from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet, DoctorViewSet, SlotViewSet

router = DefaultRouter()
router.register("doctors", DoctorViewSet, basename="doctor")
router.register("slots", SlotViewSet, basename="slot")
router.register("", AppointmentViewSet, basename="appointment")

urlpatterns = router.urls
