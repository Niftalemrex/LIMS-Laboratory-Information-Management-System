# lab/components/Technician/Inventory/models.py
from django.db import models
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()


class InventoryItem(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    category = models.CharField(max_length=255, blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)
    min_stock_level = models.IntegerField(default=3)

    def save(self, *args, **kwargs):
        # Auto-calculate status based on quantity
        if self.quantity <= 0:
            self.status = 'out_of_stock'
        elif self.quantity <= self.min_stock_level:
            self.status = 'low_stock'
        else:
            self.status = 'available'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"


class InventoryHistory(models.Model):
    ACTION_CHOICES = [
        ('issued', 'Issued'),
        ('received', 'Received'),
        ('adjusted', 'Adjusted'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    quantity = models.IntegerField()
    previous_quantity = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.action} {self.quantity} of {self.item.name} at {self.timestamp}"
