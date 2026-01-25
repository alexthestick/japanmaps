# Lost in Transit JP - Community Features PRD
**Version 1.0** | **Last Updated:** January 2026

---

## Executive Summary

Transform Lost in Transit JP from a curated discovery platform into a **community-enhanced experience** where users can share their finds, organize collections, and discover through others' experiences—without becoming another social media platform.

**Core Philosophy:** Lost in Transit curates the stores, the community shares the stories.

**Inspiration:** Letterboxd's feed model (activity-based, not algorithmic)

---

## Product Vision

**Current State:**
- 1,040+ curated stores across Japan
- Users can browse and save stores (localStorage)
- No user accounts, no social features
- One-way consumption (browse → save → leave)

**Future State:**
- Users have accounts with public profiles
- Create and share collections of stores
- Post "hauls" (photos of items found at stores)
- Write text/photo reviews of stores
- Follow activity feed (Letterboxd-style)
- Discover new stores through community content

**Not Building:**
- Social media platform with likes/comments/DMs
- Algorithmic feed
- User chat or messaging
- Influencer features or verification badges

---

## Target Users

### Primary Persona: "The Curator"
- **Age:** 22-35
- **Behavior:** Plans Japan trips, loves vintage/coffee culture
- **Pain Point:** Can't remember all the stores they want to visit
- **Motivation:** Show off their taste, help others discover gems
- **Usage:** Creates collections, posts hauls, follows others with similar taste

### Secondary Persona: "The Planner"
- **Age:** 25-40
- **Behavior:** Planning first trip to Japan, overwhelmed by options
- **Pain Point:** Too many generic Google reviews, wants authentic recs
- **Motivation:** Find trusted recommendations from real people
- **Usage:** Follows curators, saves to collections, reads reviews

### Tertiary Persona: "The Local"
- **Age:** 20-30
- **Behavior:** Lives in Tokyo/Osaka, frequent vintage shopper
- **Pain Point:** Wants to share knowledge, track their visits
- **Motivation:** Become known for their expertise
- **Usage:** Posts hauls regularly, writes detailed reviews

---

## Success Metrics

### Phase 1 (Months 1-4): Foundation
- **User Signups:** 1,000 users
- **Collection Creation:** 60% of users create ≥1 collection
- **Avg Collections per User:** 3
- **Collection Shares:** 25% share rate
- **Weekly Active Users:** 40%

### Phase 2 (Months 5-9): Community Content
- **Hauls Posted:** 50/week
- **Reviews Posted:** 30/week
- **Stores with User Content:** 50% of database
- **Avg Session Time:** 5 min → 12 min
- **User Retention:** 50% return within 7 days

### Phase 3 (Months 10-18): Social Discovery
- **Feed Engagement:** 60% of users check feed weekly
- **Cross-Discovery:** 40% discover new stores via feed
- **Monthly Active Users:** 70% of signups
- **User-Generated Content:** 30% of store page views include hauls/reviews

---

## Core Features

---

## PHASE 1: Foundation (Months 1-4)

### 1.1 User Accounts & Authentication

**User Story:**
> As a user, I want to create an account so my saves are synced across devices and I can access them anywhere.

**Requirements:**

**Sign Up Options:**
- Email + password
- Google OAuth
- No phone number required
- Email verification for security

**Profile Data:**
```
Required:
- Username (unique, 3-20 chars, alphanumeric + underscore)
- Email

Optional:
- Display name
- Avatar (upload or Gravatar)
- Bio (250 chars max)
- Website/social link
- Location (city, country)
```

**Profile URL:**
- Format: `lostintransitjp.com/@username`
- Public by default
- Shows: collections, hauls, reviews

**Technical Specs:**
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 20),
  display_name text,
  avatar_url text,
  bio text CHECK (length(bio) <= 250),
  website text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Username must be alphanumeric + underscore only
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**Auth Flow:**
```typescript
// Supabase Auth integration
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      username: 'vintage_hunter',
      display_name: 'Sarah'
    }
  }
});

// Profile creation happens via database trigger
```

**Migration from localStorage:**
```typescript
// On first login, migrate local saves
async function migrateLocalSaves(userId: string) {
  const localSaves = getSavedStoreIds(); // Existing function

  if (localSaves.length > 0) {
    // Create "My Saves" collection
    const { data: collection } = await supabase
      .from('collections')
      .insert({
        user_id: userId,
        title: 'My Saved Stores',
        description: 'Migrated from your previous saves',
        is_public: false
      })
      .select()
      .single();

    // Add stores to collection
    await supabase
      .from('collection_stores')
      .insert(
        localSaves.map(storeId => ({
          collection_id: collection.id,
          store_id: storeId
        }))
      );

    // Clear localStorage
    clearAllSavedStores();
  }
}
```

