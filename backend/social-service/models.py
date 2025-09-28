from django.db import models
import uuid
from django.core.validators import MinLengthValidator

class Post(models.Model):
    """Social posts - reviews, updates, product shares"""
    POST_TYPES = [
        ('review', 'Product Review'),
        ('share', 'Product Share'),
        ('update', 'Status Update'),
        ('recommendation', 'Recommendation'),
        ('question', 'Question'),
        ('answer', 'Answer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author_id = models.UUIDField()  # Reference to User in user-service
    
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='update')
    content = models.TextField(validators=[MinLengthValidator(1)])
    
    # Media attachments
    images = models.JSONField(default=list)  # List of image URLs
    videos = models.JSONField(default=list)  # List of video URLs
    
    # Product reference (if applicable)
    product_id = models.UUIDField(null=True, blank=True)
    product_name = models.CharField(max_length=255, blank=True)
    product_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Rating (for reviews)
    rating = models.PositiveSmallIntegerField(null=True, blank=True)  # 1-5 stars
    
    # Engagement metrics
    like_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    share_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    
    # Hashtags and mentions
    hashtags = models.JSONField(default=list)
    mentioned_users = models.JSONField(default=list)
    
    # Post settings
    is_public = models.BooleanField(default=True)
    is_promoted = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    
    # Moderation
    is_flagged = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'posts'
        indexes = [
            models.Index(fields=['author_id']),
            models.Index(fields=['post_type']),
            models.Index(fields=['product_id']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_public']),
            models.Index(fields=['like_count']),
        ]
        ordering = ['-created_at']

class Comment(models.Model):
    """Comments on posts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author_id = models.UUIDField()  # Reference to User in user-service
    
    content = models.TextField(validators=[MinLengthValidator(1)])
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    # Engagement
    like_count = models.PositiveIntegerField(default=0)
    reply_count = models.PositiveIntegerField(default=0)
    
    # Moderation
    is_flagged = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'comments'
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['author_id']),
            models.Index(fields=['parent_comment']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['created_at']

class Like(models.Model):
    """Likes on posts and comments"""
    LIKE_TYPES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('wow', 'Wow'),
        ('angry', 'Angry'),
        ('sad', 'Sad'),
        ('laugh', 'Laugh'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField()  # Reference to User in user-service
    
    # Content reference
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name='likes')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True, related_name='likes')
    
    like_type = models.CharField(max_length=10, choices=LIKE_TYPES, default='like')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'likes'
        unique_together = [('user_id', 'post'), ('user_id', 'comment')]
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['post']),
            models.Index(fields=['comment']),
            models.Index(fields=['created_at']),
        ]

class Share(models.Model):
    """Post shares/reposts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField()  # Reference to User in user-service
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='shares')
    
    # Additional comment on share
    comment = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'shares'
        unique_together = ('user_id', 'post')
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['post']),
            models.Index(fields=['created_at']),
        ]

class Hashtag(models.Model):
    """Trending hashtags"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    
    # Metrics
    post_count = models.PositiveIntegerField(default=0)
    trending_score = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hashtags'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['trending_score']),
            models.Index(fields=['post_count']),
            models.Index(fields=['last_used']),
        ]

class UserFeed(models.Model):
    """Personalized user feed entries"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField()  # Reference to User in user-service
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    
    # Feed scoring
    relevance_score = models.FloatField(default=0.0)
    engagement_score = models.FloatField(default=0.0)
    recency_score = models.FloatField(default=0.0)
    final_score = models.FloatField(default=0.0)
    
    # Feed metadata
    reason = models.CharField(max_length=100, blank=True)  # Why this post is in feed
    is_seen = models.BooleanField(default=False)
    is_clicked = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_feeds'
        unique_together = ('user_id', 'post')
        indexes = [
            models.Index(fields=['user_id', 'final_score']),
            models.Index(fields=['user_id', 'is_seen']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-final_score', '-created_at']

class DirectMessage(models.Model):
    """Direct messages between users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender_id = models.UUIDField()  # Reference to User in user-service
    recipient_id = models.UUIDField()  # Reference to User in user-service
    
    content = models.TextField(validators=[MinLengthValidator(1)])
    
    # Message type
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('product', 'Product Share'),
        ('voice', 'Voice Message'),
    ]
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    
    # Attachments
    attachment_url = models.URLField(blank=True)
    product_id = models.UUIDField(null=True, blank=True)
    
    # Message status
    is_read = models.BooleanField(default=False)
    is_deleted_by_sender = models.BooleanField(default=False)
    is_deleted_by_recipient = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'direct_messages'
        indexes = [
            models.Index(fields=['sender_id']),
            models.Index(fields=['recipient_id']),
            models.Index(fields=['is_read']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

class Conversation(models.Model):
    """Conversation threads for direct messages"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.JSONField()  # List of user IDs
    
    # Conversation metadata
    last_message_id = models.UUIDField(null=True, blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    message_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'conversations'
        indexes = [
            models.Index(fields=['last_message_at']),
            models.Index(fields=['created_at']),
        ]

class GroupChat(models.Model):
    """Group chats for communities and product discussions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Group settings
    is_public = models.BooleanField(default=False)
    max_members = models.PositiveIntegerField(default=100)
    
    # Product/topic focus
    product_id = models.UUIDField(null=True, blank=True)
    topic_tags = models.JSONField(default=list)
    
    # Metadata
    member_count = models.PositiveIntegerField(default=0)
    message_count = models.PositiveIntegerField(default=0)
    
    created_by = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'group_chats'
        indexes = [
            models.Index(fields=['created_by']),
            models.Index(fields=['product_id']),
            models.Index(fields=['is_public']),
            models.Index(fields=['created_at']),
        ]

class GroupMembership(models.Model):
    """Group chat memberships"""
    MEMBER_ROLES = [
        ('admin', 'Administrator'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(GroupChat, on_delete=models.CASCADE, related_name='memberships')
    user_id = models.UUIDField()  # Reference to User in user-service
    
    role = models.CharField(max_length=20, choices=MEMBER_ROLES, default='member')
    is_muted = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'group_memberships'
        unique_together = ('group', 'user_id')
        indexes = [
            models.Index(fields=['group']),
            models.Index(fields=['user_id']),
            models.Index(fields=['joined_at']),
        ]

class Notification(models.Model):
    """User notifications"""
    NOTIFICATION_TYPES = [
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('share', 'Share'),
        ('follow', 'Follow'),
        ('mention', 'Mention'),
        ('message', 'Direct Message'),
        ('product_update', 'Product Update'),
        ('order_update', 'Order Update'),
        ('recommendation', 'Recommendation'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_id = models.UUIDField()  # Reference to User in user-service
    sender_id = models.UUIDField(null=True, blank=True)  # Reference to User in user-service
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Related content
    post_id = models.UUIDField(null=True, blank=True)
    product_id = models.UUIDField(null=True, blank=True)
    order_id = models.UUIDField(null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        indexes = [
            models.Index(fields=['recipient_id', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']