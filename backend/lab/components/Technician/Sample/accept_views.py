# lab/components/Technician/Sample/accept_views.py
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from lab.components.Technician.Sample.sample_model import Sample
from lab.components.Doctor.NewTestRequest.NewTestRequest_models import TestRequest
from lab.components.Technician.Sample.accept_serializers import AcceptSampleSerializer

class AcceptTestRequestAPIView(APIView):
    """
    Accept a TestRequest and create a Sample safely.
    """

    def post(self, request, pk):
        try:
            test_request = TestRequest.objects.get(pk=pk)
        except TestRequest.DoesNotExist:
            return Response(
                {"error": "Test request not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent duplicate Sample creation
        existing_sample = Sample.objects.filter(patient=test_request.patient_name, test=test_request.test_type).first()
        if existing_sample:
            return Response(
                {"error": "Sample already exists for this request."},
                status=status.HTTP_400_BAD_REQUEST
            )

        priority_map = {
            'Normal': 'Routine',
            'Urgent': 'Urgent',
            'Critical': 'STAT',
            'STAT': 'STAT'
        }

        sample = Sample.objects.create(
            patient=test_request.patient_name,
            test=test_request.test_type,
            status='Received',
            priority=priority_map.get(test_request.priority, 'Routine'),
            assigned_to=None,
            collection_date=timezone.now().date()
        )

        # Mark request as accepted to hide from frontend
        test_request.accepted = True
        test_request.save()

        serializer = AcceptSampleSerializer(sample)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
