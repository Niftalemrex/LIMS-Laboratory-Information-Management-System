from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password required")

        # Use dynamic user model
        User = get_user_model()

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        # Use dynamic user model
        model = get_user_model()
        fields = ["id", "email", "role", "tenant", "isPaid", "created_by"]