**UI Components Needed:**
- Sign up modal
- Login modal
- Profile edit page
- Avatar upload component
- Email verification flow

**Edge Cases:**
- Username already taken → suggest alternatives
- Email already registered → prompt to login
- Forgot password flow
- Change email/username (with constraints)

---

### 1.2 Collections (Enhanced Saves)

**User Story:**
> As a user, I want to organize stores into themed collections so I can group them by trip, style, or category.

**Requirements:**

**Collection Properties:**
```
- Title (required, 3-60 chars)
- Description (optional, 500 chars max)
- Public/Private toggle
- Cover photo (auto-selected from first store or custom upload)
- Store count (auto-calculated)
- Created date
- Last updated date
```

**Features:**
- Create unlimited collections
- Add stores to multiple collections
- Reorder stores within collection
- Delete collections (with confirmation)
- Share public collections via link
- Duplicate collection (fork someone else's)

**Collection Types (User-Selected):**
- Trip Planning
- Favorites
- Wishlist
- Archive (Visited)
- Custom

**Technical Specs:**
```sql
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) >= 3 AND length(title) <= 60),
  description text CHECK (length(description) <= 500),
  is_public boolean DEFAULT true,
  cover_image_url text,
  collection_type text DEFAULT 'custom', -- trip | favorites | wishlist | archive | custom
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE collection_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  position integer, -- For custom ordering
  added_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, store_id)
);

-- Track collection saves (like bookmarking someone's collection)
CREATE TABLE collection_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, collection_id)
);

CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_public ON collections(is_public) WHERE is_public = true;
CREATE INDEX idx_collection_stores_collection ON collection_stores(collection_id);
```

**Collection Page URL:**
- Format: `lostintransitjp.com/@username/tokyo-vintage-gems`
- Slug auto-generated from title
- Shows: stores in grid/list view, description, save count

**Sharing:**
```typescript
// Generate shareable link
const shareUrl = `https://lostintransitjp.com/@${username}/${collectionSlug}`;

// Social share metadata
<meta property="og:title" content="Tokyo Vintage Gems - 45 stores" />
<meta property="og:description" content="My favorite vintage spots in Tokyo" />
<meta property="og:image" content={coverImageUrl} />
```

**UI Components Needed:**
- "Add to Collection" modal (with create new option)
- Collection grid view (user profile)
- Collection detail page
- Collection edit modal
- Reorder drag-and-drop interface
- Share link copy button

**Store Card Update:**
```typescript
// Replace heart icon with "Add to Collection" button
<SaveButton
  storeId={store.id}
  onSave={(collectionId) => addToCollection(store.id, collectionId)}
/>
```

---

### 1.3 Visit Tracking (Private)

**User Story:**
> As a user, I want to track which stores I've visited so I can remember where I've been.

**Requirements:**

**Features:**
- Mark store as "Visited" (checkbox)
- Private by default (only user can see)
- Visit date (auto-captured or user-selected)
- Optional private notes (not visible to others)
- Filter collections by "Visited" / "Not Visited"

**Technical Specs:**
```sql
CREATE TABLE store_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  visited_at timestamptz DEFAULT now(),
  notes text, -- Private notes, not shown publicly
  UNIQUE(user_id, store_id)
);

CREATE INDEX idx_visits_user ON store_visits(user_id);
```

**Profile Stats:**
```typescript
// Show on user profile
const stats = {
  collections: 12,
  storesVisited: 47,
  haulsPosted: 23,
  reviewsWritten: 18
};
```

**UI:**
- Checkmark button on store card
- "Visited" badge on saved stores
- Profile stats counter
- Filter: "Show only visited" in collections

---

## PHASE 2: Community Content (Months 5-9)

### 2.1 Haul Posts

**User Story:**
> As a user, I want to share photos of items I bought at stores so others can see what's available and I can showcase my finds.

**Requirements:**

**Haul Properties:**
```
- Photos (1-5 images, required)
- Caption (50-500 chars, required)
- Stores tagged (1-5 stores, required)
- Items list (optional structured data):
  - Item description
  - Price in ¥
  - Size
  - Tags (vintage, denim, etc.)
- Posted date
- View count
- Save count (users can save hauls)
```

**Creation Flow:**
```
1. User profile → "Post Haul" button
2. Upload photos (drag-drop or click)
3. Write caption (with character counter)
4. Tag stores (autocomplete search)
5. [Optional] Add item details
6. Preview
7. Publish
```

**Moderation:**
- First 3 hauls per user: manual approval (pending status)
- After 3 approved: auto-publish
- Report button on all hauls
- Admin can flag, hide, or delete

**Technical Specs:**
```sql
CREATE TABLE hauls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  caption text NOT NULL CHECK (length(caption) >= 50 AND length(caption) <= 500),
  photos text[] NOT NULL CHECK (array_length(photos, 1) >= 1 AND array_length(photos, 1) <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes text,
  views_count integer DEFAULT 0,
  saves_count integer DEFAULT 0
);

