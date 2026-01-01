# myproject/urls.py (your main project urls)
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView  # For a simple home page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('pwa.urls')),
    path('', TemplateView.as_view(template_name='homepage.html'), name='home'),
    path('accounts/', include('accounts.urls')),
    path('dashboard/', include('dashboard.urls')),
]