from rest_framework import viewsets, status
from rest_framework.response import Response
from .approved_doctor_model import ApprovedDoctorVisit
from .approved_doctor_serializers import ApprovedDoctorVisitSerializer

class ApprovedDoctorVisitViewSet(viewsets.ModelViewSet):
    queryset = ApprovedDoctorVisit.objects.all().order_by('-updated_at')
    serializer_class = ApprovedDoctorVisitSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(status='Approved')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