CREATE TABLE haul_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  haul_id uuid REFERENCES hauls(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE(haul_id, store_id)
);

-- Optional: structured item data
CREATE TABLE haul_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  haul_id uuid REFERENCES hauls(id) ON DELETE CASCADE,
  description text NOT NULL,
  price_yen integer,
  size text,
  tags text[]
);

CREATE TABLE haul_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  haul_id uuid REFERENCES hauls(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, haul_id)
);

CREATE TABLE haul_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  haul_id uuid REFERENCES hauls(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_hauls_user ON hauls(user_id);
CREATE INDEX idx_hauls_status ON hauls(status);
CREATE INDEX idx_haul_stores_store ON haul_stores(store_id);
```

**Where Hauls Appear:**
1. **User Profile** - Grid of user's hauls
2. **Store Page** - "Recent Hauls" section
3. **Feed** - "New hauls from users you follow" (Phase 3)
4. **Haul Detail Page** - Full view with all photos

**Photo Upload:**
```typescript
// Use ImageKit
async function uploadHaulPhoto(file: File, userId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', `/hauls/${userId}`);

  // Resize on upload
  formData.append('transformation', JSON.stringify({
    width: 1200,
    height: 1200,
    crop: 'maintain_ratio'
  }));

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(IMAGEKIT_PRIVATE_KEY + ':')}`
    },
    body: formData
  });

  return response.json();
}
```

**UI Components:**
- Haul creation modal
- Photo uploader (multi-select)
- Store tagger (autocomplete)
- Haul grid (profile, store pages)
- Haul detail page
- Save haul button
- Report modal

**Store Page Integration:**
```typescript
// Add "Recent Hauls" section to store page
<section>
  <h2>Recent Hauls from {storeName}</h2>
  <HaulGrid storeId={storeId} limit={6} />
  <Link to={`/stores/${storeId}/hauls`}>View All Hauls →</Link>
</section>
```

**Spam Prevention:**
```typescript
// Rate limiting
const dailyLimit = 5;
const haulsToday = await supabase
  .from('hauls')
  .select('count')
  .eq('user_id', userId)
  .gte('created_at', startOfDay(new Date()))
  .single();

if (haulsToday.count >= dailyLimit) {
  throw new Error('Max 5 hauls per day');
}

// First-time user moderation
const approvedCount = await supabase
  .from('hauls')
  .select('count')
  .eq('user_id', userId)
  .eq('status', 'approved')
  .single();

const requiresApproval = approvedCount.count < 3;
```

---

### 2.2 Store Reviews (Text + Photos Only)

**User Story:**
> As a user, I want to share my experience at a store through text and photos to help others know what to expect.

**Requirements:**

**Review Properties:**
```
- Text review (100-1000 chars, required)
- Photos (0-5 images, optional)
- Store tagged (1 store only)
- Visit date (optional)
- Posted date
```

**NO RATINGS:**
- No star ratings
- No numeric scores
- Just authentic written experiences
- Quality over quantification

**Creation Flow:**
```
1. Store page → "Write Review" button
2. Text area (with char counter)
3. [Optional] Upload photos
4. [Optional] Select visit date
5. Preview
6. Submit
```

**Moderation:**
- First 3 reviews per user: manual approval
- After 3 approved: auto-publish
- Report button
- Admin moderation queue

**Technical Specs:**
```sql
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  text_content text NOT NULL CHECK (length(text_content) >= 100 AND length(text_content) <= 1000),
  photos text[], -- 0-5 photos
  visit_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes text,
  helpful_count integer DEFAULT 0, -- Users can mark as "helpful"
  UNIQUE(user_id, store_id) -- One review per store per user
);

CREATE TABLE review_helpful (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

CREATE TABLE review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reviews_store ON reviews(store_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
```

**Store Page Integration:**
```typescript
// Reviews section on store page
<section>
  <h2>Reviews ({reviewCount})</h2>

  {/* Sort by most helpful or most recent */}
  <Select value={sortBy} onChange={setSortBy}>
    <option value="helpful">Most Helpful</option>
    <option value="recent">Most Recent</option>
  </Select>

  {reviews.map(review => (
    <ReviewCard
      key={review.id}
      review={review}
      onMarkHelpful={handleMarkHelpful}
      onReport={handleReport}
    />
  ))}
</section>
```

**Review Card UI:**
```
┌─────────────────────────────────────┐
│ @username · 2 days ago              │
│ ────────────────────────────────    │
│ "Amazing selection of vintage       │
│ denim. Staff was super helpful...   │
│ [Read more]                         │
│                                     │
│ [Photo] [Photo] [Photo]             │
│                                     │
│ 👍 Helpful (23) · Report            │
└─────────────────────────────────────┘
```

**Helpful Button:**
```typescript
// Simple upvote-style interaction
const handleMarkHelpful = async (reviewId: string) => {
  const { error } = await supabase
    .from('review_helpful')
    .insert({ review_id: reviewId, user_id: currentUser.id });

  if (!error) {
    // Increment counter
    await supabase.rpc('increment_review_helpful', { review_id: reviewId });
  }
};
```

**UI Components:**
- Review creation modal
- Review card component
- Photo upload for reviews
- Helpful button
- Report modal
- Review moderation queue (admin)

---

## PHASE 3: Social Discovery (Months 10-18)

### 3.1 Activity Feed (Letterboxd-Style)

**User Story:**
> As a user, I want to see recent activity from the community and discover new content without an algorithmic feed.

**Core Philosophy:**
- **Chronological, not algorithmic**
- Shows recent activity from followed users + Lost in Transit updates
- Simple, clean, focused on discovery

**Feed Sources:**

**1. User Activity (from users you follow):**
- Posted a new haul
- Created a new collection
- Wrote a review
- Saved a collection

**2. Lost in Transit Updates:**
- New store added to database
- Featured collection by Lost in Transit
- New blog post published

**Feed Item Types:**

```typescript
type FeedItem =
  | { type: 'haul', user: User, haul: Haul, timestamp: Date }
  | { type: 'collection', user: User, collection: Collection, timestamp: Date }
  | { type: 'review', user: User, review: Review, timestamp: Date }
  | { type: 'store_added', store: Store, timestamp: Date } // From Lost in Transit
  | { type: 'blog_post', post: BlogPost, timestamp: Date } // From Lost in Transit
  | { type: 'collection_saved', user: User, collection: Collection, timestamp: Date };
```

**Feed Logic:**
```
IF user follows others:
  Show activity from followed users (last 7 days)
  + Lost in Transit updates
ELSE:
  Show trending hauls/collections (last 7 days)
  + Lost in Transit updates
```

**Technical Specs:**
```sql
-- Activity feed table
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE, -- NULL for Lost in Transit updates
  activity_type text NOT NULL CHECK (activity_type IN (
    'haul_posted',
    'collection_created',
    'review_posted',
    'collection_saved',
    'store_added', -- Admin/system activity
    'blog_posted'  -- Admin/system activity
  )),
  haul_id uuid REFERENCES hauls(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_activities_created ON activities(created_at DESC);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
```

**Feed Query:**
```typescript
async function getFeedForUser(userId: string, page: number = 1) {
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get users this user follows
  const { data: following } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = following?.map(f => f.following_id) || [];

  // Get feed items
  const { data: activities } = await supabase
    .from('activities')
    .select(`
      *,
      user:users(*),
      haul:hauls(*),
      collection:collections(*),
      review:reviews(*),
      store:stores(*),
      blog_post:blog_posts(*)
    `)
    .or(`user_id.in.(${followingIds.join(',')}),user_id.is.null`) // NULL = Lost in Transit
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return activities;
}
```

**Feed UI (Desktop):**
```
┌─────────────────────────────────────────────────────┐
│  Feed                             [Following ▾]      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Lost in Transit added a new store                  │
│  2 hours ago                                        │
│  ┌──────────────────────────────────┐              │
│  │ [Store Photo]                     │              │
│  │ KINJI - Harajuku                  │              │
│  │ Vintage clothing in Harajuku      │              │
│  └──────────────────────────────────┘              │
│  [Save to Collection ▾]                             │
│                                                      │
│  ────────────────────────────────────────────       │
│                                                      │
│  @sarah_vintage posted a new haul                   │
│  4 hours ago from 'bout                             │
│  ┌──────────────────────────────────┐              │
│  │ [Haul Photos Grid]                │              │
│  │ "Found some amazing vintage..."   │              │
│  └──────────────────────────────────┘              │
│  [View Haul]                                        │
│                                                      │
│  ────────────────────────────────────────────       │
│                                                      │
│  @tokyo_hunter created a collection                 │
│  Yesterday                                          │
│  ┌──────────────────────────────────┐              │
│  │ Best Coffee in Shibuya (12)       │              │
│  │ My favorite local spots           │              │
│  └──────────────────────────────────┘              │
│  [View Collection] [Save]                           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Feed Filters:**
```typescript
// Dropdown to filter feed
const feedFilters = [
  { value: 'all', label: 'All Activity' },
  { value: 'following', label: 'Following' }, // Default if user follows others
  { value: 'hauls', label: 'Hauls Only' },
  { value: 'collections', label: 'Collections Only' },
  { value: 'reviews', label: 'Reviews Only' },
  { value: 'official', label: 'Lost in Transit Updates' }
];
```

**UI Components:**
- Feed page (`/feed`)
- Feed item cards (different layouts per type)
- Infinite scroll pagination
- Filter dropdown
- Empty state (when not following anyone)

**Activity Creation (Triggers):**
```typescript
// Auto-create activity when user posts haul
supabase
  .from('hauls')
  .insert(haulData)
  .then(({ data: haul }) => {
    // Create activity
    supabase.from('activities').insert({
      user_id: userId,
      activity_type: 'haul_posted',
      haul_id: haul.id
    });
  });

// Admin creates activity when adding new store
supabase
  .from('stores')
  .insert(storeData)
  .then(({ data: store }) => {
    supabase.from('activities').insert({
      user_id: null, // NULL = system/Lost in Transit
      activity_type: 'store_added',
      store_id: store.id
    });
  });
```

---

### 3.2 Following System

**User Story:**
> As a user, I want to follow other users whose taste I trust so I can see their activity in my feed.

**Requirements:**

**Features:**
- Follow/unfollow users
- See who you follow
- See who follows you
- No notifications (keep it simple)
- No mutual follows required
- No DMs or messaging

**Technical Specs:**
```sql
CREATE TABLE user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE, -- Who is following
  following_id uuid REFERENCES users(id) ON DELETE CASCADE, -- Who is being followed
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Can't follow yourself
);

