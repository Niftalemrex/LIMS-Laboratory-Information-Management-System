# C:\Users\Toshiba\Desktop\LIMS\lims\backend\lab\components\superadmin\CreateTenant\create_tenant_urls.py
from django.urls import path
from .create_tenant_views import TenantListCreateView

urlpatterns = [
    path('tenants/', TenantListCreateView.as_view(), name='tenant-list-create'),
]
