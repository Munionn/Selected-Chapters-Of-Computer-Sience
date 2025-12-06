from django.core.management.base import BaseCommand
from pizzeria.models import Certificate


class Command(BaseCommand):
    help = 'Удаляет ненужные сертификаты'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Удалить все сертификаты',
        )
        parser.add_argument(
            '--expired',
            action='store_true',
            help='Удалить только просроченные сертификаты',
        )
        parser.add_argument(
            '--inactive',
            action='store_true',
            help='Удалить только неактивные сертификаты',
        )

    def handle(self, *args, **options):
        if options['all']:
            # Удаляем все сертификаты
            count = Certificate.objects.count()
            Certificate.objects.all().delete()
            self.stdout.write(
                self.style.SUCCESS(f'Удалено {count} сертификатов')
            )
        elif options['expired']:
            # Удаляем просроченные сертификаты
            from datetime import date
            expired_certs = Certificate.objects.filter(
                expiry_date__lt=date.today()
            )
            count = expired_certs.count()
            expired_certs.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Удалено {count} просроченных сертификатов')
            )
        elif options['inactive']:
            # Удаляем неактивные сертификаты
            inactive_certs = Certificate.objects.filter(is_active=False)
            count = inactive_certs.count()
            inactive_certs.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Удалено {count} неактивных сертификатов')
            )
        else:
            # Показываем список сертификатов
            certificates = Certificate.objects.all()
            self.stdout.write('Текущие сертификаты:')
            for cert in certificates:
                status = 'Активен' if cert.is_active else 'Неактивен'
                self.stdout.write(f'- {cert.title} ({cert.number}) - {status}')
            
            self.stdout.write('\nИспользуйте:')
            self.stdout.write('  --all      - удалить все сертификаты')
            self.stdout.write('  --expired  - удалить просроченные сертификаты')
            self.stdout.write('  --inactive - удалить неактивные сертификаты')
