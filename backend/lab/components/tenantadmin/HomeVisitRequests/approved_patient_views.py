from rest_framework import viewsets, status
from rest_framework.response import Response
from .approved_patient_model import ApprovedPatientVisit
from .approved_patient_serializers import ApprovedPatientVisitSerializer

class ApprovedPatientVisitViewSet(viewsets.ModelViewSet):
    queryset = ApprovedPatientVisit.objects.all().order_by('-updated_at')
    serializer_class = ApprovedPatientVisitSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(status='Approved')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
