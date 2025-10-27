# Store Card Sizing & Panel Alignment - Prompt for Next AI Session

## Current State (Stable - Commit 0712d60)
✅ **Structural Fix Complete:** Right panel is now INSIDE the hero flex container
✅ **Layout Working:** Both preview and store panels display correctly
✅ **Issue:** Store cards are too small, right panel needs to be bigger

---

## Goal
Make store cards BIGGER to match the Kirby Air Ride aesthetic reference, and ensure both panels align properly at the bottom with balanced proportions.

### Reference: Kirby Air Ride Map Layout
- Large prominent map/preview area (left)
- Side panel with city names/info displayed prominently (right)
- Cards/tiles in right panel are **substantially sized** - not cramped
- Clear visual hierarchy with good breathing room
- Both areas have similar vertical heights
- Visual balance: preview is the hero, but side panel is clearly visible and usable

---

## Current Structure (DO NOT CHANGE)
```
motion.div (min-h-screen flex flex-col)
  ├─ Masthead (minHeight: 140px)
  └─ Hero section (flex flex-1)  ← Line 760
      ├─ Left Panel (flex-[78]) ← Takes 78% width
      │   └─ Glow Container (aspect-[16/10])
      │       └─ Preview Image
      │
      └─ Right Panel (flex-[22]) ← Takes 22% width, h-full
          ├─ FEATURED header
          └─ StorePreviews grid (2x3)
              └─ 6 store cards (aspect-[1/1], magenta borders)
```

---

## Store Cards Current Specs
- **Grid:** 2 columns × 3 rows
- **Aspect ratio:** `aspect-[1/1]` (perfect squares)
- **Gap:** `6px`
- **Border:** `3px solid ${cityColor}`
- **Size:** Currently cramped, need ~30-40% larger

---

## What Caused Previous Mistakes (CRITICAL - AVOID!)

### Mistake #1: `justify-center` on Hero Container
**What happened:** Changed hero container from `justify-start` to `justify-center`, then back
**Why it broke:** Centering caused panels to compress inward instead of expand outward
**What we learned:** When using flex proportions (flex-[78] and flex-[22]), NEVER use `justify-center` - use `justify-start` to let them expand
**Safe approach:** Keep hero as `flex flex-1 overflow-visible justify-center items-start` EXACTLY as is

### Mistake #2: Changing Flex Proportions Without Constraints
**What happened:** Changed from flex-[78]/flex-[22] to flex-[75]/flex-[25] without constraints
**Why it broke:** Left panel's content (aspect ratio) would force shrinking if not properly constrained
**What we learned:** Flex proportions alone don't work - need `min-w-0` on expanding items OR explicit max-height on constrained items
**Safe approach:** Leave current flex proportions (78/22), they're balanced

### Mistake #3: Removing Aspect Ratio from Preview
**What happened:** Replaced `aspect-[16/10]` with `max-h-[500px]`
**Why it broke:** Preview became invisible/broken, aspect ratio is the KEY constraint
**What we learned:** The aspect ratio is NOT the enemy - it ensures preview maintains proper proportions
**Safe approach:** Keep `aspect-[16/10]` on glow container, this is correct and necessary

### Mistake #4: Not Understanding Height Hierarchy
**What happened:** Didn't realize hero section's height is determined by left panel's content (via aspect ratio)
**Why it broke:** Tried to "fix" vertical space by changing aspect ratio, broke preview
**What we learned:** 
- Hero section height = left panel's natural height (aspect ratio driven)
- Right panel automatically gets same height via `h-full`
- Increasing store card size must happen WITHIN the right panel's available space, not by changing hero height
**Safe approach:** Work WITHIN the right panel constraints, don't try to expand hero section height

---

## Safe Sizing Strategy (ONLY Change These)

### Option 1: Increase Store Card Grid Gap (Simplest)
**What to change:** Line 200 in StorePreviews component
```
Current: gap: '6px'
Try: gap: '10px' or '12px'
```
**Why it's safe:** Only affects card spacing, doesn't change layout structure
**Impact:** Cards will appear slightly larger due to larger gaps between them

### Option 2: Reduce Right Panel Padding (Medium Complexity)
**What to change:** Line 935 in CitiesPage (right panel)
```
Current: px-3 py-1
Try: px-2 py-0 (tighter) or px-1 (very tight)
```
**Why it's safe:** Only affects internal padding, doesn't change flex proportions
**Impact:** Cards get more space to expand within right panel