CREATE INDEX idx_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_follows_following ON user_follows(following_id);
```

**Profile Display:**
```typescript
// User profile shows follow counts
const profileStats = {
  collections: 12,
  followers: 234,
  following: 67,
  hauls: 45,
  reviews: 23
};
```

**UI:**
```
User Profile
────────────
@sarah_vintage
Sarah | Tokyo-based vintage hunter

[Follow] or [Following ✓]

12 Collections · 234 Followers · 67 Following
```

**Follow/Unfollow:**
```typescript
async function toggleFollow(targetUserId: string) {
  const { data: existing } = await supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', currentUser.id)
    .eq('following_id', targetUserId)
    .single();

  if (existing) {
    // Unfollow
    await supabase
      .from('user_follows')
      .delete()
      .eq('id', existing.id);
  } else {
    // Follow
    await supabase
      .from('user_follows')
      .insert({
        follower_id: currentUser.id,
        following_id: targetUserId
      });
  }
}
```

**Followers/Following Pages:**
- `/@ username/followers` - List of users following them
- `/@username/following` - List of users they follow
- Simple list with follow/unfollow buttons

---

### 3.3 Trending & Discovery

**User Story:**
> As a new user who doesn't follow anyone yet, I want to discover interesting users and content.

**Discovery Pages:**

**1. Trending Hauls**
- `/discover/hauls`
- Most saved hauls from last 7 days
- Grid layout

**2. Popular Collections**
- `/discover/collections`
- Most saved collections from last 30 days
- Grid layout

**3. Active Users**
- `/discover/users`
- Users with most recent activity
- Suggested users based on stores you've saved

**Technical Specs:**
```typescript
// Trending hauls
async function getTrendingHauls(days: number = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return supabase
    .from('hauls')
    .select('*, user:users(*), saves:haul_saves(count)')
    .gte('created_at', since.toISOString())
    .eq('status', 'approved')
    .order('saves_count', { ascending: false })
    .limit(20);
}

