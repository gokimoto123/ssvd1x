# Next Session Prompt - September 11, 2025

## User Background
You are working with an applied mathematician with 35 years of experience in AI and machine learning, with deep expertise in genomics and biomarker discovery. Expect discussions at a high technical level with emphasis on mathematical correctness and practical applicability to real-world genomic datasets.

## Context
The eFDR optimization has been successfully implemented and tested. The optimized version (`current_optimized.html`) achieves ~1 hour runtime for 20,000×370 matrices with 35 alphas × 15 permutations.

## Session Objective
Enhance the UI with interactive visualization of eFDR analysis results through linked plots and improved table interaction.

## Tasks for Next Session

### Task 1: Simplify eFDR Table Interaction
**Remove the "Select" column from the eFDR results table**
- Make entire table rows clickable for selection
- Remove checkbox column to clean up interface
- Highlight selected row visually (e.g., background color)
- Maintain single selection behavior (only one row selected at a time)

### Task 2: Add Three Analysis Plots
**Add visualization plots directly below the eFDR results table:**

1. **eFDR vs Alpha Plot**
   - X-axis: Alpha values
   - Y-axis: eFDR values (0 to 1)
   - Show eFDR threshold line at 0.05
   - Highlight points where eFDR < 0.05

2. **Detections vs Alpha Plot**
   - X-axis: Alpha values  
   - Y-axis: Number of detections
   - Show how sparsity changes with alpha
   - Use consistent scale with other plots

3. **Detection Gradient vs Alpha Plot**
   - X-axis: Alpha values
   - Y-axis: Detection gradient (change in detections)
   - Shows rate of change in detections
   - Helps identify stable regions

### Task 3: Implement Bidirectional Linking
**Create interactive linking between table and plots:**

#### Table → Plots
- Clicking a table row highlights corresponding alpha point in ALL three plots
- Use distinctive marker (e.g., larger size, different color, or circle outline)
- Previous selection should be cleared

#### Plots → Table
- Clicking any point in any plot:
  - Selects corresponding row in eFDR table
  - Highlights same alpha in other two plots
  - Scrolls table to show selected row if needed

#### Visual Feedback
- Selected alpha should be clearly visible across all visualizations
- Consider using consistent color scheme (e.g., selected = orange, unselected = blue)
- Add hover effects for better interactivity

## Implementation Notes

### Current Working File
- Work on: `current_optimized.html` (the version with performance optimizations)
- Backup exists: `current_optimized_20250111_backup.html`

### Technical Considerations
- Use Chart.js (already loaded) for plots
- Implement click handlers for both table rows and chart points
- Store selected alpha index in React state
- Update all visualizations when selection changes

### Expected UI Layout
```
[eFDR Results Table]
   ↓ (click row)
[eFDR vs Alpha Plot]
   ↕ (bidirectional)
[Detections vs Alpha Plot]
   ↕ (bidirectional)
[Detection Gradient vs Alpha Plot]
   ↑ (click point)
```

The three plots should be stacked **vertically** below the eFDR table, not side by side, for better visibility and to accommodate the full width for each chart.

## Success Criteria
- ✅ Table rows directly clickable (no Select column)
- ✅ Three plots render correctly with data
- ✅ Clicking table row highlights points in all plots
- ✅ Clicking plot point selects table row and other plots
- ✅ Visual feedback is clear and responsive
- ✅ No performance degradation with interaction

## Testing Approach
1. Generate or load test data
2. Run eFDR analysis with 10-15 alphas for quick testing
3. Verify all interactions work bidirectionally
4. Test edge cases (first/last alpha, rapid clicking)
5. Ensure plots update correctly when running new analysis

## File References
- Current optimized version: `current_optimized.html`
- Session summary: `SESSION_SUMMARY_20250111.md`
- Project guidelines: `CLAUDE.md`