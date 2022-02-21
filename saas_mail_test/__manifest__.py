{
    'name': 'Saas Mail Generator',
    'version': "14.0.1.0.0",
    'category': 'SaaS',
    'author': 'Aurelien ROY',
    'website': 'https://impro.digital',
    'license': 'AGPL-3',
    'depends': [
        'base',
        'mail',
        "saas_mail",
    ],
    'data': [
        'wizard/mail_generator.xml',
        "views/menu.xml",
        "templates/main.xml",
        "templates/assets.xml",
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'demo': [],
}