### Option 3: Increase Right Panel Width (CAREFUL - Most Complex)
**What to change:** Line 935 in CitiesPage
```
Current: flex-[22] (22% of 100)
Try: flex-[24] or flex-[25] (carefully test)
```
**Why it's risky:** Must pair with adjusting left panel to maintain proportions
**If doing this:** Also change left panel (line 766) from `flex-[78]` to `flex-[76]` or `flex-[75]`
**Critical:** Use `min-w-0` on left panel to prevent it from squeezing
**Test after each change:** Must verify preview doesn't disappear

### Option 4: Adjust Store Card Aspect Ratio (AVOID if Possible)
**What to change:** Line 54 in StorePreviewCard
```
Current: aspect-[1/1]
Try: aspect-[4/3] (wider cards)
```
**Why it's risky:** Changes card proportions, must test hover effects and clip-path
**Only do this if:** Card images look distorted or stretched

---

## Testing Checklist (MUST Do After Changes)

After making ANY sizing change:
1. ✅ Preview image is visible and shows correctly
2. ✅ FEATURED header shows at top of right panel
3. ✅ All 6 store cards visible in 2×3 grid
4. ✅ Store cards not clipped at bottom
5. ✅ Bottom of preview panel aligns with bottom of right panel
6. ✅ Hover effects work on store cards
7. ✅ Landing mode (mystery city) still works
8. ✅ No scrollbars appear (one-page layout)

---

## Current Stable Code Sections (DO NOT TOUCH)

**Hero Container (Line 760):**
```jsx
<div className="flex flex-1 overflow-visible justify-center items-start"
  style={{
    clipPath: 'polygon(0 0, 100% 3%, 100% 97%, 0 100%)',
  }}
>
```

**Left Panel (Line 766):**
```jsx
<div className={`${isLandingMode ? 'w-full' : 'flex-[78]'} flex items-center justify-center p-4 pb-20 overflow-visible`}>
```

**Glow Container (Line 770):**
```jsx
<div className={`relative w-full aspect-[16/10] ${isLandingMode ? 'max-w-7xl' : ''}`}
```

**Right Panel (Line 935):**
```jsx
<div className={`flex-[22] flex flex-col items-start justify-start px-3 py-1 relative transition-all duration-300 h-full ${isLandingMode ? '' : 'flex-[22]'}`}
```

**StorePreviews Grid (Line 197-202):**
```jsx
<div className="grid grid-cols-2 w-full flex-1 overflow-hidden"
  style={{
    gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
    gap: '6px',
    alignContent: 'stretch',
  }}
>
```

---

## Recommended Next Steps

### Phase 1: Conservative Increase (Safest)
1. Increase grid gap from `6px` → `10px` (or `12px`)
2. Test and verify everything works
3. Reduce right panel padding: `px-3` → `px-2`
4. Test again

### Phase 2: If More Size Needed
1. Adjust card aspect ratio if images look wrong
2. Consider slight width increase (flex-[22] → flex-[23] or flex-[24])
3. Test carefully after each change

### Phase 3: Final Tweaks
1. Fine-tune gaps and padding
2. Verify alignment at bottom
3. Test on different city selections
4. Test landing mode

---

## Git Commit Strategy
- Commit AFTER each successful test
- Use descriptive messages: `📊 SIZING: Increase gap to 10px - Store cards appear larger`
- If breaks: `git revert [commit-hash]` immediately
- Never make multiple sizing changes in one commit

---

## Commands Reference
```bash
# View git history
git log --oneline -10

# Revert to last good state
git checkout [commit-hash] -- src/pages/CitiesPage.tsx

# View current changes
git diff src/pages/CitiesPage.tsx

# Restart dev server (clean)
pkill -9 -f "npm run dev" 2>/dev/null; sleep 2 && npm run dev
```

---

## Final Notes
- The structural fix (right panel inside flex container) is SOLID and WORKING
- Store cards ARE visible and functional at current size
- We're now ONLY adjusting sizing, not architecture
- Small incremental changes are safer than large rewrites
- Always test after each single change
- When in doubt, revert and try a different approach

Good luck! This structure is now stable and ready for conservative sizing improvements.
