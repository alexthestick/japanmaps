# ✅ Getting Started Checklist

Use this checklist to get your Japan Clothing Map up and running!

---

## 📦 Step 1: Dependencies
- [x] Node.js installed (v18+)
- [x] Project dependencies installed (`npm install`) ✅ **DONE**
- [x] No installation errors ✅ **DONE**

---

## 🗄️ Step 2: Supabase Setup

### Account & Project
- [ ] Created Supabase account at [supabase.com](https://supabase.com)
- [ ] Created new project named "Japan Clothing Map"
- [ ] Noted down database password (saved somewhere safe)

### Database Schema
- [ ] Opened SQL Editor in Supabase dashboard
- [ ] Ran `supabase/001_initial_schema.sql` successfully
- [ ] Ran `supabase/002_rls_policies.sql` successfully
- [ ] (Optional) Ran `supabase/003_sample_stores.sql` for test data

### Storage
- [ ] Created storage bucket named `store-photos`
- [ ] Made bucket **public** (important!)

### Credentials
- [ ] Copied **Project URL** from Settings → API
- [ ] Copied **anon public key** from Settings → API
- [ ] Added both to `.env.local` file

---

## 🗺️ Step 3: Mapbox Setup

- [ ] Created Mapbox account at [mapbox.com](https://www.mapbox.com)
- [ ] Verified email address
- [ ] Copied default public token (starts with `pk.`)
- [ ] Added token to `.env.local` file

---

## 🔑 Step 4: Environment Variables

- [ ] Created `.env.local` file in project root
- [ ] Added `VITE_SUPABASE_URL=...`
- [ ] Added `VITE_SUPABASE_ANON_KEY=...`
- [ ] Added `VITE_MAPBOX_TOKEN=...`
- [ ] Double-checked all three values are filled in
- [ ] File is named exactly `.env.local` (not `.env.local.example`)

---

## 🚀 Step 5: Run the App

- [ ] Opened terminal in project directory
- [ ] Ran `npm run dev`
- [ ] Saw "Local: http://localhost:5173/" message
- [ ] Opened browser to http://localhost:5173
- [ ] **Map loads successfully!** 🎉

---

## ✅ Step 6: Verify Features

### Map View
- [ ] Map is centered on Tokyo
- [ ] Sample store pins are visible (if you ran sample SQL)
- [ ] Can zoom in/out on map
- [ ] Can click on a pin to see store details
- [ ] Store detail modal opens with information

### Filters
- [ ] Can click city filters (Tokyo, Osaka, etc.)
- [ ] Map updates when filter is selected
- [ ] Can filter by category
- [ ] Can filter by price range
- [ ] Search box works
- [ ] "Clear all filters" button works

### List View
- [ ] Can toggle to List view
- [ ] Store cards display correctly
- [ ] Can click a card to see details
- [ ] Sort dropdown works (Name, City, etc.)

### Navigation
- [ ] Header links work (Map, Blog, About)
- [ ] Mobile menu works on small screens
- [ ] Footer displays correctly

---

## 🔐 Step 7: Admin Setup

### Create Admin User
- [ ] Went to Supabase dashboard → Authentication → Users
- [ ] Clicked "Add user" → "Create new user"
- [ ] Entered email and password
- [ ] User created successfully

### Test Admin Panel
- [ ] Navigated to http://localhost:5173/admin
- [ ] Login form appears
- [ ] Can log in with admin credentials
- [ ] Admin dashboard loads
- [ ] Can see "Add New Store" button
- [ ] Can see suggestions list (if any submitted)

---

## 🏪 Step 8: Add Your First Store

### Option A: Via Admin Dashboard (Recommended)
- [ ] Logged into admin dashboard
- [ ] Clicked "Add New Store"
- [ ] Filled in store name
- [ ] Filled in address
- [ ] Filled in city and country
- [ ] Got latitude/longitude from Google Maps:
  - [ ] Searched store on Google Maps
  - [ ] Right-clicked on location
  - [ ] Clicked coordinates to copy
  - [ ] Pasted into form
- [ ] Selected at least one category
- [ ] Added description
- [ ] Added photo URL (or used Unsplash: `https://source.unsplash.com/800x600/?store`)
- [ ] Clicked "Add Store"
- [ ] Store added successfully
- [ ] Refreshed homepage and saw new store on map! 🎉

### Option B: Test Suggestion Form
- [ ] Went to http://localhost:5173/suggest
- [ ] Filled out suggestion form
- [ ] Submitted successfully
- [ ] Checked admin dashboard to see suggestion
- [ ] Approved suggestion (appears on map)

---

## 🎨 Step 9: Customization (Optional)

### Branding
- [ ] Updated site title in `index.html`
- [ ] Updated brand name in `src/components/layout/Header.tsx`
- [ ] Updated footer links and social media handles
- [ ] Updated About page content

### Map Styling
- [ ] Customized pin colors in `src/lib/constants.ts`
- [ ] Changed default map location (if not using Tokyo)
- [ ] Adjusted default zoom level

### Categories
- [ ] Added/removed categories as needed
- [ ] Updated category colors

---

## 📱 Step 10: Test on Mobile

- [ ] Opened site on phone/tablet
- [ ] Map is responsive
- [ ] Filters work on mobile
- [ ] Mobile menu (hamburger) works
- [ ] Can click pins and view details
- [ ] Forms work on mobile
- [ ] All pages load correctly

---

## 🚢 Step 11: Deploy (Optional)

### Prepare for Deployment
- [ ] Pushed code to GitHub repository
- [ ] Created Vercel account
- [ ] Connected GitHub to Vercel

### Deploy to Vercel
- [ ] Imported GitHub repo to Vercel
- [ ] Added environment variables in Vercel dashboard:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_MAPBOX_TOKEN`
- [ ] Clicked "Deploy"
- [ ] Deployment successful! ✅
- [ ] Visited live URL
- [ ] Everything works on production! 🎉

---

## 📊 Step 12: Start Curating

- [ ] Created list of stores to add (from Google Maps saves, etc.)
- [ ] Added first 5 stores
- [ ] Added first 10 stores
- [ ] Added first 20 stores
- [ ] Organized stores by category
- [ ] Added high-quality photos
- [ ] Wrote compelling descriptions
- [ ] Verified all links work (Instagram, websites)

---

## 🎥 Step 13: Content Creation (Optional)

- [ ] Took screenshots of the map for social media
- [ ] Recorded demo video for YouTube
- [ ] Wrote announcement post
- [ ] Shared with friends for feedback
- [ ] Published content about the platform

---

## 🎯 Success Criteria

You're fully set up when you can:

✅ Load the map and see stores
✅ Click pins and view details
✅ Filter stores by city, category, price
✅ Toggle between map and list view
✅ Submit a store suggestion
✅ Log into admin dashboard
✅ Add a new store via admin panel
✅ See new stores appear on the map
✅ Access the site on mobile
✅ (Optional) Site is live on Vercel

---

## 🆘 Troubleshooting Quick Links

**Map not loading?**
→ Check `QUICK_START.md` - "Map not showing?" section

**No stores visible?**
→ Did you run `supabase/003_sample_stores.sql`?

**Can't log in to admin?**
→ Did you create a user in Supabase Authentication?

**Environment variables not working?**
→ Restart dev server after creating `.env.local`

**Full troubleshooting guide:**
→ See `SETUP_GUIDE.md` - "Troubleshooting" section

---

## 🧭 Progress Log (Oct 2025)

- Home Goods (🏠) and Museum (🏛️) categories added across UI and schema
- Add Store form now supports Google Places + AI descriptions + photo fetching
- AI prompt refined to avoid direct review citations
- Fixed price range constraint and duplicate photo URLs
- RPC updated to include `main_category` and `google_place_id`
- Map behavior refined: no auto-zoom on filter change; accurate subcategory coloring
- Cities and neighborhoods expanded; Kanagawa / Yokohama combined


## 📚 Documentation

- **Quick Setup**: `QUICK_START.md` (5 minutes)
- **Detailed Setup**: `SETUP_GUIDE.md` (step-by-step)
- **Project Overview**: `README.md`
- **What's Built**: `PROJECT_SUMMARY.md`

---

## 🎉 You Did It!

Once all checkboxes above are complete, you have a fully functional clothing store discovery platform!

**Now go add some amazing stores and share your platform with the world! 🗺️**

---

*Happy curating! - Built with ❤️ for the fashion community*


