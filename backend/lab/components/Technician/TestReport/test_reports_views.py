from rest_framework import generics
from .test_reports_model import TestReport
from .test_reports_serializers import TestReportSerializer

class TestReportList(generics.ListCreateAPIView):
    queryset = TestReport.objects.all()
    serializer_class = TestReportSerializer

class TestReportDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TestReport.objects.all()
    serializer_class = TestReportSerializer
