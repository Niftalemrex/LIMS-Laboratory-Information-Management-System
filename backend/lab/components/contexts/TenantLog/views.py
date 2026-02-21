from rest_framework import viewsets
from rest_framework.permissions import AllowAny  # Change to IsAuthenticated in production
from .models import TenantLog
from .serializers import TenantLogSerializer

class TenantLogViewSet(viewsets.ModelViewSet):
    queryset = TenantLog.objects.all().order_by('-timestamp')
    serializer_class = TenantLogSerializer
    permission_classes = [AllowAny]

    # optional: filter by tenant_id query param
    def get_queryset(self):
        queryset = super().get_queryset()
        tenant_id = self.request.query_params.get('tenant_id')
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        return queryset
