from rest_framework import serializers
from lab.models import LabBaseModel  # if needed

# Example shared serializer
class LabBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabBaseModel
        fields = '__all__'
