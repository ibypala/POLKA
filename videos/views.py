from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.db.models import Count, Q
from django.http import JsonResponse
from .models import Video, ViewStat, Like, Dislike, Comment
from .forms import VideoUploadForm, VideoEditForm, CommentForm
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST
from .permissions import user_can_edit_video, user_can_upload, get_user_role
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.template.loader import render_to_string
import json




def video_list(request):
    """Главная страница со списком видео"""
    # Получаем параметры сортировки
    sort = request.GET.get('sort', 'newest')
    
    # Базовый запрос
    videos = Video.objects.all()
    
    # Применяем сортировку
    if sort == 'newest':
        videos = videos.order_by('-uploaded_at')
    elif sort == 'popular':
        videos = videos.order_by('-views_count')
    elif sort == 'oldest':
        videos = videos.order_by('uploaded_at')
    
    # Для каждого видео добавляем отформатированную длительность
    for video in videos:
        video.formatted_duration = video.duration_formatted()
        # Для отладки - посмотрим в консоль
        print(f"Видео: {video.title}, длительность: {video.duration}, формат: {video.formatted_duration}")
    
    user_role = get_user_role(request.user)
    
    return render(request, 'videos/video_list.html', {
        'videos': videos,
        'user_role': user_role,
        'current_sort': sort
    })

# УДАЛИ старую функцию video_detail (ту что с pk) - она дублируется
# Оставляем только одну функцию video_detail с slug

@login_required
def video_upload(request):
    """Загрузка видео"""
    if not user_can_upload(request.user):
        raise PermissionDenied("У вас нет прав для загрузки видео")
    
    if request.method == 'POST':
        form = VideoUploadForm(request.POST, request.FILES)
        if form.is_valid():
            video = form.save(commit=False)
            video.uploaded_by = request.user
            video.save()
            messages.success(request, 'Видео успешно загружено!')
            # Перенаправляем на video_detail с slug
            return redirect('video_detail', vid=video.vid)
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{error}')
    else:
        form = VideoUploadForm()
    
    return render(request, 'videos/video_upload.html', {'form': form})

@login_required
def my_videos(request):
    """Список видео текущего пользователя"""
    # Получаем параметры сортировки
    sort = request.GET.get('sort', 'newest')
    
    # Базовый запрос
    videos = Video.objects.filter(uploaded_by=request.user)
    
    # Применяем сортировку
    if sort == 'newest':
        videos = videos.order_by('-uploaded_at')
    elif sort == 'oldest':
        videos = videos.order_by('uploaded_at')
    elif sort == 'popular':
        videos = videos.order_by('-views_count')
    
    # Добавляем статистику
    for video in videos:
        video.formatted_duration = video.duration_formatted()
    
    total_views = sum(v.views_count for v in videos)
    total_likes = sum(v.likes.count() for v in videos)
    
    return render(request, 'videos/my_videos.html', {
        'videos': videos,
        'total_videos': videos.count(),
        'total_views': total_views,
        'total_likes': total_likes,
        'current_sort': sort
    })


def video_detail(request, vid):
    """Страница просмотра видео (по vid)"""
    video = get_object_or_404(Video, vid=vid)
    
    # Увеличиваем счетчик просмотров
    video.views_count += 1
    video.save()
    
    # Записываем статистику
    ViewStat.objects.create(
        video=video,
        user=request.user if request.user.is_authenticated else None,
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    # Проверяем лайки/дизлайки
    user_liked = False
    user_disliked = False
    if request.user.is_authenticated:
        user_liked = Like.objects.filter(video=video, user=request.user).exists()
        user_disliked = Dislike.objects.filter(video=video, user=request.user).exists()
    
    # Получаем комментарии (только родительские, без ответов)
    comments = video.comments.filter(parent=None)
    
    # Получаем похожие видео (исключая текущее)
    similar_videos = Video.objects.exclude(pk=video.pk).order_by('-views_count')[:20]
    
    for similar in similar_videos:
        similar.formatted_duration = similar.duration_formatted()
    
    # Форма комментария
    comment_form = CommentForm()
    
    return render(request, 'videos/video_detail.html', {
        'video': video,
        'user_liked': user_liked,
        'user_disliked': user_disliked,
        'similar_videos': similar_videos,
        'comments': comments,
        'comment_form': comment_form,
    })


@login_required
@csrf_exempt
def ajax_video_upload(request):
    """AJAX загрузка видео с прогрессом"""
    if request.method == 'POST':
        form = VideoUploadForm(request.POST, request.FILES)
        if form.is_valid():
            video = form.save(commit=False)
            video.uploaded_by = request.user
            video.save()
            
            # Возвращаем JSON с URL для редиректа
            return JsonResponse({
                'success': True,
                'redirect_url': reverse('video_detail', kwargs={'vid': video.vid})
            })
        else:
            errors = {}
            for field, error_list in form.errors.items():
                errors[field] = [str(error) for error in error_list]
            
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)



def load_more_recommendations(request):
    """Подгрузка рекомендаций (AJAX)"""
    page = int(request.GET.get('page', 1))
    exclude_id = request.GET.get('exclude', 0)
    
    # Базовый запрос (исключаем текущее видео)
    videos = Video.objects.exclude(pk=exclude_id).order_by('-views_count')
    
    # Пагинация по 10 видео
    paginator = Paginator(videos, 10)
    
    if page > paginator.num_pages:
        return JsonResponse({'videos': [], 'has_next': False})
    
    page_videos = paginator.get_page(page)
    
    # Формируем HTML для каждого видео
    videos_html = []
    for video in page_videos:
        video.formatted_duration = video.duration_formatted()
        html = render_to_string('videos/recommendation_item.html', {
            'video': video
        }, request=request)
        videos_html.append(html)
    
    return JsonResponse({
        'videos': videos_html,
        'has_next': page_videos.has_next(),
        'next_page': page + 1 if page_videos.has_next() else None
    })

