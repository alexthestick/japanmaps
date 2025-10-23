# Carousel Implementation Diagnosis - Version 2

## Issues Observed

### Issue 1: Incorrect Initial Position
**Symptom:** Page loads with "Mystery" card (Random) selected, but carousel doesn't show the correct initial cards
**Expected:** Should start with Random, Tokyo, Osaka, Kyoto visible
**Actual:** Currently showing different cards or incorrect carousel position

### Issue 2: Arrow Navigation - Skipping & Desynchronization
**Symptom:** 
- When pressing arrow from Tokyo, it skips multiple cities forward
- Later, arrow presses work one-by-one
- Eventually, carousel moves but picture/selectedCity doesn't update

**Expected Behavior:** Each arrow press moves exactly one card
**Actual Behavior:** Multiple inconsistent behaviors

### Issue 3: Arrow vs Card Selection Discrepancy
**Symptom:** 
- Clicking cards directly works perfectly
- Arrow navigation breaks the sync between carousel position and displayed picture
- Eventually carousel transforms but selectedCity state doesn't match

---

## Root Cause Analysis

### Problem 1: Competing State Management (PRIMARY ISSUE)

There are **TWO independent state systems** that are NOT synchronized:

```
System A: Hook State (useLoopingCarousel)
├─ carousel.displayIndex  (0-35 for 18 cities with 9 clones each side)
├─ carousel.logicalIndex  (0-17, maps back to real cities)
├─ carousel.translateX    (visual position)
└─ Managed by: navigate('next'/'prev') in hook

System B: Component State (CitiesPage)
├─ selectedCity           (which city is selected)
├─ hoveredCity            (for preview on hover)
├─ currentPhotoIndex      (cycling through images)
└─ Managed by: handleCitySelect() and useEffect on carousel.displayIndex
```

**The Critical Problem:**
```javascript
// Line 170-180: This useEffect tries to sync them
useEffect(() => {
  const city = extendedCities[carousel.displayIndex];
  setSelectedCity(actualCity);
}, [carousel.displayIndex, extendedCities, cities]);
```

### Problem 2: Race Condition on Arrow Press

When you press the arrow:

```
TIMELINE OF EVENTS:
═══════════════════════════════════════════════════════════════════

T0: User clicks carousel.next()
    └─ Hook sets: displayIndex += 1, shouldTransition = true

T1: Transform begins (CSS animation 300ms)
    └─ Visual carousel starts sliding

T2: Hook timeout fires after 300ms
    └─ Checks if need to wrap/teleport
    └─ May set displayIndex to wrap position
    └─ Sets isTransitioning = false

T3: useEffect fires (carousel.displayIndex changed)
    └─ Tries to update selectedCity based on NEW displayIndex
    └─ But carousel is STILL ANIMATING or just finished

⚠️  PROBLEM: The "teleport" step (T2) may set displayIndex WHILE
    the CSS transition is still active, causing:
    - Visual position ≠ logical position
    - selectedCity ≠ what's visually displayed
    - Apparent "skipping"
```

### Problem 3: Multiple Dependencies Causing Stale Closures

In hook's navigate() function:
```javascript
const navigate = useCallback(
  (direction: 'next' | 'prev') => {
    // ...
    let newIndex = direction === 'next' ? displayIndex + 1 : displayIndex - 1;
    setDisplayIndex(newIndex);
    
    const timeoutId = setTimeout(() => {
      if (newIndex >= CLONE_COUNT + items.length) {
        setShouldTransition(false);
        setDisplayIndex(CLONE_COUNT);  // ← INSTANT JUMP
      }
      // ...
    }, TRANSITION_MS);
  },
  [displayIndex, isTransitioning, items.length, CLONE_COUNT, TRANSITION_MS]
  //↑ dependency includes displayIndex - causes stale closure issues
);
```

**Problem:** The callback depends on `displayIndex`, so it's recreated every time displayIndex changes. This can cause:
- Rapid consecutive clicks to queue up unpredictably
- Timeout handlers capturing stale `newIndex` values
- State updates happening at wrong times

### Problem 4: No Debouncing for Component State Sync

The component's useEffect at line 170 updates selectedCity **every time** carousel.displayIndex changes. If the hook does rapid state updates during wrapping, selectedCity updates multiple times rapidly, breaking visual sync.

### Problem 5: No Initial selectedCity Setup

The carousel hook initializes with `displayIndex = CLONE_COUNT` (9), which is correct for visual position. But there's NO useEffect to set selectedCity on first render!

- Component mounts with selectedCity = null
- Carousel is positioned correctly but selectedCity is unset
- Train dots show nothing selected initially

---

## Why Direct Card Clicks Work

When you click a card directly:
```javascript
const handleCitySelect = (city: CityData) => {
  setSelectedCity(actualCity);  // ← Direct, immediate update
};
```

