# SSVD1x - Sparse Singular Value Decomposition Analysis Tool

A web-based application for **Sparse Singular Value Decomposition (SSVD)** with **empirical False Discovery Rate (eFDR)** analysis for biomarker discovery in high-dimensional datasets.

**🌐 Live Application:** https://gokimoto123.github.io/ssvd1x/

## Overview

SSVD1x is a scientific research tool that identifies a small subset of matrix rows from thousands that contain a common signal of interest using L1 regularization. It is especially useful in applications where a reduced number of variables are required for downstream analysis, modeling and machine learning.

## Features

- **Data Upload**: Support for CSV and other tabular data formats
- **SSVD Algorithm**: Sparse matrix factorization with rank-1, L1 regularization
- **Multiple Analysis Modes**:
  - **1-Alpha Analysis**: Sparse model based on pre-selected sparsity parameter
  - **N-Alpha Analysis**: Sparse model selection based on detection dynamics
  - **eFDR Analysis**: Sparse model selection based on permutation-based eFDR dynamics
- **Interactive Visualization of Results**: Live eFDR, detection, detection gradient plots, interactive tables, scatter plots, line plots, and hierarchically clustered heatmaps
- **Comprehensive Export Suite**: PDF reports, CSV files, PNG charts
- **Mathematical Validation**: Built-in regression test suite for algorithm verification

## Quick Start

### Live Web App (Easiest)

**No installation required!** Access the app directly at:
**https://gokimoto123.github.io/ssvd1x/**

Simply visit the link, upload your CSV data matrix, and start analyzing.

### Run Locally (Optional)

If you prefer to run the app on your machine:

```bash
# Download repository files from GitHub
# Then start a local web server (Python 3)
python3 -m http.server 8000

# Open your browser and navigate to:
# http://localhost:8000/index.html
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

## Repository Structure

```
ssvd1x/
├── index.html                # Main application file (single-page React app)
├── fdr-worker.js             # Web Worker for parallel permutation testing
├── CLAUDE.md                 # Development documentation and guidelines
├── README.md                 # This file
└── LICENSE                   # MIT License
```

**Note for developers:** The local development version may be named `current_optimized.html`, but the deployed version on GitHub Pages is `index.html`.

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

## Release Notes

**Version 1.0.0 (October 2025)**
- Stable production release
- Complete export functionality (PDF, Excel, PNG)
- Multiple analysis modes (1-Alpha, N-Alpha, and eFDR)
- Hierarchical clustering visualization
- Mathematical regression test suite
- Comprehensive UI with tooltips and consistent navigation

## Known Issues

- Git operations may require Xcode Command Line Tools reinstallation on macOS
- Hierarchical clustering may trigger browser "Page Unresponsive" warnings for matrices >1000 rows (acceptable, warning resolves quickly)
- eFDR analysis is computationally intensive for large permutation counts

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
