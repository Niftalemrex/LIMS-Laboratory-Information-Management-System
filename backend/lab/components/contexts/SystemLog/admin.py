from django.contrib import admin
from .models import SystemLog

@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'user', 'action', 'status', 'ipAddress')
    list_filter = ('status', 'timestamp')
    search_fields = ('user', 'action', 'details')
