from django.urls import path
from .login_views import LoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
