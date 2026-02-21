from django.db import models

class TenantLog(models.Model):
    STATUS_CHOICES = [
        ('Success', 'Success'),
        ('Error', 'Error'),
        ('Info', 'Info'),
        ('Warning', 'Warning'),
    ]

    tenant_id = models.CharField(max_length=100)  # dynamic tenant
    user = models.CharField(max_length=255)
    action = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tenant_id} | {self.user} | {self.action[:30]}"
