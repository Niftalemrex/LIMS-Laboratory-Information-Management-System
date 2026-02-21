# lab/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .NewTestRequest_models import TestRequest
from test_reports.models import TestReport

@receiver(post_save, sender=TestRequest)
def create_report(sender, instance, created, **kwargs):
    if created:
        TestReport.objects.create(
            test_request=instance,
            test_name=instance.test_type,
            priority=instance.priority
        )
