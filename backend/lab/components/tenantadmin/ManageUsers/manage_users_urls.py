from django.urls import path
from .manage_users_views import TenantUserListCreateView

urlpatterns = [
    path("api/tenant/users/", TenantUserListCreateView.as_view(), name="tenant-users"),
]
