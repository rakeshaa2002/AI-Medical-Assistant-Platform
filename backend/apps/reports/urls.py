from rest_framework.routers import DefaultRouter

from .views import MedicalReportViewSet

router = DefaultRouter()
router.register("", MedicalReportViewSet, basename="report")

urlpatterns = router.urls
