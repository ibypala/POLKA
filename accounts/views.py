from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.db.models import Sum, Count
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.core.paginator import Paginator
from .forms import RegisterForm, LoginForm, UserEditForm, ProfileEditForm
from .models import Profile, Subscription
from videos.models import Video
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from django.http import HttpResponseRedirect


# === АВТОРИЗАЦИЯ ===

def register_view(request):
    """Регистрация нового пользователя"""
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Добро пожаловать, {user.username}! Регистрация прошла успешно.')
            return redirect('video_list')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{error}')
    else:
        form = RegisterForm()
    
    return render(request, 'registration/register.html', {'form': form})

def login_view(request):
    """Вход пользователя"""
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'С возвращением, {username}!')
                return redirect('video_list')
            else:
                messages.error(request, 'Неверное имя пользователя или пароль')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль')
    else:
        form = LoginForm()
    
    return render(request, 'registration/login.html', {'form': form})

def logout_view(request):
    """Выход пользователя"""
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы')
    return redirect('video_list')


# === ПРОФИЛЬ ===

def profile_view(request, username):
    """Просмотр профиля пользователя"""
    user = get_object_or_404(User, username=username)
    
    # Получаем или создаем профиль
    profile, created = Profile.objects.get_or_create(user=user)
    if created:
        messages.info(request, f'Профиль для {username} был автоматически создан')
    
    # Проверяем подписку (если пользователь залогинен)
    is_subscribed = False
    if request.user.is_authenticated and request.user != user:
        is_subscribed = Subscription.objects.filter(
            subscriber=request.user, channel=user
        ).exists()
    
    # Получаем видео пользователя
    videos = Video.objects.filter(uploaded_by=user).order_by('-uploaded_at')[:12]
    for video in videos:
        video.formatted_duration = video.duration_formatted()
    
    # Получаем статистику
    total_views = videos.aggregate(total=Sum('views_count'))['total'] or 0
    total_subscribers = Subscription.objects.filter(channel=user).count()
    
    # Обновляем статистику в профиле
    profile.videos_count = videos.count()
    profile.views_count = total_views
    profile.subscribers_count = total_subscribers
    profile.save()
    
    # Проверяем, свой ли это профиль
    is_owner = request.user == user
    
    return render(request, 'accounts/profile.html', {
        'profile_user': user,
        'profile': profile,
        'videos': videos,
        'is_owner': is_owner,
        'is_subscribed': is_subscribed,
        'total_views': total_views,
        'total_subscribers': total_subscribers,
    })

@login_required
def profile_edit(request):
    """Редактирование своего профиля"""

    user = request.user

    profile, created = Profile.objects.get_or_create(
        user=user
    )

    if request.method == 'POST':

        print("=" * 50)
        print("POST запрос на редактирование профиля")
        print("FILES:", request.FILES)
        print("POST data keys:", request.POST.keys())

        profile_form = ProfileEditForm(
            request.POST,
            request.FILES,
            instance=profile
        )

        if profile_form.is_valid():

            profile_form.save()

            print("Профиль сохранен!")
            print("Новый аватар:", profile.avatar)
            print("Новый баннер:", profile.banner)

            messages.success(
                request,
                'Профиль успешно обновлен!'
            )

            return redirect(
                'profile',
                username=user.username
            )

        else:

            print("Profile form errors:")
            print(profile_form.errors)

            for field, errors in profile_form.errors.items():
                for error in errors:
                    messages.error(
                        request,
                        f'Ошибка в поле {field}: {error}'
                    )

    else:

        profile_form = ProfileEditForm(
            instance=profile
        )

    return render(request, 'accounts/profile_edit.html', {
        'profile_form': profile_form,
    })

@login_required
@require_POST
def subscribe(request, username):
    """Подписка/отписка на канал"""
    channel = get_object_or_404(User, username=username)
    
    if request.user == channel:
        return JsonResponse({'error': 'Нельзя подписаться на себя'}, status=400)
    
    subscription, created = Subscription.objects.get_or_create(
        subscriber=request.user,
        channel=channel
    )
    
    if not created:
        subscription.delete()
        subscribed = False
    else:
        subscribed = True
    
    # Обновляем счетчик подписчиков
    subscribers_count = Subscription.objects.filter(channel=channel).count()
    
    return JsonResponse({
        'subscribed': subscribed,
        'subscribers_count': subscribers_count
    })

def profile_videos(request, username):
    """Все видео пользователя (с пагинацией)"""
    user = get_object_or_404(User, username=username)
    videos = Video.objects.filter(uploaded_by=user).order_by('-uploaded_at')
    
    # Пагинация
    paginator = Paginator(videos, 30)
    page = request.GET.get('page', 1)
    videos_page = paginator.get_page(page)
    
    for video in videos_page:
        video.formatted_duration = video.duration_formatted()
    
    return render(request, 'accounts/profile_videos.html', {
        'profile_user': user,
        'videos': videos_page,
        'is_owner': request.user == user,
        'page_obj': videos_page,
    })

def profile_subscribers(request, username):
    """Список подписчиков"""
    user = get_object_or_404(User, username=username)
    subscriptions = Subscription.objects.filter(channel=user).select_related('subscriber')
    
    return render(request, 'accounts/profile_subscribers.html', {
        'profile_user': user,
        'subscriptions': subscriptions,
        'is_owner': request.user == user,
    })

def profile_subscriptions(request, username):
    """На кого подписан пользователь"""
    user = get_object_or_404(User, username=username)
    subscriptions = Subscription.objects.filter(subscriber=user).select_related('channel')
    
    return render(request, 'accounts/profile_subscriptions.html', {
        'profile_user': user,
        'subscriptions': subscriptions,
        'is_owner': request.user == user,
    })


@login_required
def profile_settings(request):

    profile, created = Profile.objects.get_or_create(
        user=request.user
    )

    if request.method == 'POST':

        # ===== СМЕНА ПАРОЛЯ =====

        if 'old_password' in request.POST:

            user_form = UserEditForm(
                instance=request.user
            )

            password_form = PasswordChangeForm(
                request.user,
                request.POST
            )

            if password_form.is_valid():

                user = password_form.save()

                update_session_auth_hash(
                    request,
                    user
                )

                messages.success(
                    request,
                    'Пароль успешно изменен'
                )

                return HttpResponseRedirect('/accounts/settings/#security')

            else:

                for field, errors in password_form.errors.items():

                    for error in errors:

                        messages.error(
                            request,
                            error
                        )

        # ===== ОБНОВЛЕНИЕ ПРОФИЛЯ =====

        else:

            user_form = UserEditForm(
                request.POST,
                instance=request.user
            )

            password_form = PasswordChangeForm(
                request.user
            )

            if user_form.is_valid():

                user_form.save()

                messages.success(
                    request,
                    'Профиль успешно обновлен'
                )

                return redirect('profile_settings')

            else:

                for field, errors in user_form.errors.items():

                    for error in errors:

                        messages.error(
                            request,
                            error
                        )

    else:

        user_form = UserEditForm(
            instance=request.user
        )

        password_form = PasswordChangeForm(
            request.user
        )

    return render(request, 'accounts/profile_settings.html', {
        'user_form': user_form,
        'password_form': password_form,
        'profile': profile,
    })

@login_required
@require_POST
def delete_account(request):

    user = request.user

    logout(request)

    user.delete()

    messages.success(
        request,
        'Аккаунт успешно удален'
    )

    return redirect('video_list')