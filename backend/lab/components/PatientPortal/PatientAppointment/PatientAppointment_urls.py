# lab/components/PatientPortal/PatientAppointment/PatientAppointment_urls.py
from django.urls import path
from . import PatientAppointment_views

urlpatterns = [
    path('', PatientAppointment_views.PatientAppointmentListCreate.as_view(), name='patient_appointments'),
    path('<int:pk>/', PatientAppointment_views.PatientAppointmentRetrieveUpdateDelete.as_view(), name='patient_appointment_detail'),
]
