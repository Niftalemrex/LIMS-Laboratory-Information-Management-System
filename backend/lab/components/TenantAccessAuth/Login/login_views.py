from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .login_serializers import UserSerializer

class LoginView(APIView):
    def post(self, request):
        # ✅ get the user model here instead of module level
        User = get_user_model()

        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"detail": "Email and password required"}, status=400)

        # Authenticate using our EmailBackend
        user = authenticate(request, email=email, password=password)
        if not user:
            return Response({"detail": "Invalid credentials"}, status=401)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Serialize user data
        user_data = UserSerializer(user).data

        # Handle tenant (if you have a Tenant model, you can expand this)
        tenant_data = {"name": user.tenant} if hasattr(user, "tenant") and user.tenant else None

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user_data,
            "tenant": tenant_data,
        })
