from rest_framework import serializers
from .NewTestRequest_models import TestRequest

class TestRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestRequest
        fields = '__all__'
