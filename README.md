# SSVD-R1: Sparse SVD Biomarker Discovery

A React-based web application for **Sparse Singular Value Decomposition (SSVD-R1)** with **False Discovery Rate (FDR)** analysis for biomarker discovery research.

## 🎯 Purpose

SSVD-R1 computes a sparse rank-1 approximation of a P×N data matrix to identify sparse biomarker signals where:
- P ≫ N (many variables, fewer samples) 
- K ≪ P (sparse signal subset)

The algorithm identifies biomarker signals embedded in high-dimensional data matrices using sparsity constraints and FDR analysis for optimal parameter selection.

## ✨ Features

- **Matrix Generation**: Synthetic biomarker data with configurable signal-to-noise ratios
- **SSVD-R1 Algorithm**: Sparse singular value decomposition with L1 regularization
- **FDR Analysis**: Empirical false discovery rate analysis with permutation testing
- **Interactive Visualizations**: Real-time charts and performance metrics
- **Parameter Optimization**: Automated alpha parameter selection via FDR
- **Performance Metrics**: Precision, recall, F1 score, and accuracy analysis

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server)

### Installation
1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd ssvd-r1-project-III
   ```

2. **Start the development server**
   ```bash
   python3 -m http.server 8000
   ```
   *Alternative:* `npm start` (if you have Node.js installed)

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Basic Workflow
1. **Configure Parameters**: Set matrix dimensions (P, N, K) and signal parameters
2. **Generate Test Data**: Create synthetic biomarker data matrix
3. **Run FDR Analysis**: Find optimal sparsity parameters with permutation testing
4. **Select Alpha**: Click table rows to run SSVD-R1 with selected parameters
5. **Analyze Results**: Review detection performance and visualizations

## 📊 Algorithm Details

### SSVD-R1 Algorithm
The core algorithm solves:
```
minimize ||X - σuv^T||_F^2 + λ||u||_1
```
Where:
- X: P×N data matrix
- u: P×1 sparse left singular vector (biomarker loadings)  
- v: N×1 dense right singular vector (sample scores)
- σ: singular value
- λ (alpha): sparsity parameter

### FDR Analysis
Empirical False Discovery Rate analysis using:
- **Permutation Testing**: Randomized null hypothesis testing
- **Multiple Alpha Testing**: Grid search over sparsity parameters
- **Performance Metrics**: Precision, recall, F1 score computation
- **Optimal Selection**: Automated best parameter identification

## 🔧 Configuration Options

### Matrix Dimensions
- **P (Variables)**: Number of features/genes (default: 1000)
- **N (Samples)**: Number of observations/patients (default: 100)  
- **K (Signal Variables)**: Number of true biomarkers (default: 50)

### Signal Parameters  
- **Signal Scale**: Strength of biomarker signal (0.1-3.0)
- **Noise Variance**: Background noise level (0.01-3.0)
- **SNR**: Computed signal-to-noise ratio in dB

### FDR Parameters
- **Number of Alpha Values**: Grid resolution (1-50)
- **Alpha Range**: Sparsity parameter range (auto-computed)
- **Permutations**: Null hypothesis tests per alpha (5-50)
- **Expected True Signals**: Prior knowledge for π₀ estimation

## 📈 Visualizations

- **Sample Signal Plot**: First biomarker variable with true signal overlay
- **FDR Charts**: False discovery rate vs. alpha parameter
- **Detection Charts**: Number of detections across alpha values
- **Performance Metrics**: Color-coded tables with precision/recall
- **Sparse U Vector**: Biomarker loading visualization

## 🧪 Testing Scenarios

### Null Hypothesis Testing
Set K=0 to test false discovery rate control when no true signals exist.

### Signal Detection
Use K>0 with various SNR levels to test biomarker detection performance.

### Parameter Sensitivity
Adjust signal scale and noise variance to study algorithm robustness.

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18**: Modern UI framework with hooks
- **JSX**: Component-based architecture  
- **Tailwind CSS**: Utility-first styling
- **Babel Standalone**: Client-side JSX transformation

### Mathematical Libraries
- **Custom Matrix Operations**: Optimized linear algebra
- **SVD Implementation**: Power iteration method
- **Statistical Functions**: FDR and permutation testing

### File Structure
```
ssvd-r1-project-III/
├── index.html              # Main application entry
├── src/
│   └── App.jsx             # React component with algorithms
├── styles.css              # Custom CSS styles
├── package.json            # Project metadata
└── README.md               # Documentation
```

## 🔬 Scientific Background

### Applications
- **Genomics**: Gene expression biomarker discovery
- **Proteomics**: Protein marker identification  
- **Medical Imaging**: Feature selection in radiomics
- **Drug Discovery**: Compound screening analysis

### Mathematical Foundation
Based on sparse principal component analysis and L1-regularized matrix decomposition research. Implements empirical FDR methodology for multiple testing correction.

### Research Context
Suitable for high-dimensional biological data where the number of features greatly exceeds sample size, and true signals are sparse.

## 🤝 Contributing

This is a research tool. Contributions welcome for:
- Algorithm optimizations
- Additional visualization features  
- Performance improvements
- Documentation enhancements

## 📄 License

MIT License - see LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues
- **Blank page**: Check browser console for JavaScript errors
- **Slow performance**: Reduce matrix size or permutation count
- **Memory issues**: Lower P (variables) parameter for large datasets

### Browser Compatibility
- Chrome/Chromium: ✅ Recommended
- Firefox: ✅ Supported
- Safari: ✅ Supported  
- Edge: ✅ Supported

### Performance Tips
- Start with smaller matrices (P=500, N=50) for initial testing
- Use fewer permutations (Nperm=10) for faster FDR analysis
- Consider reducing alpha grid resolution for quicker results

---

**Built for biomarker discovery research • Clean architecture • Modern React implementation**