import { apiClient, ApiResponse } from './apiClient';
import { endpoints } from '../config/api';

// Video types
export interface VideoReel {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified: boolean;
    followers: number;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    originalPrice?: number;
  };
  hashtags: string[];
  isLiked: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoComment {
  id: string;
  content: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  likes: number;
  isLiked: boolean;
  replies?: VideoComment[];
  createdAt: string;
}

export interface CreateVideoData {
  title: string;
  description: string;
  hashtags?: string[];
  productIds?: string[];
}

export interface VideoFeedParams {
  page?: number;
  limit?: number;
  trending?: boolean;
  following?: boolean;
  hashtag?: string;
  userId?: string;
}

class VideoService {
  // Get video feed
  async getVideoFeed(params: VideoFeedParams = {}): Promise<{
    success: boolean;
    videos?: VideoReel[];
    error?: string;
    hasMore?: boolean;
    nextPage?: number;
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
        ...(params.trending && { trending: 'true' }),
        ...(params.following && { following: 'true' }),
        ...(params.hashtag && { hashtag: params.hashtag }),
        ...(params.userId && { userId: params.userId }),
      });

      const response: ApiResponse<{
        videos: VideoReel[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          hasMore: boolean;
        };
      }> = await apiClient.getWithCache(
        `${endpoints.videos.feed}?${queryParams}`,
        2 * 60 * 1000 // 2 minutes cache
      );

      if (response.success && response.data) {
        return {
          success: true,
          videos: response.data.videos,
          hasMore: response.data.pagination.hasMore,
          nextPage: response.data.pagination.hasMore ? response.data.pagination.page + 1 : undefined,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch video feed',
        };
      }
    } catch (error: any) {
      console.error('Video feed error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch video feed',
      };
    }
  }

  // Get trending videos
  async getTrendingVideos(limit: number = 20): Promise<{
    success: boolean;
    videos?: VideoReel[];
    error?: string;
  }> {
    return this.getVideoFeed({ trending: true, limit });
  }

  // Get video details
  async getVideoDetails(videoId: string): Promise<{
    success: boolean;
    video?: VideoReel;
    error?: string;
  }> {
    try {
      const response: ApiResponse<VideoReel> = await apiClient.getWithCache(
        endpoints.videos.details(videoId),
        5 * 60 * 1000 // 5 minutes cache
      );

      if (response.success && response.data) {
        return {
          success: true,
          video: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch video details',
        };
      }
    } catch (error: any) {
      console.error('Video details error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch video details',
      };
    }
  }

  // Like/unlike video
  async toggleLike(videoId: string, isLiked: boolean): Promise<{
    success: boolean;
    error?: string;
    newLikeCount?: number;
  }> {
    try {
      const endpoint = isLiked 
        ? endpoints.videos.unlike(videoId)
        : endpoints.videos.like(videoId);

      const response: ApiResponse<{ 
        liked: boolean; 
        likeCount: number; 
      }> = await apiClient.post(endpoint);

      if (response.success && response.data) {
        // Clear cache for video feed to reflect updated like status
        apiClient.clearCache('videos/feed');
        
        return {
          success: true,
          newLikeCount: response.data.likeCount,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to update like status',
        };
      }
    } catch (error: any) {
      console.error('Video like error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update like status',
      };
    }
  }

  // Share video
  async shareVideo(videoId: string, platform?: string): Promise<{
    success: boolean;
    error?: string;
    shareUrl?: string;
  }> {
    try {
      const response: ApiResponse<{ 
        shareUrl: string; 
        shareCount: number; 
      }> = await apiClient.post(endpoints.videos.share(videoId), { platform });

      if (response.success && response.data) {
        // Track analytics
        await this.trackVideoEngagement(videoId, 'share');
        
        return {
          success: true,
          shareUrl: response.data.shareUrl,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to share video',
        };
      }
    } catch (error: any) {
      console.error('Video share error:', error);
      return {
        success: false,
        error: error.message || 'Failed to share video',
      };
    }
  }

  // Get video comments
  async getVideoComments(videoId: string, page: number = 1, limit: number = 20): Promise<{
    success: boolean;
    comments?: VideoComment[];
    error?: string;
    hasMore?: boolean;
  }> {
    try {
      const response: ApiResponse<{
        comments: VideoComment[];
        pagination: {
          hasMore: boolean;
        };
      }> = await apiClient.get(
        `${endpoints.videos.comment(videoId)}?page=${page}&limit=${limit}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          comments: response.data.comments,
          hasMore: response.data.pagination.hasMore,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch comments',
        };
      }
    } catch (error: any) {
      console.error('Video comments error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch comments',
      };
    }
  }

  // Add comment to video
  async addComment(videoId: string, content: string, parentId?: string): Promise<{
    success: boolean;
    comment?: VideoComment;
    error?: string;
  }> {
    try {
      const response: ApiResponse<VideoComment> = await apiClient.post(
        endpoints.videos.comment(videoId),
        { content, parentId }
      );

      if (response.success && response.data) {
        // Track analytics
        await this.trackVideoEngagement(videoId, 'comment');
        
        return {
          success: true,
          comment: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to add comment',
        };
      }
    } catch (error: any) {
      console.error('Add comment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add comment',
      };
    }
  }

  // Upload video
  async uploadVideo(
    file: File,
    data: CreateVideoData,
    onProgress?: (progress: number) => void
  ): Promise<{
    success: boolean;
    video?: VideoReel;
    error?: string;
  }> {
    try {
      const response: ApiResponse<VideoReel> = await apiClient.uploadFile(
        endpoints.videos.upload,
        file,
        data,
        onProgress
      );

      if (response.success && response.data) {
        // Clear feed cache to include new video
        apiClient.clearCache('videos/feed');
        
        return {
          success: true,
          video: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to upload video',
        };
      }
    } catch (error: any) {
      console.error('Video upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload video',
      };
    }
  }

  // Track video view
  async trackVideoView(videoId: string): Promise<void> {
    try {
      await apiClient.post('/analytics/video/view', { 
        videoId, 
        timestamp: new Date().toISOString() 
      }, {
        retry: { retries: 1 } // Don't retry too much for analytics
      });
    } catch (error) {
      console.error('Failed to track video view:', error);
      // Don't throw error for analytics failures
    }
  }

  // Track video engagement (like, comment, share)
  async trackVideoEngagement(videoId: string, action: 'like' | 'comment' | 'share'): Promise<void> {
    try {
      await apiClient.post('/analytics/engagement', {
        type: 'video',
        targetId: videoId,
        action,
        timestamp: new Date().toISOString()
      }, {
        retry: { retries: 1 }
      });
    } catch (error) {
      console.error('Failed to track video engagement:', error);
      // Don't throw error for analytics failures
    }
  }

  // Get videos by hashtag
  async getVideosByHashtag(hashtag: string, page: number = 1, limit: number = 20): Promise<{
    success: boolean;
    videos?: VideoReel[];
    error?: string;
    hasMore?: boolean;
  }> {
    return this.getVideoFeed({ hashtag, page, limit });
  }

  // Get user's videos
  async getUserVideos(userId: string, page: number = 1, limit: number = 20): Promise<{
    success: boolean;
    videos?: VideoReel[];
    error?: string;
    hasMore?: boolean;
  }> {
    return this.getVideoFeed({ userId, page, limit });
  }

  // Search videos
  async searchVideos(query: string, page: number = 1, limit: number = 20): Promise<{
    success: boolean;
    videos?: VideoReel[];
    error?: string;
    hasMore?: boolean;
  }> {
    try {
      const response: ApiResponse<{
        videos: VideoReel[];
        pagination: {
          hasMore: boolean;
        };
      }> = await apiClient.get(
        `/videos/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          videos: response.data.videos,
          hasMore: response.data.pagination.hasMore,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to search videos',
        };
      }
    } catch (error: any) {
      console.error('Video search error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search videos',
      };
    }
  }

  // Delete video (for video creator)
  async deleteVideo(videoId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ message: string }> = await apiClient.delete(
        endpoints.videos.details(videoId)
      );

      if (response.success) {
        // Clear cache
        apiClient.clearCache('videos');
        
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to delete video',
        };
      }
    } catch (error: any) {
      console.error('Video delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete video',
      };
    }
  }

  // Report video
  async reportVideo(videoId: string, reason: string, description?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response: ApiResponse<{ message: string }> = await apiClient.post(
        `/videos/${videoId}/report`,
        { reason, description }
      );

      return {
        success: response.success,
        error: response.success ? undefined : response.error,
      };
    } catch (error: any) {
      console.error('Video report error:', error);
      return {
        success: false,
        error: error.message || 'Failed to report video',
      };
    }
  }
}

// Create and export singleton instance
export const videoService = new VideoService();

export default videoService;