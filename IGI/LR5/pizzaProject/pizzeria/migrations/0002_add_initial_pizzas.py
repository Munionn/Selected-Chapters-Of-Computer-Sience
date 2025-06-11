from django.db import migrations
from decimal import Decimal

def add_initial_data(apps, schema_editor):
    # Get models
    PizzaCategory = apps.get_model('pizzeria', 'PizzaCategory')
    PizzaSize = apps.get_model('pizzeria', 'PizzaSize')
    Pizza = apps.get_model('pizzeria', 'Pizza')

    # Create categories
    categories = {
        'classic': PizzaCategory.objects.create(
            name='Классические',
            description='Традиционные итальянские пиццы'
        ),
        'meat': PizzaCategory.objects.create(
            name='Мясные',
            description='Пиццы с разнообразными мясными начинками'
        ),
        'vegetarian': PizzaCategory.objects.create(
            name='Вегетарианские',
            description='Пиццы без мяса, для вегетарианцев'
        ),
        'spicy': PizzaCategory.objects.create(
            name='Острые',
            description='Пиццы с острыми ингредиентами'
        ),
        'seafood': PizzaCategory.objects.create(
            name='Морские',
            description='Пиццы с морепродуктами'
        )
    }

    # Create sizes
    sizes = {
        'small': PizzaSize.objects.create(
            name='Маленькая',
            diameter=25,
            multiplier=0.8
        ),
        'medium': PizzaSize.objects.create(
            name='Средняя',
            diameter=30,
            multiplier=1.0
        ),
        'large': PizzaSize.objects.create(
            name='Большая',
            diameter=35,
            multiplier=1.2
        ),
        'xl': PizzaSize.objects.create(
            name='Очень большая',
            diameter=40,
            multiplier=1.4
        )
    }

    # Create pizzas
    pizzas_data = [
        # Классические пиццы
        {
            'name': 'Маргарита',
            'category': categories['classic'],
            'description': 'Классическая итальянская пицца с томатным соусом, моцареллой и базиликом',
            'ingredients': 'Томатный соус, сыр моцарелла, свежий базилик, оливковое масло',
            'base_price': Decimal('12.00'),
            'is_vegetarian': True,
            'sauce': 'tomato',
            'calories_per_100g': 250
        },
        {
            'name': 'Пепперони',
            'category': categories['meat'],
            'description': 'Пицца с томатным соусом, моцареллой и пикантной пепперони',
            'ingredients': 'Томатный соус, сыр моцарелла, пепперони, орегано',
            'base_price': Decimal('14.00'),
            'is_spicy': True,
            'sauce': 'tomato',
            'calories_per_100g': 280
        },
        {
            'name': 'Четыре сыра',
            'category': categories['classic'],
            'description': 'Изысканная пицца с четырьмя видами сыра',
            'ingredients': 'Сливочный соус, моцарелла, горгонзола, пармезан, чеддер',
            'base_price': Decimal('15.00'),
            'is_vegetarian': True,
            'sauce': 'cream',
            'calories_per_100g': 300
        },
        # Мясные пиццы
        {
            'name': 'Мясная Делюкс',
            'category': categories['meat'],
            'description': 'Пицца с разнообразными мясными начинками',
            'ingredients': 'Томатный соус, моцарелла, пепперони, ветчина, бекон, куриное филе',
            'base_price': Decimal('16.00'),
            'sauce': 'bbq',
            'calories_per_100g': 320
        },
        {
            'name': 'Барбекю',
            'category': categories['meat'],
            'description': 'Пицца с курицей и соусом барбекю',
            'ingredients': 'Соус барбекю, моцарелла, куриное филе, красный лук, кукуруза',
            'base_price': Decimal('15.00'),
            'sauce': 'bbq',
            'calories_per_100g': 290
        },
        # Вегетарианские пиццы
        {
            'name': 'Вегетарианская',
            'category': categories['vegetarian'],
            'description': 'Пицца с разнообразными овощами',
            'ingredients': 'Томатный соус, моцарелла, грибы, перец, лук, маслины, помидоры',
            'base_price': Decimal('13.00'),
            'is_vegetarian': True,
            'sauce': 'tomato',
            'calories_per_100g': 220
        },
        {
            'name': 'Грибная',
            'category': categories['vegetarian'],
            'description': 'Пицца с разными видами грибов',
            'ingredients': 'Сливочный соус, моцарелла, шампиньоны, белые грибы, вешенки',
            'base_price': Decimal('14.00'),
            'is_vegetarian': True,
            'sauce': 'cream',
            'calories_per_100g': 240
        },
        # Острые пиццы
        {
            'name': 'Дьябола',
            'category': categories['spicy'],
            'description': 'Очень острая пицца с пепперони и перцем чили',
            'ingredients': 'Томатный соус, моцарелла, пепперони, перец чили, халапеньо',
            'base_price': Decimal('14.00'),
            'is_spicy': True,
            'sauce': 'tomato',
            'calories_per_100g': 270
        },
        {
            'name': 'Мексиканская',
            'category': categories['spicy'],
            'description': 'Острая пицца в мексиканском стиле',
            'ingredients': 'Томатный соус, моцарелла, фарш, перец халапеньо, кукуруза, красный лук',
            'base_price': Decimal('15.00'),
            'is_spicy': True,
            'sauce': 'tomato',
            'calories_per_100g': 290
        },
        # Морские пиццы
        {
            'name': 'Морская',
            'category': categories['seafood'],
            'description': 'Пицца с морепродуктами',
            'ingredients': 'Сливочный соус, моцарелла, креветки, мидии, кальмары, лимон',
            'base_price': Decimal('18.00'),
            'sauce': 'cream',
            'calories_per_100g': 260
        },
        {
            'name': 'Тунец и лук',
            'category': categories['seafood'],
            'description': 'Пицца с тунцом и красным луком',
            'ingredients': 'Томатный соус, моцарелла, тунец, красный лук, маслины',
            'base_price': Decimal('15.00'),
            'sauce': 'tomato',
            'calories_per_100g': 250
        }
    ]

    # Create pizzas and add sizes
    for pizza_data in pizzas_data:
        pizza = Pizza.objects.create(**pizza_data)
        # Add all sizes to each pizza
        for size in sizes.values():
            pizza.available_sizes.add(size)

def remove_initial_data(apps, schema_editor):
    PizzaCategory = apps.get_model('pizzeria', 'PizzaCategory')
    PizzaSize = apps.get_model('pizzeria', 'PizzaSize')
    Pizza = apps.get_model('pizzeria', 'Pizza')
    
    Pizza.objects.all().delete()
    PizzaCategory.objects.all().delete()
    PizzaSize.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('pizzeria', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_initial_data, remove_initial_data),
    ] 