This **bypasses** the carousel hook entirely and directly updates selectedCity. That's why it works - no race conditions, no state desync.

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 CURRENT BROKEN FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Clicks Arrow                                           │
│        │                                                      │
│        ├─→ carousel.next() called                           │
│        │      │                                              │
│        │      ├─→ displayIndex += 1                         │
│        │      ├─→ CSS transform animate (300ms)             │
│        │      └─→ setTimeout to check wrap (300ms)           │
│        │             └─→ May update displayIndex AGAIN       │
│        │                                                      │
│        └─→ useEffect fires (on displayIndex change)         │
│               └─→ setSelectedCity based on NEW index        │
│                    ⚠️  But animation may not be done!        │
│                                                               │
│  Result: selectedCity updated too early, visual mismatch    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Why the Bug Gets Worse Over Time

1. **First click:** Works, displayIndex goes 9→10, animation happens
2. **Second click:** During animation, teleport logic might fire
3. **Third+ clicks:** Accumulated state desync gets worse
4. **Eventually:** Carousel position totally divorced from selectedCity state

---

## Summary of Issues

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| Initial position wrong | No initial selectedCity setup | Page loads with no city selected |
| Arrow skips cities | Race condition on wrap timeout | Jumps 2+ cities instead of 1 |
| Picture doesn't update | useEffect fires during animation | Visual carousel ≠ displayed picture |
| Gets worse over time | Stale closures + accumulated state desync | Eventually breaks completely |
| Cards work, arrows don't | Cards bypass hook entirely | Proves hook state management is the culprit |

---

## Recommended Solution: Option A - Merged State Management

**Approach:** Move carousel index tracking INTO the component, make selectedCity the single source of truth

**Benefits:**
- Synchronous updates (no race conditions)
- Clear data flow
- Simpler to debug
- No stale closures

**Implementation Pattern:**
```javascript
// Single state for carousel position
const [displayIndex, setDisplayIndex] = useState(CLONE_COUNT);

// Arrow click handler
const handleArrowClick = (direction: 'left' | 'right') => {
  const newIndex = direction === 'right' ? displayIndex + 1 : displayIndex - 1;
  
  // Immediately update visual AND select city (synchronous)
  setDisplayIndex(newIndex);
  const city = extendedCities[newIndex];
  const actualCityId = city.isClone ? city.originalId : city.id;
  setSelectedCity(cities.find(c => c.id === actualCityId));
  
  // After animation, check wrap (visual only)
  setTimeout(() => {
    if (needsWrap) {
      setShouldTransition(false);
      setDisplayIndex(wrapPosition);
    }
  }, 300);
};
```

---

## Verification Checklist for Fix

- [ ] Initial page load shows Random, Tokyo, Osaka, Kyoto in carousel
- [ ] selectedCity is set to Random on initial load
- [ ] Press right arrow: carousel moves 1 card, selectedCity updates to Tokyo
- [ ] Press right arrow: carousel moves 1 card, selectedCity updates to Osaka
- [ ] Press arrows 15+ times: no skipping, consistent 1-card movement
- [ ] Wrap-around works: reach end, press right → goes to Random
- [ ] Selected city's image always matches carousel position
- [ ] Clicking cards still works after arrow navigation
- [ ] Train dots sync perfectly with displayed city
- [ ] No console errors during heavy arrow clicking

---

## Code References

### Hook: useLoopingCarousel.ts (Lines 1-97)
```typescript
// Problem area: navigate() function depends on displayIndex in closure
const navigate = useCallback(
  (direction: 'next' | 'prev') => {
    if (isTransitioning || items.length === 0) return;
    
    setIsTransitioning(true);
    setShouldTransition(true);
    
    let newIndex = direction === 'next' ? displayIndex + 1 : displayIndex - 1;
    setDisplayIndex(newIndex);
    
    // ⚠️ PROBLEM: This timeout fires after animation ends
    // But it may fire WHILE the CSS transition is still active
    const timeoutId = setTimeout(() => {
      if (newIndex >= CLONE_COUNT + items.length) {
        setShouldTransition(false);
        setDisplayIndex(CLONE_COUNT);  // ← Instant jump to wrap position
      } else if (newIndex < CLONE_COUNT) {
        setShouldTransition(false);
        setDisplayIndex(CLONE_COUNT + items.length - 1);
      }
      setIsTransitioning(false);
    }, TRANSITION_MS);  // 300ms
  },
  [displayIndex, isTransitioning, items.length, CLONE_COUNT, TRANSITION_MS]
  // ↑ displayIndex in deps = function recreated every render
  // ↑ = stale closures in timeout handlers
);
```

### Component: CitiesPage.tsx (Lines 162-180)
```javascript
// Line 162: Hook initialized with extendedCities
const carousel = useLoopingCarousel(extendedCities, {
  cloneCount: 9,
  cardWidth: 304,
  transitionMs: 300
});

// Line 170: SYNCING LOGIC - TRIES TO KEEP SYSTEMS IN SYNC
useEffect(() => {
  if (extendedCities.length === 0) return;
  const city = extendedCities[carousel.displayIndex];
  if (city) {
    const actualCityId = city.isClone ? city.originalId! : city.id;
    const actualCity = cities.find(c => c.id === actualCityId);
    if (actualCity) {
      setSelectedCity(actualCity);  // ← Updates displayed picture
    }
  }
}, [carousel.displayIndex, extendedCities, cities]);
// ⚠️ PROBLEM: Fires every time displayIndex changes
// ⚠️ But displayIndex might be wrong during wrap animation
```

