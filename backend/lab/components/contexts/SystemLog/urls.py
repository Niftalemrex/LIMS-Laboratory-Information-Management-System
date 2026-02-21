from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import SystemLogViewSet

router = DefaultRouter()
router.register(r'', SystemLogViewSet, basename='systemlog')  # '' ensures /api/system/logs/ works

urlpatterns = [
    path('', include(router.urls)),
]
