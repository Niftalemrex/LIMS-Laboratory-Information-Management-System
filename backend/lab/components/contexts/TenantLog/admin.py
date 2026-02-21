from django.contrib import admin
from .models import TenantLog

@admin.register(TenantLog)
class TenantLogAdmin(admin.ModelAdmin):
    list_display = ('tenant_id', 'user', 'action', 'status', 'timestamp')
    list_filter = ('status', 'tenant_id')
    search_fields = ('user', 'action', 'details')