### Component: CitiesPage.tsx (Lines 369-380)
```javascript
// Arrow buttons - they call the hook's navigate methods
<button onClick={() => carousel.prev()} ...>
  <ArrowLeft className="w-7 h-7" />
</button>

<button onClick={() => carousel.next()} ...>
  <ArrowLeft className="w-7 h-7 rotate-180" />
</button>
```

### Component: CitiesPage.tsx (Lines 386-391)
```javascript
// Carousel rendering - uses hook's state
<div 
  className="flex gap-6 px-16 py-4"
  style={{
    transform: `translateX(${carousel.translateX}px)`,
    transition: carousel.shouldTransition ? 'transform 300ms ease-out' : 'none',
  }}
>
  {carousel.extendedItems.map((city) => {
    // Rendering logic...
  })}
</div>
```

### Component: CitiesPage.tsx (Lines 136-150)
```javascript
// handleCitySelect - THIS WORKS PERFECTLY
const handleCitySelect = (city: CityData) => {
  const actualCityId = city.isClone ? city.originalId! : city.id;
  
  if (city.isRandom) {
    const realCities = cities.filter(c => !c.isRandom);
    const randomCity = realCities[Math.floor(Math.random() * realCities.length)];
    setSelectedCity(randomCity);  // ← Direct, synchronous update
  } else {
    const actualCity = cities.find(c => c.id === actualCityId);
    if (actualCity) {
      setSelectedCity(actualCity);  // ← No hook involved, no race condition
    }
  }
};
// ✅ Why it works: Synchronous, no async state management
```

---

## Architecture Comparison

### Current Architecture (Broken)
```
Component State (CitiesPage)
├─ selectedCity
├─ hoveredCity
├─ currentPhotoIndex
└─ (no control over carousel position)

        ↓↓↓ DESYNC ↓↓↓

Hook State (useLoopingCarousel)
├─ displayIndex
├─ translateX
├─ logicalIndex
└─ (no communication back to component)

Arrow Button Click
├─ Calls carousel.next()
├─ Updates hook state
├─ Triggers useEffect
├─ useEffect updates selectedCity
⚠️  But displayIndex might have wrapped already!
```

### Proposed Architecture (Fixed - Option A)
```
Component State (CitiesPage) - SINGLE SOURCE OF TRUTH
├─ displayIndex (carousel position)
├─ selectedCity (picture to show)
├─ shouldTransition (animation flag)
├─ isTransitioning (lock flag)
├─ hoveredCity
└─ currentPhotoIndex

Arrow Button Click
├─ Calls handleArrowClick()
├─ Updates displayIndex AND selectedCity SAME TIME
├─ CSS animation starts immediately
├─ After 300ms, check if wrap needed
├─ If wrap: update displayIndex only (visual jump)
✅ Both are always in sync!
```

---

## Extended Cities Array Structure

```
For 18 real cities with cloneCount=9:

extendedCities: [
  // Left clones (9-0): 9 items
  0:  clone(Fukuoka),      // clone-left-17
  1:  clone(Hiroshima),    // clone-left-16
  ...
  8:  clone(Takamatsu),    // clone-left-9

  // Real cities: 18 items  
  9:  Random,              // Starting position ← displayIndex starts here
  10: Tokyo,
  11: Osaka,
  12: Kyoto,
  ...
  26: Fukuoka,

  // Right clones (0-8): 9 items
  27: clone(Random),       // clone-right-0
  28: clone(Tokyo),        // clone-right-1
  ...
  35: clone(Takamatsu),    // clone-right-8
]

displayIndex mapping:
  displayIndex 8  → wrap to 26 (Fukuoka in real array)
  displayIndex 9  → Random (start)
  displayIndex 10 → Tokyo
  ...
  displayIndex 27 → wrap to 9 (Random in real array)
```

---

## Debugging Checklist

When testing the fix:

1. **Open DevTools Console**
   - No errors on initial load
   - No errors on arrow clicks

2. **Check Initial State**
   ```javascript
   // Should see:
   carousel.displayIndex = 9  (points to Random)
   selectedCity.name = "Random"
   selectedCity != null
   ```

3. **Click Arrow Once**
   ```javascript
   // Should see:
   carousel.displayIndex = 10 (points to Tokyo)
   selectedCity.name = "Tokyo"
   // Displayed picture shows Tokyo
   // Train dots highlight Tokyo
   ```

4. **Rapid Arrow Clicks (10+ times)**
   ```javascript
   // Should see:
   // displayIndex increments: 10, 11, 12, 13...
   // selectedCity always matches displayIndex
   // No skipping
   // No frozen state
   ```

5. **Wrap-Around Test**
   ```javascript
   // Reach Fukuoka (displayIndex 26)
   // Press arrow right
   // Should see:
   // Animation to Random
   // displayIndex wraps to 9
   // selectedCity = Random
   // No carousel jank
   ```
