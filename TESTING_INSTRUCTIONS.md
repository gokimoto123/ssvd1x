# eFDR Optimization Testing Instructions

## Test Setup Complete ✅

The optimization has been implemented with the following key changes:

### Fixed Permutation Functions Added
- Both `current.html` and `current_optimized.html` now support fixed permutation patterns
- Enables reproducible A/B testing with identical random permutations
- Functions: `generateFixedPermutations()`, `savePermutationPatterns()`, `loadPermutationPatterns()`

### Optimization in current_optimized.html
- **alphaMax-based adaptive parameters** instead of arbitrary thresholds (0.1, 0.01)
- **Inverted logic for permutations**: small alphas get FEWER iterations (since we only need approximate null distribution)
- **Proper parameters for original matrix**: small alphas get MORE iterations for accuracy

## Testing Steps

### 1. Navigate to Applications
- **Baseline**: http://localhost:8001/current.html
- **Optimized**: http://localhost:8001/current_optimized.html

### 2. Generate Test Data
In both applications:
1. Click "Generate Test Data" or upload a CSV
2. Use these parameters for consistent testing:
   - P = 100 (or existing matrix size)
   - K = 5-10 signal variables
   - Small matrix for quick testing

### 3. Run eFDR Analysis with Fixed Permutations

#### In Browser Console (both versions):
```javascript
// Enable fixed permutations for reproducible testing
const useFixedPermutations = true;

// Test with reduced parameters for quick validation
const testParams = {
    Nalpha: 10,     // 10 alphas instead of 25
    Nperm: 5,       // 5 permutations instead of 15
    useFixedPermutations: true
};
```

### 4. Run Analysis
1. **Baseline version**: Run eFDR analysis, note timing
2. **Optimized version**: Run eFDR analysis with same parameters
3. Compare results and performance

### 5. Expected Results
- **Speed improvement**: 50-70% faster in optimized version
- **eFDR accuracy**: Should match within 5% between versions
- **Iteration counts**: Optimized version should show adaptive iteration counts in console

## Key Optimizations Implemented

### Adaptive Parameters Based on alpha/alphaMax Ratio

#### For Permutations (current_optimized.html):
```javascript
const alphaRatio = alpha / alphaMax;

// Fewer iterations for small alphas (inverted logic)
const adaptiveMaxIter = 
    alphaRatio < 0.05 ? 400 :      // Was 1000
    alphaRatio < 0.2 ? 350 :        
    alphaRatio < 0.5 ? 250 :        
    alphaRatio < 0.75 ? 150 :       
    50;                             

const adaptiveTolerance = 
    alphaRatio < 0.2 ? 0.01 :       // Was 0.0001
    alphaRatio < 0.5 ? 0.005 :      
    0.001;                          
```

#### For Original Matrix (current_optimized.html):
```javascript
// More iterations for small alphas (proper logic)
const adaptiveMaxIterOrig = 
    alphaRatio < 0.05 ? 2000 :     
    alphaRatio < 0.2 ? 1000 :       
    alphaRatio < 0.5 ? 500 :        
    alphaRatio < 0.75 ? 200 :       
    100;                            
```

## Validation Checklist
- [ ] Both versions load without errors
- [ ] Fixed permutations generate and save correctly
- [ ] Optimized version shows adaptive iteration counts
- [ ] eFDR results match within acceptable tolerance
- [ ] Performance improvement is significant
- [ ] Console output shows optimization working

## Next Steps
If validation successful:
1. Update current.html with optimizations
2. Add UI controls for fixed permutations option
3. Consider further batch size optimizations