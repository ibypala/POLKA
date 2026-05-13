from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import os
from datetime import datetime

def avatar_upload_path(instance, filename):
    """Путь для загрузки аватарок"""
    ext = filename.split('.')[-1].lower()
    # Создаем уникальное имя файла с временной меткой
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f'avatars/user_{instance.user.id}/avatar_{timestamp}.{ext}'

def banner_upload_path(instance, filename):
    """Путь для загрузки баннеров"""
    ext = filename.split('.')[-1].lower()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    # Измени 'banners' на 'covers' или 'headers'
    return f'covers/user_{instance.user.id}/cover_{timestamp}.{ext}'

class Profile(models.Model):
    """Профиль пользователя"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField('Аватар', upload_to=avatar_upload_path, blank=True, null=True)
    banner = models.ImageField('Баннер', upload_to=banner_upload_path, blank=True, null=True)
    bio = models.TextField('О себе', max_length=500, blank=True)
    location = models.CharField('Местоположение', max_length=100, blank=True)
    website = models.URLField('Сайт', blank=True, max_length=200)
    birth_date = models.DateField('Дата рождения', null=True, blank=True)
    
    # Социальные ссылки (только YouTube и Telegram)
    youtube = models.URLField('YouTube', blank=True, max_length=200)
    telegram = models.URLField('Telegram', blank=True, max_length=200)
    
    # Статистика
    subscribers_count = models.PositiveIntegerField('Подписчики', default=0)
    videos_count = models.PositiveIntegerField('Видео', default=0)
    views_count = models.PositiveIntegerField('Просмотры', default=0)
    
    # Настройки
    show_subscribers = models.BooleanField('Показывать подписчиков', default=True)
    show_views = models.BooleanField('Показывать просмотры', default=True)
    
    created_at = models.DateTimeField('Дата регистрации', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'
    
    def __str__(self):
        return f"Профиль {self.user.username}"
    
    def save(self, *args, **kwargs):
        """Переопределяем save для обработки старых файлов при обновлении"""
        try:
            # Если это обновление существующего профиля
            if self.pk:
                old_profile = Profile.objects.get(pk=self.pk)
                
                # Если загружен новый аватар - удаляем старый
                if old_profile.avatar and self.avatar and old_profile.avatar != self.avatar:
                    if os.path.isfile(old_profile.avatar.path):
                        os.remove(old_profile.avatar.path)
                
                # Если загружен новый баннер - удаляем старый
                if old_profile.banner and self.banner and old_profile.banner != self.banner:
                    if os.path.isfile(old_profile.banner.path):
                        os.remove(old_profile.banner.path)
        except Profile.DoesNotExist:
            pass
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """При удалении профиля удаляем файлы с диска"""
        # Удаляем аватар
        if self.avatar:
            if os.path.isfile(self.avatar.path):
                os.remove(self.avatar.path)
        
        # Удаляем баннер
        if self.banner:
            if os.path.isfile(self.banner.path):
                os.remove(self.banner.path)
        
        super().delete(*args, **kwargs)
    
    def update_stats(self):
        """Обновляет статистику профиля"""
        from videos.models import Video
        self.videos_count = Video.objects.filter(uploaded_by=self.user).count()
        self.views_count = Video.objects.filter(uploaded_by=self.user).aggregate(
            total=models.Sum('views_count')
        )['total'] or 0
        self.save()

# Сигнал для автоматического создания профиля при регистрации
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        Profile.objects.create(user=instance)

class Subscription(models.Model):
    """Подписки пользователей"""
    subscriber = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    channel = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscribers')
    created_at = models.DateTimeField('Дата подписки', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'
        unique_together = ['subscriber', 'channel']  # Нельзя подписаться дважды
        indexes = [
            models.Index(fields=['subscriber']),
            models.Index(fields=['channel']),
        ]
    
    def __str__(self):
        return f"{self.subscriber.username} подписан на {self.channel.username}"