from rest_framework import serializers
from .models import TenantLog

class TenantLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantLog
        fields = '__all__'
