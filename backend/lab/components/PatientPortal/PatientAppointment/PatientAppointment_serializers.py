from rest_framework import serializers
from .PatientAppointment_model import PatientAppointment

class PatientAppointmentSerializer(serializers.ModelSerializer):
    # Virtual fields to unify patient info
    patient_id = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = PatientAppointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "with_whom",
            "date",
            "time",
            "location",
            "notes",
            "status",
            "created_at",
            "updated_at",
            "patient_id",
            "doctor_name",
        ]

    def get_patient_id(self, obj):
        return obj.patient.id if obj.patient else None

    def get_patient_name(self, obj):
        # Prefer linked User username; fallback to manual patient_name field
        if obj.patient:
            return obj.patient.username
        return obj.patient_name or ""

    def get_doctor_name(self, obj):
        # with_whom is just a string
        return obj.with_whom or ""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure notes and location are never None
        data["notes"] = data.get("notes") or ""
        data["location"] = data.get("location") or ""
        # Extra fields
        data["patient_id"] = self.get_patient_id(instance)
        data["patient_name"] = self.get_patient_name(instance)
        data["doctor_name"] = self.get_doctor_name(instance)
        return data
