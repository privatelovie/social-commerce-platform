// MongoDB initialization script for Docker
// This script runs when the MongoDB container starts for the first time

// Switch to the social_commerce database
use('social_commerce');

// Create collections with initial indexes for better performance
db.createCollection('users');
db.createCollection('posts');
db.createCollection('products');
db.createCollection('comments');
db.createCollection('analytics');

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

// Create indexes for posts collection
db.posts.createIndex({ "authorId": 1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "tags": 1 });
db.posts.createIndex({ "trending.score": -1 });

// Create indexes for products collection
db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "createdAt": -1 });

// Create indexes for comments collection
db.comments.createIndex({ "postId": 1 });
db.comments.createIndex({ "userId": 1 });
db.comments.createIndex({ "createdAt": -1 });

// Create indexes for analytics collection
db.analytics.createIndex({ "type": 1, "createdAt": -1 });
db.analytics.createIndex({ "userId": 1 });
db.analytics.createIndex({ "postId": 1 });

print('MongoDB initialization completed successfully');
print('Created collections: users, posts, products, comments, analytics');
print('Created performance indexes for all collections');