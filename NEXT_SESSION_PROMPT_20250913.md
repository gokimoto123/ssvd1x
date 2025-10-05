# Next Session Prompt - September 13, 2025

## User Background
You are working with an applied mathematician with 35 years of experience in AI and machine learning, with deep expertise in genomics and biomarker discovery. Expect discussions at a high technical level with emphasis on mathematical correctness and practical applicability to real-world genomic datasets.

## Context
The eFDR optimization has been successfully implemented and tested. Interactive UI features have been partially implemented with table interaction working but chart click events failing.

## Session Objective
Fix chart click event detection issues to complete bidirectional linking between eFDR results table and the three analysis plots.

## Current Status

### Completed Features ✅
- eFDR results table with clickable rows (no Select column)
- Three interactive SVG-based analysis plots positioned vertically below table:
  1. eFDR vs Alpha Plot
  2. Detections vs Alpha Plot  
  3. Detection Gradient vs Alpha Plot
- Table row selection properly highlights corresponding points in all charts
- Charts have proper visual styling with clipping boundaries
- Responsive design that maintains readability across browser widths

### Current Problem ❌
**Chart click events aren't firing at all**
- Console shows no "FDR Chart point clicked" messages when clicking chart markers
- Clicking plot markers should select alpha values and execute SSVD algorithm (like table rows do)
- Table → Charts works fine, but Charts → Table/SSVD doesn't work

## Investigation Results

### Root Cause Analysis
From code investigation, the issue is NOT missing click handlers:
- SVG circles DO have proper `onClick={() => handlePointClick(index)}` handlers
- `handlePointClick` function exists and should log + call `onRowSelect(index)`
- Console logging confirms the handlers are attached but events never fire

### Suspected Issues
1. **Clipping Path Interference**: Circles are inside `<g clipPath="url(#fdrChartClip)">` which may block click detection
2. **Missing pointer-events Styling**: No explicit `pointer-events: all` on clickable SVG elements
3. **Event Propagation**: Nested containers might intercept click events

## Required Fixes

### Task 1: Add Explicit Pointer Events Styling
**Add `style={{pointerEvents: 'all'}}` to all clickable SVG circles:**
```jsx
<circle
    onClick={() => handlePointClick(index)}
    style={{pointerEvents: 'all'}}
    // ... other props
>
```

### Task 2: Debug Clipping Path Interaction
**Check if clipping path prevents click detection:**
- Temporarily remove clipping from interactive elements to test
- If clipping is the issue, restructure SVG to keep markers outside clipped areas
- Ensure clipping boundaries don't interfere with click zones

### Task 3: Add Event Debugging
**Enhance logging to isolate the issue:**
- Add console.log directly in circle onClick handlers
- Test clicking different chart areas and marker positions
- Verify event bubbling isn't being prevented

### Task 4: Alternative Event Handling (if needed)
**Try different approaches if standard onClick fails:**
- Test `onMouseDown` instead of `onClick`
- Add `event.preventDefault()` and `event.stopPropagation()` if needed
- Consider adding invisible larger click targets around small markers

## Expected Behavior After Fix
- Clicking any chart marker logs "FDR Chart point clicked" message
- Chart clicks select corresponding table row
- Chart clicks execute SSVD algorithm for selected alpha
- Bidirectional linking works: Table ↔ Charts ↔ SSVD execution

## Technical Context

### Current Working File
- **Primary file**: `current_optimized.html` (contains all optimizations + UI features)
- **Chart Components**: FDRChart, DetectionsChart, GradientChart (all SVG-based)
- **Container**: FDRResultsDisplay component handles table and chart integration

### Key Functions
- `handlePointClick(index)` - Should select alpha and trigger SSVD
- `onRowSelect(index)` - Shared selection handler for table and charts  
- `onRunSingleAlpha(alpha)` - Executes SSVD algorithm for specific alpha

### Chart Structure
```jsx
<g clipPath="url(#fdrChartClip)">
    {/* Data points */}
    {data.alphaValues.map((alpha, index) => (
        <circle
            onClick={() => handlePointClick(index)}
            // Missing: style={{pointerEvents: 'all'}}
        />
    ))}
</g>
```

## Success Criteria
- ✅ Console logs "FDR Chart point clicked" when clicking chart markers
- ✅ Chart clicks select table rows and highlight other chart points  
- ✅ Chart clicks execute SSVD algorithm (same behavior as table clicks)
- ✅ All three charts (FDR, Detections, Gradient) respond to clicks
- ✅ No performance degradation or visual regression

## Testing Approach
1. Run eFDR analysis to generate chart data
2. Click various chart markers and verify console output
3. Confirm chart clicks trigger both selection and SSVD execution
4. Test edge cases (boundary markers, rapid clicking)
5. Verify table-chart bidirectional sync still works

## File References
- Current working file: `current_optimized.html`
- Session summary: `SESSION_SUMMARY_20250913.md`  
- Project guidelines: `CLAUDE.md`