// Popular collections
async function getPopularCollections(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return supabase
    .from('collections')
    .select('*, user:users(*), saves:collection_saves(count)')
    .eq('is_public', true)
    .gte('created_at', since.toISOString())
    .order('saves_count', { ascending: false })
    .limit(20);
}

// Suggested users (based on stores you saved)
async function getSuggestedUsers(userId: string) {
  // Find users who have saved similar stores to you
  // Complex query - recommend using a view or function

  return supabase.rpc('get_suggested_users', {
    current_user_id: userId,
    limit: 10
  });
}
```

**UI:**
```
Discover
────────
[Hauls] [Collections] [Users]

Trending Hauls This Week
┌────┬────┬────┬────┐
│    │    │    │    │
│    │    │    │    │
└────┴────┴────┴────┘

Popular Collections
┌────┬────┬────┐
│    │    │    │
│    │    │    │
└────┴────┴────┘

Users to Follow
┌───────────────────────────┐
│ @user · 45 hauls          │
│ [Follow]                  │
├───────────────────────────┤
│ @user2 · 23 collections   │
│ [Follow]                  │
└───────────────────────────┘
```

---

## Technical Architecture

### Database Schema Summary

```sql
-- Core user system
users
user_follows

-- Collections
collections
collection_stores
collection_saves

