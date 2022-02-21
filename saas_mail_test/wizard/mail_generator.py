from odoo import models, fields, api, _
from odoo.exceptions import UserError

from email import generator
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

_logger = logging.getLogger(__name__)


HELPER = """
<h3 class="subtitle">Domain</h3>
<ul>
    <li>Base Url: {vals[base_url]}</li>
    <li>Catchall domain: {vals[domain]}</li>
    <li>Catchall alias: {vals[catchall]}</li>
    <li>Bounce alias: {vals[bounce]}</li>
</ul>
<hr/>
<h3 class="subtitle">Outgoing server ({vals[outgoing_count]})</h3>
<ul>
{vals[outgoing]}
</ul>
<hr/>
<h3 class="subtitle">Incomming server ({vals[incomming_count]})</h3>
<ul>
{vals[incomming]}
</ul>
<hr/>
<h3 class="subtitle">Alias ({vals[alias_count]})</h3>
<ul>
{vals[alias]}
</ul>
        """

INCOMMING_ITEM = "<li><strong>{o.name}</strong>: {o.server_type}, {o.server}</li>"
OUTGOING_ITEM = "<li><strong>{o.name}</strong>: {o.smtp_host}, {o.smtp_encryption}</li>"
ALIAS_ITEM = "<li><strong>{o.alias_name}</strong> --> {o.alias_model_id.name}</li>"

class MailGenerator(models.TransientModel):
    _name = 'saas_mail.mail_generator'
    _description = 'Mail Generator'


    @api.model
    def default_get(self, fields):
        res = super(MailGenerator, self).default_get(fields)

        ir_config = self.env["ir.config_parameter"].sudo()
        base_url =  ir_config.get_param("web.base.url")
        bounce =  ir_config.get_param("mail.bounce.alias")
        catchall = ir_config.get_param("mail.catchall.alias")
        domain = ir_config.get_param("mail.catchall.domain")
        outgoing = self.env['ir.mail_server'].search([])
        incomming = self.env['fetchmail.server'].search([])
        alias = self.env['mail.alias'].search([('alias_name', '!=', False)])

        vals = {
            'bounce': "{}@{}".format(bounce, domain) if domain else bounce,
            'catchall': "{}@{}".format(catchall, domain) if domain else catchall,
            'domain': domain if domain else '--',
            'base_url': base_url if base_url else '--',
            'outgoing_count': len(outgoing),
            'incomming_count': len(incomming),
            'alias_count': len(alias),
            'outgoing': "".join([OUTGOING_ITEM.format(o=item) for item in outgoing]),
            'incomming': "".join([INCOMMING_ITEM.format(o=item) for item in incomming]),
            'alias': "".join([ALIAS_ITEM.format(o=item) for item in alias]),
        }

        mail_helper = HELPER.format(vals=vals)

        res.update({
            'alias_domain': domain,
            'catchall_alias': catchall,
            'bounce_alias': bounce,
            'mail_helper': mail_helper,
        })

        return res

    name = fields.Char(compute='_compute_name')
    mail_helper = fields.Html()
    alias_domain = fields.Char()
    base_url = fields.Char()
    catchall_alias = fields.Char()
    bounce_alias = fields.Char()
    eml = fields.Text()
    from_recipient = fields.Char(required=True)
    to = fields.Char(required=True)
    subject = fields.Char()
    cc = fields.Char()
    bcc = fields.Char()
    body = fields.Html()
    model_id = fields.Many2one(comodel_name='ir.model')
    alias_id = fields.Many2one(comodel_name='mail.alias')

    @api.onchange('alias_id')
    def _onchange_alias(self):
        if self.alias_id:
            to = "{o.alias_name}@{o.alias_domain}" if self.alias_domain else "{o.alias_name}@"
            self.to = to.format(o=self.alias_id)

    @api.depends('subject')
    def _compute_name(self):
        for record in self:
            record.name = "{}".format(record.subject)

    def _prepare_message(self):
        self.ensure_one()

        vals = {
            'subject': self.subject,
            'to': self.to,
            'from': self.from_recipient,
        }

        eml = self.generate_mail(vals, "<body><html>{}</body></html>".format(self.body))
        _logger.warning(eml)

        return eml

    def action_confirm(self):
        self.ensure_one()
        self.eml = self._prepare_message()
        return self.post()


    @api.model
    def generate_mail(self, vals, body):
        msg = MIMEMultipart('alternative')
        msg['Subject'] = vals.get('subject')
        msg['To'] = vals.get('to')
        msg['From'] = vals.get('from')

        part = MIMEText(body, 'html')
        msg.attach(part)

        return msg.as_string()


    def post(self):
        self.ensure_one()

        try:
            self.env['mail.thread'].sudo().message_process(
                self.model_id.model if self.model_id else False,
                self.eml,
            )
            message = 'OK'
        except ValueError as error:
            message = str(error)

        result = message or ''
        return result
