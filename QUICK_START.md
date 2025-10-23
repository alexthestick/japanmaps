# 🚀 Quick Start Guide

Get your Japan Clothing Map running in **5 minutes**!

---

## ✅ Step 1: Install Dependencies
```bash
npm install
```
✅ **Already done!** Dependencies are installed.

---

## ✅ Step 2: Set Up Environment Variables

1. Create a file named `.env.local` in the project root
2. Add these three lines (you'll fill in the values next):

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MAPBOX_TOKEN=
```

---

## 📊 Step 3: Create Supabase Project

### 3.1 Sign up and create project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Name it "Japan Clothing Map"
4. Set a database password (save it!)
5. Choose a region
6. Click **"Create new project"** (wait ~2 mins)

### 3.2 Run the database setup
1. In Supabase, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Copy **ALL** contents from `supabase/001_initial_schema.sql`
4. Paste and click **"Run"** ▶️
5. Repeat for `supabase/002_rls_policies.sql`
6. (Optional) Run `supabase/003_sample_stores.sql` for 5 test stores

### 3.3 Create storage bucket
1. Click **"Storage"** (left sidebar)
2. Click **"Create a new bucket"**
3. Name: `store-photos`
4. Make it **Public** ✅
5. Click **"Create bucket"**

### 3.4 Get your credentials
1. Click **"Settings"** (gear icon, bottom left)
2. Click **"API"**
3. Copy **Project URL** → paste into `.env.local` as `VITE_SUPABASE_URL`
4. Copy **anon public** key → paste into `.env.local` as `VITE_SUPABASE_ANON_KEY`

---

## 🗺️ Step 4: Get Mapbox Token

1. Go to [mapbox.com](https://www.mapbox.com) and sign up (free!)
2. Go to [account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
3. Copy your **Default public token** (starts with `pk.`)
4. Paste into `.env.local` as `VITE_MAPBOX_TOKEN`

Your `.env.local` should now look like:
```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...long_string_here
VITE_MAPBOX_TOKEN=pk.eyJ1Ijoi...long_string_here
```

---

## 🎉 Step 5: Run the App!

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

You should see:
- ✅ A map centered on Tokyo
- ✅ 5 sample store pins (if you ran the sample data)
- ✅ Working filters and search
- ✅ Click a pin to see store details

---

## 🎯 Next Steps

### Add Your First Real Store

**Option A: Via Admin Dashboard (Easy)**
1. Create an admin account:
   - Go to Supabase → **"Authentication"** → **"Users"**
   - Click **"Add user"**
   - Enter email & password
   - Click **"Create user"**
2. Go to `http://localhost:5173/admin`
3. Log in with your admin account
4. Click **"Add New Store"**
5. Fill in the form:
   - Get lat/lng from Google Maps (right-click → coordinates)
   - Use Unsplash images for testing: `https://source.unsplash.com/800x600/?store`
6. Click **"Add Store"**
7. Refresh homepage - your store appears! 🎉

**Option B: Test the Suggestion Form**
1. Go to `http://localhost:5173/suggest`
2. Fill out the form as a public user
3. Submit
4. Go to admin dashboard to see the suggestion
5. Approve it to add to the map

---

## 🐛 Troubleshooting

### Map not showing?
- ✅ Check `.env.local` has all 3 values filled in
- ✅ Restart dev server: Press `Ctrl+C`, then `npm run dev` again
- ✅ Make sure Mapbox token starts with `pk.`

### No stores on map?
- ✅ Did you run `supabase/003_sample_stores.sql`?
- ✅ Check browser console (F12) for errors
- ✅ Verify Supabase credentials are correct

### Can't log in to admin?
- ✅ Did you create a user in Supabase Authentication?
- ✅ Check email/password are correct
- ✅ Look for errors in browser console

---

## 📚 Learn More

- **Full setup guide**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **README**: See [README.md](./README.md)
- **Project structure**: Check the `src/` folder

---

## 🆕 What's New (Oct 2025)

- New main categories: Home Goods (🏠) and Museum (🏛️)
- Add Store form: Google Places + AI description + photo import
- Smarter map behavior: no auto-zoom on filter change
- Expanded cities & neighborhoods including Kanagawa / Yokohama


## 🎨 Customize It!

### Change map colors
Edit `src/lib/constants.ts` → `PIN_COLORS`

### Add more cities
Edit `src/lib/constants.ts` → `MAJOR_CITIES_JAPAN`

### Change default map view
Edit `src/lib/mapbox.ts` → `DEFAULT_CENTER`

---

**You're all set! Start adding stores and building your platform! 🗺️**


