from django.db import migrations
from datetime import date

def add_initial_certificates(apps, schema_editor):
    Certificate = apps.get_model('pizzeria', 'Certificate')
    
    certificates = [
        {
            'title': 'Сертификат качества ISO 9001',
            'number': 'ISO-9001-2023-001',
            'issue_date': date(2023, 1, 15),
            'expiry_date': date(2026, 1, 15),
            'issuing_authority': 'Международная организация по стандартизации',
            'description': 'Сертификат соответствия системы менеджмента качества требованиям ISO 9001:2015',
            'is_active': True
        },
        {
            'title': 'Сертификат HACCP',
            'number': 'HACCP-2023-002',
            'issue_date': date(2023, 2, 1),
            'expiry_date': date(2026, 2, 1),
            'issuing_authority': 'Центр сертификации пищевой безопасности',
            'description': 'Сертификат системы управления безопасностью пищевых продуктов',
            'is_active': True
        },
        {
            'title': 'Экологический сертификат',
            'number': 'ECO-2023-003',
            'issue_date': date(2023, 3, 10),
            'expiry_date': date(2024, 3, 10),
            'issuing_authority': 'Экологический союз',
            'description': 'Сертификат соответствия экологическим стандартам и требованиям',
            'is_active': True
        }
    ]
    
    for cert_data in certificates:
        Certificate.objects.create(**cert_data)

def remove_initial_certificates(apps, schema_editor):
    Certificate = apps.get_model('pizzeria', 'Certificate')
    Certificate.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0016_add_initial_partners'),
    ]

    operations = [
        migrations.RunPython(add_initial_certificates, remove_initial_certificates),
    ]
