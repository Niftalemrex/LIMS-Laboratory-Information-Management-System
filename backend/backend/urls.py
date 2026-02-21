"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# ✅ Import your tenant user view
from lab.components.tenantadmin.ManageUsers.manage_users_views import TenantUserListCreateView

urlpatterns = [
    path('api/', include('lab.components.Doctor.NewTestRequest.NewTestRequest_urls')),
    path('api/', include('lab.components.Doctor.DocterAppointment.DocterAppointment_urls')),


path('', include('lab.components.tenantadmin.CurrentTenant.current_tenant_urls')),
    # ... other tenantadmin routes
  path('api/', include('lab.components.Support.SystemAlerts.urls')),

path('api/', include('lab.components.tenantadmin.HomeVisitRequests.approved_patient_urls')),
path('api/', include('lab.components.tenantadmin.HomeVisitRequests.approved_doctor_urls')),

 path('api/superadmin/', include('lab.components.superadmin.CreateTenant.create_tenant_urls')),

 path('api/system/logs/', include('lab.components.contexts.SystemLog.urls')),
path('api/tenant/logs/', include('lab.components.contexts.TenantLog.urls')),

  path('technician/equipment/', include('lab.components.Technician.Equipment.urls')),
 path('', include('lab.components.TenantAccessAuth.Login.login_urls')),
path('technician/inventory/', include('lab.components.Technician.Inventory.urls')),
  # TenantAdminProfile endpoints
    path('api/tenantadmin/profiles/', include('lab.components.tenantadmin.TenantAdminProfile.tenantadmin_profile_urls')),
  path('api/tenant/users/', TenantUserListCreateView.as_view(), name='tenant-users'),

    # Patient Portal endpoints
    path('api/patient-appointments/', include('lab.components.PatientPortal.PatientAppointment.PatientAppointment_urls')),

    path('api/samples/', include('lab.components.Technician.Sample.sample_urls')),
    path('api/accept/', include('lab.components.Technician.Sample.accept_urls')),  # new Accept API

    # Technician endpoints - Test Reports
    path('api/test-reports/', include('lab.components.Technician.TestReport.test_reports_urls')),
]



if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)