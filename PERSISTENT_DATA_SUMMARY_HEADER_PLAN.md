# Persistent Data Summary Header Implementation Plan

## **Overview**

**Feature**: Add a persistent header showing P×N dimensions and three histograms (overall data, row means, column means) across all analysis screens after Matrix Review.

**Problem**: Users lose context of what data is being analyzed once they leave the Matrix Review page, leading to potential confusion during long analysis workflows.

**Solution**: A compact, always-visible data summary header that provides continuous visual confirmation of the dataset being analyzed.

## **Research Findings**

### **Existing Infrastructure**
- ✅ `MatrixHistogram` component exists and works well
- ✅ Matrix dimensions (P×N) available in `matrixInfo` throughout the app
- ✅ Statistics calculation functions are present
- ✅ Row means already calculated during preprocessing
- ✅ Overall data histogram already implemented in Matrix Review

### **Missing Components**
- ❌ Row means histogram component
- ❌ Column means histogram component
- ❌ Persistent header layout component
- ❌ Integration into main app workflow

## **User Experience Benefits**

### **Data Awareness**
- Users always know what dataset they're analyzing
- Clear visual confirmation of data consistency
- Immediate detection of data quality issues

### **Workflow Confidence**
- No confusion about which matrix is being processed
- Professional analysis tool appearance
- Reduced cognitive load during complex workflows

### **Error Prevention**
- Mismatched or corrupted data becomes immediately visible
- Quality control throughout the entire analysis pipeline
- Consistent data validation across all screens

## **Technical Implementation Plan**

### **Phase 1: Component Development**

#### 1. Row Means Histogram Component
```javascript
// Calculate row means
const rowMeans = matrix.map(row =>
    row.reduce((sum, val) => sum + val, 0) / row.length
);

// Use existing MatrixHistogram with row means data
<MatrixHistogram
    matrixData={[rowMeans]} // Reshape for histogram component
    title={`Row Means (${P} features)`}
    color="rgba(34, 197, 94, 1)" // Green
    bins={32} // Fewer bins for compact display
/>
```

#### 2. Column Means Histogram Component
```javascript
// Calculate column means
const columnMeans = matrix[0].map((_, colIdx) =>
    matrix.reduce((sum, row) => sum + row[colIdx], 0) / matrix.length
);

// Use existing MatrixHistogram with column means data
<MatrixHistogram
    matrixData={[columnMeans]} // Reshape for histogram component
    title={`Column Means (${N} samples)`}
    color="rgba(168, 85, 247, 1)" // Purple
    bins={32} // Fewer bins for compact display
/>
```

#### 3. Persistent Data Summary Component
```javascript
const PersistentDataSummary = ({ matrix, matrixInfo, statistics }) => {
    // Memoized calculations for performance
    const rowMeans = useMemo(() =>
        matrix.map(row => row.reduce((sum, val) => sum + val, 0) / row.length),
        [matrix]
    );

    const columnMeans = useMemo(() =>
        matrix[0].map((_, colIdx) =>
            matrix.reduce((sum, row) => sum + row[colIdx], 0) / matrix.length
        ),
        [matrix]
    );

    return (
        <div className="bg-gray-50 border-b border-gray-200 p-4 mb-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* P×N Dimensions */}
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600 font-medium">Matrix Dimensions</div>
                        <div className="text-xl font-bold text-blue-900">{matrixInfo.P} × {matrixInfo.N}</div>
                        <div className="text-xs text-gray-500">{matrixInfo.filename}</div>
                    </div>

                    {/* Overall Data Histogram */}
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="h-20">
                            <MatrixHistogram
                                matrixData={matrix}
                                title="Overall Values"
                                color="rgba(59, 130, 246, 1)"
                                bins={24}
                                compact={true}
                            />
                        </div>
                    </div>

                    {/* Row Means Histogram */}
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="h-20">
                            <MatrixHistogram
                                matrixData={[rowMeans]}
                                title="Row Means"
                                color="rgba(34, 197, 94, 1)"
                                bins={24}
                                compact={true}
                            />
                        </div>
                    </div>

                    {/* Column Means Histogram */}
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="h-20">
                            <MatrixHistogram
                                matrixData={[columnMeans]}
                                title="Column Means"
                                color="rgba(168, 85, 247, 1)"
                                bins={24}
                                compact={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
```

### **Phase 2: MatrixHistogram Component Enhancement**

