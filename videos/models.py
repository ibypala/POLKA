from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse  # Добавил импорт
import os
from datetime import timedelta
import subprocess
import json
from PIL import Image
import io
from django.core.files.base import ContentFile
from django.template.defaultfilters import slugify
import shortuuid

def video_upload_path(instance, filename):
    """Сохраняем видео в папку с ID пользователя"""
    # Очищаем имя файла от спецсимволов
    import re
    filename = re.sub(r'[^\w\.-]', '', filename)
    return f'videos/user_{instance.uploaded_by.id}/{filename}'

def thumbnail_upload_path(instance, filename):
    """Сохраняем превью в папку с ID пользователя"""
    name, ext = os.path.splitext(filename)
    return f'thumbnails/user_{instance.uploaded_by.id}/{name}.jpg'

class Video(models.Model):
    # Основная информация
    title = models.CharField('Название', max_length=100)  # было 200
    description = models.TextField('Описание', max_length=5000, blank=True)  # ограничение 5000 символов
    vid = models.CharField('Video ID', max_length=20, unique=True, blank=True, editable=False)
    
    # Файлы
    video_file = models.FileField('Видео файл', upload_to=video_upload_path)
    thumbnail = models.ImageField('Превью', upload_to=thumbnail_upload_path, blank=True, null=True)
    
    # Метаданные видео
    duration = models.IntegerField('Длительность (сек)', default=0, help_text='Длительность видео в секундах')
    file_size = models.BigIntegerField('Размер файла (байт)', default=0)
    video_format = models.CharField('Формат видео', max_length=10, blank=True)
    resolution = models.CharField('Разрешение', max_length=20, blank=True)
    
    # Автор и дата
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Загрузил', related_name='videos')
    uploaded_at = models.DateTimeField('Дата загрузки', auto_now_add=True)
    
    # Статистика
    views_count = models.PositiveIntegerField('Просмотры', default=0)
    likes_count = models.PositiveIntegerField('Лайки', default=0)
    
    class Meta:
        verbose_name = 'Видео'
        verbose_name_plural = 'Видео'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['-uploaded_at']),
            models.Index(fields=['uploaded_by']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        """Возвращает URL для видео (как в YouTube)"""
        return reverse('video_detail', kwargs={'vid': self.vid})
    
    def generate_thumbnail_from_video(self):
        """Генерирует превью из видео (первый кадр)"""
        if not self.video_file:
            return False
        
        try:
            import subprocess
            import os
            from django.core.files import File
            import time
            
            # Путь для временного файла
            temp_dir = os.path.dirname(self.video_file.path)
            temp_path = os.path.join(temp_dir, f'temp_thumb_{int(time.time())}.jpg')
            
            print(f"Генерируем превью для: {self.video_file.path}")
            
            # Генерируем превью через ffmpeg (первый кадр)
            # Берем кадр на 1 секунде, если видео длинное, иначе первый кадр
            seek_time = '00:00:01'
            if self.duration and self.duration < 2:
                seek_time = '00:00:00'
            
            result = subprocess.run(
                [
                    'ffmpeg', '-i', self.video_file.path,
                    '-ss', seek_time,           # кадр на 1 секунде
                    '-vframes', '1',            # один кадр
                    '-q:v', '2',                # качество
                    '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080',  # FullHD 16:9
                    temp_path, '-y'
                ],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0 and os.path.exists(temp_path):
                # Открываем сгенерированное изображение
                with open(temp_path, 'rb') as f:
                    # Генерируем имя для файла превью
                    thumb_filename = f"thumb_{os.path.splitext(os.path.basename(self.video_file.name))[0]}.jpg"
                    
                    # Сохраняем как превью
                    self.thumbnail.save(
                        thumb_filename,
                        File(f),
                        save=False
                    )
                
                # Удаляем временный файл
                os.remove(temp_path)
                
                print(f"Превью сгенерировано для видео: {self.title}")
                return True
            else:
                print(f"Ошибка генерации превью: {result.stderr}")
                
                # Если не получилось с 1 секунды, пробуем с 0
                result = subprocess.run(
                    ['ffmpeg', '-i', self.video_file.path, '-ss', '00:00:00', '-vframes', '1', 
                     '-q:v', '2', '-vf', 'scale=640:360:force_original_aspect_ratio=increase,crop=640:360', 
                     temp_path, '-y'],
                    capture_output=True,
                    text=True
                )
                
                if result.returncode == 0 and os.path.exists(temp_path):
                    with open(temp_path, 'rb') as f:
                        thumb_filename = f"thumb_{os.path.splitext(os.path.basename(self.video_file.name))[0]}.jpg"
                        self.thumbnail.save(
                            thumb_filename,
                            File(f),
                            save=False
                        )
                    
                    os.remove(temp_path)
                    print(f"Превью сгенерировано (с 0 секунды) для видео: {self.title}")
                    return True
                
                return False
                
        except Exception as e:
            print(f"Ошибка при генерации превью: {e}")
            import traceback
            traceback.print_exc()
            return False
        
    def process_thumbnail(self):
        """Обрабатывает превью: изменяет размер и оптимизирует"""
        if self.thumbnail:
            try:
                from PIL import Image
                
                # Открываем изображение
                img = Image.open(self.thumbnail.path)
                
                # Целевой размер для видео (16:9)
                target_size = (1280, 720)  # HD качество
                
                # Создаем новое изображение с черным фоном
                new_img = Image.new('RGB', target_size, (0, 0, 0))
                
                # Изменяем размер оригинального изображения с сохранением пропорций
                img.thumbnail(target_size, Image.Resampling.LANCZOS)
                
                # Вставляем изображение по центру
                x = (target_size[0] - img.width) // 2
                y = (target_size[1] - img.height) // 2
                new_img.paste(img, (x, y))
                
                # Сохраняем
                new_img.save(self.thumbnail.path, quality=85, optimize=True)
                print(f"Превью обработано: {self.thumbnail.path}")
                
            except Exception as e:
                print(f"Ошибка при обработке превью: {e}")
    
    def save(self, *args, **kwargs):
        """При сохранении получаем информацию о видео"""
        is_new = self.pk is None
        
        # Генерируем короткий ID, если его нет
        if not self.vid:
            self.vid = shortuuid.ShortUUID().random(length=8)  # Например: "fnPqXCXC"
            
            # Проверяем уникальность
            while Video.objects.filter(vid=self.vid).exists():
                self.vid = shortuuid.ShortUUID().random(length=8)
        
        # Если это новое видео или загружен новый файл
        if is_new and self.video_file:
            # Получаем размер файла
            self.file_size = self.video_file.size
            
            # Сначала сохраняем, чтобы файл появился на диске
            super().save(*args, **kwargs)
            
            # Получаем информацию о видео через ffprobe
            try:
                import subprocess
                import os
                
                video_path = self.video_file.path
                print(f"Путь к видео: {video_path}")
                
                # Проверяем существует ли файл
                if os.path.exists(video_path):
                    print(f"Файл найден: {video_path}")
                    
                    # Пробуем получить длительность через ffprobe
                    result = subprocess.run(
                        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', 
                         '-of', 'default=noprint_wrappers=1:nokey=1', video_path],
                        capture_output=True,
                        text=True
                    )
                    
                    print(f"Результат ffprobe: {result.stdout}")
                    print(f"Ошибки ffprobe: {result.stderr}")
                    
                    if result.returncode == 0 and result.stdout.strip():
                        try:
                            duration_float = float(result.stdout.strip())
                            self.duration = int(duration_float)
                            print(f"Длительность установлена: {self.duration} секунд")
                            
                            # Обновляем запись с длительностью
                            self.save(update_fields=['duration'])
                        except ValueError as e:
                            print(f"Ошибка преобразования длительности: {e}")
                    else:
                        print("ffprobe не вернул длительность")
                else:
                    print(f"Файл НЕ найден: {video_path}")
                    
            except Exception as e:
                print(f"Ошибка при получении длительности: {e}")
                import traceback
                traceback.print_exc()
        else:
            # Если видео не новое, просто сохраняем
            super().save(*args, **kwargs)
        
        # Если превью не загружено - генерируем из видео
        if not self.thumbnail and self.video_file:
            print(f"Нет превью, генерируем для видео: {self.title}")
            self.generate_thumbnail_from_video()
            # ВАЖНО: сохраняем после генерации превью
            super().save(update_fields=['thumbnail'])

        # Обрабатываем превью (если оно есть)
        if self.thumbnail:
            self.process_thumbnail()
            # ВАЖНО: сохраняем после обработки
            super().save(update_fields=['thumbnail'])
    
    def delete(self, *args, **kwargs):
        """При удалении удаляем файлы с диска"""
        # Удаляем видео файл
        if self.video_file:
            if os.path.isfile(self.video_file.path):
                os.remove(self.video_file.path)
        
        # Удаляем превью
        if self.thumbnail:
            if os.path.isfile(self.thumbnail.path):
                os.remove(self.thumbnail.path)
        
        # Удаляем папку пользователя, если она пустая
        video_folder = os.path.dirname(self.video_file.path) if self.video_file else None
        thumbnail_folder = os.path.dirname(self.thumbnail.path) if self.thumbnail else None
        
        super().delete(*args, **kwargs)
        
        # Пытаемся удалить пустые папки
        try:
            if video_folder and os.path.exists(video_folder) and not os.listdir(video_folder):
                os.rmdir(video_folder)
        except:
            pass
        
        try:
            if thumbnail_folder and os.path.exists(thumbnail_folder) and not os.listdir(thumbnail_folder):
                os.rmdir(thumbnail_folder)
        except:
            pass
    
    def duration_formatted(self):
        """Возвращает длительность в формате ЧЧ:ММ:СС"""
        if self.duration and self.duration > 0:
            hours = self.duration // 3600
            minutes = (self.duration % 3600) // 60
            seconds = self.duration % 60
            
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes}:{seconds:02d}"
        return "00:00"
    
    def file_size_formatted(self):
        """Возвращает размер файла в читаемом формате"""
        if self.file_size:
            size = self.file_size
            if size < 1024:
                return f"{size} B"
            elif size < 1024 * 1024:
                return f"{size / 1024:.1f} KB"
            elif size < 1024 * 1024 * 1024:
                return f"{size / (1024 * 1024):.1f} MB"
            else:
                return f"{size / (1024 * 1024 * 1024):.2f} GB"
        return "0 MB"

