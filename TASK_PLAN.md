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
- Task #3: COMPLETED - Implemented shallow state management in Zustand across all critical stores
- Task #4: COMPLETED - Refactored 'Can unlock L2' logic to centralized canUnlockL2 function
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

### Task #3: Shallow State Management Implementation (COMPLETED)
- **Target**: Implement shallow state management in Zustand to reduce re-renders ✅
- **Approach**: 4-phase systematic implementation across all critical stores
- **Files Modified**: 15+ files across 4 major stores

**Phase 1: L2Store Critical Path (COMPLETED)**
- `useProver.ts` - Only subscribes to `l2?.prover.isBuilt` and `l2?.prover.maxSize`
- `useDAConfirmer.ts` - Only subscribes to `l2?.da.isBuilt` and `l2?.da.maxSize`
- **Impact**: Eliminated cascading re-renders between DA/Prover operations

**Phase 2: TransactionsStore Optimization (COMPLETED)**
- `StorePage.tsx` - Shallow comparison for 8 transaction properties
- `TransactionUpgradeView.tsx` - Shallow comparison for 8 upgrade functions
- `TxButton.tsx` - Shallow comparison for 7 transaction functions
- **Impact**: Massive improvement in store page scrolling and transaction UI responsiveness

**Phase 3: GameStore Working Blocks (COMPLETED)**
- `useMiner.ts` - Only subscribes to `workingBlocks[0]` (mining chain)
- `useSequencer.ts` - Only subscribes to `workingBlocks[1]` (sequencing chain)
- `WorkingBlockDetails.tsx` - Only subscribes to `workingBlocks[props.chainId]`
- **Impact**: Cross-chain isolation - changes in one chain don't affect others

**Phase 4: UpgradesStore & Final Polish (COMPLETED)**
- `useUpgradesStore.ts` - Added shallow to `useUpgrades()` convenience hook
- `L2Unlock.tsx` - Index-specific subscription to `workingBlocks[0]`
- `DappsUnlock.tsx` - ChainId-specific subscription to `workingBlocks[props.chainId]`
- **Impact**: All 11 files using `useUpgrades()` automatically benefit from shallow comparisons

**Overall Performance Results**:
- Systematic elimination of unnecessary re-renders across the entire app
- Smoother gameplay during high-frequency operations
- Better frame rates and reduced computational overhead
- Improved scalability as the game grows in complexity

### Task #4: Refactor 'Can unlock L2' Logic (COMPLETED)
- **Target**: Centralize all L2 unlock logic to a single canUnlockL2 function ✅
- **Implementation**: 
  - Updated `canUnlockL2()` in `useL2Store.ts` with proper logic checking:
    - L2 not already unlocked
    - All L1 transactions unlocked (level !== -1)
    - All L1 dapps unlocked (level !== -1)
  - Simplified `L2Unlock.tsx` component to use centralized function
  - Updated `checkCanPrestige()` to use `isL2Unlocked` for consistency
- **Files Modified**:
  - `useL2Store.ts` - Implemented complete canUnlockL2 logic with TransactionsStore integration
  - `L2Unlock.tsx` - Removed duplicated logic, now uses centralized function
  - `useUpgradesStore.ts` - Updated checkCanPrestige to use isL2Unlocked flag
- **Benefits**: 
  - Single source of truth for L2 unlock conditions
  - Easier to maintain and update unlock requirements
  - Reduced code duplication and potential for bugs
  - Consistent behavior across all components
