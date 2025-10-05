# Session Continuation Prompt - January 9, 2025

## Context for Next Session
Please continue optimization of the SSVD1x application's eFDR analysis performance. Read the following files for context:
1. `CLAUDE.md` - Project guidelines
2. `EFDR_OPTIMIZATION_PLAN_ADAPTIVE_20250109.md` - Detailed optimization plan
3. `current.html` - Current working file (Version A - baseline)

## Current Status
- **Completed**: Phase 1 batching of permutations (5-10x speedup achieved)
- **Partially completed**: Basic adaptive parameters (but using arbitrary thresholds)
- **Ready to implement**: Data-driven adaptive optimization using alphaMax ratios

## Key Discovery from Previous Session
The current adaptive logic uses arbitrary thresholds (0.1, 0.01) rather than data-driven values. We discovered that:
1. Small alphas (< 0.01) naturally converge slower and currently get the MOST iterations (1000)
2. For permutation testing (estimating null distribution), we only need approximate solutions
3. Therefore, we should INVERT the logic for permutations - give small alphas FEWER iterations
4. Thresholds should be based on alpha/alphaMax ratio, not fixed values

## Critical Implementation Requirements

### A/B Testing Approach
To validate optimizations without breaking existing code:
1. Create `current_optimized.html` as copy of `current.html`
2. Apply optimizations ONLY to the copy
3. Run both versions with IDENTICAL permutations for valid comparison
4. Compare eFDR curves to ensure < 5% deviation

### Ensuring Identical Permutations
**CRITICAL**: Both versions must use the same random permutations for valid comparison.

Implement by adding permutation pattern generation and storage:
```javascript
// Generate once, use in both versions
function generateFixedPermutations(Nperm, matrixRows) {
    const patterns = [];
    for (let i = 0; i < Nperm; i++) {
        const shuffled = [...Array(matrixRows).keys()].sort(() => Math.random() - 0.5);
        patterns.push(shuffled);
    }
    localStorage.setItem('fixedPermutations', JSON.stringify(patterns));
    return patterns;
}
```

## Next Steps
1. Copy current.html → current_optimized.html
2. Implement fixed permutation patterns in both files
3. Apply alphaMax-based adaptive optimization to current_optimized.html
4. Test both versions with identical parameters
5. Compare eFDR results and timing
6. Validate that eFDR curves match within acceptable tolerance

## Expected Outcomes
- Additional 2-3x speedup (on top of existing 5-10x from batching)
- Target: 25 alphas × 15 permutations in under 2 minutes
- eFDR accuracy maintained within 5% of baseline

## Files to Reference
- Working file: `current.html` (and `index.html` mirror)
- Optimization plan: `EFDR_OPTIMIZATION_PLAN_ADAPTIVE_20250109.md`
- Previous optimizations: See lines 667-693 for batching implementation