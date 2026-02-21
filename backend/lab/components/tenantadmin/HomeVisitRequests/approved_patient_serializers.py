from rest_framework import serializers
from .approved_patient_model import ApprovedPatientVisit
from django.contrib.auth.models import User

class ApprovedPatientVisitSerializer(serializers.ModelSerializer):
    patient_id = serializers.PrimaryKeyRelatedField(
        source='patient', queryset=User.objects.all(), write_only=True
    )
    patient = serializers.StringRelatedField(read_only=True)

    # Read-only ID field so frontend gets it back
    patient_pk = serializers.IntegerField(source="patient.id", read_only=True)

    date = serializers.DateTimeField(required=False, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    postal_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    doctor_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    medical_needs = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = ApprovedPatientVisit
        fields = [
            'id', 'appointment_id', 'patient', 'patient_id', 'patient_pk',
            'assigned_staff', 'date', 'address', 'city', 'postal_code',
            'doctor_name', 'reason', 'notes', 'medical_needs', 'status', 'updated_at'
        ]
