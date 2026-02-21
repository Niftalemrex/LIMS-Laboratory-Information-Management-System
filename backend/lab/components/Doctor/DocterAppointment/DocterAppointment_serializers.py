from rest_framework import serializers
from .DocterAppointment_model import DoctorAppointment

class DoctorAppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = DoctorAppointment
        fields = [
            "id",
            "patientName",
            "address",
            "city",
            "postalCode",
            "doctor",
            "date",
            "reason",
            "notes",
            "assignedStaff",
            "medicalNeeds",
            "updatedAt",
            "doctor_name",
            "patient_name",
        ]

    def get_doctor_name(self, obj):
        return obj.doctor or ""

    def get_patient_name(self, obj):
        return obj.patientName or ""

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Only replace None with safe defaults
        if data.get("assignedStaff") is None:
            data["assignedStaff"] = ""
        if data.get("medicalNeeds") is None:
            data["medicalNeeds"] = []

        # Add extra display fields
        data["doctor_name"] = self.get_doctor_name(instance)
        data["patient_name"] = self.get_patient_name(instance)
        return data
