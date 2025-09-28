from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import redis
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Social Commerce Recommendation Engine", version="1.0.0")

# Redis connection for caching
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

class UserProfile(BaseModel):
    user_id: str
    preferences: Dict[str, float]
    purchase_history: List[str]
    social_connections: List[str]
    demographics: Dict[str, str]

class ProductFeatures(BaseModel):
    product_id: str
    category: str
    price: float
    rating: float
    tags: List[str]
    description: str

class RecommendationRequest(BaseModel):
    user_id: str
    num_recommendations: int = 10
    recommendation_type: str = "general"  # general, social, trending

class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[Dict[str, float]]
    confidence_scores: List[float]
    recommendation_type: str

class RecommendationEngine:
    def __init__(self):
        self.user_profiles = {}
        self.product_features = {}
        self.user_item_matrix = None
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english')
        
    def add_user_profile(self, profile: UserProfile):
        """Add or update user profile"""
        self.user_profiles[profile.user_id] = profile
        logger.info(f"Added profile for user: {profile.user_id}")
        
    def add_product_features(self, product: ProductFeatures):
        """Add or update product features"""
        self.product_features[product.product_id] = product
        logger.info(f"Added product: {product.product_id}")
        
    def get_collaborative_recommendations(self, user_id: str, num_recommendations: int) -> List[Dict[str, float]]:
        """Get recommendations based on collaborative filtering"""
        # Simple collaborative filtering implementation
        if user_id not in self.user_profiles:
            return []
            
        user_profile = self.user_profiles[user_id]
        similar_users = self._find_similar_users(user_id)
        
        recommendations = []
        for similar_user_id, similarity_score in similar_users[:num_recommendations]:
            if similar_user_id in self.user_profiles:
                similar_user = self.user_profiles[similar_user_id]
                for product_id in similar_user.purchase_history:
                    if product_id not in user_profile.purchase_history:
                        recommendations.append({
                            "product_id": product_id,
                            "score": similarity_score,
                            "reason": "users_like_you"
                        })
                        
        return recommendations[:num_recommendations]
        
    def get_content_based_recommendations(self, user_id: str, num_recommendations: int) -> List[Dict[str, float]]:
        """Get recommendations based on content similarity"""
        if user_id not in self.user_profiles:
            return []
            
        user_profile = self.user_profiles[user_id]
        user_preferences = user_profile.preferences
        
        recommendations = []
        for product_id, product in self.product_features.items():
            if product_id not in user_profile.purchase_history:
                # Calculate content similarity score
                score = self._calculate_content_similarity(user_preferences, product)
                recommendations.append({
                    "product_id": product_id,
                    "score": score,
                    "reason": "based_on_interests"
                })
                
        # Sort by score and return top N
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations[:num_recommendations]
        
    def get_social_recommendations(self, user_id: str, num_recommendations: int) -> List[Dict[str, float]]:
        """Get recommendations based on social connections"""
        if user_id not in self.user_profiles:
            return []
            
        user_profile = self.user_profiles[user_id]
        social_connections = user_profile.social_connections
        
        recommendations = []
        for friend_id in social_connections:
            if friend_id in self.user_profiles:
                friend_profile = self.user_profiles[friend_id]
                for product_id in friend_profile.purchase_history:
                    if product_id not in user_profile.purchase_history:
                        recommendations.append({
                            "product_id": product_id,
                            "score": 0.8,  # Base social score
                            "reason": "friends_purchased"
                        })
                        
        return recommendations[:num_recommendations]
        
    def _find_similar_users(self, user_id: str) -> List[tuple]:
        """Find users similar to the given user"""
        if user_id not in self.user_profiles:
            return []
            
        target_user = self.user_profiles[user_id]
        similarities = []
        
        for other_user_id, other_user in self.user_profiles.items():
            if other_user_id != user_id:
                similarity = self._calculate_user_similarity(target_user, other_user)
                similarities.append((other_user_id, similarity))
                
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities
        
    def _calculate_user_similarity(self, user1: UserProfile, user2: UserProfile) -> float:
        """Calculate similarity between two users"""
        # Simple Jaccard similarity on purchase history
        set1 = set(user1.purchase_history)
        set2 = set(user2.purchase_history)
        
        if not set1 or not set2:
            return 0.0
            
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0
        
    def _calculate_content_similarity(self, user_preferences: Dict[str, float], product: ProductFeatures) -> float:
        """Calculate content similarity between user preferences and product"""
        score = 0.0
        
        # Category preference
        if product.category in user_preferences:
            score += user_preferences[product.category] * 0.4
            
        # Rating influence
        score += (product.rating / 5.0) * 0.3
        
        # Price preference (inverse relationship for affordability)
        if product.price > 0:
            score += (1000 / product.price) * 0.2  # Simplified price scoring
            
        # Tag matching
        product_tags = set(product.tags)
        user_tag_prefs = set(user_preferences.keys())
        tag_overlap = len(product_tags.intersection(user_tag_prefs))
        score += (tag_overlap / len(product_tags) if product_tags else 0) * 0.1
        
        return min(score, 1.0)  # Cap at 1.0

# Global recommendation engine instance
recommendation_engine = RecommendationEngine()

@app.post("/users/profile")
async def add_user_profile(profile: UserProfile):
    """Add or update user profile"""
    try:
        recommendation_engine.add_user_profile(profile)
        
        # Cache in Redis
        redis_client.setex(
            f"user_profile:{profile.user_id}",
            3600,  # 1 hour TTL
            json.dumps(profile.dict())
        )
        
        return {"status": "success", "message": f"Profile added for user {profile.user_id}"}
    except Exception as e:
        logger.error(f"Error adding user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/products")
async def add_product(product: ProductFeatures):
    """Add or update product features"""
    try:
        recommendation_engine.add_product_features(product)
        
        # Cache in Redis
        redis_client.setex(
            f"product:{product.product_id}",
            3600,  # 1 hour TTL
            json.dumps(product.dict())
        )
        
        return {"status": "success", "message": f"Product {product.product_id} added"}
    except Exception as e:
        logger.error(f"Error adding product: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """Get personalized recommendations for a user"""
    try:
        # Check cache first
        cache_key = f"recommendations:{request.user_id}:{request.recommendation_type}:{request.num_recommendations}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            return RecommendationResponse(**json.loads(cached_result))
        
        # Generate recommendations based on type
        if request.recommendation_type == "collaborative":
            recommendations = recommendation_engine.get_collaborative_recommendations(
                request.user_id, request.num_recommendations
            )
        elif request.recommendation_type == "content":
            recommendations = recommendation_engine.get_content_based_recommendations(
                request.user_id, request.num_recommendations
            )
        elif request.recommendation_type == "social":
            recommendations = recommendation_engine.get_social_recommendations(
                request.user_id, request.num_recommendations
            )
        else:  # "general" - hybrid approach
            collab_recs = recommendation_engine.get_collaborative_recommendations(
                request.user_id, request.num_recommendations // 2
            )
            content_recs = recommendation_engine.get_content_based_recommendations(
                request.user_id, request.num_recommendations // 2
            )
            recommendations = collab_recs + content_recs
        
        # Calculate confidence scores
        confidence_scores = [rec["score"] for rec in recommendations]
        
        response = RecommendationResponse(
            user_id=request.user_id,
            recommendations=recommendations,
            confidence_scores=confidence_scores,
            recommendation_type=request.recommendation_type
        )
        
        # Cache the result
        redis_client.setex(cache_key, 1800, json.dumps(response.dict()))  # 30 minutes TTL
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "recommendation-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)