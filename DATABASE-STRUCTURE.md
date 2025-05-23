# Cat Social Network Database Structure

This document outlines the required database structure for the backend of the Cat Social Network application. The frontend expects the API to follow these models and endpoints.

## Models

### User

Represents a user of the application.

```python
class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Custom user fields as needed
    # You can extend AbstractUser with additional fields
```

### Cat

Represents a cat profile in the application.

```python
class Cat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    breed = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    owner = models.ForeignKey(User, related_name='cats', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='cat_images/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optional additional fields
    description = models.TextField(blank=True)
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
```

### CatLike

Tracks which users have liked which cats.

```python
class CatLike(models.Model):
    cat = models.ForeignKey(Cat, related_name='likes', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='cat_likes', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cat', 'user')
```

### Comment

Represents comments on cat profiles, with support for threaded replies.

```python
class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cat = models.ForeignKey(Cat, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='comments', on_delete=models.CASCADE)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    text = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        
    @property
    def reply_count(self):
        """Calculate the number of direct replies to this comment."""
        return self.replies.count()
        
    def save(self, *args, **kwargs):
        # Update comment count on the cat when creating a new top-level comment
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and self.parent is None:
            self.cat.comments_count += 1
            self.cat.save()
```

### CommentLike

Tracks which users have liked which comments.

```python
class CommentLike(models.Model):
    comment = models.ForeignKey(Comment, related_name='likes', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='comment_likes', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('comment', 'user')
```

## API Endpoints

The frontend expects the following API endpoints:

### Authentication

- `POST /api/auth/login/` - Log in an existing user
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/logout/` - Log out the current user
- `GET /api/auth/user/` - Get the current authenticated user

### Cats

- `GET /api/cats/` - List all cats (with pagination)
- `GET /api/cats/:id/` - Get a specific cat by ID
- `POST /api/cats/:id/like/` - Like/unlike a cat (toggle)
- `GET /api/users/:username/cats/` - Get cats for a specific user

### Comments

- `GET /api/cats/:catId/comments/` - Get comments for a specific cat
  - Query parameters:
    - `sort=recent` (default) or `sort=likes` - Sort comments by recency or popularity
- `POST /api/cats/:catId/comments/` - Add a new comment to a cat
- `GET /api/comments/:commentId/replies/` - Get replies to a specific comment
- `POST /api/comments/:commentId/like/` - Like/unlike a comment (toggle)
- `DELETE /api/comments/:commentId/` - Delete a comment (if owner or admin)

### Users

- `GET /api/users/me/` - Get current user's profile
- `GET /api/users/:username/` - Get a user's public profile

## Django Setup

For the Django backend, you'll need to:

1. Install required packages:
   ```bash
   pip install django djangorestframework django-cors-headers pillow
   ```

2. Configure CORS to allow requests from your frontend:
   ```python
   # settings.py
   INSTALLED_APPS = [
       # ...
       'corsheaders',
       'rest_framework',
       # ...
   ]
   
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',
       # ... other middleware
   ]
   
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",  # React development server
       # Add your production frontend URL when deploying
   ]
   
   REST_FRAMEWORK = {
       'DEFAULT_AUTHENTICATION_CLASSES': [
           'rest_framework.authentication.SessionAuthentication',
           'rest_framework.authentication.TokenAuthentication',
       ],
       'DEFAULT_PERMISSION_CLASSES': [
           'rest_framework.permissions.IsAuthenticated',
       ],
       'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
       'PAGE_SIZE': 10
   }
   ```

3. Create ViewSets for your models:
   ```python
   # views.py example
   from rest_framework import viewsets, permissions, status
   from rest_framework.decorators import action
   from rest_framework.response import Response
   
   class CatViewSet(viewsets.ModelViewSet):
       queryset = Cat.objects.all()
       serializer_class = CatSerializer
       
       @action(detail=True, methods=['post'])
       def like(self, request, pk=None):
           cat = self.get_object()
           user = request.user
           
           like, created = CatLike.objects.get_or_create(cat=cat, user=user)
           
           if not created:
               # User already liked, so unlike
               like.delete()
               cat.likes_count -= 1
               cat.save()
               return Response({'liked': False, 'likes_count': cat.likes_count})
           
           # New like
           cat.likes_count += 1
           cat.save()
           return Response({'liked': True, 'likes_count': cat.likes_count})
   ```

4. Create appropriate serializers for your models:
   ```python
   # serializers.py example
   from rest_framework import serializers
   
   class CommentSerializer(serializers.ModelSerializer):
       username = serializers.CharField(source='user.username', read_only=True)
       userProfilePic = serializers.ImageField(source='user.profile_pic', read_only=True)
       timestamp = serializers.SerializerMethodField()
       likeCount = serializers.IntegerField(source='likes_count', read_only=True)
       replyCount = serializers.IntegerField(source='reply_count', read_only=True)
       
       class Meta:
           model = Comment
           fields = ['id', 'username', 'userProfilePic', 'text', 'timestamp', 
                    'likeCount', 'replyCount', 'created_at']
       
       def get_timestamp(self, obj):
           # Convert timestamp to human-readable format like "5 min" or "2 hours"
           # Implement your time formatting logic here
           return "5 min"  # Placeholder
   ```

## Deployment Considerations

1. For production, make sure to:
   - Use environment variables for sensitive configuration
   - Set up proper media storage (e.g., AWS S3 for images)
   - Configure secure CORS settings
   
2. For user authentication in production:
   - Consider using JWT tokens instead of session authentication
   - Implement proper password reset flows
   - Add social authentication if needed

3. Performance optimizations:
   - Use database indexes on frequently queried fields
   - Consider caching popular content
   - Implement pagination for all list endpoints
