# C:\Users\Toshiba\Desktop\LIMS\lims\backend\lab\components\superadmin\CreateTenant\create_tenant_serializers.py
from rest_framework import serializers
from .create_tenant_model import Tenant

class TenantSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Tenant
        fields = [
            'id', 'company_name', 'email', 'password',
            'role', 'is_paid', 'created_by', 'billing_period', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        password = validated_data.pop('password')
        tenant = Tenant.objects.create_user(password=password, **validated_data)
        return tenant
