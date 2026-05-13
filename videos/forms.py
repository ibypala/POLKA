from django import forms
from .models import Video, Comment
import os 

class VideoUploadForm(forms.ModelForm):
    class Meta:
        model = Video
        fields = ['title', 'description', 'video_file', 'thumbnail']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите название видео'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Введите описание видео (можно оставить пустым)'
            }),
            'video_file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'video/mp4,video/mov,video/avi,video/mkv,video/webm'
            }),
            'thumbnail': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
            }),
        }
        labels = {
            'title': 'Название видео',
            'description': 'Описание',
            'video_file': 'Видео файл',
            'thumbnail': 'Превью (картинка)',
        }
        help_texts = {
            'video_file': 'Поддерживаемые форматы: MP4, MOV, AVI, MKV, WebM. Максимальный размер: 500MB',
            'thumbnail': 'Рекомендуемый размер: 640x360 (16:9). Форматы: JPG, PNG, GIF, WebP',
        }
    
    def clean_title(self):
        title = self.cleaned_data.get('title')
        if len(title) > 100:
            raise forms.ValidationError('Название не может быть длиннее 100 символов')
        return title

    def clean_description(self):
        description = self.cleaned_data.get('description')
        if description and len(description) > 5000:
            raise forms.ValidationError('Описание не может быть длиннее 5000 символов')
        return description
    
    def clean_video_file(self):
        video = self.cleaned_data.get('video_file')
        if video:
            # Проверяем расширение
            ext = os.path.splitext(video.name)[1].lower()
            valid_extensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
            if ext not in valid_extensions:
                raise forms.ValidationError(
                    f'Поддерживаются только видео файлы: {", ".join(valid_extensions)}'
                )
            
            # Проверяем размер (500MB)
            max_size = 500 * 1024 * 1024
            if video.size > max_size:
                size_mb = video.size / (1024 * 1024)
                raise forms.ValidationError(
                    f'Файл слишком большой ({size_mb:.1f} MB). '
                    f'Максимальный размер: 500 MB'
                )
        return video
    
    def clean_thumbnail(self):
        thumbnail = self.cleaned_data.get('thumbnail')
        if thumbnail:
            # Проверяем расширение
            ext = os.path.splitext(thumbnail.name)[1].lower()
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            if ext not in valid_extensions:
                raise forms.ValidationError(
                    f'Поддерживаются только изображения: {", ".join(valid_extensions)}'
                )
            
            # Проверяем размер (10MB)
            max_size = 10 * 1024 * 1024
            if thumbnail.size > max_size:
                size_mb = thumbnail.size / (1024 * 1024)
                raise forms.ValidationError(
                    f'Изображение слишком большое ({size_mb:.1f} MB). '
                    f'Максимальный размер: 10 MB'
                )
            
            # Проверяем что это действительно изображение
            try:
                from PIL import Image
                img = Image.open(thumbnail)
                img.verify()  # Проверяем что файл корректен
            except Exception as e:
                raise forms.ValidationError(f'Файл не является изображением или поврежден: {e}')
            
        return thumbnail


class VideoEditForm(forms.ModelForm):
    """Форма для редактирования видео"""
    class Meta:
        model = Video
        fields = ['title', 'description', 'thumbnail']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите название видео'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Введите описание видео'
            }),
            'thumbnail': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
            }),
        }
        labels = {
            'title': 'Название видео',
            'description': 'Описание',
            'thumbnail': 'Превью (картинка)',
        }
        help_texts = {
            'thumbnail': 'Оставьте пустым, чтобы оставить текущее превью',
        }
    
    
    def clean_title(self):
        title = self.cleaned_data.get('title')
        if len(title) > 100:
            raise forms.ValidationError('Название не может быть длиннее 100 символов')
        return title

    def clean_description(self):
        description = self.cleaned_data.get('description')
        if description and len(description) > 5000:
            raise forms.ValidationError('Описание не может быть длиннее 5000 символов')
        return description
    
    def clean_thumbnail(self):
        thumbnail = self.cleaned_data.get('thumbnail')
        if thumbnail:
            # Проверяем расширение
            ext = os.path.splitext(thumbnail.name)[1].lower()
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            if ext not in valid_extensions:
                raise forms.ValidationError(
                    f'Поддерживаются только изображения: {", ".join(valid_extensions)}'
                )
            
            # Проверяем размер (10MB)
            max_size = 10 * 1024 * 1024
            if thumbnail.size > max_size:
                size_mb = thumbnail.size / (1024 * 1024)
                raise forms.ValidationError(
                    f'Изображение слишком большое ({size_mb:.1f} MB). '
                    f'Максимальный размер: 10 MB'
                )
        return thumbnail

class CommentForm(forms.ModelForm):
    """Форма для комментариев"""
    class Meta:
        model = Comment
        fields = ['text']
        widgets = {
            'text': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Напишите комментарий...'
            }),
        }
        labels = {
            'text': '',
        }
