from rest_framework import viewsets
from rest_framework.permissions import AllowAny  # frontend can POST without auth
from .models import SystemLog
from .serializers import SystemLogSerializer

class SystemLogViewSet(viewsets.ModelViewSet):
    queryset = SystemLog.objects.all().order_by('-timestamp')
    serializer_class = SystemLogSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save()
