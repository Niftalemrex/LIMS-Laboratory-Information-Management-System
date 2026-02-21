# lab/components/Technician/Inventory/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryItemViewSet, InventoryHistoryViewSet

router = DefaultRouter()
router.register(r'items', InventoryItemViewSet, basename='inventory-item')
router.register(r'history', InventoryHistoryViewSet, basename='inventory-history')

urlpatterns = [
    path('', include(router.urls)),
]
