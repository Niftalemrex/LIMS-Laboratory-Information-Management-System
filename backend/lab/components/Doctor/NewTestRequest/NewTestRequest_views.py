from rest_framework import viewsets
from .NewTestRequest_models import TestRequest
from .NewTestRequest_serializers import TestRequestSerializer

class NewTestRequestViewSet(viewsets.ModelViewSet):
    queryset = TestRequest.objects.all()
    serializer_class = TestRequestSerializer
