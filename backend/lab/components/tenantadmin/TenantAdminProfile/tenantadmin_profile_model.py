# tenantadmin_profile_model.py
from django.db import models

class TenantAdminProfile(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return self.name
