from django.contrib import admin
from .models import Alumni


@admin.register(Alumni)
class AlumniAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'company', 'batch', 'department', 'available')
    list_filter = ('batch', 'department', 'industry', 'available')
    search_fields = ('name', 'role', 'company', 'email')
    list_editable = ('available',)
    ordering = ('-created_at',)
