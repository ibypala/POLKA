from django.contrib import admin
from .models import Video, ViewStat

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'uploaded_by', 'uploaded_at', 'views_count', 'video_file_size']
    list_filter = ['uploaded_at', 'uploaded_by']
    search_fields = ['title', 'description']
    readonly_fields = ['views_count', 'video_file_path', 'thumbnail_path']
    
    def video_file_size(self, obj):
        if obj.video_file:
            size = obj.video_file.size
            if size < 1024:
                return f"{size} B"
            elif size < 1024 * 1024:
                return f"{size / 1024:.1f} KB"
            else:
                return f"{size / (1024 * 1024):.1f} MB"
        return "-"
    video_file_size.short_description = 'Размер видео'
    
    def video_file_path(self, obj):
        if obj.video_file:
            return obj.video_file.path
        return "-"
    video_file_path.short_description = 'Путь к видео'
    
    def thumbnail_path(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.path
        return "-"
    thumbnail_path.short_description = 'Путь к превью'

@admin.register(ViewStat)
class ViewStatAdmin(admin.ModelAdmin):
    list_display = ['video', 'user', 'viewed_at', 'ip_address']
    list_filter = ['viewed_at']