# lab/components/PatientPortal/PatientAppointment/PatientAppointment_views.py
from rest_framework import generics
from .PatientAppointment_model import PatientAppointment
from .PatientAppointment_serializers import PatientAppointmentSerializer

class PatientAppointmentListCreate(generics.ListCreateAPIView):
    serializer_class = PatientAppointmentSerializer
    # Remove authentication requirement
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return all appointments
        return PatientAppointment.objects.all()

    def perform_create(self, serializer):
        # Assign a default patient ID or remove if not needed
        serializer.save()

class PatientAppointmentRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PatientAppointmentSerializer
    # Remove authentication requirement
    # permission_classes = [permissions.IsAuthenticated]
    queryset = PatientAppointment.objects.all()
