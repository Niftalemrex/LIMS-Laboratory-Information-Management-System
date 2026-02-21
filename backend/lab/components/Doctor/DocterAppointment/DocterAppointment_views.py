from rest_framework import viewsets
from .DocterAppointment_model import DoctorAppointment
from .DocterAppointment_serializers import DoctorAppointmentSerializer

class DoctorAppointmentViewSet(viewsets.ModelViewSet):
    queryset = DoctorAppointment.objects.all().order_by('-updatedAt')
    serializer_class = DoctorAppointmentSerializer
