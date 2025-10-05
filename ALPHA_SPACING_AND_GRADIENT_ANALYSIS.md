# Alpha Spacing and Detection Gradient Analysis
## SSVD1x Technical Discussion - January 17, 2025

### Current Implementation Status

#### Alpha Spacing
- **Current**: Uniform/constant spacing between alpha values
- **Formula**: `alpha[i] = alpha0 + (alphaMax - alpha0) * i / (Nalpha - 1)`
- **Result**: Equal intervals (Δα) across entire range [alpha0, alphaMax]

#### Detection Gradient Calculation
- **Current**: Simple difference between consecutive detection counts
- **Formula**: `gradient[i] = detections[i] - detections[i-1]`
- **Previous** (before fix): Rate of change `(detections[i] - detections[i-1]) / Δα`

### Key Insight: With Uniform Alpha Spacing

Since Δα is constant in current implementation:
- **Simple difference and rate of change differ only by a constant scaling factor**
- Both produce identical curve shapes for identifying linear regions
- Simple difference is more interpretable: "N more detections per step"

### Identifying Linear Regions in Detection Curve

With current uniform spacing and simple difference gradient:

1. **Linear regions in detection curve** = **Horizontal regions in gradient chart**
   - Constant gradient → Linear growth in detections
   - Zero gradient → Flat detection curve (no new detections)
   
2. **Inflection points** = **Local extrema in gradient chart**
   - Maximum gradient → Steepest increase in detections
   - Gradient sign change → Detection curve changing from increasing to decreasing

3. **Interpretation is straightforward**:
   - Gradient = 5 means "gaining 5 detections per alpha step"
   - Easier than "gaining 142.86 detections per unit alpha"

### Future Enhancement: Variable Alpha Spacing

#### Potential Use Cases

1. **Adaptive Resolution**
   - Dense sampling around knee/transition regions
   - Sparse sampling in flat regions
   - Optimize computational efficiency

2. **Targeted Analysis**
   - Focus around specific FDR thresholds
   - Zoom into regions of interest
   - Binary search for specific detection targets

3. **Different Spacing Strategies**
   ```javascript
   // Logarithmic - more density near zero
   alpha[i] = alphaMax * Math.exp(Math.log(alpha0/alphaMax) * (1 - i/(N-1)))
   
   // Geometric - constant ratio between points  
   alpha[i] = alpha0 * Math.pow(alphaMax/alpha0, i/(N-1))
   
   // Adaptive - based on gradient magnitude
   // Add points where |gradient| > threshold
   ```

4. **Prior Knowledge Integration**
   - Pre-design grids based on expected signal ranges
   - Historical data from similar analyses
   - Domain-specific alpha distributions

#### Implementation Requirements for Variable Spacing

1. **Code Changes Needed**:
   - Option to specify custom alpha array
   - Modify gradient calculation to use rate: `Δdetections / Δα`
   - Update visualizations for non-uniform x-axis
   - Adjust progress indicators for variable intervals

2. **UI Enhancements**:
   - Alpha spacing mode selector (uniform/log/geometric/custom)
   - Interactive alpha distribution preview
   - Import/export custom alpha sequences

3. **Algorithm Considerations**:
   - Gradient must account for varying Δα
   - Interpolation for comparing non-uniform results
   - Statistical adjustments for non-uniform sampling

#### Benefits of Variable Spacing

1. **Computational Efficiency**
   - Reduce total SSVD iterations
   - Maintain accuracy in critical regions
   - Skip uninformative alpha ranges

2. **Better Resolution**
   - Capture sharp transitions accurately
   - Find precise FDR crossing points
   - Identify subtle features in detection curve

3. **Exploratory Power**
   - Multi-scale analysis in single run
   - Adaptive refinement strategies
   - Optimal alpha discovery

### Recommendations

#### For Current SSVD1x Usage
- Current uniform spacing with simple difference gradient is optimal
- Linear regions easily identified as horizontal lines in gradient chart
- No changes needed for basic linear region identification

#### For Future Development
- Implement variable alpha spacing as advanced feature
- Add spacing strategy selector to UI
- Modify gradient calculation to handle non-uniform intervals
- Consider adaptive refinement algorithms

### Mathematical Note

With variable spacing, gradient calculation becomes:
```javascript
// Must use rate of change, not simple difference
gradient[i] = (detections[i] - detections[i-1]) / (alpha[i] - alpha[i-1])
```

This ensures gradient represents true local slope regardless of alpha interval size, making it comparable across different spacing strategies.

### Conclusion

Current implementation is well-suited for uniform alpha analysis. Variable spacing would add significant value for advanced users and specific use cases, particularly when computational efficiency or high resolution in specific regions is important.

---
*Document created for future reference when implementing variable alpha spacing feature*