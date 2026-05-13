from django.core.management.base import BaseCommand
from django.template.defaultfilters import slugify
from videos.models import Video

class Command(BaseCommand):
    help = 'Генерирует slug для всех видео'

    def handle(self, *args, **options):
        videos = Video.objects.filter(slug__isnull=True) | Video.objects.filter(slug='')
        count = 0
        
        for video in videos:
            if video.title:
                video.slug = slugify(video.title)
                
                # Проверяем уникальность
                original_slug = video.slug
                counter = 1
                while Video.objects.filter(slug=video.slug).exclude(pk=video.pk).exists():
                    video.slug = f"{original_slug}-{counter}"
                    counter += 1
                
                video.save()
                count += 1
                self.stdout.write(f"Сгенерирован slug для: {video.title} -> {video.slug}")
        
        self.stdout.write(self.style.SUCCESS(f"Готово! Обработано видео: {count}"))