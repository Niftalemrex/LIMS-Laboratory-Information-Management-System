from django.urls import path
from .accept_views import AcceptTestRequestAPIView

urlpatterns = [
    path('<int:pk>/', AcceptTestRequestAPIView.as_view(), name='accept-test-request'),
]
