# Mobile Optimization Testing Checklist

## Pre-Testing Setup

### Access the Application
- **Local**: http://localhost:3000 (use Chrome DevTools device emulation)
- **Production**: www.fiquanttaxpro.com (after deployment)

### Testing Tools
1. **Chrome DevTools**
   - F12 → Toggle Device Toolbar (Ctrl+Shift+M)
   - Test different device presets
   - Throttle network to simulate 3G/4G

2. **Real Devices**
   - Use ngrok for local testing on real devices
   - Test on actual iOS and Android devices

3. **Lighthouse**
   - Run audits in Chrome DevTools
   - Focus on mobile performance

## Device-Specific Tests

### iPhone SE (375px width)
- [ ] Mobile nav appears (hamburger menu)
- [ ] Bottom nav visible and functional
- [ ] Desktop header hidden
- [ ] Text readable (not too small)
- [ ] Buttons minimum 44px height
- [ ] Forms full-screen
- [ ] No horizontal scroll

### iPhone 12/13/14 Pro (390px)
- [ ] Safe area respected (notch handling)
- [ ] Bottom nav not obscured by home indicator
- [ ] All content fits width
- [ ] Touch targets adequate

### iPhone 14 Pro Max (428px)
- [ ] Layout scales properly
- [ ] Images not pixelated
- [ ] Text hierarchy maintained

### Samsung Galaxy S21 (360px)
- [ ] Navigation drawer opens smoothly
- [ ] All features accessible
- [ ] Forms use proper Android keyboards
- [ ] Material design elements work

### Google Pixel 6 (412px)
- [ ] Similar to Galaxy S21 tests
- [ ] Chrome mobile features work

### iPad (768px)
- [ ] Desktop navigation shows (not mobile nav)
- [ ] Tablet-optimized layout
- [ ] Touch targets appropriate for tablets

## Feature Testing

### Navigation (Mobile Only)

#### Hamburger Menu
- [ ] **Open/Close**: Tap hamburger icon → drawer slides in
- [ ] **Overlay**: Dark overlay appears behind drawer
- [ ] **Close on overlay**: Tap overlay → drawer closes
- [ ] **Menu items**: All nav items visible and clickable
- [ ] **User info**: Shows user avatar, name, email, tier badge
- [ ] **Admin button**: Appears only for admin users
- [ ] **Logout**: Works correctly

#### Bottom Navigation
- [ ] **4 Icons Visible**: Home, Calculate, History, Profile/Login
- [ ] **Active State**: Current tab highlighted
- [ ] **Icon Size**: Minimum 24px (6w x 6h)
- [ ] **Label Visibility**: Text visible below icons
- [ ] **Touch Response**: Immediate visual feedback
- [ ] **Position**: Fixed at bottom, doesn't scroll

### Authentication

#### Mobile Auth Modal
- [ ] **Full Screen**: Modal covers entire screen
- [ ] **Header**: Back arrow and title visible
- [ ] **Login Form**:
  - [ ] Email input uses email keyboard
  - [ ] Password input shows/hides toggle
  - [ ] No zoom on input focus
  - [ ] Submit button full-width
  - [ ] Switch to register works
- [ ] **Register Form**:
  - [ ] Phone input uses tel keyboard
  - [ ] All fields accessible
  - [ ] Terms checkbox easy to tap
  - [ ] Switch to login works

### Forms & Inputs

#### Input Fields
- [ ] **Height**: Minimum 44px
- [ ] **Font Size**: 16px (prevents iOS zoom)
- [ ] **Keyboards**:
  - [ ] Email → email keyboard (@, .com)
  - [ ] Phone → numeric keypad
  - [ ] Number → numeric keypad
  - [ ] Text → standard keyboard
- [ ] **Autocomplete**: Works on mobile
- [ ] **Paste**: Long-press paste works

#### Tax Calculators
- [ ] **PAYE Calculator**:
  - [ ] All inputs accessible
  - [ ] Number inputs use numeric keyboard
  - [ ] Calculate button easy to tap
  - [ ] Results display properly
  - [ ] PDF download works
- [ ] **CIT Calculator**: Same tests as PAYE
- [ ] **VAT Calculator**: Same tests as PAYE
- [ ] **CGT Calculator**: Same tests as PAYE

### Tables & Data Display

#### History Page
- [ ] **Mobile**: Shows cards instead of table
- [ ] **Card Layout**:
  - [ ] Each calculation in separate card
  - [ ] Key info visible (date, type, amount)
  - [ ] Tap card to view details
  - [ ] Swipe gestures smooth
- [ ] **Desktop**: Shows normal table (unchanged)

#### Admin Dashboard (Admin Users)
- [ ] **User List**: Converts to cards on mobile
- [ ] **Analytics**: Graphs resize properly
- [ ] **Actions**: Buttons accessible

