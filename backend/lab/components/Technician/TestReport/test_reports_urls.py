from django.urls import path
from .test_reports_views import TestReportList, TestReportDetail

app_name = "test_report"

urlpatterns = [
    path("", TestReportList.as_view(), name="list"),
    path("<int:pk>/", TestReportDetail.as_view(), name="detail"),
]
