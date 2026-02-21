from rest_framework import serializers
from .approved_doctor_model import ApprovedDoctorVisit
from django.contrib.auth.models import User

class ApprovedDoctorVisitSerializer(serializers.ModelSerializer):
    doctor_id = serializers.PrimaryKeyRelatedField(
        source='doctor', queryset=User.objects.all(), write_only=True
    )
    doctor = serializers.StringRelatedField(read_only=True)

    # Read-only ID field so frontend gets it back
    doctor_pk = serializers.IntegerField(source="doctor.id", read_only=True)

    patient_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date = serializers.DateTimeField(required=False, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    postal_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    medical_needs = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = ApprovedDoctorVisit
        fields = [
            'id', 'appointment_id', 'doctor', 'doctor_id', 'doctor_pk',
            'assigned_staff', 'patient_name', 'date', 'address', 'city',
            'postal_code', 'reason', 'notes', 'medical_needs', 'status', 'updated_at'
        ]
