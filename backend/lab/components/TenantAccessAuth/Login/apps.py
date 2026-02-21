from django.apps import AppConfig

class LoginConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lab.components.TenantAccessAuth.Login'
    label = 'tenantaccess_login'  # ✅ unique, no other app should use this
