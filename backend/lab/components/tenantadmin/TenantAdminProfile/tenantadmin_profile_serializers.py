# tenantadmin_profile_serializers.py
from rest_framework import serializers
from .tenantadmin_profile_model import TenantAdminProfile

class TenantAdminProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = TenantAdminProfile
        fields = ['id', 'name', 'email', 'avatar', 'avatar_url']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar:
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None
