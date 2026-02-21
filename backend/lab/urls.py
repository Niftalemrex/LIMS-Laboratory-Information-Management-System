from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),


     path('', include('lab.components.TenantAccessAuth.Login.login_urls')),

    # Doctor endpoints
    path('api/test-requests/', include('backend.lab.components.Doctor.NewTestRequest.NewTestRequest_urls')),

path("api/", include("lab.components.Doctor.DocterAppointment.DocterAppointment_urls")),

  path('api/tenant/users/', TenantUserListCreateView.as_view(), name='tenant-users'),

path('api/superadmin/', include('lab.components.superadmin.CreateTenant.create_tenant_urls')),

    # Technician endpoints - Samples
    path('api/samples/', include('backend.lab.components.Technician.Sample.sample_urls')),
 path('api/accept/', include('lab.components.Technician.Sample.accept_urls')),  # new Accept API
    # Technician endpoints - Test Reports
    path('api/test-reports/', include('backend.lab.components.Technician.TestReport.test_report_urls')),
]