-- Visits (private)
store_visits

-- Hauls
hauls
haul_stores
haul_items (optional)
haul_saves
haul_reports

-- Reviews
reviews
review_helpful
review_reports

-- Activity feed
activities
```

### Authentication

**Provider:** Supabase Auth

**Methods:**
- Email/password
- Google OAuth

**Row Level Security (RLS):**
```sql
-- Users can update their own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Collections visibility
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public collections visible to all"
  ON collections FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own collections"
  ON collections FOR ALL
  USING (user_id = auth.uid());

-- Hauls must be approved to be visible (except to owner)
ALTER TABLE hauls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved hauls visible to all"
  ON hauls FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Users can manage own hauls"
  ON hauls FOR ALL
  USING (user_id = auth.uid());
```

### File Storage

**Provider:** ImageKit.io (already in use)

**Folders:**
- `/avatars/{userId}/` - Profile photos
- `/hauls/{userId}/` - Haul photos
- `/reviews/{userId}/` - Review photos
- `/collections/{collectionId}/` - Custom cover images

**Upload Limits:**
- Max 5MB per image
- Max 5 images per haul/review
- Formats: JPG, PNG, WEBP

### API Endpoints

```typescript
// User endpoints
GET    /api/users/:username
PATCH  /api/users/me
GET    /api/users/:username/collections
GET    /api/users/:username/hauls
GET    /api/users/:username/reviews
GET    /api/users/:username/followers
GET    /api/users/:username/following
POST   /api/users/:username/follow
DELETE /api/users/:username/follow

// Collection endpoints
GET    /api/collections/:id
POST   /api/collections
PATCH  /api/collections/:id
DELETE /api/collections/:id
POST   /api/collections/:id/stores
DELETE /api/collections/:id/stores/:storeId
POST   /api/collections/:id/save
DELETE /api/collections/:id/save

// Haul endpoints
GET    /api/hauls/:id
POST   /api/hauls
PATCH  /api/hauls/:id
DELETE /api/hauls/:id
POST   /api/hauls/:id/save
DELETE /api/hauls/:id/save
POST   /api/hauls/:id/report

// Review endpoints
GET    /api/reviews/:id
POST   /api/reviews
PATCH  /api/reviews/:id
DELETE /api/reviews/:id
POST   /api/reviews/:id/helpful
POST   /api/reviews/:id/report

// Feed endpoints
GET    /api/feed?filter=all|following|hauls|collections
GET    /api/discover/hauls
GET    /api/discover/collections
GET    /api/discover/users

// Store updates (to show user content)
GET    /api/stores/:id/hauls
GET    /api/stores/:id/reviews
```

### Frontend Components

**New Pages:**
- `/feed` - Activity feed
- `/@:username` - User profile
- `/@:username/:collectionSlug` - Collection page
- `/hauls/:id` - Haul detail
- `/discover` - Discovery hub
- `/settings` - User settings

**New Components:**
```
components/
├── user/
│   ├── UserProfile.tsx
│   ├── UserProfileStats.tsx
│   ├── FollowButton.tsx
│   ├── UserCard.tsx
│   └── SettingsForm.tsx
├── collections/
│   ├── CollectionGrid.tsx
│   ├── CollectionCard.tsx
│   ├── CollectionDetail.tsx
│   ├── CreateCollectionModal.tsx
│   ├── AddToCollectionModal.tsx
│   └── CollectionCoverUpload.tsx
├── hauls/
│   ├── HaulGrid.tsx
│   ├── HaulCard.tsx
│   ├── HaulDetail.tsx
│   ├── CreateHaulModal.tsx
│   ├── HaulPhotoUpload.tsx
│   └── StoreTagInput.tsx
├── reviews/
│   ├── ReviewList.tsx
│   ├── ReviewCard.tsx
│   ├── WriteReviewModal.tsx
│   └── HelpfulButton.tsx
└── feed/
    ├── FeedPage.tsx
    ├── FeedItem.tsx (polymorphic)
    ├── FeedFilter.tsx
    └── EmptyFeed.tsx
