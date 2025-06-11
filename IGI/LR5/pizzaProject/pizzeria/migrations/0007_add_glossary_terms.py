from django.db import migrations

def add_glossary_terms(apps, schema_editor):
    GlossaryTerm = apps.get_model('pizzeria', 'GlossaryTerm')
    
    terms = [
        {
            'term': 'Неаполитанская пицца',
            'definition': 'Традиционная итальянская пицца из Неаполя с тонким мягким тестом, запеченная при очень высокой температуре (430-480°C) в дровяной печи.'
        },
        {
            'term': 'Моцарелла',
            'definition': 'Традиционный итальянский сыр из буйволиного или коровьего молока, основной ингредиент классической пиццы.'
        },
        {
            'term': 'Базилик',
            'definition': 'Ароматная трава, которая является одним из ключевых ингредиентов итальянской кухни и традиционным украшением пиццы Маргарита.'
        },
        {
            'term': 'Томатный соус',
            'definition': 'Основа большинства пицц, приготовленная из спелых помидоров с добавлением трав и специй.'
        },
        {
            'term': 'Пиццайоло',
            'definition': 'Профессиональный мастер по приготовлению пиццы, владеющий искусством замеса теста и выпекания.'
        },
        {
            'term': 'Кортичча',
            'definition': 'Корочка пиццы, образующаяся по краям во время выпекания. Может быть тонкой или пышной в зависимости от стиля.'
        },
        {
            'term': 'Пепперони',
            'definition': 'Острая разновидность салями итало-американского происхождения, популярная начинка для пиццы.'
        },
        {
            'term': 'Каменная печь',
            'definition': 'Традиционная печь для приготовления пиццы, выложенная огнеупорным камнем, позволяющая достигать высоких температур.'
        },
        {
            'term': 'Пицца аль тальо',
            'definition': 'Пицца, которая продается прямоугольными кусками (в переводе с итальянского "на отрез").'
        },
        {
            'term': 'Кальцоне',
            'definition': 'Закрытая пицца в форме полумесяца, где начинка полностью закрыта тестом и запечена внутри.'
        }
    ]
    
    for term_data in terms:
        GlossaryTerm.objects.create(**term_data)

def remove_glossary_terms(apps, schema_editor):
    GlossaryTerm = apps.get_model('pizzeria', 'GlossaryTerm')
    GlossaryTerm.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0006_add_initial_promocodes'),
    ]

    operations = [
        migrations.RunPython(add_glossary_terms, remove_glossary_terms),
    ] 