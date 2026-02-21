# current_tenant_urls.py
from django.urls import path
from .current_tenant_views import CurrentTenantView

urlpatterns = [
    path('api/tenant/current/', CurrentTenantView.as_view(), name='current-tenant'),
]