```

---

## Moderation & Safety

### Content Moderation

**Strategy: Trust but Verify**

**Auto-Approval After Trust:**
- First 3 hauls: manual approval
- First 3 reviews: manual approval
- After 3 approved: auto-publish
- Report system for community flagging

**Moderation Queue:**
```typescript
// Admin dashboard view
interface ModerationQueue {
  pending_hauls: Haul[];
  pending_reviews: Review[];
  reported_hauls: Haul[];
  reported_reviews: Review[];
  flagged_users: User[];
}
```

**Admin Actions:**
- Approve
- Reject (with reason)
- Flag user (probation)
- Ban user

**Reporting Reasons:**
```typescript
const reportReasons = [
  'Spam or misleading',
  'Inappropriate content',
  'Not related to store',
  'Hate speech or harassment',
  'Copyright violation',
  'Other (specify)'
];
```

### Spam Prevention

**Rate Limits:**
- 5 hauls per day per user
- 3 reviews per day per user
- 20 follows per day per user
- 10 collections per day per user

**Content Filters:**
```typescript
// Detect spam patterns
const spamIndicators = [
  /buy.*from.*website/i,
  /click.*link/i,
  /dm.*for.*more/i,
  /follow.*instagram/i
];

function containsSpam(text: string): boolean {
  return spamIndicators.some(pattern => pattern.test(text));
}
```

**Image Moderation:**
- Manual review for first 3 uploads
- Consider: AWS Rekognition for inappropriate content detection
- File size limits (5MB max)

---

## SEO Considerations

### New Indexable Pages

**User Profiles:**
```html
<!-- /@username -->
<title>@sarah_vintage - Lost in Transit JP</title>
<meta name="description" content="Tokyo-based vintage hunter. 45 hauls, 12 collections." />
<meta name="robots" content="index, follow" />
```

**Collections:**
```html
<!-- /@username/tokyo-vintage-gems -->
<title>Tokyo Vintage Gems - 45 stores by @sarah_vintage</title>
<meta name="description" content="My favorite vintage spots in Tokyo including 'bout, Kinji, and more" />
<meta property="og:type" content="article" />
```

**Hauls:**
```html
<!-- /hauls/:id -->
<title>Vintage Carhartt from 'bout - @sarah_vintage</title>
<meta name="description" content="Amazing finds from 'bout in Tokyo" />
```

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "sarah_vintage",
  "url": "https://lostintransitjp.com/@sarah_vintage",
  "description": "Tokyo-based vintage hunter"
}
```

---

## Analytics & Metrics

### User Engagement Metrics

**Track:**
- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- User retention (7-day, 30-day)
- Collection creation rate
- Haul posting rate
- Review posting rate
- Feed engagement (views, clicks)
- Follow graph growth

**Tools:**
- Mixpanel or Amplitude for event tracking
- PostHog (self-hosted alternative)
- Google Analytics 4 for web traffic

**Key Events:**
```typescript
analytics.track('Haul Posted', {
  user_id: userId,
  store_count: storeIds.length,
  photo_count: photos.length,
  has_prices: items.some(i => i.price_yen)
});

analytics.track('Collection Created', {
  user_id: userId,
  is_public: isPublic,
  store_count: storeIds.length
});

analytics.track('Review Posted', {
  user_id: userId,
  store_id: storeId,
  has_photos: photos.length > 0,
  character_count: text.length
});
```

### Business Metrics

**Track:**
- User-generated content (UGC) growth
- Store coverage (% of stores with hauls/reviews)
- Collection shares
- Traffic sources (organic, social, direct)
- User acquisition cost (if running ads)

---

## Launch Plan

### Phase 1: Foundation (Months 1-4)

**Month 1: User Accounts**
- Week 1-2: Supabase Auth setup, database schema
- Week 3: Sign up/login UI, profile pages
- Week 4: Testing, bug fixes, localStorage migration

**Month 2: Collections**
- Week 1: Collection creation/editing
- Week 2: Add to collection flow
- Week 3: Public collection pages, sharing
- Week 4: Testing, refinement

**Month 3: Visit Tracking**
- Week 1-2: Visit check-ins, private notes
- Week 3: Profile stats
- Week 4: Buffer for bug fixes

**Month 4: Beta Testing**
- Invite 50-100 users
- Gather feedback
- Fix critical issues
- Prepare for Phase 2

**Launch Announcement:**
- Blog post about new features
- Email to existing users (if you have list)
- Social media announcement

---

### Phase 2: Community Content (Months 5-9)

**Month 5: Haul Posts**
- Week 1-2: Haul creation flow, photo upload
- Week 3: Store tagging, haul display
- Week 4: Testing, moderation setup

**Month 6: Haul Integration**
- Week 1-2: Haul grids on store pages
- Week 3: Haul detail pages, save feature
- Week 4: Admin moderation dashboard

**Month 7: Reviews**
- Week 1-2: Review creation, photo upload
- Week 3: Review display on store pages
- Week 4: Helpful button, moderation

**Month 8-9: Refinement**
- Fix bugs
- Improve UX based on feedback
- Optimize performance
- Prepare for Phase 3

