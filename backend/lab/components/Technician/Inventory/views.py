# lab/components/Technician/Inventory/views.py
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import InventoryItem, InventoryHistory
from .serializers import InventoryItemSerializer, InventoryHistorySerializer

User = get_user_model()


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('-last_updated')
    serializer_class = InventoryItemSerializer

    @action(detail=True, methods=['post'])
    def issue(self, request, pk=None):
        item = self.get_object()

        # Validate quantity
        try:
            quantity = int(request.data.get('quantity', 0))
        except (TypeError, ValueError):
            return Response({'error': 'Quantity must be a valid integer'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            return Response({'error': 'Quantity must be positive'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity > item.quantity:
            return Response({'error': f'Cannot issue {quantity}. Only {item.quantity} available.'}, status=status.HTTP_400_BAD_REQUEST)

        previous_quantity = item.quantity

        with transaction.atomic():
            item.quantity -= quantity
            item.save()

            InventoryHistory.objects.create(
                item=item,
                action='issued',
                quantity=quantity,
                previous_quantity=previous_quantity,
                performed_by=request.user if request.user.is_authenticated else None,
                notes=request.data.get('notes', '')
            )

        serializer = self.get_serializer(item)
        return Response({'message': f'{quantity} units issued successfully.', 'item': serializer.data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        item = self.get_object()

        # Validate quantity
        try:
            quantity = int(request.data.get('quantity', 0))
        except (TypeError, ValueError):
            return Response({'error': 'Quantity must be a valid integer'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            return Response({'error': 'Quantity must be positive'}, status=status.HTTP_400_BAD_REQUEST)

        previous_quantity = item.quantity

        with transaction.atomic():
            item.quantity += quantity
            item.save()

            InventoryHistory.objects.create(
                item=item,
                action='received',
                quantity=quantity,
                previous_quantity=previous_quantity,
                performed_by=request.user if request.user.is_authenticated else None,
                notes=request.data.get('notes', '')
            )

        serializer = self.get_serializer(item)
        return Response({'message': f'{quantity} units received successfully.', 'item': serializer.data}, status=status.HTTP_200_OK)


class InventoryHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryHistory.objects.all().order_by('-timestamp')
    serializer_class = InventoryHistorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['item__name', 'performed_by__username', 'action']
    ordering_fields = ['timestamp', 'quantity']
    ordering = ['-timestamp']
