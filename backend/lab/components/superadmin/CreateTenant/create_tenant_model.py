# C:\Users\Toshiba\Desktop\LIMS\lims\backend\lab\components\superadmin\CreateTenant\create_tenant_model.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Custom Tenant Manager
class TenantManager(BaseUserManager):
    def create_user(self, email, company_name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email must be set')
        email = self.normalize_email(email)
        tenant = self.model(email=email, company_name=company_name, **extra_fields)
        tenant.set_password(password)
        tenant.save(using=self._db)
        return tenant

    def create_superuser(self, email, company_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, company_name, password, **extra_fields)


class Tenant(AbstractBaseUser):
    ROLE_CHOICES = [
        ('tenant-admin', 'Tenant Admin'),
    ]
    BILLING_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    id = models.BigAutoField(primary_key=True)
    company_name = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='tenant-admin')
    is_paid = models.BooleanField(default=True)
    created_by = models.CharField(max_length=255)
    billing_period = models.CharField(max_length=10, choices=BILLING_CHOICES, default='monthly')
    created_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = TenantManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['company_name']

    def __str__(self):
        return self.company_name
