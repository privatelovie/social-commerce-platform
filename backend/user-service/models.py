from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django.core.validators import RegexValidator

class User(AbstractUser):
    """Extended user model with social commerce features"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Profile Information
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='covers/', blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_validator], max_length=17, blank=True)
    
    # Location
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Social Features
    is_seller = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    follower_count = models.PositiveIntegerField(default=0)
    following_count = models.PositiveIntegerField(default=0)
    
    # Privacy Settings
    is_private = models.BooleanField(default=False)
    show_email = models.BooleanField(default=False)
    show_phone = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['is_seller']),
            models.Index(fields=['created_at']),
        ]

class UserProfile(models.Model):
    """Extended profile information for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Preferences
    preferred_language = models.CharField(max_length=10, default='en')
    preferred_currency = models.CharField(max_length=3, default='USD')
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Shopping Preferences
    preferred_categories = models.JSONField(default=list)  # List of category IDs
    price_range_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_range_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Notification Preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    marketing_notifications = models.BooleanField(default=True)
    
    # Social Preferences
    allow_friend_requests = models.BooleanField(default=True)
    show_activity = models.BooleanField(default=True)
    allow_recommendations = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'

class Follow(models.Model):
    """User following relationships"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_follows'
        unique_together = ('follower', 'following')
        indexes = [
            models.Index(fields=['follower']),
            models.Index(fields=['following']),
            models.Index(fields=['created_at']),
        ]

class UserAddress(models.Model):
    """Multiple addresses per user"""
    ADDRESS_TYPES = [
        ('home', 'Home'),
        ('work', 'Work'),
        ('billing', 'Billing'),
        ('shipping', 'Shipping'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    
    address_type = models.CharField(max_length=20, choices=ADDRESS_TYPES)
    is_default = models.BooleanField(default=False)
    
    # Address fields
    street_address = models.TextField()
    apartment_number = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    
    # Contact information
    recipient_name = models.CharField(max_length=200)
    recipient_phone = models.CharField(max_length=20, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_addresses'
        indexes = [
            models.Index(fields=['user', 'is_default']),
            models.Index(fields=['user', 'address_type']),
        ]

class UserSession(models.Model):
    """Track user sessions for analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    
    session_id = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_type = models.CharField(max_length=50, blank=True)  # mobile, desktop, tablet
    browser = models.CharField(max_length=100, blank=True)
    
    # Location data (if available)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Session data
    is_active = models.BooleanField(default=True)
    login_time = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'user_sessions'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['session_id']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['login_time']),
        ]