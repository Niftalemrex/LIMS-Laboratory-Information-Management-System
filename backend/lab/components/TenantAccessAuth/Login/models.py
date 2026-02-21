# lab/components/TenantAccessAuth/Login/models.py
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('tenant-admin', 'Tenant Admin'),
        ('doctor', 'Doctor'),
        ('technician', 'Technician'),
        ('support', 'Support'),
        ('patient', 'Patient'), 
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    tenant = models.CharField(max_length=100, null=True, blank=True)
    isPaid = models.BooleanField(default=False)
    created_by = models.CharField(max_length=100, null=True, blank=True)

    groups = models.ManyToManyField(
        Group,
        related_name="tenantaccess_users",
        blank=True,
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name="tenantaccess_users_permissions",
        blank=True,
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"
