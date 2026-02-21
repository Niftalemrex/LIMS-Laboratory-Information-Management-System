from django.urls import path, include 
from rest_framework.routers import DefaultRouter 
from .NewTestRequest_views import NewTestRequestViewSet 


router = DefaultRouter() 
router.register(r'test-requests', NewTestRequestViewSet, basename='testrequest') 
urlpatterns = [ path('', include(router.urls)), ]