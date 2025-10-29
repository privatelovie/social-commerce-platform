# Follow/Unfollow Components

A complete set of React components for implementing user following functionality in your social commerce platform.

## Components

### 1. FollowButton
A versatile button component for following/unfollowing users with multiple display variants.

**Features:**
- Three variants: `default`, `compact`, `icon-only`
- Visual feedback with hover states
- Loading states
- Icon animations (UserPlus → UserCheck → User)
- Automatic follower count updates

**Usage:**
```tsx
import { FollowButton } from './components/FollowButton';

<FollowButton
  username="johndoe"
  isFollowing={false}
  followersCount={1234}
  onFollowChange={(isFollowing, newCount) => {
    console.log(`Now following: ${isFollowing}, followers: ${newCount}`);
  }}
  variant="default"
/>
```

**Props:**
- `username` (string, required): Username of the user to follow
- `isFollowing` (boolean, required): Current follow state
- `followersCount` (number, optional): Current follower count
- `onFollowChange` (function, optional): Callback when follow state changes
- `variant` ('default' | 'compact' | 'icon-only', optional): Button style
- `className` (string, optional): Additional CSS classes

---

### 2. UserCard
Display user information with integrated follow functionality.

**Features:**
- Three layout variants: `card`, `list`, `compact`
- Verified badge display
- Creator badge display
- Follower count formatting (1.2K, 1.5M)
- Profile picture with fallback
- Bio display (optional)

**Usage:**
```tsx
import { UserCard } from './components/UserCard';

<UserCard
  user={{
    username: 'johndoe',
    displayName: 'John Doe',
    profile: {
      avatar: 'https://...',
      bio: 'Creator and entrepreneur'
    },
    isVerified: true,
    isCreator: true,
    socialStats: {
      followersCount: 12500
    },
    isFollowing: false
  }}
  currentUserId="current-user-id"
  onFollowChange={(username, isFollowing, count) => {
    console.log(`User ${username} follow changed`);
  }}
  variant="card"
  showBio={true}
/>
```

**Props:**
- `user` (object, required): User data
- `currentUserId` (string, optional): ID of current user (to hide follow button on own profile)
- `onFollowChange` (function, optional): Callback for follow state changes
- `showBio` (boolean, optional): Whether to display bio
- `variant` ('card' | 'list' | 'compact', optional): Display style

---

### 3. FollowersList
Modal/dialog component to display followers or following lists.

**Features:**
- Pagination with "Load More"
- Empty states
- Error handling with retry
- Real-time follow/unfollow updates
- Smooth animations
- Modal overlay with backdrop

**Usage:**
```tsx
import { FollowersList } from './components/FollowersList';

const [showFollowers, setShowFollowers] = useState(false);

<FollowersList
  username="johndoe"
  type="followers"
  currentUserId="current-user-id"
  isOpen={showFollowers}
  onClose={() => setShowFollowers(false)}
/>
```

**Props:**
- `username` (string, required): Username to fetch followers/following for
- `type` ('followers' | 'following', required): Type of list to show
- `currentUserId` (string, optional): Current user ID
- `isOpen` (boolean, required): Whether modal is open
- `onClose` (function, required): Close callback

---

### 4. SuggestedUsers
Component to display recommended users to follow.

**Features:**
- Two variants: `sidebar` (compact) and `page` (grid)
- Refresh functionality
- Loading states
- Automatic error handling
- Responsive grid layout

**Usage:**
```tsx
import { SuggestedUsers } from './components/SuggestedUsers';

// Sidebar variant
<SuggestedUsers
  currentUserId="current-user-id"
  limit={5}
  variant="sidebar"
  title="Suggested for you"
/>

// Page variant
<SuggestedUsers
  currentUserId="current-user-id"
  limit={12}
  variant="page"
  title="Recommended creators"
/>
```

**Props:**
- `currentUserId` (string, optional): Current user ID
- `limit` (number, optional): Number of suggestions to show
- `variant` ('sidebar' | 'page', optional): Display layout
- `title` (string, optional): Component title

---

## Integration Examples

### In a Profile Page
```tsx
import { FollowButton, FollowersList } from './components';

const ProfilePage = ({ user, currentUser }) => {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1>{user.displayName}</h1>
        {user.id !== currentUser.id && (
          <FollowButton
            username={user.username}
            isFollowing={user.isFollowing}
            followersCount={user.followersCount}
          />
        )}
      </div>

      <div className="flex gap-4">
        <button onClick={() => setShowFollowers(true)}>
          {user.followersCount} Followers
        </button>
        <button onClick={() => setShowFollowing(true)}>
          {user.followingCount} Following
        </button>
      </div>

      <FollowersList
        username={user.username}
        type="followers"
        currentUserId={currentUser.id}
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
      />

      <FollowersList
        username={user.username}
        type="following"
        currentUserId={currentUser.id}
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
      />
    </div>
  );
};
```

### In a Feed Sidebar
```tsx
import { SuggestedUsers } from './components';

const FeedSidebar = ({ currentUserId }) => {
  return (
    <aside className="w-80">
      <SuggestedUsers
        currentUserId={currentUserId}
        limit={5}
        variant="sidebar"
      />
    </aside>
  );
};
```

### In Search Results
```tsx
import { UserCard } from './components';

const SearchResults = ({ users, currentUserId }) => {
  return (
    <div className="space-y-2">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          currentUserId={currentUserId}
          variant="list"
        />
      ))}
    </div>
  );
};
```

---

## API Integration

All components use the `usersAPI` service from `services/api.js`:

```javascript
// Already implemented in your API service
usersAPI.followUser(username)        // POST /api/users/:username/follow
usersAPI.unfollowUser(username)      // DELETE /api/users/:username/follow
usersAPI.getFollowers(username, page)
usersAPI.getFollowing(username, page)
usersAPI.getTrendingCreators(limit)
```

---

## Styling

Components use Tailwind CSS classes. Make sure you have:
- Tailwind CSS configured
- `lucide-react` icons installed: `npm install lucide-react`

---

## Backend API Requirements

The backend endpoints are already implemented in `backend/routes/users.js`:

- `POST /api/users/:username/follow` - Toggle follow/unfollow
- `GET /api/users/:username/followers` - Get followers list
- `GET /api/users/:username/following` - Get following list
- `GET /api/users/trending/creators` - Get suggested users

---

## Notes

- All components handle loading and error states
- Follow/unfollow actions are optimistic with proper error handling
- Components are fully typed with TypeScript
- Responsive design included
- Icons use `lucide-react`
- Avatar fallback using DiceBear API
