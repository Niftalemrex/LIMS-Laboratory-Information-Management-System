from django.db import models

class DoctorAppointment(models.Model):
    patientName = models.CharField(max_length=200)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    postalCode = models.CharField(max_length=20, blank=True, null=True)
    doctor = models.CharField(max_length=200)
    date = models.DateTimeField()
    reason = models.TextField()
    notes = models.TextField(blank=True, null=True)
    assignedStaff = models.CharField(max_length=200, blank=True, null=True)
    medicalNeeds = models.JSONField(default=list)  # Store as list
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patientName} - {self.date}"
