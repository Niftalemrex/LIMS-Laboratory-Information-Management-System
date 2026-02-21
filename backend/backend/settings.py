"""
Django settings for backend project.
"""

from pathlib import Path

# ------------------------
# BASE DIR
# ------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ------------------------
# SECURITY
# ------------------------
SECRET_KEY = 'django-insecure-_*vnj)lo)((lm$2+i$+ms*gyeu8f8$40$wyeq1_+328&fbx@z$'
DEBUG = True
ALLOWED_HOSTS = [ 
    '127.0.0.1',
    'localhost',
    '10.0.2.2',         # Android emulator
    '192.168.1.100',    # Replace with your PC LAN IP
    '192.168.0.2',      # your LAN IP
]

# ------------------------
# INSTALLED APPS
# ------------------------
INSTALLED_APPS = [
    # Django default
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',

    # Local apps
    'lab',

    # Technician
    'lab.components.Technician',
    'lab.components.Technician.Sample',
    'lab.components.Technician.Equipment',
     'lab.components.Technician.Inventory',

    # Doctor
    'lab.components.Doctor.NewTestRequest',
    'lab.components.Doctor.DocterAppointment',

    # Patient
    'lab.components.PatientPortal.PatientAppointment',

    # TenantAdmin
    'lab.components.tenantadmin.HomeVisitRequests',
    'lab.components.tenantadmin.TenantAdminProfile',
    'lab.components.tenantadmin.ManageUsers',

    # Superadmin
    'lab.components.superadmin.CreateTenant',

    # TenantAccessAuth (Login system)
    # 'lab.components.TenantAccessAuth.Login',  # old style
    'lab.components.TenantAccessAuth.Login.apps.LoginConfig',  # new style

    # Contexts
    'lab.components.contexts.SystemLog.apps.SystemLogConfig',
    'lab.components.contexts.TenantLog.apps.TenantLogConfig',

    # ✅ System Alerts (new)
    'lab.components.Support.SystemAlerts',
]


# ------------------------
# MIDDLEWARE
# ------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first for CORS
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ------------------------
# URLS & TEMPLATES
# ------------------------
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ------------------------
# DATABASE
# ------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'lims_db',
        'USER': 'lims_user',
        'PASSWORD': 'lims321',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# ------------------------
# AUTH PASSWORD VALIDATORS
# ------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ------------------------
# INTERNATIONALIZATION
# ------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ------------------------
# STATIC FILES
# ------------------------
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / "static"]

# ------------------------
# MEDIA FILES
# ------------------------
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ------------------------
# DEFAULT PK FIELD TYPE
# ------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ------------------------
# CORS
# ------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev server
    "http://127.0.0.1:5173",
    "http://localhost:8000",   # Django default
    "http://127.0.0.1:8000",
    "http://10.0.2.2:8000",
    "http://192.168.1.100:8000",
]
CORS_ALLOW_CREDENTIALS = True

# ------------------------
# REST FRAMEWORK
# ------------------------
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}


# ------------------------
# AUTHENTICATION
# ------------------------
#AUTH_USER_MODEL = 'tenantaccess_login.User'

  # <-- Fixed: use app label + model name

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # keep default
    'lab.components.TenantAccessAuth.backends.EmailBackend',  # custom email backend
]

APPEND_SLASH = True
