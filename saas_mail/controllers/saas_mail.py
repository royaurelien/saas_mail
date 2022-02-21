
from odoo import http
# import base64
from odoo.http import request

import logging

_logger = logging.getLogger(__name__)


class ReceiveEmail(http.Controller):

    @http.route(
        '/saas_mail/receive', type='json', auth='public')
    def saas_mail_receive(
            self, message, custom_values=None, save_original=None, **post):
        _logger.info('Saas client message post called')
        env = request.env
        return env['mail.thread'].sudo().message_process(
            False,
            message,
            custom_values,
            save_original)

    @http.route(
        '/saas_mail/post', type='http', auth='public',
        csrf=False)
    def saas_mail_post(self, **post):
        _logger.info('Saas client incoming message from mailgun')
        env = request.env
        model = post.get('model', False)

        try:
            env['mail.thread'].sudo().message_process(
                model,
                post.get('body-mime'),
            )
            message = 'OK'
        except ValueError as error:
            message = str(error)

        result = message or ''
        return http.Response(result, status=200)
