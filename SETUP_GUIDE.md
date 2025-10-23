# Japan Clothing Map - Setup Guide

Welcome! This guide will walk you through setting up your clothing store discovery platform from scratch.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- A **Supabase account** - [Sign up free](https://supabase.com/)
- A **Mapbox account** - [Sign up free](https://www.mapbox.com/)
- A **code editor** (VS Code recommended)

---

## 🚀 Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all necessary packages including React, TypeScript, Tailwind CSS, Mapbox, Supabase, and more.

---

## 🗄️ Step 2: Set Up Supabase

### 2.1 Create a New Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com/)
2. Click **"New Project"**
3. Fill in:
   - **Name**: Japan Clothing Map (or whatever you like)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
4. Wait for the project to be created (~2 minutes)

### 2.2 Run the Database Schema

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy the contents of `supabase/001_initial_schema.sql` from this project
4. Paste it into the SQL editor and click **"Run"**
5. Repeat for `supabase/002_rls_policies.sql`
6. (Optional) Run `supabase/003_sample_stores.sql` to add 5 sample stores for testing

### 2.3 Set Up Storage Buckets

1. Click on **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Name it `store-photos`
4. Make it **Public**
5. Click **"Create bucket"**

### 2.4 Get Your Supabase Credentials

1. Click on **"Settings"** (gear icon) in the left sidebar
2. Click on **"API"**
3. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **anon public key** (long string)
4. Save these - you'll need them in Step 4!

---

## 🗺️ Step 3: Set Up Mapbox

### 3.1 Create a Mapbox Account

1. Go to [mapbox.com](https://www.mapbox.com/)
2. Click **"Sign up"** (it's free!)
3. Verify your email

### 3.2 Get Your Access Token

1. Go to [account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
2. Your **Default public token** is already created
3. Copy this token (starts with `pk.`)
4. Save it - you'll need it next!

**Note**: The free tier includes 50,000 map loads per month, which is plenty to start!

---

## 🔑 Step 4: Configure Environment Variables

1. In the project root, find the file `.env.local.example`
2. Create a copy and name it `.env.local` (remove `.example`)
3. Open `.env.local` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

4. Save the file

**Important**: Never commit `.env.local` to Git! It's already in `.gitignore`.

---

## 🔄 Schema Updates (October 2025)

If your repository includes newer SQL files, run them (in filename order) after the core schema:

1. `supabase/004_rpc_functions.sql` (ensures RPC returns coordinates and extra fields)
2. `supabase/005_add_neighborhoods.sql`
3. Any timestamped migrations such as:
   - `*_fix_category_casing.sql` (standardize category casing)
   - `*_update_main_category_check.sql` (allow Home Goods & Museum)

These changes enable new categories, better filtering, and stable data exports.

---

## ▶️ Step 5: Run the Development Server

In your terminal, run:

```bash
npm run dev
```

You should see output like:

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open your browser and go to `http://localhost:5173/` 🎉

---

## ✅ Step 6: Verify Everything Works

### Test the Map View
- The map should load centered on Tokyo
- You should see 5 sample store pins (if you ran the sample data SQL)
- Click on a pin - a store detail modal should appear

### Test Filters
- Click on a category filter - the map should update
- Try searching for "Tokyo" - stores should filter

### Test the Suggestion Form
1. Click **"Suggest a Store"** in the header
2. Fill out the form
3. Submit it
4. Check your Supabase dashboard:
   - Go to **"Table Editor"** → **"store_suggestions"**
   - Your submission should be there!

### Test Admin Dashboard
1. First, create an admin account in Supabase:
   - Go to **"Authentication"** → **"Users"**
   - Click **"Add user"**
   - Enter email and password
   - Click **"Create user"**
2. Go to `http://localhost:5173/admin`
3. Log in with your admin credentials
4. You should see the suggestions list
5. Try adding a new store via the form

---

## 📝 Step 7: Add Your First Real Store

Now it's time to add your curated stores!

### Option 1: Via Admin Dashboard (Recommended)

1. Go to `/admin` and log in
2. Click **"Add New Store"**
3. Fill in all the details:
   - **Name**: Store name
   - **Address**: Full address
   - **City & Neighborhood**: Location details
   - **Latitude & Longitude**: Get these from Google Maps:
     - Search for the store on Google Maps
     - Right-click on the location
     - Click on the coordinates to copy them
   - **Categories**: Select at least one
   - **Description**: What makes this store special?
   - **Photo URL**: Link to a photo (use Unsplash for testing)
   - **Instagram/Website**: Social links
4. Click **"Add Store"**
5. Refresh the map - your store should appear!

### Option 2: Directly in Supabase

1. Go to your Supabase dashboard
2. Click **"Table Editor"** → **"stores"**
3. Click **"Insert"** → **"Insert row"**
4. Fill in the fields (note: `location` must be in format `POINT(longitude latitude)`)
5. Click **"Save"**

---

## 🎨 Step 8: Customization Ideas

### Change the Map Style
Edit `src/lib/mapbox.ts`:
```typescript
export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11'; // Try: streets-v12, outdoors-v12, satellite-v9
```

### Update Pin Colors
Edit `src/lib/constants.ts`:
```typescript
export const PIN_COLORS = {
  archive: '#YOUR_COLOR',
  vintage: '#YOUR_COLOR',
  // etc.
};
```

### Add More Categories
Edit `src/lib/constants.ts`:
```typescript
export const STORE_CATEGORIES = [
  'archive',
  'vintage',
  'your-new-category', // Add here
] as const;
```

### Change Default Map Location
Edit `src/lib/mapbox.ts`:
```typescript
export const DEFAULT_CENTER = {
  longitude: YOUR_LONGITUDE,
  latitude: YOUR_LATITUDE,
};
```

---

## 🚀 Step 9: Deploy to Vercel (Optional)

When you're ready to go live:

### 9.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 9.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com/)
2. Sign up/in with GitHub
3. Click **"New Project"**
4. Import your GitHub repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MAPBOX_TOKEN`
6. Click **"Deploy"**
7. Wait 2-3 minutes... done! 🎉

---

## 🐛 Troubleshooting

### Map Not Loading?
- ✅ Check that `VITE_MAPBOX_TOKEN` is set in `.env.local`
- ✅ Make sure the token starts with `pk.`
- ✅ Restart the dev server after adding env variables

### No Stores Showing?
- ✅ Check that you ran the sample stores SQL
- ✅ Check browser console for errors
- ✅ Verify Supabase credentials are correct

### Can't Add Stores?
- ✅ Make sure you're logged in to admin
- ✅ Check that latitude/longitude are valid numbers
- ✅ Verify at least one category is selected

### "Missing Supabase environment variables" Error?
- ✅ Make sure `.env.local` exists (not `.env.local.example`)
- ✅ Restart the dev server after creating `.env.local`

---

## 📚 Next Steps

Now that your map is running:

1. **Add Your Stores**: Start adding your curated list from Google Maps
2. **Test on Mobile**: Open the site on your phone - it's fully responsive!
3. **Customize Design**: Tweak colors, fonts, and layouts to match your brand
4. **Create Content**: Write your first blog post about the platform
5. **Share It**: Post on social media and get feedback!

---

## 🆘 Need Help?

- Check the main `README.md` for more details
- Review the PRD for feature explanations
- Look at the codebase structure document for architecture details

---

## 🎉 You're All Set!

Congratulations! You now have a fully functional clothing store discovery platform. 

Have fun curating and building! 🗺️👕

---

*Last updated: October 2025*


