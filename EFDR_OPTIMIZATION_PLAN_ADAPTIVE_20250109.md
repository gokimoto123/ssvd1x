# eFDR Optimization Plan: Data-Driven Adaptive Parameters
**Date:** January 9, 2025  
**Goal:** Achieve sub-2-minute eFDR analysis for 25 alphas × 15 permutations

## Executive Summary
Current implementation uses arbitrary thresholds (0.1, 0.01) for adaptive parameters. This plan implements data-driven optimization using alpha/alphaMax ratios, with inverted logic for permutation testing to achieve 2-3x additional speedup.

## Key Insights from Analysis

### 1. Problem with Current Implementation
```javascript
// Current: Arbitrary thresholds, backwards for permutations
const adaptiveMaxIter = alpha > 0.1 ? 500 : alpha > 0.01 ? 750 : 1000;
const adaptiveTolerance = alpha > 0.1 ? 0.01 : alpha > 0.01 ? 0.001 : 0.0001;
```

**Issues:**
- Thresholds (0.1, 0.01) are arbitrary, not based on data
- Small alphas get MORE iterations (1000) despite being slowest
- Doesn't scale with actual alphaMax of the matrix
- Same logic for original and permuted matrices

### 2. Mathematical Basis for Optimization
- **alphaMax** = 0.75 × max(|u|) × s (point where solution becomes all zeros)
- Convergence speed varies exponentially with alpha/alphaMax ratio
- Small alphas (< 0.1 × alphaMax): Slow convergence, many iterations needed
- Large alphas (> 0.5 × alphaMax): Fast convergence, few iterations needed

### 3. Key Insight for Permutations
**For permutation testing, we're estimating a null distribution, not finding exact solutions**
- Can accept approximate solutions for permutations
- Should INVERT iteration logic: give small alphas FEWER iterations
- Accuracy matters most at decision boundaries (eFDR ≈ 0.05)

## Implementation Plan

### Phase 1: A/B Testing Infrastructure

#### 1.1 Create Testing Versions
```bash
# Create optimized version for comparison
cp current.html current_optimized.html
```

#### 1.2 Implement Fixed Permutation Patterns
Both versions must use identical permutations for valid comparison.

**Add to both current.html and current_optimized.html:**
```javascript
// Add near line 580 (before runFDRAnalysis)
function generateFixedPermutations(Nperm, matrixRows) {
    const patterns = [];
    for (let i = 0; i < Nperm; i++) {
        const indices = Array.from({length: matrixRows}, (_, i) => i);
        // Fisher-Yates shuffle with fixed sequence
        for (let j = indices.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [indices[j], indices[k]] = [indices[k], indices[j]];
        }
        patterns.push(indices);
    }
    return patterns;
}

// Store/retrieve patterns
function savePermutationPatterns(patterns) {
    localStorage.setItem('ssvd1x_fixed_permutations', JSON.stringify(patterns));
}

function loadPermutationPatterns() {
    const stored = localStorage.getItem('ssvd1x_fixed_permutations');
    return stored ? JSON.parse(stored) : null;
}
```

**Modify permuteMatrixRows function (around line 230):**
```javascript
// Add parameter for using fixed pattern
const permuteMatrixRows = function(matrix, fixedPattern = null) {
    if (fixedPattern) {
        // Use provided permutation pattern
        return fixedPattern.map(idx => matrix[idx]);
    }
    // Original random permutation code...
}
```

### Phase 2: Implement Optimizations (current_optimized.html only)

#### 2.1 Pass alphaMax to runFDRAnalysis
Ensure alphaMax is available for ratio calculations:
```javascript
// Line ~586: Add alphaMax to function parameters if not present
async function runFDRAnalysis({ matrix, alpha0, alphaMax, Nalpha, Nperm, pi0, ... }) {
```

#### 2.2 Replace Adaptive Logic for Permutations
**Location:** Lines 683-685 in permutation loop

**Replace:**
```javascript
// OLD: Arbitrary thresholds
const adaptiveMaxIter = alpha > 0.1 ? 500 : alpha > 0.01 ? 750 : 1000;
const adaptiveTolerance = alpha > 0.1 ? 0.01 : alpha > 0.01 ? 0.001 : 0.0001;
```

