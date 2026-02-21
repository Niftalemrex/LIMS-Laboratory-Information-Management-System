from django.db import models
from datetime import date

PRIORITY_CHOICES = [
    ('Normal', 'Normal'),
    ('Urgent', 'Urgent'),
    ('Critical', 'Critical'),
]

class TestRequest(models.Model):
    patient_name = models.CharField(max_length=255)
    test_type = models.CharField(max_length=100)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Normal')
    notes = models.TextField(blank=True)
    date_requested = models.DateField(default=date.today)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.patient_name} - {self.test_type}"


class Sample(models.Model):
    STATUS_CHOICES = [
        ('Received', 'Received'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Rejected', 'Rejected'),
    ]
    PRIORITY_CHOICES = [
        ('Routine', 'Routine'),
        ('Urgent', 'Urgent'),
        ('STAT', 'STAT'),
    ]

    patient = models.CharField(max_length=100)
    test = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Routine')
    collection_date = models.DateField(null=True, blank=True)
    assigned_to = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.patient} - {self.test}"
