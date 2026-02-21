from django.urls import path
from .views import SystemAlertListCreateView, SystemAlertDetailView

urlpatterns = [
    path('alerts/', SystemAlertListCreateView.as_view(), name='alert-list-create'),
    path('alerts/<str:id>/', SystemAlertDetailView.as_view(), name='alert-detail'),
]
