# dashboard/urls.py
from django.urls import path
from . import views

app_name = 'dashboard'  # Important for namespacing

urlpatterns = [
    path('homepage/', views.homepage, name='homepage'),
    path('community/', views.community, name='community'),
    path('base/', views.base_dashboard, name='base_dashboard'),

]