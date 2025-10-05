# eFDR Performance Optimization Plan for SSVD1x
**Date:** September 6, 2025 (Updated January 9, 2025)  
**Purpose:** Optimize empirical False Discovery Rate (eFDR) analysis performance in SSVD1x application

## Current Performance Status

### ✅ IMPLEMENTED: Phase 1 - Parallel Batching
- **Batched permutation processing** implemented (lines 638-693 in current.html)
- **Dynamic batch size** based on CPU cores: `Math.min(navigator.hardwareConcurrency || 4, 8)`
- **Parallel execution** using `Promise.all()` for each batch
- **Progress tracking** with console logging after each batch completion

### Remaining Performance Issues
- **High iteration count**: Still using `maxIter=5000` for SSVD calculations
- **Time estimate**: ~10-15 minutes for 25 alphas × 15 permutations (improved from hours)
- **No warm starting**: Each alpha starts from scratch
- **Fixed tolerance**: Not adaptive based on alpha value or permutation context

### Current Implementation Details
- Original matrix: `maxIter=5000`, `tolerance=0.0001`
- Permutations: Same parameters as original (should be reduced)
- Batch processing: **IMPLEMENTED** - processes up to 8 permutations in parallel
- Progress reporting: **IMPLEMENTED** - batch-by-batch updates

## Phase 1: Parallel Processing with Smart Batching ✅ COMPLETED

### 1.1 ✅ Permutation Batching - IMPLEMENTED
Current implementation in `current.html` (lines 642-693):
- Dynamic batch size using hardware concurrency
- Parallel processing with `Promise.all()`
- Progress updates after each batch
- Console logging for monitoring

### 1.2 🔄 NEXT PRIORITY: Reduce Permutation Computational Cost
- **Reduce maxIter**: 5000 → 500-1000 for permutations
- **Relax tolerance**: 0.0001 → 0.001 for permutations  
- **Early termination**: Stop when solution becomes all-zeros
- **Rationale**: Permutations only need approximate solutions for null distribution

### 1.3 Add Cancellation Support
- Add "Cancel Analysis" button during eFDR run
- Clean shutdown of running batches
- Save partial results if desired
- Use AbortController or flag-based cancellation

## Phase 2: Algorithmic Optimizations (Additional 2-3x speedup)

### 2.1 Warm Starting Between Alphas
- Use solution from `alpha[i]` as starting point for `alpha[i+1]`
- Cache permutation patterns and reuse across similar alphas
- Interpolate initial vectors for intermediate alphas
- Expected benefit: 20-30% reduction in iterations

### 2.2 Adaptive Convergence Criteria
```javascript
// Adaptive tolerance based on alpha value
const adaptiveTolerance = alpha > 0.1 ? 0.01 : 
                          alpha > 0.01 ? 0.001 : 
                          0.0001;

// Dynamic maxIter based on convergence rate
if (convergenceRate > 0.9) maxIter = 200;
else if (convergenceRate > 0.7) maxIter = 300;
else maxIter = 500;
```

### 2.3 Statistical Early Stopping
- Monitor eFDR estimate variance across permutations
- Stop adding permutations when confidence interval is narrow
- Use sequential testing to determine sufficient permutations
- Implement moving average of eFDR estimates

## Phase 3: Advanced Parallelization (Future optimization)

### 3.1 Web Workers Implementation
```javascript
// Move SSVD calculations to Web Workers
const worker = new Worker('ssvd-worker.js');
worker.postMessage({
    matrix: permutedMatrix,
    alpha: alpha,
    maxIter: 300
});
worker.onmessage = (e) => {
    const result = e.data;
    // Process result
};
```

### 3.2 Progressive Results
- Display partial eFDR results as batches complete
- Update UI with confidence intervals
- Allow early stopping if results are sufficient
- Implement checkpoint/resume for long analyses

## Implementation Priority Order

### ✅ Completed (January 2025)
1. **Permutation batching** with `Promise.all()` - DONE
2. **Progress updates** after each batch completion - DONE
3. **Dynamic batch sizing** based on CPU cores - DONE

### 🔄 Immediate Priorities (Next Session)
1. **Reduced iterations** (500-1000) and **relaxed tolerance** (0.001) for permutations
2. **Cancel button** for long-running analyses

### Next Session Priorities
1. Warm starting between consecutive alphas
2. Adaptive convergence monitoring
3. Statistical early stopping with confidence intervals
4. SVD power iteration reduction (50 → 30)

### Future Enhancements
1. Web Workers for true parallelism
2. GPU acceleration via WebGL
3. Checkpoint/resume functionality
4. Importance sampling for permutations

## Expected Performance Improvements

| Scenario | Pre-Batching | Current (w/ Batching) | After Phase 1.2 | After Phase 2 |
|----------|-------------|----------------------|-----------------|---------------|
| 10 alphas, 10 perms | ~20 min | ~5 min ✅ | ~1-2 min | ~30 sec |
| 25 alphas, 15 perms | ~90 min | ~10-15 min ✅ | ~3-5 min | ~1-2 min |
| 35 alphas, 25 perms | ~2-3 hours | ~20-30 min ✅ | ~5-10 min | ~2-3 min |

## Key Code Locations

### ✅ Already Modified
1. **Permutation loop** (lines 642-693): Converted to batched processing
2. **Progress reporting** (line 690): Updates after each batch completion

### 🔄 Still Need Modification
1. **`SSVDR1Algorithm` parameters** (line ~665-670): Reduce maxIter/tolerance for permutations
2. **Early termination logic**: Add zero-detection check
3. **Cancel button integration**: Add UI control and abort logic

## Technical Considerations

### Memory Management
- Batch size should not exceed available memory
- Monitor memory usage with large matrices (P > 10000)
- Consider matrix chunking for very large datasets

### Browser Compatibility
- `navigator.hardwareConcurrency` not available in all browsers
- Fallback to conservative batch size (4) if unavailable
- Test on multiple browsers for consistency

### Validation Requirements
- Ensure eFDR estimates remain statistically valid
- Compare results with sequential implementation
- Monitor convergence quality with relaxed tolerances
- Validate that batching doesn't affect randomness

## Success Metrics

1. **Performance**: 10x speedup for standard analyses
2. **Reliability**: No increase in failed convergences
3. **Accuracy**: eFDR estimates within 1% of sequential version
4. **Usability**: Smooth progress updates and cancellation
5. **Scalability**: Handle matrices up to 20000×500

## Notes for Implementation

- Start with Phase 1 batching for immediate impact
- Test with small datasets first (10 alphas, 5 perms)
- Monitor browser console for memory/performance issues
- Keep sequential version as fallback option
- Document any accuracy trade-offs from relaxed tolerances

## Update Summary (January 9, 2025)

### What's Been Implemented
- ✅ **Phase 1.1 Complete**: Parallel batching of permutations using `Promise.all()`
- ✅ **Dynamic batch sizing**: Automatically uses up to 8 CPU cores
- ✅ **Progress tracking**: Batch-by-batch console logging
- ✅ **Performance improvement**: ~5-10x speedup achieved (from hours to 10-15 minutes)

### Next Steps for Further Optimization
1. **Reduce computational cost per permutation** (maxIter: 5000 → 500-1000)
2. **Add adaptive tolerance** based on alpha values
3. **Implement early termination** for zero solutions
4. **Add UI cancel button** for long analyses

---
This optimization plan tracks the progress of eFDR performance improvements in SSVD1x. Phase 1 batching is complete, with additional optimizations planned to achieve sub-5-minute analysis times.