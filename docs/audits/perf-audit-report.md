# Performance Optimization Audit Report

## Summary
Analyzed 109 components for animation smoothness, render performance, and GPU acceleration opportunities.

---

## Issue 1: Navbar Scroll Listener Missing `passive` Option

**File:** `src/components/feature/Navbar.tsx`
**Line:** 20

**Impact:** Non-passive scroll listeners block the main thread during scrolling, causing potential jank on mobile devices.

**Current Code:**
```tsx
window.addEventListener('scroll', handleScroll);
```

**Patch:**
```tsx
window.addEventListener('scroll', handleScroll, { passive: true });
```

---

## Issue 2: `transition-all` Causes Unnecessary Property Animations

**Files:** Multiple components
**Count:** 177 instances

**Impact:** `transition-all` animates ALL CSS properties including `box-shadow`, `border`, `color`, etc. This causes excessive repaints and GPU work. Should be scoped to specific properties.

**High-Impact Locations:**
- `ProductCatalog.tsx:213` - Product cards
- `Navbar.tsx:56` - Nav container
- `SearchOverlay.tsx:220` - Category buttons
- `ProfileDropdown.tsx:76` - Dropdown container

**Patch Example (ProductCatalog.tsx:213):**

**Current:**
```tsx
className={`bg-white rounded-2xl overflow-hidden transition-all duration-300...`}
```

**Fixed:**
```tsx
className={`bg-white rounded-2xl overflow-hidden transition-[transform,box-shadow] duration-300...`}
```

---

## Issue 3: Missing `will-change` for Animated Elements

**Files:** All modal/overlay components
**Impact:** Browser can't optimize compositing layers in advance, causing stutter on animation start.

**Patch for SearchOverlay.tsx (line 187):**
```tsx
// Add will-change-transform to the modal container
className="max-w-3xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up will-change-transform"
```

**Patch for ProfileDropdown.tsx (line 76):**
```tsx
className="... animate-slide-up sm:animate-scale-in origin-top-right will-change-transform"
```

---

## Issue 4: `hover:shadow-xl` Without GPU Acceleration

**File:** Multiple card components (63 instances)
**Impact:** Shadow transitions trigger expensive repaints on every frame. Should be paired with transform for GPU compositing.

**Affected Files:**
- `ProductCatalog.tsx` - Product cards
- `IngredientLibrary.tsx` - Ingredient cards
- `routines-list/page.tsx` - Routine cards
- `marketplace/page.tsx` - Product cards

**Patch Pattern:**
Add `transform-gpu` class to elements with shadow transitions:

```tsx
// Before
className="shadow-md hover:shadow-xl transition-shadow"

// After
className="shadow-md hover:shadow-xl transition-shadow transform-gpu"
```

---

## Issue 5: `backdrop-blur` Without Isolation

**Files:** 
- `SearchOverlay.tsx:184`
- `ProductCatalog.tsx:565`
- `preview-of-waitlist-*.tsx`

**Impact:** `backdrop-blur` is computationally expensive. Without proper isolation, it can affect the entire render tree.

**Patch for SearchOverlay.tsx (line 184):**
```tsx
// Add isolate to create a new stacking context
<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in isolate" onClick={onClose}>
```

---

## Issue 6: Infinite `animate-bounce` Runs Continuously

**Files:**
- `HeroSection.tsx:26` - Scroll indicator
- `ai-chat/page.tsx:611-613` - Typing dots
- `booking-success/page.tsx:24` - Success icon

**Impact:** Infinite animations consume CPU/GPU even when not visible. Should pause when offscreen.

**Patch for HeroSection.tsx:**
Use Intersection Observer or CSS `:not(:focus-within)` to pause:

```tsx
// Replace infinite bounce with a more performant pulse
<div className="flex flex-col items-center space-y-2 animate-pulse">
```

Or better, use CSS to stop when scrolled:
```css
/* Add to index.css */
@media (prefers-reduced-motion: reduce) {
  .animate-bounce {
    animation: none;
  }
}
```

---

## Issue 7: Product Card `renderStars` Function Creates New Elements Each Render

**File:** `ProductCatalog.tsx:157-173`

**Impact:** Creates 5 React elements per product on every render. With 20+ products, this creates 100+ elements repeatedly.

