from django.db import models


class Alumni(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True, blank=True, null=True)
    role = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    batch = models.CharField(max_length=10)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=200, blank=True, default='')
    experience = models.CharField(max_length=50, blank=True, default='')
    industry = models.CharField(max_length=100, blank=True, default='')
    skills = models.JSONField(default=list, blank=True)
    available = models.BooleanField(default=True)
    linkedin = models.URLField(blank=True, default='')
    avatar = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Alumni'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.role} at {self.company} (Batch {self.batch})"
