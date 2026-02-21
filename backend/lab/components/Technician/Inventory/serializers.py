# lab/components/Technician/Inventory/serializers.py
from rest_framework import serializers
from .models import InventoryItem, InventoryHistory

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'


class InventoryHistorySerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)

    class Meta:
        model = InventoryHistory
        fields = '__all__'
