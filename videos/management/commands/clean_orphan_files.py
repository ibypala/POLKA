import os
from django.core.management.base import BaseCommand
from django.conf import settings
from videos.models import Video

class Command(BaseCommand):
    help = 'Очищает файлы видео и превью, на которые нет ссылок в базе данных'
    
    def handle(self, *args, **options):
        self.stdout.write("Начинаем очистку мусорных файлов...")
        
        # Получаем все пути к файлам из базы
        db_video_paths = []
        db_thumbnail_paths = []
        
        for video in Video.objects.all():
            if video.video_file:
                # Получаем относительный путь от MEDIA_ROOT
                rel_path = video.video_file.name
                db_video_paths.append(rel_path)
                self.stdout.write(f"В БД есть видео: {rel_path}")
            
            if video.thumbnail:
                rel_path = video.thumbnail.name
                db_thumbnail_paths.append(rel_path)
                self.stdout.write(f"В БД есть превью: {rel_path}")
        
        # Проверяем файлы в папке media/videos
        videos_dir = os.path.join(settings.MEDIA_ROOT, 'videos')
        thumbnails_dir = os.path.join(settings.MEDIA_ROOT, 'thumbnails')
        
        deleted_count = 0
        
        # Проверяем видео
        if os.path.exists(videos_dir):
            for root, dirs, files in os.walk(videos_dir):
                for file in files:
                    full_path = os.path.join(root, file)
                    # Получаем относительный путь
                    rel_path = os.path.relpath(full_path, settings.MEDIA_ROOT).replace('\\', '/')
                    
                    if rel_path not in db_video_paths:
                        # Файл есть на диске, но нет в базе
                        os.remove(full_path)
                        self.stdout.write(self.style.WARNING(f"Удален мусорный файл: {full_path}"))
                        deleted_count += 1
        
        # Проверяем превью
        if os.path.exists(thumbnails_dir):
            for root, dirs, files in os.walk(thumbnails_dir):
                for file in files:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, settings.MEDIA_ROOT).replace('\\', '/')
                    
                    if rel_path not in db_thumbnail_paths:
                        os.remove(full_path)
                        self.stdout.write(self.style.WARNING(f"Удален мусорный файл: {full_path}"))
                        deleted_count += 1
        
        # Удаляем пустые папки
        for root, dirs, files in os.walk(settings.MEDIA_ROOT, topdown=False):
            if not os.listdir(root) and root != settings.MEDIA_ROOT:
                os.rmdir(root)
                self.stdout.write(self.style.WARNING(f"Удалена пустая папка: {root}"))
        
        self.stdout.write(self.style.SUCCESS(f"Очистка завершена. Удалено файлов: {deleted_count}"))