from rest_framework import generics
from .models import SystemAlert
from .serializers import SystemAlertSerializer

class SystemAlertListCreateView(generics.ListCreateAPIView):
    queryset = SystemAlert.objects.all().order_by('-timestamp')
    serializer_class = SystemAlertSerializer

class SystemAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SystemAlert.objects.all()
    serializer_class = SystemAlertSerializer
    lookup_field = 'id'   # ✅ now matches frontend alert.id
