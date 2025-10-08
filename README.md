# SSVD1x - Sparse Singular Value Decomposition Analysis Tool

A web-based application for **Sparse Singular Value Decomposition (SSVD)** with **empirical False Discovery Rate (eFDR)** analysis, designed for biomarker discovery in high-dimensional data matrices.

## Overview

SSVD1x is a research tool that identifies a small subset of matrix rows (variables) from thousands that contain a common signal of interest using L1 regularization. The tool is particularly useful for high-dimensional data analysis where the number of variables greatly exceeds the number of samples.

## Features

- **Data Upload**: Support for CSV and other tabular data formats
- **SSVD Algorithm**: Sparse matrix factorization with L1 regularization
- **eFDR Analysis**: Empirical False Discovery Rate estimation using permutation testing
- **Alpha Path Analysis**: Detection analysis across multiple sparsity parameters
- **Interactive Visualizations**: Real-time parameter adjustment and result visualization
- **Export Capabilities**: Download results in various formats

## Quick Start

### Running the Application

```bash
# Start the web server (Python 3)
python3 -m http.server 8000

# Navigate to http://localhost:8000 in your browser
# Open current_optimized.html
```

### Alternative Methods
```bash
npm start
npm run dev
npm run serve
```

## Technical Details

### Architecture
- **Frontend**: React 18 with JSX (Babel Standalone transformation)
- **Styling**: Tailwind CSS + custom CSS
- **Algorithms**: Pure JavaScript implementation (no external math libraries)
- **Performance**: Web Worker for parallel permutation testing
- **Deployment**: Static HTML file, no build process required

### Core Algorithms
- `svd1()`: Power iteration method for singular value decomposition
- `SSVDR1Algorithm()`: Sparse SVD with iterative soft thresholding
- `runFDRAnalysis()`: Permutation-based FDR analysis
- `permuteMatrixRows()`: Matrix row permutation for null hypothesis testing

### Mathematical Background
The application implements sparse SVD for biomarker discovery in P × N data matrices where:
- P >> N (many more variables than samples)
- K << P (sparse embedded signal)
- Typical applications include genomics, proteomics, and medical diagnostics

## File Structure

```
ssvd1x/
├── current_optimized.html    # Main application file
├── fdr-worker.js             # Web Worker for parallel FDR computation
├── CLAUDE.md                 # Development documentation
├── README.md                 # This file
└── LICENSE                   # MIT License
```

## System Requirements

- Modern web browser with ES6+ support
- No installation or build process required
- Handles matrices up to ~1000×100 efficiently
- Works offline once loaded

## Applications

- **Genomics**: Gene expression analysis
- **Proteomics**: Protein biomarker discovery
- **Medical Imaging**: Feature extraction
- **Drug Discovery**: Target identification
- **Machine Learning**: Feature selection in high-dimensional spaces

## Development

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines and mathematical algorithm specifications.

## Testing

The application includes a comprehensive mathematical regression test suite accessible via the UI (green "🧪 Run Tests" button). Tests cover:
- SVD convergence
- Alpha parameter bounds
- SSVD sparsity constraints
- Performance benchmarks

## Known Issues

- Git operations may require Xcode Command Line Tools reinstallation on macOS
- Large matrices (>1000×100) may experience performance degradation
- Context window limitations in development environment

## Contributing

Contributions are welcome! Please ensure all mathematical regression tests pass before submitting changes.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Developed by gokimoto123

## Citation

If you use SSVD1x in your research, please cite:
```
SSVD1x: A Web-Based Tool for Sparse Singular Value Decomposition Analysis
GitHub: https://github.com/gokimoto123/ssvd1x
```

## Contact

For questions or support, please open an issue on GitHub.
