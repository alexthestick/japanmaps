# 🔍 PERFORMANCE ANALYSIS REPORT - CitiesPage Image Flashing & Border Delay

**Date:** October 26, 2025
**Affected Files:** `src/pages/CitiesPage.tsx`
**Issue:** Image flashing on preview panel + border not immediately visible

---

## 📋 ISSUES IDENTIFIED

### **Issue 1: IMAGE FLASHING - Missing Initial Image State ⚠️**

**Location:** `src/pages/CitiesPage.tsx` lines 667-705

**Problem:**
```typescript
const currentImage = displayCity?.images?.[selectedCity ? currentPhotoIndex : 0];

<img
  src={currentImage}
  alt={displayCity.name}
  style={{ opacity: 1 }}  // ← ALWAYS 1, even when loading!
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';  // ← Hides image on error
  }}
  onLoad={(e) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'block';  // ← Shows image after load
  }}
/>
```

**Root Cause:**
1. Image starts with `opacity: 1` and `display: 'block'` (default)
2. If image fails to load or is still loading, `onError` sets `display: 'none'`
3. When image finally loads, `onLoad` sets `display: 'block'`
4. This creates a **flashing effect** because:
   - Empty src or slow load → display:none (flashes off)
   - Image arrives → display:block (flashes on)
   - **No loading state** - always either fully hidden or fully visible

5. Additionally: `currentImage` can be `undefined` if images array is empty
   - undefined src causes immediate error
   - Triggers onError handler
   - Creates flash

---

### **Issue 2: BORDER DELAY - Glow Transition Lag ⚠️**

**Location:** `src/pages/CitiesPage.tsx` lines 641-657

**Problem:**
```typescript
{/* Atmospheric Glow - 0.6s transition */}
<div style={{
  background: `radial-gradient(...)`,
  transition: 'background 0.6s ease-in-out',  // ← 600ms delay!
}}

{/* Border Glow - 0.6s transition */}
<div style={{
  background: `linear-gradient(...)`,
  filter: 'blur(8px)',
  transition: 'background 0.6s ease-in-out',  // ← 600ms delay!
}}

{/* Actual Border - NO TRANSITION */}
<div style={{
  border: `5px solid rgba(34, 211, 238, 0.9)`,
  // ← NO transition property!
}}
```

**Root Cause:**
1. Glow layers have **600ms transitions** on background changes
2. Actual border has **NO transition** - should be instant
3. When city changes:
   - Border appears instantly (correct)
   - But glow layers take 600ms to transition colors
   - Creates visual inconsistency where border "appears" before glow settles
4. User perceives: Border takes time to show because glow is still transitioning

---

### **Issue 3: IMAGE UNDEFINED SRC ⚠️**

**Location:** `src/pages/CitiesPage.tsx` line 668

**Problem:**
```typescript
const currentImage = displayCity?.images?.[selectedCity ? currentPhotoIndex : 0];

<img src={currentImage} />  // ← Can be undefined!
```

**Root Cause:**
1. If `displayCity.images` is empty array → `currentImage` is `undefined`
2. `<img src={undefined} />` → Creates invalid img element
3. Browser tries to load from "undefined" URL
4. Immediate error → onError fires → display:none
5. Creates **instant flash** (appears then disappears)

---

### **Issue 4: LOADING STATE NOT MANAGED ⚠️**

**Location:** `src/pages/CitiesPage.tsx` lines 220-336

**Problem:**
```typescript
// Image loading state tracking:
const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);
const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

// NO loading state for image!
// NO tracking of image ready status!
// NO preloading of next image!

// When city changes:
useEffect(() => {
  setCurrentPhotoIndex(0);  // Reset photo
  // But what about the old image? Still visible? Still loading?
}, [selectedCity]);
```

**Root Cause:**
1. **No loading state indicator** - page doesn't track if image is loaded
2. **No preloading** - next image isn't loaded until needed
3. **No placeholder strategy** - nothing shows while loading
4. **Photo cycling** happens every 3 seconds without checking if image exists
5. Creates jarring transitions and flash effects

---

### **Issue 5: PLACEHOLDER LOGIC BROKEN ⚠️**

**Location:** `src/pages/CitiesPage.tsx` lines 685-686

**Problem:**
```typescript
placeholder.className = '...w-full h-full flex items-center justify-center absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 hidden';
//                                                                                                                            ^^^^^^
//                                                                                                                            HIDDEN BY DEFAULT!
```

**Root Cause:**
1. Placeholder div has `hidden` class - never visible!
2. When image fails to load:
   - Image gets `display: none`
   - Placeholder has class `hidden` (display: none)
   - Result: **completely blank space**
3. Border/glow still visible, but content area is empty
4. Creates visual "broken" appearance

---

### **Issue 6: ASYNC IMAGE SWITCHING ⚠️**

**Location:** `src/pages/CitiesPage.tsx` lines 327-336

**Problem:**
```typescript
useEffect(() => {
  setCurrentPhotoIndex(0);

  if (selectedCity && selectedCity.images.length > 1) {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % selectedCity.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }
}, [selectedCity]);
```

**Root Cause:**
1. Photo changes every 3 seconds automatically
2. When `currentPhotoIndex` changes → React re-renders → `currentImage` changes
3. **Old image still visible** while new one loads
4. No fade/transition between images → jarring switch
5. If new image is slow to load → flash of old image, then delay, then new image

---

## 📊 IMPACT SUMMARY

| Issue | Severity | Visual Effect | Affected Component |
|-------|----------|---------------|-------------------|
| Undefined src | 🔴 HIGH | Instant black flash | City preview image |
| No loading state | 🔴 HIGH | Flickering on load | Entire preview area |
| Broken placeholder | 🔴 HIGH | Blank white space | Fallback display |
| Glow transitions | 🟡 MEDIUM | Border delay perception | Border/glow area |
| No preloading | 🟡 MEDIUM | Slow photo cycling | Photo transition |
| Async switching | 🟡 MEDIUM | Jarring transitions | Photo carousel |

---

## 🎯 RECOMMENDED FIXES (Priority Order)

### **CRITICAL - Fix First:**
1. ✅ Add image loading state management
2. ✅ Prevent undefined src by checking image array
3. ✅ Remove `hidden` class from placeholder
4. ✅ Add smooth fade transitions on image load

### **HIGH - Fix Second:**
1. ✅ Add preloading for next image
2. ✅ Implement proper loading skeleton
3. ✅ Add instant border transition (remove 600ms delay)

### **MEDIUM - Fix Third:**
1. ✅ Better placeholder with loading indicator
2. ✅ Preload next photo during cycling
3. ✅ Smooth fade between photo cycles

---

## 📁 FILES TO INSPECT

**Primary:** `src/pages/CitiesPage.tsx`
- Line 220-336: State management and effects
- Line 321-324: Image selection logic
- Line 667-705: Image element and handlers
- Line 641-657: Glow transitions
- Line 685-686: Placeholder logic

**Secondary:**
- `src/types/database.ts` - CityData interface
- `src/lib/constants.ts` - City configuration

---

## 🔧 NEXT STEPS

Share this report with Claude for implementation of fixes. Suggest starting with:
1. Image loading state
2. Safe image URL handling
3. Remove placeholder `hidden` class
4. Add fade transitions

