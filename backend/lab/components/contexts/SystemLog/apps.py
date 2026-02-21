from django.apps import AppConfig

class SystemLogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lab.components.contexts.SystemLog'  # correct dotted path
    label = 'systemlog'  # unique app label
