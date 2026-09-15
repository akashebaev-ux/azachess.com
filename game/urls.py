from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path(
        "analyse/",
        views.analyse_position,
        name="analyse_position",
    ),
]
