
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

    @http.route(["/vuejs/data/contacts"], type='json', auth="user")
    def saas_mail_get_contacts(self, **kw):
        env = request.env

        res = env['res.partner'].search([('email', '!=', False), ('user_ids', '=', False)])
        contacts = [dict(id=record.id, name="{o.name} <{o.email}>".format(o=record)) for record in res]
        return contacts

    @http.route(["/vuejs/data/helper"], type='json', auth="user")
    def saas_mail_get_help(self, **kw):
        env = request.env
        vals = env['saas_mail.mail_generator'].default_get([])

        res = env['res.partner'].search([('email', '!=', False), ('user_ids', '=', False)])

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
                record = env[mail_message.model].browse(res_id)
                _logger.error(record)
                _logger.error(record._description)

                record_value = {
                    'name': record.name_get()[0][1],
                    'id': res_id,
                    'model': record._name,
                    'desc': _(record._description),
                    'create_date': record.create_date,
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
