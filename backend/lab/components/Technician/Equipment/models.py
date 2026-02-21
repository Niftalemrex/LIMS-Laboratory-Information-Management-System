from django.db import models
import uuid
from datetime import timedelta
from dateutil.relativedelta import relativedelta  # ✅ make sure this package is installed

class Equipment(models.Model):
    STATUS_CHOICES = [
        ('operational', 'Operational'),
        ('maintenance', 'Maintenance'),
        ('out-of-service', 'Out of Service'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    serial_number = models.CharField(max_length=255, unique=True)
    department = models.CharField(max_length=255)
    calibration_date = models.DateField(null=True, blank=True)
    next_calibration_date = models.DateField(null=True, blank=True)
    last_maintenance = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='operational')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-calculate next calibration date if calibration_date is set
        if self.calibration_date:
            self.next_calibration_date = self.calibration_date + relativedelta(months=6)
        else:
            self.next_calibration_date = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.serial_number})"
