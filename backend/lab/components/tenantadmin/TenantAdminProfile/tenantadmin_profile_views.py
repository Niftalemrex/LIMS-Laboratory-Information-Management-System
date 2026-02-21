# tenantadmin_profile_views.py
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .tenantadmin_profile_model import TenantAdminProfile
from .tenantadmin_profile_serializers import TenantAdminProfileSerializer

class TenantAdminProfileViewSet(viewsets.ViewSet):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def list(self, request):
        # Return first profile if exists
        profile = TenantAdminProfile.objects.first()
        if profile:
            serializer = TenantAdminProfileSerializer(profile, context={'request': request})
            return Response([serializer.data])
        return Response([])

    def create(self, request):
        # Only allow one profile
        if TenantAdminProfile.objects.exists():
            return Response({"detail": "Profile already exists."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = TenantAdminProfileSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        profile = TenantAdminProfile.objects.first()
        if not profile:
            return Response({"detail": "Profile does not exist."}, status=status.HTTP_404_NOT_FOUND)
        serializer = TenantAdminProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
