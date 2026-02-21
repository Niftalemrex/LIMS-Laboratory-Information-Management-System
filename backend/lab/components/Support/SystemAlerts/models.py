from django.db import models

class SystemAlert(models.Model):
    ALERT_TYPES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]

    id = models.CharField(primary_key=True, max_length=100)
    type = models.CharField(max_length=20, choices=ALERT_TYPES, default='info')
    message = models.TextField()
    status = models.CharField(max_length=50, default='active')
    timestamp = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.type.upper()}] {self.message[:50]}"
