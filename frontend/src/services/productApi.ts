// Real-world product API integration service
export interface RealProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
  subcategory?: string;
  description: string;
  features: string[];
  specifications?: { [key: string]: string };
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  url: string;
  source: 'amazon' | 'bestbuy' | 'shopify' | 'target' | 'walmart' | 'ebay';
  lastUpdated: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  rating: number;
  title?: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
  images?: string[];
  source: string;
}

// Amazon Product Advertising API integration
export class AmazonProductService {
  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;
  
  constructor(accessKey: string, secretKey: string, partnerTag: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.partnerTag = partnerTag;
  }

  async searchProducts(query: string, category?: string): Promise<RealProduct[]> {
    // Implementation would use Amazon Product Advertising API
    // For demo purposes, I'm showing the structure
    try {
      const response = await this.makeAmazonAPICall('SearchItems', {
        Keywords: query,
        SearchIndex: category || 'All',
        ItemCount: 20,
        Resources: [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ProductInfo',
          'Images.Primary.Large',
          'Images.Variants.Large',
          'Offers.Listings.Price',
          'CustomerReviews.StarRating',
          'CustomerReviews.Count'
        ]
      });

      return this.parseAmazonResponse(response);
    } catch (error) {
      console.error('Amazon API error:', error);
      return [];
    }
  }

  async getProductDetails(asin: string): Promise<RealProduct | null> {
    try {
      const response = await this.makeAmazonAPICall('GetItems', {
        ItemIds: [asin],
        Resources: [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ProductInfo',
          'Images.Primary.Large',
          'Images.Variants.Large',
          'Offers.Listings.Price',
          'CustomerReviews.StarRating',
          'CustomerReviews.Count'
        ]
      });

      const products = this.parseAmazonResponse(response);
      return products[0] || null;
    } catch (error) {
      console.error('Amazon API error:', error);
      return null;
    }
  }

  private async makeAmazonAPICall(operation: string, params: any) {
    // This would implement the actual Amazon PA API call with proper authentication
    // For now, returning mock structure to show integration pattern
    throw new Error('Amazon API credentials required');
  }

  private parseAmazonResponse(response: any): RealProduct[] {
    // Parse Amazon API response into our standard format
    return response.SearchResult?.Items?.map((item: any) => ({
      id: item.ASIN,
      name: item.ItemInfo?.Title?.DisplayValue || '',
      brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '',
      price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
      originalPrice: item.Offers?.Listings?.[0]?.SavingBasis?.Amount,
      currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'USD',
      image: item.Images?.Primary?.Large?.URL || '',
      images: item.Images?.Variants?.map((img: any) => img.Large?.URL) || [],
      rating: item.CustomerReviews?.StarRating?.Value || 0,
      reviewCount: item.CustomerReviews?.Count || 0,
      category: item.BrowseNodeInfo?.BrowseNodes?.[0]?.DisplayName || '',
      description: item.ItemInfo?.Features?.DisplayValues?.join(', ') || '',
      features: item.ItemInfo?.Features?.DisplayValues || [],
      availability: item.Offers?.Listings?.[0]?.Availability?.Type === 'Now' ? 'in_stock' : 'out_of_stock',
      url: item.DetailPageURL || '',
      source: 'amazon' as const,
      lastUpdated: new Date().toISOString()
    })) || [];
  }
}