#### Add Compact Mode Support
```javascript
const MatrixHistogram = ({ matrixData, title, color, bins = 64, compact = false }) => {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: !compact,
                position: 'top'
            },
            title: {
                display: !compact,
                text: title
            }
        },
        scales: {
            x: {
                display: !compact,
                grid: { display: !compact }
            },
            y: {
                display: !compact,
                grid: { display: !compact }
            }
        },
        elements: {
            point: {
                radius: compact ? 1 : 3,
                hoverRadius: compact ? 2 : 5
            }
        }
    };

    return (
        <div className={compact ? "h-20" : "h-64"}>
            {compact && (
                <div className="text-xs font-medium text-gray-600 mb-1">{title}</div>
            )}
            <Line data={chartData} options={chartOptions} />
        </div>
    );
};
```

### **Phase 3: Integration Strategy**

#### 1. Main App Integration
```javascript
// In main app component, add after Matrix Review stage
{matrix && matrixInfo && statistics && showAnalysisPanel && (
    <PersistentDataSummary
        matrix={matrix}
        matrixInfo={matrixInfo}
        statistics={statistics}
    />
)}

// Show on all analysis screens
{matrix && matrixInfo && statistics && (analysisResults || alphaSequenceResults) && (
    <PersistentDataSummary
        matrix={matrix}
        matrixInfo={matrixInfo}
        statistics={statistics}
    />
)}
```

#### 2. Conditional Display Logic
- **Show when**: `matrix && matrixInfo && statistics` exist
- **Hide when**: On upload page or Matrix Review page (redundant there)
- **Always show on**: Analysis configuration, progress, results, export screens

#### 3. Responsive Design
```css
/* Desktop: 4-column layout */
@media (min-width: 768px) {
    .summary-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Tablet: 2×2 grid */
@media (max-width: 767px) {
    .summary-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Mobile: Vertical stack with dimensions always first */
@media (max-width: 640px) {
    .summary-grid {
        grid-template-columns: 1fr;
    }
    .dimensions-card {
        order: -1;
    }
}
```

### **Phase 4: Performance Optimization**

#### 1. Memoization Strategy
```javascript
// Expensive calculations only run when matrix changes
const rowMeans = useMemo(() =>
    matrix?.map(row => row.reduce((sum, val) => sum + val, 0) / row.length) || [],
    [matrix]
);

const columnMeans = useMemo(() =>
    matrix?.[0]?.map((_, colIdx) =>
        matrix.reduce((sum, row) => sum + row[colIdx], 0) / matrix.length
    ) || [],
    [matrix]
);
```

#### 2. Large Matrix Handling
```javascript
// For matrices larger than 10k elements, use sampling
const shouldSample = matrix.length * matrix[0].length > 10000;
const sampledMatrix = shouldSample ? sampleMatrix(matrix, 5000) : matrix;
```

#### 3. Lazy Loading
```javascript
// Only calculate when component is visible
const [isVisible, setIsVisible] = useState(false);
const ref = useRef();

useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
        setIsVisible(entry.isIntersecting);
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
}, []);
```

### **Phase 5: Implementation Steps**

1. **Enhance MatrixHistogram** with compact mode support
2. **Create calculation utilities** for row/column means
3. **Build PersistentDataSummary component** with responsive grid layout
4. **Add integration points** in main app component
5. **Test across all workflows** (single-alpha, N-alpha, eFDR)
6. **Optimize performance** for large datasets
7. **Add error handling** for edge cases
8. **Document component API** for future maintenance

## **Expected Outcomes**

### **User Experience Improvements**
- **100% data awareness** throughout analysis workflow
- **Immediate quality control** visual feedback
- **Professional interface** appearance
- **Reduced cognitive load** during complex analyses

### **Technical Benefits**
- **Reuses existing components** (MatrixHistogram)
- **Minimal performance impact** with proper memoization
- **Responsive design** works on all screen sizes
- **Clean integration** with existing state management

### **Quality Assurance**
- **Visual validation** of data consistency
- **Early detection** of data corruption or processing errors
- **Confidence building** for users analyzing large datasets
- **Error prevention** through continuous visual feedback

## **Future Enhancements**

### **Phase 6: Advanced Features**
- **Interactive histograms** with zoom/pan capabilities
- **Statistical overlays** (mean lines, standard deviation bands)
- **Data quality indicators** (outlier detection, missing values)
- **Comparison mode** (before/after preprocessing)

### **Phase 7: Customization**
- **User preferences** for which histograms to show
- **Color scheme options** for different data types
- **Export functionality** for the summary header
- **Annotation support** for data documentation

## **Implementation Priority**

**High Priority**: Core functionality (P×N + 3 histograms)
**Medium Priority**: Performance optimization and responsive design
**Low Priority**: Advanced features and customization options

This plan provides a complete roadmap for implementing a professional-grade persistent data summary header that will significantly improve the user experience of the SSVD1x application.