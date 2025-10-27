# Phase 10: Landing State - Full-Width Preview Implementation

## 🎯 Goal
When page first loads with a random city, show only full-width preview (no right panel). User can then select a city to transition to split layout (Phase 11).

---

## 📋 Phase 10 Breakdown

### **Phase 10.1: Add Landing State Management**
**What:** Create state to track if we're in "landing mode" vs "split mode"

**Changes:**
- Add `isLandingMode` state (boolean)
- Set `isLandingMode = true` when `displayCity.isRandom`
- Set `isLandingMode = false` when user selects a real city

**Code:**
```typescript
const [isLandingMode, setIsLandingMode] = useState(true);

// Reset to landing mode on page load
useEffect(() => {
  if (displayCity?.isRandom) {
    setIsLandingMode(true);
  }
}, []);

// Exit landing mode on city selection
const handleCitySelect = (city: CityData) => {
  setIsLandingMode(false);
  // ... rest of selection logic
};
```

**Testing:**
- Page loads → landing mode active ✓
- Select city → landing mode false ✓

---

### **Phase 10.2: Conditional Right Panel Rendering**
**What:** Hide/show right panel based on landing mode

**Changes:**
- Right panel should only render when NOT in landing mode
- OR render but with `opacity: 0` and `pointer-events: none` for smooth transition

**Code Option A (Don't render):**
```typescript
{!isLandingMode && (
  <div className="flex-[22] flex flex-col...">
    {/* Right panel content */}
  </div>
)}
```

**Code Option B (Render but hidden - better for animation):**
```typescript
<div className={`flex-[22] flex flex-col... ${isLandingMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
  {/* Right panel content */}
</div>
```

**Testing:**
- Landing mode: Right panel invisible/not rendered ✓
- Non-landing: Right panel visible ✓

---

### **Phase 10.3: Flexible Preview Panel Width**
**What:** Preview expands to full width in landing mode, shrinks to 78% in split mode

**Changes:**
- Change flex sizing based on `isLandingMode`
- Landing: `flex-[100]` (full width)
- Split: `flex-[78]` (78% width)

**Code:**
```typescript
<div className={isLandingMode ? 'flex-[100]' : 'flex-[78]'}>
  {/* Preview content */}
</div>
```

**Testing:**
- Landing mode: Preview takes full width ✓
- Non-landing: Preview is 78% ✓

---

### **Phase 10.4: Add Landing State Message/UI**
**What:** Show "Select a city" message overlay on preview in landing mode

**Changes:**
- Add optional overlay div over preview
- Display message: "Select a city to explore"
- Only show in landing mode
- Should be subtle, not blocking

**Code:**
```typescript
{isLandingMode && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white/80">Select a City</h2>
      <p className="text-lg text-white/60 mt-2">to explore stores and neighborhoods</p>
    </div>
  </div>
)}
```

**Styling:**
- Centered text
- Semi-transparent white (white/80)
- Positioned over preview
- Not blocking clicks (pointer-events-none)

**Testing:**
- Landing mode: Message visible ✓
- Message is readable ✓
- Can still interact with carousel ✓

---

### **Phase 10.5: Update handleCitySelect Logic**
**What:** Make sure city selection properly exits landing mode

**Changes:**
- In `handleCitySelect`, set `setIsLandingMode(false)`
- Ensure travel button still works
- Ensure right panel populated correctly

**Code:**
```typescript
const handleCitySelect = (city: CityData) => {
  setSelectedCity(city);
  setIsLandingMode(false);  // ← EXIT LANDING MODE
  // ... rest of logic
};
```

**Testing:**
- Click a city → landing mode off ✓
- Right panel appears ✓
- All city data shows correctly ✓

---

### **Phase 10.6: Handle Carousel Interaction**
**What:** When user hovers over carousel in landing mode, optionally preview right panel

**Optional Enhancement:**
- Hovering carousel could fade in right panel preview (50% opacity)
- Gives user preview of what's there
- Click confirms transition

**Or simpler:**
- Just show hint text "Click to select"
- Don't show right panel until they click

**Testing:**
- Landing mode carousel hover works ✓
- Can click and select ✓

---

### **Phase 10.7: Smooth Transition (Phase 11 prep)**
**What:** Prepare for smooth animation between modes

**What NOT to do yet:**
- Don't add animations yet (Phase 11)
- Just get the state transitions working cleanly

**What to prepare:**
- Ensure flex sizing uses conditional classes (not inline)
- Right panel uses opacity-based hiding (for smooth fade)
- Preview width changes are CSS-based (for smooth scale)

**Testing:**
- State changes don't cause jumpy UI ✓
- Layout is stable ✓
- Ready for Phase 11 animations ✓

---

## 📊 Implementation Order

1. **Phase 10.1** - Add `isLandingMode` state ✓
2. **Phase 10.2** - Conditional right panel rendering ✓
3. **Phase 10.3** - Flexible preview width ✓
4. **Phase 10.4** - Landing message/UI ✓
5. **Phase 10.5** - Update selection logic ✓
6. **Phase 10.6** - Test carousel interaction ✓
7. **Phase 10.7** - Verify smooth transitions ready ✓

---

## 🎯 Final Result

**Landing State (Page Load):**
```
┌─────────────────────────────────────┐
│                                     │
│      FULL-WIDTH PREVIEW PANEL       │
│                                     │
│      Tokyo Temple Image             │
│      + Ken Burns Animation          │
│                                     │
│      "Select a City" Message        │
│                                     │
│      [Carousel Below]               │
│                                     │
└─────────────────────────────────────┘
```

**Split State (After Selection):**
```
┌──────────────────────┬─────────────┐
│                      │ TOKYO       │
│                      │ 東京        │
│   PREVIEW PANEL      ├─────────────┤
│   (78% width)        │ [Stores]    │
│                      │ [Stores]    │
│                      │ [Stores]    │
│                      │ [Stores]    │
│                      │ [Stores]    │
│                      │ [Stores]    │
└──────────────────────┴─────────────┘
```

---

## ✅ Testing Checklist

- [ ] Page loads → sees full-width preview with message
- [ ] Can hover carousel → cards highlight
- [ ] Click city → smooth transition to split layout
- [ ] Right panel appears with city data
- [ ] Travel button visible and clickable
- [ ] All animations smooth and responsive
- [ ] No console errors or warnings

---

## 📝 Files to Modify

**Primary:** `src/pages/CitiesPage.tsx`

**Key changes:**
- Add `isLandingMode` state (line ~230)
- Conditional right panel rendering (line ~787)
- Flexible preview width (line ~627)
- Landing message overlay (line ~715)
- Update `handleCitySelect` (line ~370)

