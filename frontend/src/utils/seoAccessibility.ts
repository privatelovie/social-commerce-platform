/**
 * SEO and Accessibility utilities and helpers
 */

import { useEffect } from 'react';

// Meta tags management
export const MetaTags = {
  setTitle: (title: string): void => {
    if (typeof document !== 'undefined') {
      document.title = title;
    }
  },

  setDescription: (description: string): void => {
    MetaTags.setMetaTag('description', description);
  },

  setKeywords: (keywords: string[]): void => {
    MetaTags.setMetaTag('keywords', keywords.join(', '));
  },

  setMetaTag: (name: string, content: string): void => {
    if (typeof document === 'undefined') return;

    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  },

  setOpenGraph: (property: string, content: string): void => {
    if (typeof document === 'undefined') return;

    let meta = document.querySelector(`meta[property="og:${property}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', `og:${property}`);
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  },

  setTwitterCard: (name: string, content: string): void => {
    if (typeof document === 'undefined') return;

    let meta = document.querySelector(`meta[name="twitter:${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = `twitter:${name}`;
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  },

  setCanonical: (url: string): void => {
    if (typeof document === 'undefined') return;

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    
    link.href = url;
  },

  setRobots: (content: string): void => {
    MetaTags.setMetaTag('robots', content);
  }
};

// SEO-friendly page metadata
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  twitterHandle?: string;
}

export const applySEOData = (seoData: SEOData): void => {
  // Basic meta tags
  MetaTags.setTitle(seoData.title);
  MetaTags.setDescription(seoData.description);
  
  if (seoData.keywords) {
    MetaTags.setKeywords(seoData.keywords);
  }

  // Open Graph
  MetaTags.setOpenGraph('title', seoData.title);
  MetaTags.setOpenGraph('description', seoData.description);
  MetaTags.setOpenGraph('type', seoData.type || 'website');
  
  if (seoData.image) {
    MetaTags.setOpenGraph('image', seoData.image);
  }
  
  if (seoData.url) {
    MetaTags.setOpenGraph('url', seoData.url);
    MetaTags.setCanonical(seoData.url);
  }
  
  if (seoData.siteName) {
    MetaTags.setOpenGraph('site_name', seoData.siteName);
  }
  
  if (seoData.author) {
    MetaTags.setMetaTag('author', seoData.author);
  }
  
  if (seoData.publishedTime) {
    MetaTags.setOpenGraph('article:published_time', seoData.publishedTime);
  }
  
  if (seoData.modifiedTime) {
    MetaTags.setOpenGraph('article:modified_time', seoData.modifiedTime);
  }

  // Twitter Cards
  MetaTags.setTwitterCard('card', 'summary_large_image');
  MetaTags.setTwitterCard('title', seoData.title);
  MetaTags.setTwitterCard('description', seoData.description);
  
  if (seoData.image) {
    MetaTags.setTwitterCard('image', seoData.image);
  }
  
  if (seoData.twitterHandle) {
    MetaTags.setTwitterCard('site', seoData.twitterHandle);
    MetaTags.setTwitterCard('creator', seoData.twitterHandle);
  }
};

// React hook for SEO
export const useSEO = (seoData: SEOData) => {
  useEffect(() => {
    applySEOData(seoData);
  }, [seoData]);
};

// Accessibility utilities
export const AccessibilityUtils = {
  // Focus management
  focusElement: (selector: string, delay: number = 0): void => {
    setTimeout(() => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && element.focus) {
        element.focus();
      }
    }, delay);
  },

  // Trap focus within a container
  trapFocus: (containerSelector: string): (() => void) => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return () => {};

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  },

  // Announce to screen readers
  announceToScreenReader: (message: string): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Check if element is in viewport
  isInViewport: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Color contrast checker
  getContrastRatio: (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      // Calculate relative luminance
      const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if contrast ratio meets WCAG standards
  meetsWCAGContrast: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = AccessibilityUtils.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
};

// Keyboard navigation utilities
export const KeyboardNavigation = {
  // Handle arrow key navigation
  handleArrowKeys: (
    e: KeyboardEvent,
    items: NodeListOf<HTMLElement> | HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void,
    vertical: boolean = true
  ): void => {
    const { key } = e;
    const itemsArray = Array.from(items);
    let newIndex = currentIndex;

    if (vertical) {
      if (key === 'ArrowDown') {
        newIndex = Math.min(currentIndex + 1, itemsArray.length - 1);
      } else if (key === 'ArrowUp') {
        newIndex = Math.max(currentIndex - 1, 0);
      }
    } else {
      if (key === 'ArrowRight') {
        newIndex = Math.min(currentIndex + 1, itemsArray.length - 1);
      } else if (key === 'ArrowLeft') {
        newIndex = Math.max(currentIndex - 1, 0);
      }
    }

    if (newIndex !== currentIndex) {
      e.preventDefault();
      onIndexChange(newIndex);
      if (itemsArray[newIndex] && itemsArray[newIndex].focus) {
        itemsArray[newIndex].focus();
      }
    }
  },

  // Escape key handler
  handleEscape: (e: KeyboardEvent, callback: () => void): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      callback();
    }
  },

  // Enter/Space key handler for buttons
  handleActivation: (e: KeyboardEvent, callback: () => void): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }
};

// Structured data helpers
export const StructuredData = {
  // Generate JSON-LD for products
  generateProductSchema: (product: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    availability: string;
    brand?: string;
    rating?: number;
    reviewCount?: number;
  }): string => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: `https://schema.org/${product.availability}`
      }
    };

    if (product.brand) {
      (schema as any).brand = {
        '@type': 'Brand',
        name: product.brand
      };
    }

    if (product.rating && product.reviewCount) {
      (schema as any).aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount
      };
    }

    return JSON.stringify(schema);
  },

  // Generate JSON-LD for articles
  generateArticleSchema: (article: {
    headline: string;
    description: string;
    image: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    url: string;
  }): string => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      description: article.description,
      image: article.image,
      author: {
        '@type': 'Person',
        name: article.author
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      url: article.url
    };

    return JSON.stringify(schema);
  },

  // Inject structured data into page
  injectSchema: (schema: string): void => {
    if (typeof document === 'undefined') return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = schema;
    document.head.appendChild(script);
  }
};

// Image optimization for SEO
export const ImageSEO = {
  // Generate optimized alt text
  generateAltText: (filename: string, context?: string): string => {
    // Remove file extension and replace hyphens/underscores with spaces
    const cleanName = filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return context ? `${cleanName} - ${context}` : cleanName;
  },

  // Validate image accessibility
  validateImageAccessibility: (img: HTMLImageElement): {
    hasAlt: boolean;
    altIsDescriptive: boolean;
    hasTitle: boolean;
    isDecorative: boolean;
  } => {
    const alt = img.getAttribute('alt');
    const title = img.getAttribute('title');
    const isDecorative = alt === '' || img.getAttribute('role') === 'presentation';

    return {
      hasAlt: alt !== null,
      altIsDescriptive: Boolean(alt && alt.length > 3 && !alt.includes('image') && !alt.includes('picture')),
      hasTitle: Boolean(title),
      isDecorative
    };
  }
};

export default {
  MetaTags,
  applySEOData,
  useSEO,
  AccessibilityUtils,
  KeyboardNavigation,
  StructuredData,
  ImageSEO
};