from rest_framework import serializers
from .models import Alumni


class AlumniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumni
        fields = [
            'id', 'name', 'email', 'role', 'company', 'batch',
            'department', 'location', 'experience', 'industry',
            'skills', 'available', 'linkedin', 'avatar',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AlumniListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list view."""
    class Meta:
        model = Alumni
        fields = [
            'id', 'name', 'role', 'company', 'batch',
            'department', 'location', 'experience', 'industry',
            'skills', 'available', 'linkedin',
        ]