class Like(models.Model):
    """Лайки к видео"""
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField('Дата лайка', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Лайк'
        verbose_name_plural = 'Лайки'
        unique_together = ['video', 'user']  # Один пользователь может лайкнуть видео только раз
    
    def __str__(self):
        return f"{self.user.username} лайкнул {self.video.title}"
        
class Dislike(models.Model):
    """Дизлайки к видео"""
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='dislikes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField('Дата дизлайка', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Дизлайк'
        verbose_name_plural = 'Дизлайки'
        unique_together = ['video', 'user']  # Один пользователь может дизлайкнуть видео только раз
    
    def __str__(self):
        return f"{self.user.username} дизлайкнул {self.video.title}"

class ViewStat(models.Model):
    """Статистика просмотров"""
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='view_stats')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    viewed_at = models.DateTimeField('Время просмотра', auto_now_add=True)
    ip_address = models.GenericIPAddressField('IP адрес', blank=True, null=True)
    
    class Meta:
        verbose_name = 'Статистика просмотра'
        verbose_name_plural = 'Статистика просмотров'
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"{self.video.title} - {self.viewed_at}"
        
        
class Comment(models.Model):
    """Комментарии к видео"""
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField('Текст комментария', max_length=2000)
    created_at = models.DateTimeField('Дата комментария', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}: {self.text[:50]}"