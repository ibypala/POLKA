from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import Profile
import os
import re


class RegisterForm(UserCreationForm):
    """Форма регистрации"""

    username = forms.CharField(
        label='Имя пользователя',
        max_length=30,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите имя пользователя',
            'maxlength': '30'
        })
    )

    email = forms.EmailField(
        label='Email',
        required=False,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите email (необязательно)'
        })
    )

    password1 = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите пароль'
        })
    )

    password2 = forms.CharField(
        label='Подтверждение пароля',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Повторите пароль'
        })
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password1',
            'password2'
        ]

    def clean_username(self):

        username = self.cleaned_data.get('username')

        if not re.match(
            r'^[a-zA-Z0-9@.+_-]+$',
            username
        ):

            raise forms.ValidationError(
                'Логин может содержать только английские буквы, цифры и символы @ . + _ -'
            )

        if User.objects.filter(
            username=username
        ).exists():

            raise forms.ValidationError(
                'Это имя пользователя уже занято'
            )

        return username


class LoginForm(AuthenticationForm):
    """Форма входа"""

    username = forms.CharField(
        label='Имя пользователя',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите имя пользователя'
        })
    )

    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите пароль'
        })
    )


class UserEditForm(forms.ModelForm):
    """Форма редактирования пользователя"""

    email = forms.EmailField(
        label='Email',
        required=False,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите email'
        })
    )

    first_name = forms.CharField(
        label='Имя',
        max_length=30,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите имя',
            'maxlength': '30'
        })
    )

    last_name = forms.CharField(
        label='Фамилия',
        max_length=30,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите фамилию',
            'maxlength': '30'
        })
    )

    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name'
        ]

    def clean_email(self):

        email = self.cleaned_data.get('email')

        if email and User.objects.filter(
            email=email
        ).exclude(
            pk=self.instance.pk
        ).exists():

            raise forms.ValidationError(
                'Этот email уже используется'
            )

        return email


class ProfileEditForm(forms.ModelForm):
    """Форма редактирования профиля"""

    bio = forms.CharField(
        label='О себе',
        required=False,
        max_length=500,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 5,
            'maxlength': '500',
            'placeholder': 'Расскажите о себе...'
        })
    )

    location = forms.CharField(
        label='Местоположение',
        required=False,
        max_length=100,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'maxlength': '100',
            'placeholder': 'Город, страна'
        })
    )

    website = forms.URLField(
        label='Личный сайт',
        required=False,
        max_length=200,
        widget=forms.URLInput(attrs={
            'class': 'form-control',
            'maxlength': '200',
            'placeholder': 'https://example.com'
        })
    )

    birth_date = forms.DateField(
        label='Дата рождения',
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        })
    )

    youtube = forms.URLField(
        label='YouTube',
        required=False,
        max_length=200,
        widget=forms.URLInput(attrs={
            'class': 'form-control',
            'maxlength': '200',
            'placeholder': 'https://youtube.com/@username'
        })
    )

    telegram = forms.URLField(
        label='Telegram',
        required=False,
        max_length=200,
        widget=forms.URLInput(attrs={
            'class': 'form-control',
            'maxlength': '200',
            'placeholder': 'https://t.me/username'
        })
    )

    class Meta:
        model = Profile

        fields = [
            'avatar',
            'banner',
            'bio',
            'location',
            'website',
            'birth_date',
            'youtube',
            'telegram'
        ]

        widgets = {

            'avatar': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': '.jpg,.jpeg,.png'
            }),

            'banner': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': '.jpg,.jpeg,.png'
            }),

        }

        labels = {
            'avatar': 'Аватар',
            'banner': 'Баннер профиля',
        }

        help_texts = {
            'avatar': 'Форматы: JPG, PNG. Максимум 5MB',
            'banner': 'Форматы: JPG, PNG. Максимум 10MB',
        }

    def clean_avatar(self):

        avatar = self.cleaned_data.get('avatar')

        if avatar:

            if avatar.size > 5 * 1024 * 1024:

                raise forms.ValidationError(
                    'Аватар не может быть больше 5MB'
                )

            ext = avatar.name.split('.')[-1].lower()

            if ext not in ['jpg', 'jpeg', 'png']:

                raise forms.ValidationError(
                    'Поддерживаются только JPG и PNG'
                )

        return avatar

    def clean_banner(self):

        banner = self.cleaned_data.get('banner')

        if banner:

            if banner.size > 10 * 1024 * 1024:

                raise forms.ValidationError(
                    'Баннер не может быть больше 10MB'
                )

            ext = banner.name.split('.')[-1].lower()

            if ext not in ['jpg', 'jpeg', 'png']:

                raise forms.ValidationError(
                    'Поддерживаются только JPG и PNG'
                )

        return banner

    def clean_website(self):

        website = self.cleaned_data.get('website')

        if website and not website.startswith(
            ('http://', 'https://')
        ):

            website = 'https://' + website

        return website

    def clean_youtube(self):

        youtube = self.cleaned_data.get('youtube')

        if youtube and not youtube.startswith(
            ('http://', 'https://')
        ):

            youtube = 'https://' + youtube

        return youtube

    def clean_telegram(self):

        telegram = self.cleaned_data.get('telegram')

        if telegram and not telegram.startswith(
            ('http://', 'https://')
        ):

            telegram = 'https://' + telegram

        return telegram