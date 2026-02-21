from django.urls import path
from .sample_views import SampleList, SampleDetail

app_name = "sample"

urlpatterns = [
    path("", SampleList.as_view(), name="list"),
    path("<int:pk>/", SampleDetail.as_view(), name="detail"),
]
