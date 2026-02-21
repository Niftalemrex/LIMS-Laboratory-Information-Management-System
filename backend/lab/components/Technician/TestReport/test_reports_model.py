from django.db import models
from lab.components.Doctor.NewTestRequest.NewTestRequest_models import TestRequest


class TestReport(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('Routine', 'Routine'),
        ('Urgent', 'Urgent'),
        ('STAT', 'STAT'),
    ]

    CATEGORY_CHOICES = [
        ('Hematology', 'Hematology'),
        ('Biochemistry', 'Biochemistry'),
        ('Immunology', 'Immunology'),
        ('Microbiology', 'Microbiology'),
        ('Radiology', 'Radiology'),
        ('Pathology', 'Pathology'),
    ]

    test_request = models.OneToOneField(
        TestRequest, on_delete=models.CASCADE, related_name="report"
    )
    test_name = models.CharField(max_length=255, default="General")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="Routine")
    result = models.TextField(blank=True, null=True)
    normal_range = models.CharField(max_length=100, blank=True, null=True)
    units = models.CharField(max_length=50, blank=True, null=True)
    technician = models.CharField(max_length=255, blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    attachments = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.test_request.patient_name} - {self.test_name}"
