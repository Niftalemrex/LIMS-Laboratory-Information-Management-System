from django.db import models
from django.contrib.auth.models import User

class PatientAppointment(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Completed', 'Completed'),
    ]

    # Optional link to a registered user
    patient = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='appointments',
        null=True, blank=True
    )

    # Manual entry if no linked User
    patient_name = models.CharField(max_length=255, blank=True, null=True)

    with_whom = models.CharField(max_length=255)  # Doctor, lab, etc.
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # Prefer patient_name if no linked User
        if self.patient:
            return f"{self.patient.username} - {self.with_whom} on {self.date} {self.time}"
        return f"{self.patient_name or 'Unknown Patient'} - {self.with_whom} on {self.date} {self.time}"
