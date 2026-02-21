from django.urls import path
from .approved_patient_views import ApprovedPatientVisitViewSet

patient_approval = ApprovedPatientVisitViewSet.as_view({'get': 'list', 'post': 'create'})

urlpatterns = [
    path('approved-patient/', patient_approval, name='approved-patient'),
]