// Best Buy API integration
export class BestBuyProductService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchProducts(query: string, category?: string): Promise<RealProduct[]> {
    try {
      const categoryFilter = category ? `&categoryPath.name="${category}"` : '';
      const url = `https://api.bestbuy.com/v1/products((search=${query})${categoryFilter})?apiKey=${this.apiKey}&format=json&show=sku,name,shortDescription,longDescription,type,startDate,new,active,lowPriceGuarantee,activeUpdateDate,regularPrice,salePrice,clearance,onSale,planPrice,priceWithPlan,priceRestriction,priceUpdateDate,digital,preowned,carriers,planFeatures,devices,carrierPlans,technologyCode,carrierModelNumber,earlyTerminationFees,outletCenter,secondaryMarket,frequentlyPurchasedWith,accessories,relatedProducts,requiredParts,techSpecs,includedItemList,energyGuide,warrantyLabor,warrantyParts,gallery,micropayment,purchasingChannelExclusive,isWirelessPlan,wirelessPlans,carrierPlans,longDescriptionHtml,conditions,productFamilies,productVariations,aspectRatio,screenFormat,lengthInMinutes,mpaaRating,plot,studio,theatricalReleaseDate,description,manufacturer,modelNumber,names,color,depth,height,weight,width,accessories,genre,artistName,onlineAvailability,onlineAvailabilityText,onlineAvailabilityUpdateDate,storeAvailability,storeAvailabilityText,storeAvailabilityUpdateDate,itemUpdateDate,customerReviewCount,customerReviewAverage,inStorePickup,homeDelivery,quantityLimit,fulfilledBy,members,bundledIn,albumTitle,artistName,onlineAvailability,onlineAvailabilityText,onlineAvailabilityUpdateDate,releaseDate,salesRankShortTerm,salesRankMediumTerm,salesRankLongTerm,bestSellingRank,url,spin360Url,mobileUrl,affiliateUrl,addToCartUrl,accessoriesUrl,customerReviewsUrl,pdpUrl,catPath,customerTopRated,format,frequentlyPurchasedWith,relatedProducts,techSpecs,crossSell,salesRankShortTerm,salesRankMediumTerm,salesRankLongTerm,bestSellingRank,url,buttonUrl,affiliateUrl,clickThroughUrl,impressionUrl,orderUrl,addToCartUrl,emailUrl,imageUrl,spin360Url,mobileUrl`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.products.map((product: any) => ({
        id: product.sku.toString(),
        name: product.name || '',
        brand: product.manufacturer || '',
        price: product.salePrice || product.regularPrice || 0,
        originalPrice: product.regularPrice !== product.salePrice ? product.regularPrice : undefined,
        currency: 'USD',
        image: product.image || product.largeImage || '',
        images: [product.image, product.largeImage, product.thumbnailImage].filter(Boolean),
        rating: product.customerReviewAverage || 0,
        reviewCount: product.customerReviewCount || 0,
        category: product.categoryPath || '',
        description: product.shortDescription || product.longDescription || '',
        features: product.features ? product.features.map((f: any) => f.feature) : [],
        specifications: product.details ? product.details.reduce((acc: any, detail: any) => {
          acc[detail.name] = detail.value;
          return acc;
        }, {}) : undefined,
        availability: product.onlineAvailability ? 'in_stock' : 'out_of_stock',
        url: product.url || '',
        source: 'bestbuy' as const,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Best Buy API error:', error);
      return [];
    }
  }
}

// Generic product aggregation service
export class ProductAggregationService {
  private amazon?: AmazonProductService;
  private bestBuy?: BestBuyProductService;

  constructor(config: {
    amazon?: { accessKey: string; secretKey: string; partnerTag: string };
    bestBuy?: { apiKey: string };
  }) {
    if (config.amazon) {
      this.amazon = new AmazonProductService(
        config.amazon.accessKey,
        config.amazon.secretKey,
        config.amazon.partnerTag
      );
    }
    if (config.bestBuy) {
      this.bestBuy = new BestBuyProductService(config.bestBuy.apiKey);
    }
  }

  async searchProducts(query: string, category?: string): Promise<RealProduct[]> {
    const promises: Promise<RealProduct[]>[] = [];
    
    if (this.amazon) {
      promises.push(this.amazon.searchProducts(query, category));
    }
    if (this.bestBuy) {
      promises.push(this.bestBuy.searchProducts(query, category));
    }

    try {
      const results = await Promise.allSettled(promises);
      const products = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<RealProduct[]>).value);

      // Remove duplicates and sort by rating
      const uniqueProducts = this.removeDuplicates(products);
      return uniqueProducts.sort((a, b) => b.rating - a.rating);
    } catch (error) {
      console.error('Product aggregation error:', error);
      return [];
    }
  }

  private removeDuplicates(products: RealProduct[]): RealProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const key = `${product.name.toLowerCase()}-${product.brand.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// Free alternatives using web scraping (be mindful of ToS)
export class OpenProductService {
  async searchProducts(query: string): Promise<RealProduct[]> {
    // This could integrate with:
    // 1. Open Product Data APIs
    // 2. Product Hunt API
    // 3. Rakuten RapidAPI marketplace
    // 4. Fake Store API (for demo)
    
    try {
      // Using Fake Store API for demonstration
      const response = await fetch('https://fakestoreapi.com/products');
      const products = await response.json();
      
      const filtered = products.filter((product: any) => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );

      return filtered.map((product: any) => ({
        id: product.id.toString(),
        name: product.title,
        brand: 'Generic',
        price: product.price,
        currency: 'USD',
        image: product.image,
        images: [product.image],
        rating: product.rating.rate,
        reviewCount: product.rating.count,
        category: product.category,
        description: product.description,
        features: [product.description],
        availability: 'in_stock' as const,
        url: `https://fakestoreapi.com/products/${product.id}`,
        source: 'demo' as any,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Open Product API error:', error);
      return [];
    }
  }
}

// Review aggregation service
export class ReviewAggregationService {
  async getProductReviews(productId: string, source: string): Promise<ProductReview[]> {
    // This could integrate with:
    // 1. Google Reviews API
    // 2. Trustpilot API
    // 3. Yelp API
    // 4. Amazon reviews (via scraping - check ToS)
    
    try {
      // Demo implementation
      return this.generateMockReviews(productId);
    } catch (error) {
      console.error('Review aggregation error:', error);
      return [];
    }
  }

  private generateMockReviews(productId: string): ProductReview[] {
    const mockReviews = [
      {
        id: `${productId}-1`,
        productId,
        user: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b25fc4e4?w=50',
          verified: true
        },
        rating: 5,
        title: 'Excellent quality!',
        comment: 'This product exceeded my expectations. The build quality is outstanding and it works perfectly.',
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: Math.floor(Math.random() * 50),
        verified: true,
        source: 'verified_purchase'
      },
      {
        id: `${productId}-2`,
        productId,
        user: {
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
          verified: true
        },
        rating: 4,
        title: 'Good value for money',
        comment: 'Solid product with good features. Shipping was fast and packaging was secure.',
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: Math.floor(Math.random() * 30),
        verified: true,
        source: 'verified_purchase'
      }
    ];

    return mockReviews;
  }
}

export default {
  ProductAggregationService,
  ReviewAggregationService,
  OpenProductService,
  AmazonProductService,
  BestBuyProductService
};