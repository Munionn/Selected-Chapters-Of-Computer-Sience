from .models import Company

def seo_metadata(request):
    """Context processor to provide common SEO metadata"""
    company = Company.objects.first()
    
    # Default metadata
    metadata = {
        'site_name': 'Пиццерия',
        'meta_description': 'Лучшая пиццерия в городе с доставкой. Свежие ингредиенты, быстрая доставка, отличный сервис.',
        'meta_keywords': 'пицца, доставка пиццы, итальянская кухня, пиццерия',
        'meta_author': 'Пиццерия',
        'meta_robots': 'index, follow',
        'og_type': 'website',
        'twitter_card': 'summary_large_image',
        'canonical_url': request.build_absolute_uri(request.path).split('?')[0],
    }
    
    # Update with company info if available
    if company:
        metadata.update({
            'site_name': company.name,
            'meta_description': company.description[:160] if company.description else metadata['meta_description'],
            'meta_keywords': company.meta_keywords or metadata['meta_keywords'],
            'meta_description': company.meta_description or metadata['meta_description'],
            'og_image': request.build_absolute_uri(company.logo.url) if company.logo else None,
        })
    
    return {'seo_metadata': metadata}
