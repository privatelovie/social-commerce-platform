// Real product images from stable CDN sources
export const productImages = {
  electronics: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop', // Headphones
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop', // Watch
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop', // Sunglasses
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop', // Camera
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop', // Smart Watch
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&h=800&fit=crop', // Laptop
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop', // Phone
    'https://images.unsplash.com/photo-1572635196184-84e35138cf62?w=800&h=800&fit=crop', // Headphones 2
  ],
  fashion: [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop', // Dress
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop', // Sneakers
    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&h=800&fit=crop', // Handbag
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop', // Watch
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop', // Backpack
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop', // Sunglasses
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=800&fit=crop', // Shoes
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop', // Boots
  ],
  home: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', // Chair
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop', // Lamp
    'https://images.unsplash.com/photo-1571898672907-72b01e5e00f0?w=800&h=800&fit=crop', // Vase
    'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=800&h=800&fit=crop', // Pillow
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&h=800&fit=crop', // Plant Pot
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=800&fit=crop', // Sofa
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=800&fit=crop', // Table
    'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&h=800&fit=crop', // Rug
  ],
  fitness: [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop', // Gym equipment
    'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&h=800&fit=crop', // Yoga mat
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop', // Dumbbell
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop', // Protein
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop', // Running shoes
    'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=800&h=800&fit=crop', // Water bottle
    'https://images.unsplash.com/photo-1579364046732-c21c9f1de2a5?w=800&h=800&fit=crop', // Resistance band
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop', // Kettlebell
  ],
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop', // Lipstick
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop', // Perfume
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop', // Skincare
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=800&fit=crop', // Makeup palette
    'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=800&fit=crop', // Beauty products
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop', // Serum
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop', // Face mask
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=800&fit=crop', // Brush set
  ]
};

export const getProductImage = (category: string = 'electronics', index: number = 0): string => {
  const categoryLower = category.toLowerCase();
  const images = productImages[categoryLower as keyof typeof productImages] || productImages.electronics;
  return images[index % images.length];
};

export const getRandomProductImage = (category: string = 'electronics'): string => {
  const categoryLower = category.toLowerCase();
  const images = productImages[categoryLower as keyof typeof productImages] || productImages.electronics;
  return images[Math.floor(Math.random() * images.length)];
};

// User avatar placeholders - using stable dicebear API
export const getUserAvatar = (name: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&background=%23667eea`;
};

// Fallback product image if category not found
export const fallbackProductImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop';
