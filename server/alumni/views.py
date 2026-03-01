from rest_framework import viewsets, filters
from rest_framework.response import Response
from django.db.models import Q
from .models import Alumni
from .serializers import AlumniSerializer, AlumniListSerializer


class AlumniViewSet(viewsets.ModelViewSet):
    """
    Alumni API — CRUD with search and filtering.

    Query params:
        ?search=<term>      — search name, role, company
        ?batch=<year>       — filter by batch year
        ?department=<dept>  — filter by department
        ?company=<company>  — filter by company
        ?industry=<ind>     — filter by industry
        ?available=true     — filter available mentors only
    """
    queryset = Alumni.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return AlumniListSerializer
        return AlumniSerializer

    def get_queryset(self):
        qs = Alumni.objects.all()
        params = self.request.query_params

        # Search
        search = params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(role__icontains=search) |
                Q(company__icontains=search) |
                Q(skills__icontains=search)
            )

        # Filters
        batch = params.get('batch')
        if batch:
            qs = qs.filter(batch=batch)

        department = params.get('department')
        if department:
            qs = qs.filter(department__iexact=department)

        company = params.get('company')
        if company:
            qs = qs.filter(company__iexact=company)

        industry = params.get('industry')
        if industry:
            qs = qs.filter(industry__iexact=industry)

        available = params.get('available')
        if available is not None:
            qs = qs.filter(available=available.lower() in ('true', '1', 'yes'))

        return qs

    def list(self, request, *args, **kwargs):
        """Override to add filter options metadata."""
        queryset = self.filter_queryset(self.get_queryset())
        all_alumni = Alumni.objects.all()

        # Build filter options from all data
        filter_options = {
            'batches': sorted(all_alumni.values_list('batch', flat=True).distinct()),
            'departments': sorted(all_alumni.values_list('department', flat=True).distinct()),
            'companies': sorted(all_alumni.values_list('company', flat=True).distinct()),
            'industries': sorted(all_alumni.values_list('industry', flat=True).distinct()),
        }

        # Stats
        stats = {
            'total': all_alumni.count(),
            'available_mentors': all_alumni.filter(available=True).count(),
            'companies_count': all_alumni.values('company').distinct().count(),
            'industries_count': all_alumni.values('industry').distinct().count(),
        }

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['filter_options'] = filter_options
            response.data['stats'] = stats
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'filter_options': filter_options,
            'stats': stats,
        })
