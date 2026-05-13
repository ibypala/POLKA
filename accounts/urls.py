from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),

    path('@<str:username>/', views.profile_view, name='profile'),
    path('@<str:username>/videos/', views.profile_videos, name='profile_videos'),

    path('profile/edit/', views.profile_edit, name='profile_edit'),

    path('subscribe/<str:username>/', views.subscribe, name='subscribe'),

    path('settings/', views.profile_settings, name='profile_settings'),

    path('delete/', views.delete_account, name='delete_account'),
]