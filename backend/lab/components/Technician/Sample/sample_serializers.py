from rest_framework import serializers
from .sample_model import TestRequest, Sample

class TestRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestRequest
        fields = '__all__'

class SampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sample
        fields = '__all__'
