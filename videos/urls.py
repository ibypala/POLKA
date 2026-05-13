from django.urls import path
from . import views

urlpatterns = [
    path('', views.video_list, name='video_list'),
    path('watch/<str:vid>/', views.video_detail, name='video_detail'),  # YouTube-style
    path('upload/', views.video_upload, name='video_upload'),
    path('my-videos/', views.my_videos, name='my_videos'),
    path('video/<int:pk>/edit/', views.video_edit, name='video_edit'),
    path('video/<int:pk>/delete/', views.video_delete, name='video_delete'),
    path('video/<int:pk>/like/', views.like_video, name='like_video'),
    path('video/<int:pk>/dislike/', views.dislike_video, name='dislike_video'),
    path('video/<int:pk>/comment/', views.add_comment, name='add_comment'),
    path('comment/<int:pk>/reply/', views.reply_comment, name='reply_comment'),
    path('comment/<int:pk>/delete/', views.delete_comment, name='delete_comment'),
    path('load-more-recommendations/', views.load_more_recommendations, name='load_more_recommendations'),
    path('ajax-upload/', views.ajax_video_upload, name='ajax_video_upload'),
]