
from odoo import http, _
# import base64
from odoo.http import request

import logging

_logger = logging.getLogger(__name__)


class ReceiveEmail(http.Controller):

    main_template = "saas_mail_test.vuejs_app_main"

    def _load_app(self, **kw):
        return http.request.render(self.main_template, **kw)


    @http.route(["/vuejs/app"], auth="public")
    def load_app(self, **kw):
        return self._load_app(**kw)

    def _add_display_name(self, vals):
        def apply(x):
            x["display"] = "{o[name]} <{o[email]}>".format(o=x)
            return x
        return list(map(apply, vals))

    @http.route(["/vuejs/data/contacts"], type='json', auth="user")
    def saas_mail_get_contacts(self, **kw):
        env = request.env

        res = env['res.partner'].search([('email', '!=', False), ('user_ids', '=', False)])
        # contacts = [dict(id=record.id, name="{o.name} <{o.email}>".format(o=record)) for record in res]
        vals = res.read(['id', 'name', 'email'])
        # contacts = list(map(lambda x: x.update({'display': "{o[name]} <{o[email]}>".format(o=x)}), vals))
        contacts = self._add_display_name(vals)
        _logger.warning(contacts)
        return contacts

    @http.route(["/vuejs/data/alias"], type='json', auth="user")
    def saas_mail_get_alias(self, **kw):
        env = request.env

        res = env['mail.alias'].search([('alias_name', '!=', False)])

        vals = res.read(['id', 'alias_name', 'alias_domain'])
        # contacts = self._add_display_name(vals)
        _logger.warning(vals)
        return vals


    @http.route(["/vuejs/data/helper"], type='json', auth="user")
    def saas_mail_get_help(self, **kw):
        env = request.env
        vals = env['saas_mail.mail_generator'].default_get([])

        _logger.warning(vals)
        return vals

    @http.route(["/vuejs/data/generate"], type='json', auth="user")
    def saas_mail_generate(self, **kw):
        env = request.env

        data = {}
        vals = kw.get('data')
        res = env['saas_mail.mail_generator'].create(vals)
        eml = res._prepare_message()
        try:
            res_id = env['mail.thread'].sudo().message_process(False, eml)
        except ValueError as error:
            data['error'] = error
            return data

        _logger.warning(eml)
        _logger.warning(res_id)
        data['eml'] = eml

        if type(res_id) == int:
            mail_message = env['mail.message'].search([('res_id', '=', res_id)], limit=1, order='create_date desc')
            if mail_message:
                res_model = mail_message.model
                record = env[res_model].browse(res_id)
                _logger.error(record)
                _logger.error(record._description)

                action = 'ir.actions.act_window'
                action = ''

                url = "/web#action={}&id={}&view_type=form&model={}".format(action, res_id, res_model)
                # url = "'/web#menu_id=%s&amp;action=%s&amp;id=%s&amp;view_type=form&amp;model=your_model' % (%(addon.menu_id)d, %(addon.action_id)d, your_res_id, )"

                record_value = {
                    'name': record.name_get()[0][1],
                    'id': res_id,
                    'model': res_model,
                    'desc': _(record._description),
                    'create_date': record.create_date,
                    'url': url,
                }
                data['record'] = record_value



        return data

    # @http.route(
    #     '/saas_mail/post', type='http', auth='public',
    #     csrf=False)
    # def saas_mail_post(self, **post):
    #     _logger.info('Saas client incoming message from mailgun')
    #     env = request.env
    #     model = post.get('model', False)

    #     try:
    #         env['mail.thread'].sudo().message_process(
    #             model,
    #             post.get('body-mime'),
    #         )
    #         message = 'OK'
    #     except ValueError as error:
    #         message = str(error)

    #     result = message or ''
    #     return http.Response(result, status=200)
