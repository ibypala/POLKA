from django.core.exceptions import PermissionDenied

def user_can_edit_video(user, video):
    """
    Проверяет, может ли пользователь редактировать/удалять видео
    """
    if user.is_anonymous:
        return False
    if user.is_staff:  # админ может всё
        return True
    if user == video.uploaded_by:  # автор может своё видео
        return True
    return False

def user_can_upload(user):
    """
    Проверяет, может ли пользователь загружать видео
    """
    return user.is_authenticated  # любой залогиненный может загружать

def get_user_role(user):
    """
    Возвращает роль пользователя
    """
    if user.is_anonymous:
        return 'гость'
    if user.is_staff:
        return 'администратор'
    if user.is_authenticated:
        return 'зарегистрированный пользователь'
    return 'гость'