from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .tenantadmin_profile_views import TenantAdminProfileViewSet

router = DefaultRouter()
router.register(r'profiles', TenantAdminProfileViewSet, basename='tenantadminprofile')

urlpatterns = [
    path('', include(router.urls)),
]
