# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SSVD-R1 is a React-based web application for **Sparse Singular Value Decomposition (SSVD-R1)** with **False Discovery Rate (FDR)** analysis for biomarker discovery research. This is a scientific research tool that identifies sparse biomarker signals in high-dimensional data matrices using sparsity constraints and FDR analysis.

## Development Commands

### Starting the Application
```bash
# Primary method (Python HTTP server)
python3 -m http.server 8000

# Alternative methods
npm start
npm run dev
npm run serve
```

### Opening the Application
- Navigate to `http://localhost:8000` in a web browser
- The application runs entirely in the browser with no build process required

### Testing
- Open `test-basic.html` for basic component loading tests
- Open `test-app.html` for application functionality tests
- No formal test framework is configured - testing is manual through browser

## Architecture Overview

### Technology Stack
- **Frontend Framework**: React 18 with JSX
- **Styling**: Tailwind CSS + custom CSS
- **Build System**: None (uses Babel Standalone for JSX transformation)
- **Deployment**: Static files served via Python HTTP server
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

### File Structure
```
ssvd-r1-project-III/
├── index.html              # Main application entry point
├── src/
│   └── App.jsx             # Single React component with all algorithms
├── styles.css              # Custom CSS styles
├── package.json            # Project metadata and scripts
├── test-app.html           # Application functionality tests
├── test-basic.html         # Basic component loading tests
├── README.md               # Comprehensive documentation
└── PROJECT_STATUS.md       # Implementation status and history
```

### Core Implementation

**Single Component Architecture**: The entire application is implemented as one large React component (`SSVDR1Analyzer`) in `src/App.jsx` containing:

- **Matrix Operations**: Custom linear algebra utilities (multiply, transpose, norm)
- **SVD Implementation**: Power iteration method for singular value decomposition
- **SSVD-R1 Algorithm**: Sparse SVD with L1 regularization using iterative soft thresholding
- **FDR Analysis**: Empirical false discovery rate analysis with permutation testing
- **UI Components**: Interactive parameter controls, progress indicators, results visualization

**Key Algorithms**:
- `svd1()`: Basic SVD using power iteration method
- `SSVDR1Algorithm()`: Main sparse SVD algorithm with sparsity parameter alpha
- `runFDRAnalysis()`: Permutation-based FDR analysis across multiple alpha values
- `permuteMatrixRows()`: Matrix row permutation for null hypothesis testing

## Application Workflow

1. **Parameter Configuration**: Set matrix dimensions (P×N), signal parameters (K, signal scale, noise variance)
2. **Data Generation**: Create synthetic biomarker data with embedded signals
3. **FDR Analysis**: Test multiple alpha values with permutation testing to find optimal sparsity parameters
4. **Alpha Selection**: Click table rows to run SSVD-R1 with selected alpha values
5. **Results Analysis**: Review detection performance metrics (precision, recall, F1 score)

## Key Configuration Parameters

- **P**: Number of variables/features (e.g., genes) - typically 1000
- **N**: Number of samples/observations (e.g., patients) - typically 100
- **K**: Number of true signal variables (biomarkers) - can be 0 for null hypothesis testing
- **Signal Scale**: Biomarker signal strength (0.1-3.0)
- **Noise Variance**: Background noise level (0.01-3.0)
- **Alpha**: Sparsity parameter for L1 regularization (determined by FDR analysis)

## Scientific Context

This application implements sparse principal component analysis for biomarker discovery in high-dimensional biological data where:
- P ≫ N (many variables, fewer samples)
- K ≪ P (sparse signal subset)
- Typical applications: genomics, proteomics, medical imaging, drug discovery

## Development Notes

- **No Build Process**: Application uses Babel Standalone for in-browser JSX transformation
- **Pure JavaScript**: All algorithms implemented in vanilla JavaScript with no external math libraries
- **Browser-Only**: No server-side computation required
- **Memory Limitations**: Handles matrices up to approximately 1000×100 efficiently
- **Performance**: Real-time parameter updates, ~2-3 second initial load time

## Common Issues

- **Blank Page**: Check browser console for JavaScript errors
- **Slow Performance**: Reduce matrix dimensions (P, N) or permutation count
- **Memory Issues**: Lower P parameter for large datasets
- **Numerical Instability**: Occurs with extreme parameter values - algorithm includes safeguards

## Browser Requirements

- Modern JavaScript support (ES6+)
- No additional plugins or extensions required
- Works offline once loaded
- Responsive design supports various screen sizes