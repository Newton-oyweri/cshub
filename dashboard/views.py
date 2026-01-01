# dashboard/views.py
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

def homepage(request):
    return render(request, 'homepage.html')

def community(request):
    return render(request, 'community.html')

def base_dashboard(request):
    return render(request, 'base_dashboard.html')