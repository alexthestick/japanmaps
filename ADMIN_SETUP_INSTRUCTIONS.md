# Admin Security Setup Instructions

## ✅ Completed Tasks

1. **Removed Admin Login from Footer** - The admin login link is no longer visible in the footer
2. **Reduced Mapbox Clutter** - Changed from navigation styles to lighter styles and programmatically hid POI labels
3. **Improved Pin Visibility** - Your custom pins will now be much more visible
4. **Added Admin Role Security** - Created a proper admin role system

## 🔐 Setting Up Your Admin Account

### Step 1: Run the Database Migration

You need to run the SQL migration to add admin roles to your database:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `/supabase/010_add_admin_roles.sql`
4. Click **Run** to execute the migration

### Step 2: Set Yourself as Admin

After running the migration, you need to mark your account as an admin.

**Option A: If you already have an account**

Run this query in the Supabase SQL Editor (replace with your actual email):

```sql
UPDATE profiles
SET is_admin = TRUE
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-actual-email@example.com');
```

**Option B: If you don't have a profile yet**

Run this query (replace with your actual email):

```sql
INSERT INTO profiles (id, is_admin)
VALUES ((SELECT id FROM auth.users WHERE email = 'your-actual-email@example.com'), TRUE)
ON CONFLICT (id) DO UPDATE SET is_admin = TRUE;
```

### Step 3: Test Admin Access

1. Navigate to `/admin` on your website
2. Log in with your email and password
3. You should now have full admin access
4. Any other users who try to access this page will see "Access Denied"

## 🛡️ Security Features Implemented

- ✅ Admin role check in the frontend (prevents UI access)
- ✅ Row Level Security (RLS) policies in Supabase (prevents database access)
- ✅ Only admins can:
  - Insert, update, or delete stores
  - Update store suggestions
  - Create, update, or delete blog posts
- ✅ Regular users cannot become admins (must be set manually in database)
- ✅ Admin status is checked on every login and page load

## ⚠️ Important Notes

- The admin panel is still accessible at `/admin` URL, but only admins can use it
- If you want to add more admins in the future, you'll need to manually update the database
- Keep your admin credentials secure
- The admin login link has been removed from the footer to reduce visibility

## 📋 Next Steps - Information Needed

To complete the remaining tasks, please provide:

1. **Social Media Links:**
   - Instagram URL or handle
   - YouTube URL (or should I remove it?)
   - Any other social media you want to include

2. **Contact Email:**
   - Your actual contact email address (currently shows `hello@example.com`)

3. **About Page Personal Content:**
   - Write a personal paragraph about why you created this project
   - Your connection to Japan
   - Your vision for the site

4. **Photos for Cities/Neighborhoods:**
   - Where are your photos stored?
   - Do you need help uploading them?

5. **Landing Page Images:**
   - Which images are placeholders that need replacement?
   - Do you have replacement images ready?

Once you provide this information, I can complete the content updates!
