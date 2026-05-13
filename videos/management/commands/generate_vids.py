import shortuuid
from django.core.management.base import BaseCommand
from videos.models import Video

class Command(BaseCommand):
    help = 'Генерирует короткие ID для всех видео'

    def handle(self, *args, **options):
        # Находим видео без vid
        videos = Video.objects.filter(vid__isnull=True) | Video.objects.filter(vid='')
        count = 0
        
        if not videos.exists():
            self.stdout.write(self.style.SUCCESS('Все видео уже имеют vid!'))
            return
        
        self.stdout.write(f"Найдено видео без vid: {videos.count()}")
        
        for video in videos:
            # Генерируем уникальный ID
            video.vid = shortuuid.ShortUUID().random(length=8)
            
            # Проверяем уникальность
            while Video.objects.filter(vid=video.vid).exclude(pk=video.pk).exists():
                video.vid = shortuuid.ShortUUID().random(length=8)
            
            video.save()
            count += 1
            self.stdout.write(f"✓ {video.title[:30]}... -> {video.vid}")
        
        self.stdout.write(self.style.SUCCESS(f"Готово! Сгенерировано ID: {count}"))