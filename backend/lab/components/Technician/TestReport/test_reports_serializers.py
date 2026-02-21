from rest_framework import serializers
from .test_reports_model import TestReport

class TestReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestReport
        fields = '__all__'
