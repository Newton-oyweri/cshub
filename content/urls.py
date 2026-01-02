from django.urls import path
from . import views
app_name = 'content'  # Important for namespacing
urlpatterns = [
    # Example route - you can change or add more later
    path('', views.profilecontent, name='profilecontent'),
    path('community/', views.communitycontent, name='communitycontent'),
]