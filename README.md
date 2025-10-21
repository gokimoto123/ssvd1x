# SSVD1x - Sparse Singular Value Decomposition Analysis Tool

A web-based application for **Sparse Singular Value Decomposition (SSVD)** with **empirical False Discovery Rate (eFDR)** analysis for biomarker discovery in high-dimensional datasets.

## Overview

SSVD1x is a scientific research tool that identifies a small subset of matrix rows (genes, proteins, methylation loci, etc.) from thousands that contain a common signal of interest using L1 regularization. It is especially useful in applications where a reduced number of variables are required for downstream analysis, modeling and machine learning. 
## Features

- **Data Upload**: Support for CSV and other tabular data formats
- **SSVD Algorithm**: Sparse matrix factorization with rank-1 L1 regularization
- **Multiple Analysis Modes**:
  - **1-Alpha Analysis**: Sparse model based on pre-selected sparsity parameter (alpha)
  - **N-Alpha Analysis**: Sparse model selection based on detection dynamics across multiple alpha values
  - **eFDR Analysis**: Sparse model selection based on permutation-based eFDR dynamics across multiple alpha values
- **Interactive Visualizations**: Heatmaps with 2-way hierarchical clustering, detection charts, alpha path analysis
- **Comprehensive Export Suite**:
  - PDF reports that summarize analysis parameters and results
  - CSV files of tables and text files
  - PNG charts (composite heatmaps with dendrograms, eFDR, detection and gradient curves)
- **Mathematical Validation**: Built-in regression test suite for algorithm verification

## Quick Start

### Live Web App (Easiest)
**No installation required!!** Access the app directly at:
**https: https://gokimoto123.github.io/ssvd1x/**

### Run Locally (Optional)
If you prefer to run the app on your machine:

```bash
# Download the repository files from GitHub
# Then start a local web server (Python 3)
python3 -m http.server 8000

### Alternative Methods

npm start
npm run dev
npm run serve

## Technical Details

### Architecture
- **Frontend**: React 18 with JSX (Babel Standalone transformation)
- **Styling**: Tailwind CSS + custom CSS
- **Algorithms**: Pure JavaScript implementation (no external math libraries)
- **Performance**: Web Worker for parallel permutation testing
- **Deployment**: Static HTML file, no build process required

### Core Algorithms
- `svd1()`: Power iteration method for singular value decomposition
- `SSVDR1Algorithm()`: Sparsifies top left singular vector with iterative soft thresholding while preserving dominant signal in the row-space of the data matrix
- `runFDRAnalysis()`: Emprical False Discovery Rate (eFDR) based on permuationa testing 
- `permuteMatrixRows()`: Matrix row permutation for null hypothesis testing

### Mathematical Background
The application implements sparse rank-1 SVD for biomarker discovery in P × N data matrices where:
- P >> N (many more variables than samples)
- K << P (sparse embedded signal)
- Typical applications include genomics, proteomics, medical diagnostics, machine learning

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

## Applications based on sparse subsets of variables

- **Genomics**: Gene expression analysis
- **Proteomics**: Protein biomarker discovery
- **Epigenomics**: DNA methylation loci
- **Polygenic Risk Score**: Disease risk based on common genetic variation  
- **Medical Imaging**: Feature extraction from voxels
- **Drug Discovery**: Target identification
- **Machine Learning**: Dimensionality reduction for machine learning

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
- Multiple analysis modes (1-Alpha, N-Alpha and eFDR)
- Hierarchical clustering visualization
- Mathematical regression test suite
- Comprehensive UI with tooltips and consistent navigation between different 

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
SSVD1x: A Web-Based Tool for Sparse Rank-1 Singular Value Decomposition Analysis
GitHub: https://github.com/gokimoto123/ssvd1x
```

## Contact

For questions or support, please open an issue on GitHub.