def video_delete(request, pk):
    """Удаление видео"""
    video = get_object_or_404(Video, pk=pk)
    
    if not user_can_edit_video(request.user, video):
        raise PermissionDenied("У вас нет прав для удаления этого видео")
    
    if request.method == 'POST':
        video_title = video.title
        video.delete()
        messages.success(request, f'Видео "{video_title}" успешно удалено')
        return redirect('video_list')
    
    return redirect('video_edit', pk=pk)  # Если GET запрос - редирект на редактирование

@login_required
def like_video(request, pk):
    """Лайк видео (AJAX)"""
    video = get_object_or_404(Video, pk=pk)
    
    if request.method == 'POST':
        # Если был дизлайк - удаляем его
        Dislike.objects.filter(video=video, user=request.user).delete()
        
        # Добавляем или удаляем лайк
        like, created = Like.objects.get_or_create(
            video=video,
            user=request.user
        )
        
        if not created:
            like.delete()
            liked = False
        else:
            liked = True
        
        return JsonResponse({
            'liked': liked,
            'likes_count': video.likes.count(),
            'dislikes_count': video.dislikes.count()
        })
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def dislike_video(request, pk):
    """Дизлайк видео (AJAX)"""
    video = get_object_or_404(Video, pk=pk)
    
    if request.method == 'POST':
        # Если был лайк - удаляем его
        Like.objects.filter(video=video, user=request.user).delete()
        
        # Добавляем или удаляем дизлайк
        dislike, created = Dislike.objects.get_or_create(
            video=video,
            user=request.user
        )
        
        if not created:
            # Если дизлайк уже был - удаляем
            dislike.delete()
            disliked = False
        else:
            disliked = True
        
        return JsonResponse({
            'disliked': disliked,
            'likes_count': video.likes.count(),
            'dislikes_count': video.dislikes.count()
        })
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@require_POST
def add_comment(request, pk):
    """Добавление комментария"""
    video = get_object_or_404(Video, pk=pk)
    form = CommentForm(request.POST)
    
    if form.is_valid():
        comment = form.save(commit=False)
        comment.video = video
        comment.user = request.user
        comment.save()
        
        # Возвращаем HTML нового комментария для AJAX
        return render(request, 'videos/comment_item.html', {'comment': comment})
    
    return HttpResponseBadRequest('Invalid form')

@login_required
@require_POST
def reply_comment(request, pk):
    """Ответ на комментарий"""
    parent = get_object_or_404(Comment, pk=pk)
    form = CommentForm(request.POST)
    
    if form.is_valid():
        comment = form.save(commit=False)
        comment.video = parent.video
        comment.user = request.user
        comment.parent = parent
        comment.save()
        
        return render(request, 'videos/comment_item.html', {'comment': comment})
    
    return HttpResponseBadRequest('Invalid form')

@login_required
@require_POST
def delete_comment(request, pk):
    """Удаление комментария"""
    comment = get_object_or_404(Comment, pk=pk)
    
    # Проверяем права (автор комментария или админ)
    if request.user != comment.user and not request.user.is_staff:
        return HttpResponseBadRequest('Недостаточно прав')
    
    comment.delete()
    return JsonResponse({'status': 'ok'})

def video_detail(request, vid):  # Было slug
    """Страница просмотра видео (по vid)"""
    video = get_object_or_404(Video, vid=vid)  # Ищем по vid
    
    # Увеличиваем счетчик просмотров
    video.views_count += 1
    video.save()
    
    # Записываем статистику
    ViewStat.objects.create(
        video=video,
        user=request.user if request.user.is_authenticated else None,
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    # Проверяем лайки/дизлайки
    user_liked = False
    user_disliked = False
    if request.user.is_authenticated:
        user_liked = Like.objects.filter(video=video, user=request.user).exists()
        user_disliked = Dislike.objects.filter(video=video, user=request.user).exists()
    
    # Получаем комментарии (только родительские, без ответов)
    comments = video.comments.filter(parent=None)
    
    # Получаем похожие видео
    similar_videos = Video.objects.filter(
        uploaded_by=video.uploaded_by
    ).exclude(
        pk=video.pk
    )[:8]
    
    for similar in similar_videos:
        similar.formatted_duration = similar.duration_formatted()
    
    # Форма комментария
    comment_form = CommentForm()
    
    return render(request, 'videos/video_detail.html', {
        'video': video,
        'user_liked': user_liked,
        'user_disliked': user_disliked,
        'similar_videos': similar_videos,
        'comments': comments,
        'comment_form': comment_form,
    })

@login_required
def video_edit(request, pk):
    """Редактирование видео"""
    video = get_object_or_404(Video, pk=pk)
    
    # Проверяем права
    if not user_can_edit_video(request.user, video):
        raise PermissionDenied("У вас нет прав для редактирования этого видео")
    
    if request.method == 'POST':
        form = VideoEditForm(request.POST, request.FILES, instance=video)
        if form.is_valid():
            form.save()
            messages.success(request, 'Видео успешно обновлено!')
            return redirect('video_detail', vid=video.vid)
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{error}')
    else:
        form = VideoEditForm(instance=video)
    
    return render(request, 'videos/video_edit.html', {'form': form, 'video': video})

def permission_denied(request, exception):
    """Обработка ошибки 403"""
    return render(request, '403.html', status=403)