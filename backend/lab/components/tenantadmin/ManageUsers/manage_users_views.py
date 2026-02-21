import time
from rest_framework import generics, status
from rest_framework.response import Response
from .manage_users_model import TenantUser, ROLE_CHOICES, BRANCH_CHOICES
from .manage_users_serializers import TenantUserSerializer
from lab.components.superadmin.CreateTenant.create_tenant_model import Tenant

class TenantUserListCreateView(generics.ListCreateAPIView):
    serializer_class = TenantUserSerializer
    queryset = TenantUser.objects.all()

    def get_queryset(self):
        tenant_id = self.request.query_params.get("tenant")
        if tenant_id:
            return TenantUser.objects.filter(tenant_id=tenant_id)
        return TenantUser.objects.none()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # Required fields check
        required_fields = ["name", "email", "role", "tenant", "created_by", "password"]
        for field in required_fields:
            if not data.get(field):
                return Response({"error": f"Field '{field}' is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate role
        if data["role"] not in dict(ROLE_CHOICES):
            return Response({"error": f"Role must be one of {list(dict(ROLE_CHOICES).keys())}"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate branch if provided
        if data.get("branch") and data["branch"] not in dict(BRANCH_CHOICES):
            return Response({"error": f"Branch must be one of {list(dict(BRANCH_CHOICES).keys())}"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique ID if missing
        if not data.get("id"):
            data["id"] = f"user-{int(time.time() * 1000)}"

        # Check tenant exists
        try:
            tenant = Tenant.objects.get(id=data["tenant"])
            data["tenant"] = tenant.id
        except Tenant.DoesNotExist:
            return Response({"error": f"Tenant '{data['tenant']}' does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"tenant_user": serializer.data}, status=status.HTTP_201_CREATED)
