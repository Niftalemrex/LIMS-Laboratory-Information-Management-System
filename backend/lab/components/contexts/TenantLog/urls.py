from rest_framework.routers import DefaultRouter
from .views import TenantLogViewSet

router = DefaultRouter()
router.register(r'logs', TenantLogViewSet, basename='tenantlog')

urlpatterns = router.urls