**Patch - Memoize the renderStars function:**
```tsx
import { useCallback } from 'react';

// At component level
const renderStars = useCallback((rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  // ... rest of function
  return stars;
}, []);
```

---

## Issue 8: `renderProductCard` Inline Function Prevents Memoization

**File:** `ProductCatalog.tsx:204-320`

**Impact:** New function reference created every render, preventing React.memo optimizations on child components.

**Patch - Extract to memoized component:**
```tsx
// Create separate file or move outside component
const ProductCard = React.memo(({ 
  product, 
  isRecommended, 
  isSelected, 
  onNavigate, 
  onAddToCompare 
}: ProductCardProps) => {
  // ... card JSX
});
```

---

## Issue 9: Chat Messages Re-animate on Every State Change

**File:** `ai-chat/page.tsx:570-601`

**Impact:** Animation delay uses index which re-calculates on every render. All messages re-animate when new message is added.

**Patch - Track animated messages:**
```tsx
// Add state to track which messages have been animated
const [animatedMessageIds, setAnimatedMessageIds] = useState<Set<number>>(new Set());

// In useEffect when messages change
useEffect(() => {
  const newIds = new Set(animatedMessageIds);
  messages.forEach(m => newIds.add(m.id));
  setAnimatedMessageIds(newIds);
}, [messages]);

// In render
<div
  key={message.id}
  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${
    !animatedMessageIds.has(message.id) ? 'animate-slide-up' : ''
  }`}
>
```

---

## Issue 10: Large Static Arrays Recreated Every Render

**Files:**
- `Navbar.tsx:41-49` - navLinks array
- `ProductCatalog.tsx:75-93` - categories and skinTypes arrays
- `IngredientLibrary.tsx:21-28` - categories array
- `SearchOverlay.tsx:28-123` - allResults array

**Impact:** Creates new array references every render, causing unnecessary child re-renders.

**Patch - Move outside component or use useMemo:**

```tsx
// Move OUTSIDE the component function
const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Discover', path: '/discover' },
  // ...
];

const Navbar = () => {
  // navLinks is now stable reference
};
```

---

## Issue 11: Missing `loading="lazy"` on Images

**Files:** Multiple
- Search results images
- Product card images
- Profile avatars

**Impact:** All images load immediately, blocking initial render.

**Patch for ProductCatalog.tsx (line 248-251):**
```tsx
<img
  src={product.image}
  alt={product.name}
  loading="lazy"
  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
/>
```

---

## Issue 12: Image Hover Scale Transition Should Use GPU

**File:** `ProductCatalog.tsx:251`

**Impact:** `scale` transform without `transform-gpu` may not use GPU acceleration on all browsers.

**Patch:**
```tsx
className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300 transform-gpu"
```

---

## Summary of Critical Patches

| Priority | Issue | Impact | Files Affected |
|----------|-------|--------|----------------|
| HIGH | Add `passive: true` to scroll listener | Scroll jank | Navbar.tsx |
| HIGH | Scope `transition-all` to specific props | Excessive repaints | 177 locations |
| HIGH | Add `will-change-transform` to modals | Animation stutter | 4 overlay components |
| MEDIUM | Add `transform-gpu` to shadow transitions | Repaint overhead | 63 card components |
| MEDIUM | Add `loading="lazy"` to images | Initial load time | All image components |
| MEDIUM | Move static arrays outside components | Unnecessary re-renders | 10+ components |
| LOW | Add `isolate` to backdrop-blur elements | Render tree impact | 6 locations |
| LOW | Memoize renderStars function | Element creation | ProductCatalog.tsx |

---

## Tailwind Config Addition

Add these utilities to `tailwind.config.ts` for easier GPU acceleration:

```ts
// In theme.extend
extend: {
  // ... existing config
},
// Add as plugin or utility
```

Or add to `src/index.css`:

```css
/* GPU-accelerated transitions */
.transform-gpu {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Reduce motion preference */
@media (prefers-reduced-motion: reduce) {
  .animate-bounce,
  .animate-pulse,
  .animate-spin {
    animation: none;
  }
  
  .transition-all,
  .transition-transform,
  .transition-shadow {
    transition: none;
  }
}
```