**Mid-Phase Check-in:**
- Evaluate metrics (hauls/reviews posted)
- User interviews
- Decide if ready for Phase 3

---

### Phase 3: Social Discovery (Months 10-18)

**Month 10-11: Following System**
- Week 1-2: Follow/unfollow functionality
- Week 3-4: Followers/following pages
- Testing

**Month 12-14: Activity Feed**
- Week 1-4: Feed logic, activity triggers
- Week 5-8: Feed UI, filtering
- Week 9-12: Testing, optimization

**Month 15-16: Discovery Features**
- Trending hauls/collections
- User suggestions
- Discovery page

**Month 17-18: Polish & Launch**
- Performance optimization
- Final bug fixes
- Full public launch
- Marketing push

---

## Future Considerations (Beyond 18 Months)

**Potential Features:**
- Trip planning tools (itinerary builder)
- Store check-ins with badges
- Export collections to PDF/map
- Mobile app (React Native)
- Premium tier ($5/month)
- Business accounts for stores
- Events/meetups integration
- Expand beyond Japan (Korea, Thailand, etc.)

**Monetization Options:**
- Premium subscriptions
- Business partnerships with stores
- Affiliate commissions
- Sponsored collections
- Premium analytics for stores

---

## Open Questions & Decisions Needed

**Design:**
- [ ] Color scheme for user profiles (match existing brand?)
- [ ] Typography for user-generated content
- [ ] Icon set for feed items

**Product:**
- [ ] Should collections be forkable? (copy someone's collection)
- [ ] Allow commenting on hauls/reviews?
- [ ] Private messaging between users?
- [ ] Allow users to edit hauls/reviews after posting?

**Technical:**
- [ ] Image CDN strategy (ImageKit transformations)
- [ ] Search implementation (Algolia vs built-in?)
- [ ] Analytics platform choice
- [ ] Error tracking (Sentry vs alternatives)

**Business:**
- [ ] Pricing for premium tier (if any)
- [ ] Store partnership model
- [ ] Content moderation resources (hire moderators?)

---

## Success Criteria

**Phase 1 Success:**
- ✅ 1,000+ user accounts created
- ✅ 60% create at least 1 collection
- ✅ 25% share a collection externally
- ✅ <5% bug report rate

**Phase 2 Success:**
- ✅ 50+ hauls posted per week
- ✅ 30+ reviews posted per week
- ✅ 50% of stores have user content
- ✅ 12+ min avg session time

**Phase 3 Success:**
- ✅ 60% of users check feed weekly
- ✅ 40% discover stores via feed
- ✅ 70% monthly active user retention
- ✅ Organic growth through sharing

---

## Resources Needed

### Development Team
- 1 Full-stack developer (you + me via Claude Code)
- Timeline: 18 months part-time OR 9 months full-time

### Design
- UI/UX for new pages (can use existing design system)
- Feed item designs
- Profile page layouts

### Infrastructure
- Supabase (current): ~$25-100/month
- ImageKit (current): ~$50-200/month
- Domain/hosting: Existing
- Analytics: Free tier → $50/month

### Moderation
- Start: You manually approve
- Growth: 1 part-time moderator at ~1,000 MAU
- Scale: Automated tools + community reporting

---

## Appendix

### Competitor Analysis

**Letterboxd (Film)**
- Activity feed (chronological)
- Lists (collections)
- Reviews (no ratings in our case)
- Following system
- Clean, focused UI

**Foursquare/Swarm**
- Check-ins (our visit tracking)
- Tips (our reviews)
- Lists
- Became too social media-like

**Google Maps**
- Reviews + photos
- Lists (collections)
- Too utilitarian, not community-focused

**Our Unique Position:**
- Curated store database (quality)
- Japan-focused (niche)
- Hauls (show actual finds, not just reviews)
- Community without algorithm

### User Research Questions

**For Current Users:**
1. Would you create an account to save your stores?
2. Would you share your favorite stores with friends?
3. Would you post photos of items you found?
4. What would make you come back to the site regularly?

**For Potential Users:**
1. How do you currently discover stores in Japan?
2. Do you trust influencer recommendations?
3. Would you follow real shoppers vs influencers?
4. What makes you save/bookmark places?

---

## Document Control

**Version History:**
- v1.0 (Jan 2026): Initial PRD
- Future: Update after each phase

**Approvals:**
- [ ] Product vision approved
- [ ] Technical approach approved
- [ ] Timeline agreed upon
- [ ] Metrics defined

**Next Steps:**
1. Review and approve PRD
2. Create Phase 1 technical spec
3. Set up development environment
4. Begin implementation

---

**Questions or need clarification on any section?** Let me know what to expand or modify!
