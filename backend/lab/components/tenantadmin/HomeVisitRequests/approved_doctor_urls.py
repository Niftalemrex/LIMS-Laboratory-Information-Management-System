from django.urls import path
from .approved_doctor_views import ApprovedDoctorVisitViewSet

doctor_approval = ApprovedDoctorVisitViewSet.as_view({'get': 'list', 'post': 'create'})

urlpatterns = [
    path('approved-doctor/', doctor_approval, name='approved-doctor'),
]
