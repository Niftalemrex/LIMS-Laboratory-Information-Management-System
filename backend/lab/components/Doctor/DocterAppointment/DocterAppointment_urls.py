from rest_framework.routers import DefaultRouter
from .DocterAppointment_views import DoctorAppointmentViewSet

router = DefaultRouter()
router.register(r'doctor-appointments', DoctorAppointmentViewSet, basename='doctor-appointments')

urlpatterns = router.urls
