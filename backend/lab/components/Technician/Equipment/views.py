from rest_framework import viewsets
from django.db.models import Q
from .models import Equipment
from .serializers import EquipmentSerializer

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().order_by('-created_at')
    serializer_class = EquipmentSerializer
    # No authentication/permission required

    # Optional: filtering by status/priority/search
    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        search = self.request.query_params.get('search')

        if status:
            queryset = queryset.filter(status=status)
        if priority:
            queryset = queryset.filter(priority=priority)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(model__icontains=search) |
                Q(department__icontains=search)
            )
        return queryset
