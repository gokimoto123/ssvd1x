# SSVD1x Optimization Plan - September 25, 2025

## **Performance Issues & UI Fixes Based on Complete Analysis**

### **PRIMARY PERFORMANCE ISSUE: 1-Alpha Analysis Overly Strict Parameters**
**Root Cause**: 1-Alpha uses unnecessarily strict convergence vs all other analysis modes
- **1-Alpha**: maxIter=5000, tolerance=0.0001 (lines 5219-5220)
- **N-Alpha original data**: maxIter=1000, tolerance=0.001 (lines 5314-5316)
- **eFDR original data**: Same as N-Alpha (1000, 0.001)
- **eFDR permutations**: Adaptive 50-400 iterations (optimized for speed)

**Impact**: 1-Alpha takes 5x longer than necessary for large matrices like 19K×370
**Solution**: Harmonize 1-Alpha parameters with N-Alpha for consistency

### **SECONDARY ISSUE: Chart Selection Re-runs SSVD**
**Root Cause**: Chart clicks call `onRunSingleAlpha()` instead of using pre-computed results
- **Location**: Lines 3123-3124, 3147-3148, 3168-3169
- **Impact**: Additional 10+ second waits after N-Alpha analysis completes
- **Solution**: Use pre-computed `results.results[index]` directly

## **Implementation Plan**

### **Phase 1: Fix 1-Alpha Analysis Performance (Critical)**
**Recommended Approach**: Match N-Alpha parameters for consistency
- **Change 1-Alpha to**: maxIter=1000, tolerance=0.001
- **Rationale**:
  - Same precision as N-Alpha original data analysis
  - Consistent user experience across analysis modes
  - Still much more precise than eFDR permutations (which use 50-400 iterations)
- **Expected Result**: 3-5x faster 1-Alpha analysis for large matrices

### **Phase 2: Fix Chart Selection Performance**
1. **Modify chart `onRowSelect` handlers** to use pre-computed `results.results[index]`
2. **Remove** unnecessary `onRunSingleAlpha` calls from chart clicks
3. **Add** instant result formatting and display
4. **Expected Result**: Instant chart selection (0.1s vs 10+s)

### **Phase 3: Fix Missing Reset Buttons & Styling Inconsistencies**

#### **Missing Reset Buttons**:
1. **Matrix Review Page**: Add `onResetToOriginal={resetData}` prop
2. **Choose Analysis Type Page**: Add Reset button alongside Back button
3. **eFDR Configuration**: Ensure Reset button appears consistently

#### **Reset Button Styling**:
- **Standardize all Reset buttons**: `bg-red-600 text-white hover:bg-red-700`
- **Fix inconsistent styling**: Result pages currently use gray border instead of red
- **Update components**: `AlphaSequenceResultsDisplay` and `SSVDResultsDisplay`

### **Phase 4: Add Missing Progress Indicators**
1. **Chart selection**: Add loading spinner for large result processing
2. **1-Alpha analysis**: Verify progress indicator works properly
3. **Visual feedback**: Immediate point highlighting during selection

## **Why Not Apply eFDR Adaptive Strategy to N-Alpha?**

**eFDR adaptive parameters are designed for permutation optimization**:
- **eFDR**: 875 permutation runs (35 alphas × 25 perms) need speed optimization
- **N-Alpha**: Only 35 original data runs - minimal benefit from adaptive approach
- **Original data**: Still needs reasonable precision for meaningful results
- **Permutations**: Can use loose precision (just need null distribution approximation)

**Conclusion**: Adaptive strategy wouldn't provide significant speedup for N-Alpha's 35 runs

## **Expected Performance Improvements**

### **1-Alpha Analysis**:
- **Current**: 10+ seconds (5000 iter, 0.0001 tol)
- **After fix**: 2-3 seconds (1000 iter, 0.001 tol)
- **Improvement**: 3-5x faster

### **Chart Selection**:
- **Current**: 10+ seconds (re-runs SSVD)
- **After fix**: Instant (uses pre-computed results)
- **Improvement**: 100x faster

### **User Experience**:
- **Consistent**: All analysis modes use similar performance
- **Complete**: Reset buttons on every page with proper styling
- **Clear**: Progress feedback for all operations

## **Implementation Priority**
1. **Critical**: Fix 1-Alpha convergence parameters (biggest impact)
2. **High**: Fix chart selection to use pre-computed results
3. **Medium**: Add missing Reset buttons and fix styling
4. **Low**: Add progress indicators and UI polish

## **Recommendation**
Start by changing 1-Alpha analysis to use maxIter=1000, tolerance=0.001 to match N-Alpha parameters. This single change will provide immediate 3-5x performance improvement for large matrices.

## **Key Code Locations**
- **1-Alpha parameters**: lines 5219-5220 in `current_optimized.html`
- **N-Alpha parameters**: lines 5314-5316 in `current_optimized.html`
- **Chart selection handlers**: lines 3123-3124, 3147-3148, 3168-3169
- **Missing Reset buttons**: Matrix Review (5481), Choose Analysis Type (3219)
- **Reset styling issues**: `AlphaSequenceResultsDisplay` and `SSVDResultsDisplay` components

## **Research Context**
- **Matrix tested**: 19,000 × 370 gene expression data
- **Problem identified**: User experienced long delays when clicking detection gradient chart
- **Root cause**: Chart selection re-runs entire SSVD algorithm instead of using pre-computed results
- **Secondary finding**: 1-Alpha analysis uses overly strict convergence parameters