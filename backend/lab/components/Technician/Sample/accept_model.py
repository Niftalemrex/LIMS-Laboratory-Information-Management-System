from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .sample_model import Sample      # <-- use relative import with lowercase
from ..models import TestRequest
from .accept_serializers import AcceptSampleSerializer

class AcceptTestRequestAPIView(APIView):
    def post(self, request, pk):
        try:
            test_request = TestRequest.objects.get(pk=pk)
        except TestRequest.DoesNotExist:
            return Response({"error": "Test request not found"}, status=status.HTTP_404_NOT_FOUND)

        sample = Sample.objects.create(
            patient=test_request.patient_name,
            test=test_request.test_type,
            status='Received',
            priority=('Routine' if test_request.priority == 'Normal' else test_request.priority),
            assigned_to=request.data.get('assigned_to', '')
        )

        test_request.accepted = True
        test_request.save()

        serializer = AcceptSampleSerializer(sample)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
