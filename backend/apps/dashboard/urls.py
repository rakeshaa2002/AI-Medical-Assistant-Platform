from django.urls import path

from .views import AdminStatsView, MyStatsView

urlpatterns = [
    path("admin-stats/", AdminStatsView.as_view(), name="admin_stats"),
    path("my-stats/", MyStatsView.as_view(), name="my_stats"),
]
