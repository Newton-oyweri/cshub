from django.http import HttpResponse
from django.shortcuts import render

def profilecontent(request):
    return render(request, 'profilecontent.html')

def communitycontent(request):
    return render(request, 'communitycontent.html')