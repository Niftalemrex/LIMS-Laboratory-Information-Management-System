from django.db import models
from django.contrib.auth.models import User

class ApprovedPatientVisit(models.Model):
    appointment_id = models.CharField(max_length=100, unique=True)
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='approved_patient_visits')
    assigned_staff = models.CharField(max_length=255, blank=True)
    date = models.DateTimeField(null=True, blank=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    postal_code = models.CharField(max_length=50, blank=True, null=True)
    doctor_name = models.CharField(max_length=255, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    medical_needs = models.JSONField(default=list, blank=True, null=True)
    status = models.CharField(max_length=20, default='Approved')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient.username} - {self.appointment_id}"
