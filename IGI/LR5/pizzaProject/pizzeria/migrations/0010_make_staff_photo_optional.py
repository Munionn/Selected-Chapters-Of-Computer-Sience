from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0009_add_initial_reviews'),
    ]

    operations = [
        migrations.AlterField(
            model_name='staff',
            name='photo',
            field=models.ImageField(blank=True, null=True, upload_to='staff/', verbose_name='Фото'),
        ),
    ] 