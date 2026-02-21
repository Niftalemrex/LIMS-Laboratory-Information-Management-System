from rest_framework import viewsets
from lab.models import LabBaseModel
from lab.serializers import LabBaseSerializer

# Example shared view
class LabBaseViewSet(viewsets.ModelViewSet):
    queryset = LabBaseModel.objects.all()
    serializer_class = LabBaseSerializer
