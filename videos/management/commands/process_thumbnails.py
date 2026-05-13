import os
from django.core.management.base import BaseCommand
from videos.models import Video

class Command(BaseCommand):
    help = 'Обрабатывает все превью: изменяет размер и оптимизирует'

    def add_arguments(self, parser):
        parser.add_argument(
            '--generate',
            action='store_true',
            help='Генерировать превью для видео без превью',
        )

    def handle(self, *args, **options):
        videos = Video.objects.all()
        processed = 0
        generated = 0
        
        for video in videos:
            # Обрабатываем существующие превью
            if video.thumbnail:
                try:
                    video.process_thumbnail()
                    processed += 1
                    self.stdout.write(f"Обработано превью: {video.title}")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Ошибка у {video.title}: {e}"))
            
            # Генерируем новые превью если нужно
            elif options['generate'] and video.video_file:
                try:
                    if video.generate_thumbnail_from_video():
                        generated += 1
                        self.stdout.write(f"Сгенерировано превью: {video.title}")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Ошибка генерации у {video.title}: {e}"))
        
        self.stdout.write(self.style.SUCCESS(
            f"Готово! Обработано превью: {processed}, сгенерировано новых: {generated}"
        ))