### Ads

#### Non-Logged-In Users
- [ ] 5 banner ads visible on homepage:
  - [ ] After hero section
  - [ ] After features
  - [ ] After pricing
  - [ ] After trust section
  - [ ] Before footer
- [ ] Ads load without breaking layout
- [ ] Ads responsive on different widths

#### Logged-In Free Users
- [ ] Ads visible (same as non-logged-in)

#### Premium Users
- [ ] NO ads visible

### Performance

#### Loading Speed
- [ ] **First Contentful Paint**: < 2s
- [ ] **Time to Interactive**: < 3.5s
- [ ] **No layout shifts**: Content doesn't jump

#### Scrolling
- [ ] Smooth scrolling (60fps)
- [ ] No jank or stuttering
- [ ] Pull-to-refresh works (if implemented)

#### Images
- [ ] Load progressively
- [ ] Sized appropriately for screen
- [ ] No pixelation

## Browser-Specific Tests

### Safari (iOS)
- [ ] All features work
- [ ] No zoom on input focus
- [ ] Safe area insets respected
- [ ] Smooth animations
- [ ] Back swipe gesture works

### Chrome (Android)
- [ ] All features work
- [ ] Proper keyboard types
- [ ] Material design respected
- [ ] Swipe navigation works

### Edge Mobile
- [ ] Basic functionality works
- [ ] No rendering issues

## Orientation Tests

### Portrait Mode
- [ ] All layouts correct
- [ ] Navigation accessible
- [ ] Forms usable

### Landscape Mode
- [ ] Navigation height adjusts
- [ ] Content reflows properly
- [ ] Inputs still accessible
- [ ] Bottom nav still visible

## Network Conditions

### 3G Connection
- [ ] Page loads (may be slow)
- [ ] Critical content prioritized
- [ ] Images lazy load
- [ ] Functionality works

### Offline Mode
- [ ] Graceful degradation
- [ ] Error messages clear
- [ ] Cached content accessible (if implemented)

## Accessibility Tests

### Touch Targets
- [ ] All buttons ≥ 44px x 44px
- [ ] Adequate spacing between targets
- [ ] No accidental taps

### Color Contrast
- [ ] Text readable on backgrounds
- [ ] WCAG AA compliant (4.5:1 for text)
- [ ] Important info not color-only

### Screen Readers
- [ ] VoiceOver (iOS): Nav elements announced
- [ ] TalkBack (Android): All actions accessible
- [ ] ARIA labels present

### Keyboard Navigation
- [ ] Can tab through all elements
- [ ] Focus indicators visible
- [ ] No keyboard traps

## Edge Cases

### Very Small Screens (< 360px)
- [ ] Content doesn't break
- [ ] Still usable
- [ ] No horizontal scroll

### Very Large Screens (> 600px mobile view)
- [ ] Graceful transition to tablet view
- [ ] No awkward breakpoints

### Slow Devices
- [ ] Animations smooth (or disabled)
- [ ] No performance issues
- [ ] Responsive touch feedback

## Common Issues to Check

### Layout Issues
- [ ] No horizontal scroll
- [ ] No overlapping elements
- [ ] No cut-off text
- [ ] No broken grid layouts

### Touch Issues
- [ ] No accidental double-taps
- [ ] No missed taps
- [ ] Touch feedback immediate
- [ ] No ghost clicks

### Form Issues
- [ ] No zoom on focus
- [ ] Keyboard doesn't cover inputs
- [ ] Submit buttons accessible
- [ ] Validation messages visible

## Lighthouse Scores

Run Lighthouse audit in Chrome DevTools (mobile mode):

### Target Scores
- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

### Common Issues
- [ ] Eliminate render-blocking resources
- [ ] Properly size images
- [ ] Use efficient cache policy
- [ ] Minimize main thread work

## Final Checks

### Before Deployment
- [ ] No console errors
- [ ] All features tested on real devices
- [ ] Lighthouse scores meet targets
- [ ] Accessibility audit passed
- [ ] Cross-browser tested

### After Deployment
- [ ] Test on production URL
- [ ] Verify analytics tracking
- [ ] Check mobile user experience
- [ ] Monitor error reports

## Bug Reporting Template

```
Device: [iPhone 12, Samsung S21, etc.]
OS Version: [iOS 17, Android 13, etc.]
Browser: [Safari, Chrome, etc.]
Screen Size: [390px, 412px, etc.]
Issue: [Description]
Steps to Reproduce:
1. 
2. 
3. 
Expected: [What should happen]
Actual: [What actually happens]
Screenshot: [If applicable]
```

---

**Testing Status**: ⏳ Ready for testing
**Estimated Time**: 2-3 hours for comprehensive testing
**Priority**: High - Mobile users represent significant portion of traffic
