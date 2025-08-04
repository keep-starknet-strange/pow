# POW! Task Plan

This file tracks the task execution plan for TODO.md items. Reference this file after context clears.

## Phase 1: Critical Fixes & Performance (High Priority)
1. **Fix audio not playing on physical phones** - Bug affecting UX on real devices
2. **Convert ScrollViews to FlatLists** - Performance optimization for achievements & store pages
3. **Implement shallow state management in Zustand** - Focus on l2 nested state to reduce re-renders

## Phase 2: Code Quality & Core Features (Medium Priority)
4. **Refactor 'Can unlock L2' logic** - Centralize to single canUnlockL2 function in useL2Store
5. **Environment variables for FOC Engine contracts** - Better config management
6. **Add block breaking animation** - Visual feedback before blocks slide left
7. **Add automation animations** - For miner, prover, da, sequencer upgrades
8. **Add fade transitions for tabs** - Transactions/dApps switching animations
9. **Show red/green hash animations** - Mining success/failure feedback
10. **Add tutorial after first block** - Onboarding explaining balance and fees
11. **Add floating pickaxe animation** - Visual for auto-miner levels

## Phase 3: Polish & Nice-to-haves (Low Priority)
12. **Conditional Claim Reward button** - Only show when prestige >= 1
13. **Add Terms of Use page** - Navigate from settings, use mock data file
14. **Add haptics/sound to tabs** - Feedback for 3 Tab/Switch events
15. **Add shadows to components** - Pixel art style considerations
16. **Add Bitcoin Maxi easter eggs** - Fun additions

## Current Status
- Task #1: PAUSED - Audio issue complex, needs deeper investigation
- Task #2: COMPLETED - ScrollViews successfully converted to FlatLists with performance optimizations
- **Bug Fixes**: COMPLETED - Fixed FlatList virtualization issues with Canvas components and store refresh

## Implementation Notes
### Task #1: Audio Fix (PAUSED)
- **Issue**: Audio reaches `player.play()` successfully but no sound on physical iOS devices
- **Debugging Done**: Added comprehensive logging, audio session configuration, activation
- **Status**: All debugging shows audio system working correctly - likely iOS-specific hardware routing issue
- **Next Steps When Resumed**: 
  - Try alternative audio libraries (react-native-sound, expo-av)
  - Test with different audio formats
  - Add device-specific audio routing detection
  - Consider iOS audio session category changes

### Task #2: ScrollView to FlatList Conversion (COMPLETED)
- **Target**: Convert achievements and store page ScrollViews to FlatLists ✅
- **Benefits**: Better performance with large item lists, memory optimization ✅
- **Files Modified**: 
  - `AchievementsPage.tsx` - Converted main vertical ScrollView + nested horizontal ScrollViews to FlatLists
  - `StorePage.tsx` - Converted main vertical ScrollView to FlatList with unified data structure
  - Added React.memo to `TransactionUpgradeView`, `UpgradeView`, `AutomationView` components
- **Performance Optimizations Added**:
  - `useMemo` for data preparation to prevent unnecessary recalculations
  - `useCallback` for render functions to prevent unnecessary re-renders
  - FlatList performance props: `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews`
  - React.memo for frequently rendered store components
- **Results**: Significant performance improvement for scrolling through large lists of achievements and store items

### Bug Fixes: FlatList Issues (COMPLETED)
**Bug #1: IconWithLock images disappearing after FlatList virtualization**
- **Root Cause**: Canvas components getting destroyed/recreated by FlatList virtualization but not re-initializing properly
- **Fix Applied**:
  - Disabled aggressive virtualization (`removeClippedSubviews={false}`)
  - Added unique keys to all Canvas components based on content
  - Enhanced memoization to prevent unnecessary re-renders
- **Files Modified**: `IconWithLock.tsx`, `StorePage.tsx`, `AchievementsPage.tsx`

**Bug #2: Store not updating available items after purchases**
- **Root Cause**: Missing dependencies in `storeData` useMemo - unlock functions depend on store state not included in dependency array
- **Fix Applied**: Added missing store state dependencies (`transactionFeeLevels`, `upgrades`, `automations`, etc.)
- **Result**: Store immediately shows newly unlocked items after purchases without requiring tab navigation

**Performance Impact**: Minimal memory increase due to less aggressive virtualization, but reliable Canvas rendering maintained
