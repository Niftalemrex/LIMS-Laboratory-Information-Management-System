from rest_framework import serializers
from .manage_users_model import TenantUser, ROLE_CHOICES, BRANCH_CHOICES

class TenantUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantUser
        fields = "__all__"
        read_only_fields = ["created_at"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_role(self, value):
        if value not in dict(ROLE_CHOICES).keys():
            raise serializers.ValidationError(f"Role must be one of {list(dict(ROLE_CHOICES).keys())}")
        return value

    def validate_branch(self, value):
        if value and value not in dict(BRANCH_CHOICES).keys():
            raise serializers.ValidationError(f"Branch must be one of {list(dict(BRANCH_CHOICES).keys())}")
        return value
