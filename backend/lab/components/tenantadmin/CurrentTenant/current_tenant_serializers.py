# current_tenant_serializers.py
from rest_framework import serializers
from lab.components.superadmin.CreateTenant.create_tenant_model import Tenant

class CurrentTenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'company_name', 'email', 'created_at']
