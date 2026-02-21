from rest_framework import generics, status
from rest_framework.response import Response
from .create_tenant_model import Tenant
from .create_tenant_serializers import TenantSerializer

class TenantListCreateView(generics.ListCreateAPIView):
    queryset = Tenant.objects.all().order_by('-created_at')
    serializer_class = TenantSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Log full errors to console
            print("Serializer validation failed:")
            print(serializer.errors)
            # Return them in the response for easier debugging
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        tenant = serializer.save()
        return Response({
            'message': 'Tenant created successfully',
            'tenant': TenantSerializer(tenant).data
        }, status=status.HTTP_201_CREATED)