**With:**
```javascript
// NEW: Data-driven, inverted for permutations
const alphaRatio = alpha / alphaMax;

// For PERMUTATIONS: Prioritize speed, invert iteration logic
const adaptiveMaxIter = 
    alphaRatio < 0.05 ? 400 :      // Very small: cap iterations (was 1000!)
    alphaRatio < 0.2 ? 350 :        // Small: less time
    alphaRatio < 0.5 ? 250 :        // Medium: faster
    alphaRatio < 0.75 ? 150 :       // Large: very fast
    50;                             // Near alphaMax: minimal

const adaptiveTolerance = 
    alphaRatio < 0.2 ? 0.01 :       // Loose for small alphas (was 0.0001!)
    alphaRatio < 0.5 ? 0.005 :      
    0.001;                          // Tighter only for large alphas
```

#### 2.3 Update Original Matrix Analysis (Non-Permutation)
**Location:** Around line 622-628 for original SSVD

**Add adaptive parameters based on alphaMax:**
```javascript
// For ORIGINAL matrix: Give small alphas the iterations they need
const alphaRatio = alpha / alphaMax;
const adaptiveMaxIterOrig = 
    alphaRatio < 0.05 ? 2000 :     // Very small: many iterations
    alphaRatio < 0.2 ? 1000 :       // Small: standard
    alphaRatio < 0.5 ? 500 :        // Medium: fewer
    alphaRatio < 0.75 ? 200 :       // Large: fast
    100;                            // Near alphaMax: very fast

const adaptiveToleranceOrig = 
    alphaRatio < 0.2 ? 0.0001 :     // Tight for small alphas
    alphaRatio < 0.5 ? 0.001 :      
    0.01;                           // Looser for large alphas

const originalResult = await SSVDR1Algorithm({ 
    matrix, 
    alpha,
    maxIter: adaptiveMaxIterOrig,  // Use adaptive
    tolerance: adaptiveToleranceOrig,  // Use adaptive
    initialSVD
});
```

### Phase 3: Testing Protocol

#### 3.1 Generate Fixed Permutations
Run in browser console:
```javascript
// Generate and save patterns for both versions to use
const patterns = generateFixedPermutations(15, 1000);  // 15 perms, 1000 rows
savePermutationPatterns(patterns);
console.log("Saved permutation patterns for testing");
```

#### 3.2 Test Version A (current.html)
1. Open http://localhost:8000/current.html
2. Load or generate test matrix
3. Run eFDR analysis: 25 alphas, 15 permutations
4. Note timing from console
5. Export results → "baseline_efdr_results.csv"

#### 3.3 Test Version B (current_optimized.html)
1. Open http://localhost:8000/current_optimized.html
2. Load same test matrix
3. Run eFDR analysis: same parameters
4. Note timing from console
5. Export results → "optimized_efdr_results.csv"

#### 3.4 Compare Results
```javascript
// Quick comparison in console
function compareCSVResults(baselineCSV, optimizedCSV) {
    // Parse both CSV files
    // Calculate max deviation
    // Check key eFDR thresholds
    // Report timing difference
}
```

### Phase 4: Validation Criteria

#### Success Metrics
- ✅ **Speed**: > 50% reduction in runtime
- ✅ **Accuracy**: Max eFDR deviation < 5%
- ✅ **Correlation**: > 0.95 between eFDR curves
- ✅ **Decision points**: Alpha at eFDR=0.05 within 10%
- ✅ **Monotonicity**: eFDR still increases with alpha

#### Risk Mitigation
- If deviation > 5%: Adjust iteration reduction less aggressively
- If correlation < 0.95: Check for bugs in permutation logic
- If not monotonic: Increase minimum iterations for small alphas

## Expected Outcomes

### Performance Improvements
| Metric | Current | Optimized | Improvement |
|--------|---------|-----------|-------------|
| 25α × 15perm | 3-5 min | 1-2 min | 60-70% faster |
| Small α iterations | 1000 | 400 | 60% reduction |
| Large α iterations | 500 | 50-150 | 70-90% reduction |

### Accuracy Preservation
- eFDR curves should overlap within 5%
- Critical decision points preserved
- Statistical validity maintained

## Implementation Checklist

- [ ] Create current_optimized.html copy
- [ ] Add fixed permutation functions to both versions
- [ ] Implement alphaMax-based ratios in optimized version
- [ ] Test with fixed permutations
- [ ] Compare eFDR results
- [ ] Validate accuracy metrics
- [ ] If successful, update current.html

## Notes for Next Session
- Start with creating the optimized copy
- Focus on targeted edits to preserve context window
- Run tests promptly to validate approach
- Be prepared to adjust parameters if deviation too high