/**
 * Utility functions for image handling
 * Provides fallback placeholder images using data URIs to avoid network requests
 */

/**
 * Creates a data URI for a placeholder pizza image
 * This avoids network requests when images fail to load
 */
export const getPizzaPlaceholder = (): string => {
  // SVG placeholder as data URI (base64 encoded)
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Qn9C40YjQu9CwPC90ZXh0Pjwvc3ZnPg==';
};

/**
 * Handles image load errors by replacing with placeholder
 * Prevents infinite error loops by removing onerror handler after first use
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
  const target = e.target as HTMLImageElement;
  // Only replace if not already a placeholder
  if (!target.src.includes('data:image/svg+xml')) {
    target.src = getPizzaPlaceholder();
    target.onerror = null; // Prevent infinite loop
  }
};

