// Demo integration with real APIs for immediate testing
// This service aggregates multiple free APIs and provides a unified interface
import { RealProduct, ProductReview, ProductAggregationService, OpenProductService } from './productApi';

interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

// Enhanced product service that combines demo APIs with real aggregation
export class DemoRealProductService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private aggregationService: ProductAggregationService;
  private openProductService: OpenProductService;
  
  constructor() {
    this.aggregationService = new ProductAggregationService({});
    this.openProductService = new OpenProductService();
  }

  async getProductById(id: string): Promise<RealProduct | null> {
    const cacheKey = `product_${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Try to extract the original ID and source from our prefixed ID
      let originalId = id;
      let source = 'unknown';
      
      if (id.startsWith('fakestore_')) {
        originalId = id.replace('fakestore_', '');
        source = 'fakestore';
      } else if (id.startsWith('dummyjson_')) {
        originalId = id.replace('dummyjson_', '');
        source = 'dummyjson';
      } else if (id.startsWith('tech_')) {
        source = 'tech';
      }

      let product: RealProduct | null = null;

      if (source === 'fakestore') {
        const response = await fetch(`https://fakestoreapi.com/products/${originalId}`);
        const fakeProduct: FakeStoreProduct = await response.json();
        
        product = {
          id: `fakestore_${fakeProduct.id}`,
          name: fakeProduct.title,
          brand: this.getBrandFromCategory(fakeProduct.category),
          price: fakeProduct.price,
          currency: 'USD',
          image: fakeProduct.image,
          images: [fakeProduct.image],
          rating: fakeProduct.rating.rate,
          reviewCount: fakeProduct.rating.count,
          category: fakeProduct.category,
          description: fakeProduct.description,
          features: this.extractFeatures(fakeProduct.description),
          availability: 'in_stock' as const,
          url: `https://fakestoreapi.com/products/${fakeProduct.id}`,
          source: 'demo' as any,
          lastUpdated: new Date().toISOString()
        };
      } else if (source === 'dummyjson') {
        const response = await fetch(`https://dummyjson.com/products/${originalId}`);
        const dummyProduct = await response.json();
        
        product = {
          id: `dummyjson_${dummyProduct.id}`,
          name: dummyProduct.title,
          brand: dummyProduct.brand || 'Generic',
          price: dummyProduct.price,
          originalPrice: dummyProduct.price * 1.2,
          currency: 'USD',
          image: dummyProduct.thumbnail,
          images: dummyProduct.images || [dummyProduct.thumbnail],
          rating: dummyProduct.rating || 4.5,
          reviewCount: Math.floor(Math.random() * 500) + 50,
          category: dummyProduct.category,
          description: dummyProduct.description,
          features: dummyProduct.tags || [],
          specifications: {
            'Discount': `${dummyProduct.discountPercentage}%`,
            'Stock': dummyProduct.stock.toString(),
            'Brand': dummyProduct.brand || 'Generic'
          },
          availability: dummyProduct.stock > 0 ? 'in_stock' as const : 'out_of_stock' as const,
          url: `https://dummyjson.com/products/${dummyProduct.id}`,
          source: 'demo' as any,
          lastUpdated: new Date().toISOString()
        };
      } else {
        // Search through all products to find the one with matching ID
        const allProducts = await this.searchProducts('', { limit: 100 });
        product = allProducts.find(p => p.id === id) || null;
      }

      // Cache the result
      if (product) {
        this.cache.set(cacheKey, { data: product, timestamp: Date.now() });
      }
      
      return product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const cacheKey = `reviews_${productId}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Generate mock reviews for demonstration
    const mockUsers = [
      { id: '1', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50', verified: true },
      { id: '2', name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50', verified: false },
      { id: '3', name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50', verified: true },
      { id: '4', name: 'Alex Rodriguez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50', verified: false },
      { id: '5', name: 'Jessica Kim', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50', verified: true }
    ];

    const mockReviews: ProductReview[] = mockUsers.map((user, index) => ({
      id: `review_${productId}_${index}`,
      productId: productId,
      user: {
        name: user.name,
        avatar: user.avatar,
        verified: user.verified
      },
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      title: [
        'Great product!',
        'Exceeded expectations',
        'Worth every penny',
        'Highly recommend',
        'Amazing quality'
      ][index] || 'Good purchase',
      comment: [
        'This product completely exceeded my expectations. The quality is outstanding and shipping was fast.',
        'Really happy with this purchase. Great value for money and works exactly as described.',
        'Excellent build quality and design. Would definitely buy again and recommend to others.',
        'Fast shipping, great packaging, and the product works perfectly. Very satisfied!',
        'Top-notch quality and customer service. This has become my go-to choice for this type of product.'
      ][index] || 'Good product overall.',
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
      helpful: Math.floor(Math.random() * 20),
      verified: Math.random() > 0.3, // 70% verified purchases
      source: 'demo'
    }));

    // Cache the result
    this.cache.set(cacheKey, { data: mockReviews, timestamp: Date.now() });
    return mockReviews;
  }

  async searchProducts(query: string, options: { limit?: number } = {}): Promise<RealProduct[]> {
    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Use real aggregation service first, with fallbacks
      const [aggregatedResults, openResults, demoResults] = await Promise.allSettled([
        this.aggregationService.searchProducts(query),
        this.openProductService.searchProducts(query),
        this.getDemoResults(query)
      ]);

      const products: RealProduct[] = [];

      // Prioritize real API results
      if (aggregatedResults.status === 'fulfilled' && aggregatedResults.value.length > 0) {
        products.push(...aggregatedResults.value);
      } else if (openResults.status === 'fulfilled' && openResults.value.length > 0) {
        products.push(...openResults.value);
      } else if (demoResults.status === 'fulfilled') {
        products.push(...demoResults.value);
      }

      // If still no results, use fallback
      const finalResults = products.length > 0 
        ? this.removeDuplicates(products).slice(0, options.limit || 20)
        : this.getFallbackProducts(query);

      // Cache the result
      this.cache.set(cacheKey, { data: finalResults, timestamp: Date.now() });
      return finalResults;
      
    } catch (error) {
      console.error('Enhanced search error:', error);
      return this.getFallbackProducts(query);
    }
  }

  private async getDemoResults(query: string): Promise<RealProduct[]> {
    // Use multiple free APIs in parallel as fallback
    const [fakeStoreProducts, dummyJsonProducts] = await Promise.allSettled([
      this.getFakeStoreProducts(query),
      this.getDummyJsonProducts(query)
    ]);

    const products: RealProduct[] = [];

    if (fakeStoreProducts.status === 'fulfilled') {
      products.push(...fakeStoreProducts.value);
    }

    if (dummyJsonProducts.status === 'fulfilled') {
      products.push(...dummyJsonProducts.value);
    }

    // Add some trending tech products
    const techProducts = await this.getTechProducts(query);
    products.push(...techProducts);

    return products;
  }

  private async getFakeStoreProducts(query: string): Promise<RealProduct[]> {
    const cacheKey = `fakestore_${query}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch('https://fakestoreapi.com/products');
      const products: FakeStoreProduct[] = await response.json();
      
      const filtered = products.filter((product: FakeStoreProduct) => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );

      const realProducts: RealProduct[] = filtered.map((product: FakeStoreProduct) => ({
        id: `fakestore_${product.id}`,
        name: product.title,
        brand: this.getBrandFromCategory(product.category),
        price: product.price,
        currency: 'USD',
        image: product.image,
        images: [product.image],
        rating: product.rating.rate,
        reviewCount: product.rating.count,
        category: product.category,
        description: product.description,
        features: this.extractFeatures(product.description),
        availability: 'in_stock' as const,
        url: `https://fakestoreapi.com/products/${product.id}`,
        source: 'demo' as any,
        lastUpdated: new Date().toISOString()
      }));

      // Cache the result
      this.cache.set(cacheKey, { data: realProducts, timestamp: Date.now() });
      return realProducts;
    } catch (error) {
      console.error('FakeStore API error:', error);
      return [];
    }
  }

  private async getDummyJsonProducts(query: string): Promise<RealProduct[]> {
    try {
      const response = await fetch('https://dummyjson.com/products/search?q=' + encodeURIComponent(query));
      const data = await response.json();
      
      return data.products.map((product: any) => ({
        id: `dummyjson_${product.id}`,
        name: product.title,
        brand: product.brand || 'Generic',
        price: product.price,
        originalPrice: product.price * 1.2, // Simulate discount
        currency: 'USD',
        image: product.thumbnail,
        images: product.images || [product.thumbnail],
        rating: product.rating || 4.5,
        reviewCount: Math.floor(Math.random() * 500) + 50,
        category: product.category,
        description: product.description,
        features: product.tags || [],
        specifications: {
          'Discount': `${product.discountPercentage}%`,
          'Stock': product.stock.toString(),
          'Brand': product.brand || 'Generic'
        },
        availability: product.stock > 0 ? 'in_stock' as const : 'out_of_stock' as const,
        url: `https://dummyjson.com/products/${product.id}`,
        source: 'demo' as any,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('DummyJSON API error:', error);
      return [];
    }
  }

  private async getTechProducts(query: string): Promise<RealProduct[]> {
    // Add some curated tech products from public APIs
    try {
      // You could integrate with:
      // - GitHub API for development tools
      // - Product Hunt API for new products
      // - News APIs for trending items
      
      const trendingProducts: RealProduct[] = [
        {
          id: 'tech_1',
          name: 'MacBook Air M2',
          brand: 'Apple',
          price: 1199,
          originalPrice: 1299,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
          images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
          rating: 4.8,
          reviewCount: 1247,
          category: 'Electronics',
          subcategory: 'Laptops',
          description: 'Apple MacBook Air with M2 chip - incredibly thin and light laptop with all-day battery life',
          features: ['M2 Chip', '8-core CPU', '10-core GPU', '18-hour battery', 'Liquid Retina display'],
          availability: 'in_stock',
          url: 'https://apple.com/macbook-air-m2',
          source: 'demo' as any,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'tech_2',
          name: 'Sony WH-1000XM4',
          brand: 'Sony',
          price: 349,
          originalPrice: 399,
          currency: 'USD',
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
          images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'],
          rating: 4.7,
          reviewCount: 892,
          category: 'Electronics',
          subcategory: 'Headphones',
          description: 'Industry-leading noise canceling wireless headphones with premium sound quality',
          features: ['Active Noise Canceling', '30-hour battery', 'Touch controls', 'Premium sound'],
          availability: 'in_stock',
          url: 'https://sony.com/wh-1000xm4',
          source: 'demo' as any,
          lastUpdated: new Date().toISOString()
        }
      ];

      // Filter by query if provided
      if (query && query.trim()) {
        return trendingProducts.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        );
      }

      return trendingProducts;
    } catch (error) {
      console.error('Tech products error:', error);
      return [];
    }
  }

  private getBrandFromCategory(category: string): string {
    const brandMap: { [key: string]: string } = {
      "men's clothing": 'Fashion Co',
      "women's clothing": 'StyleWear',
      'jewelery': 'Luxury Gems',
      'electronics': 'TechBrand'
    };
    return brandMap[category] || 'Generic';
  }

  private extractFeatures(description: string): string[] {
    // Extract key features from description
    const words = description.split(' ');
    const features = [];
    
    // Look for technical terms, materials, etc.
    const techWords = words.filter(word => 
      word.length > 6 && 
      (word.includes('cotton') || word.includes('steel') || word.includes('wireless') || 
       word.includes('premium') || word.includes('quality'))
    );
    
    features.push(...techWords.slice(0, 3));
    
    if (features.length === 0) {
      features.push('High Quality', 'Durable', 'Premium Design');
    }
    
    return features;
  }

  private removeDuplicates(products: RealProduct[]): RealProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const key = `${product.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private getFallbackProducts(query: string): RealProduct[] {
    // Fallback products when APIs fail
    return [
      {
        id: 'fallback_1',
        name: 'Premium Wireless Earbuds',
        brand: 'AudioTech',
        price: 149.99,
        originalPrice: 199.99,
        currency: 'USD',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'],
        rating: 4.5,
        reviewCount: 324,
        category: 'Electronics',
        description: 'High-quality wireless earbuds with noise cancellation and premium sound',
        features: ['Noise Cancellation', 'Wireless Charging', '8-hour Battery'],
        availability: 'in_stock',
        url: '#',
        source: 'demo' as any,
        lastUpdated: new Date().toISOString()
      }
    ];
  }
}

// Price tracking service
export class PriceTrackingService {
  private priceHistory: Map<string, Array<{ price: number; date: string }>> = new Map();

  async trackPrice(productId: string, currentPrice: number) {
    const history = this.priceHistory.get(productId) || [];
    history.push({ price: currentPrice, date: new Date().toISOString() });
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(entry => new Date(entry.date) > thirtyDaysAgo);
    
    this.priceHistory.set(productId, filteredHistory);
  }

  async getPriceHistory(productId: string) {
    return this.priceHistory.get(productId) || [];
  }

  async isPriceDropped(productId: string, currentPrice: number): Promise<boolean> {
    const history = this.priceHistory.get(productId);
    if (!history || history.length < 2) return false;
    
    const lastPrice = history[history.length - 1].price;
    return currentPrice < lastPrice * 0.95; // 5% drop threshold
  }
}

export default new DemoRealProductService();