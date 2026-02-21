from django.db import models

class SystemLog(models.Model):
    STATUS_CHOICES = [
        ('Success', 'Success'),
        ('Error', 'Error'),
        ('Info', 'Info'),
        ('Warning', 'Warning'),
    ]

    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.CharField(max_length=255)
    action = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    ipAddress = models.GenericIPAddressField(null=True, blank=True)
    details = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.timestamp} - {self.user} - {self.status}"
