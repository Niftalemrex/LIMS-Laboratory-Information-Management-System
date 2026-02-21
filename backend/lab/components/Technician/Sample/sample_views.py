from rest_framework import generics
from .sample_model import Sample
from .sample_serializers import SampleSerializer

class SampleList(generics.ListCreateAPIView):
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer

class SampleDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sample.objects.all()
    serializer_class = SampleSerializer
