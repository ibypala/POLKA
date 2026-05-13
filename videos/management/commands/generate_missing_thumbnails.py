import os
from django.core.management.base import BaseCommand
from videos.models import Video

class Command(BaseCommand):
    help = 'Генерирует превью для видео, у которых нет превью'

    def handle(self, *args, **options):
        videos = Video.objects.filter(thumbnail='')
        total = videos.count()
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS("Все видео уже имеют превью!"))
            return
        
        self.stdout.write(f"Найдено видео без превью: {total}")
        
        generated = 0
        for video in videos:
            self.stdout.write(f"Обрабатываем: {video.title}")
            if video.generate_thumbnail_from_video():
                video.save()  # Сохраняем изменения
                generated += 1
                self.stdout.write(self.style.SUCCESS(f"  ✓ Превью сгенерировано"))
            else:
                self.stdout.write(self.style.ERROR(f"  ✗ Ошибка генерации"))
        
        self.stdout.write(self.style.SUCCESS(
            f"Готово! Сгенерировано превью: {generated} из {total}"
        ))