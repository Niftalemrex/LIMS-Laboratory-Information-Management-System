# current_tenant_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from lab.components.superadmin.CreateTenant.create_tenant_model import Tenant
from .current_tenant_serializers import CurrentTenantSerializer

class CurrentTenantView(APIView):
    # Remove permission_classes to allow public access
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # For demo: return the first tenant in the database
            tenant = Tenant.objects.first()
            if not tenant:
                return Response({"error": "Tenant not found"}, status=404)

            serializer = CurrentTenantSerializer(tenant)
            return Response(serializer.data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
