from django.db import models
from datetime import date

# Optional: define choices for priority
PRIORITY_CHOICES = [
    ('Normal', 'Normal'),
    ('Urgent', 'Urgent'),
    ('Critical', 'Critical'),
]

class TestRequest(models.Model):
    patient_id = models.CharField(max_length=50, default='UNKNOWN')   # default for existing rows
    patient_name = models.CharField(max_length=255, default='UNKNOWN')
    test_type = models.CharField(max_length=255, default='General')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Normal')
    notes = models.TextField(blank=True, null=True)
    date_requested = models.DateField(default=date.today)  # default today to avoid migration issues
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'lab'

    def __str__(self):
        return f"{self.patient_name} - {self.test_type} ({self.priority})"
