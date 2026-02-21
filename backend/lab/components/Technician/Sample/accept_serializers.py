from rest_framework import serializers
from .sample_model import Sample


class AcceptSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sample
        fields = '__all__'
