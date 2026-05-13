from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import Profile

class Command(BaseCommand):
    help = 'Создает профили для всех пользователей, у которых их нет'

    def handle(self, *args, **options):
        users = User.objects.all()
        created = 0
        skipped = 0
        
        self.stdout.write(f"Найдено пользователей: {users.count()}")
        
        for user in users:
            try:
                # Проверяем, есть ли профиль
                profile = user.profile
                self.stdout.write(f"✓ Профиль для {user.username} уже существует")
                skipped += 1
            except Profile.DoesNotExist:
                # Создаем профиль
                Profile.objects.create(user=user)
                created += 1
                self.stdout.write(self.style.SUCCESS(f"✓ Создан профиль для {user.username}"))
        
        self.stdout.write(self.style.SUCCESS(
            f"\nГотово! Создано профилей: {created}, пропущено: {skipped}"
        ))