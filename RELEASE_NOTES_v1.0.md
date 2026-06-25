# SSVD1x Version 1.0.0 - Production Release

**Release Date**: November 20, 2025

**🎉 First Production Release of SSVD1x!**

After several months of intensive development, testing, and refinement (August-November 2025), we're excited to release SSVD1x v1.0 - a browser-based tool for sparse singular value decomposition with empirical false discovery rate validation.

---

## 🌐 Live Application

**Try it now**: https://gokimoto123.github.io/ssvd1x/

No installation required - works in any modern browser!

---

## 🎯 What is SSVD1x?

SSVD1x helps researchers find sparse signals in high-dimensional data where you have many more variables than samples (the P >> N problem). Common in genomics, proteomics, finance, and machine learning.

**Example**: Find 50 signal genes from 20,000 total genes using only 100 patient samples.

---

## ✨ Key Features

### Three Analysis Modes
- **1-Alpha Analysis** - Quick exploration with a single sparsity parameter (~seconds)
- **N-Alpha Analysis** - Explore detection dynamics across multiple alpha values (~minutes)
- **eFDR Analysis** - Full statistical validation with permutation testing (~5-10 minutes)

### Interactive Visualizations
- Real-time parameter tuning with instant feedback
- Hierarchical clustering heatmaps
- Detection dynamics plots
- eFDR vs alpha curves
- Scatter plots and line plots

### Comprehensive Export System
- **PDF Reports** - Publication-ready analysis summaries
- **Excel Tables** - Detection results with quartile statistics
- **PNG Charts** - High-resolution visualizations
- **ZIP Archives** - Complete analysis packages

### Demo Datasets Included
- **4 Synthetic Datasets** (1000×100) - Varying SNR: -5, -15, -20, -25 dB
- **1 Real Gene Expression Dataset** (19,120×368) - Hepatocellular carcinoma patient data
- **Ground Truth Files** - Validate detection performance

### Mathematical Validation
- Built-in regression test suite (accessible via UI)
- Tests cover SVD convergence, alpha bounds, sparsity constraints
- Ensures mathematical correctness across updates

---

## 🚀 Technical Highlights

- **Browser-Based** - No installation, no build process
- **Pure JavaScript** - Custom linear algebra implementation (no external math libraries)
- **React 18** - Modern UI with Babel Standalone (no webpack/npm needed)
- **Web Workers** - Parallel processing for computationally intensive tasks
- **Responsive Design** - Works on desktop and tablet devices
- **Offline Capable** - Runs offline once loaded

---

## 📊 Performance

- **Synthetic Datasets**: Load in 1-2 seconds
- **Gene Expression**: Load in ~5 seconds
- **N-Alpha Analysis**: 2-3 minutes (35 alpha values)
- **eFDR Analysis**: 5-10 minutes (25 alphas, 10 permutations)
- **Matrix Size**: Efficiently handles up to ~1000×100 (tested up to 19K×368)

---

## 🎓 Who Should Use This?

**Perfect for researchers and data scientists working with:**
- 🧬 Genomics/proteomics data (biomarker discovery)
- 📊 High-dimensional datasets (P >> N problem)
- 🔬 Statistical validation (FDR control)
- 🏥 Clinical research (patient stratification)
- 💼 Feature selection for machine learning

---

## 📖 Documentation

- **Main README**: [README.md](README.md) - Quick start guide
- **Demo Data**: [demo_data/README.md](demo_data/README.md) - Dataset descriptions and download instructions
- **Developer Docs**: [CLAUDE.md](CLAUDE.md) - Development guidelines and algorithm specifications

---

## 🔬 Algorithm Validation

All core algorithms include versioned "fingerprints" and have been validated:
- **SVD_v2.1_VALIDATED** - Power iteration with convergence criteria
- **SSVD-R1_v1.3_VALIDATED** - Sparse rank-1 factorization
- **ALPHAMAX_v1.2_VALIDATED** - Sparsity parameter calculation
- **FDR_ANALYSIS_v2.0_VALIDATED** - Permutation testing with monotonicity checks

Run the test suite yourself: Click the 🧪 Run Tests button in the application header.

---

## 📦 What's Included

- `index.html` (506 KB) - Complete application (single file!)
- `fdr-worker.js` (24 KB) - Web Worker for parallel processing
- `demo_data/` - 5 curated datasets with ground truth
- `CLAUDE.md` - Comprehensive development documentation
- `LICENSE` - MIT License (open source)

---

## 🙏 Acknowledgments

SSVD1x was developed in collaboration with researchers who contributed to the original SSVD algorithm development. Special thanks to former collaborators for their foundational work on sparse SVD methods and statistical validation approaches.

---

## 🐛 Known Issues

- Git operations may require Xcode Command Line Tools on macOS
- Hierarchical clustering may briefly show browser "Page Unresponsive" warning for large matrices (>1000 rows) - warning resolves automatically
- eFDR analysis is computationally intensive for high permutation counts (expected behavior)

---

## 🔮 Future Enhancements

Based on user feedback, we're considering:
- Additional export formats (JSON, R-compatible)
- Batch processing for multiple datasets
- Integration with popular bioinformatics workflows (Galaxy, Bioconductor)
- Cloud-based computation for larger matrices
- Additional clustering algorithms
- Rank-k (multi-dimensional) sparse SVD

**Have suggestions?** Open an issue on GitHub!

---

## 📝 Citation

If you use SSVD1x in your research, please cite:

```
SSVD1x: A Web-Based Tool for Sparse Singular Value Decomposition with FDR Validation
Version 1.0.0 (2025)
GitHub: https://github.com/gokimoto123/ssvd1x
Live Application: https://gokimoto123.github.io/ssvd1x/
```

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/gokimoto123/ssvd1x/issues)
- **Questions**: Open a GitHub Discussion
- **Feature Requests**: Submit via GitHub Issues

---

## 📜 License

MIT License - Free and open source

See [LICENSE](LICENSE) for full details.

---

## 🚀 Getting Started

**Ready to find signals in your data?**

1. Visit https://gokimoto123.github.io/ssvd1x/
2. Try a demo dataset (we recommend "SNR -15 dB" for a quick test)
3. Upload your own CSV data matrix
4. Select analysis mode and parameters
5. Explore results interactively
6. Export publication-ready reports

**No sign-up. No installation. No cost.**

---

**Happy analyzing!** 🎉

---

*Version 1.0.0 released November 20, 2025*
