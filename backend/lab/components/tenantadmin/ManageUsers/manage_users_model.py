from django.db import models
from lab.components.superadmin.CreateTenant.create_tenant_model import Tenant
from django.contrib.auth.hashers import make_password

ROLE_CHOICES = [
    ("doctor", "Doctor"),
    ("technician", "Technician"),
    ("support", "Support Staff"),
]

BRANCH_CHOICES = [
    ("main", "Main Branch"),
    ("west", "West Branch"),
    ("east", "East Branch"),
]

class TenantUser(models.Model):
    id = models.CharField(primary_key=True, max_length=50)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    branch = models.CharField(max_length=50, choices=BRANCH_CHOICES, blank=True, null=True)
    password = models.CharField(max_length=128)
    created_by = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    tenant = models.ForeignKey(Tenant, to_field="id", on_delete=models.CASCADE, related_name="users")

    def save(self, *args, **kwargs):
        if not self.pk and self.password:
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.email})"
