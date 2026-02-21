from rest_framework import serializers
from .models import SystemAlert

class SystemAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemAlert
        fields = '__all__'
