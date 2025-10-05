# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SSVD1x is a React-based web application for **Sparse Singular Value Decomposition (SSVD)** with **empirical False Discovery Rate (eFDR)** and **alph-path analysis** originally developed for biomarker discovery in high-dimensional data matrices. This is a scientific research tool that identifies a small subset of matrix rows (i.e., variables) out of many thousands that contain a common signal of interest using L1 regularization across the matrix rows/variables that preseves the common signal on the columns/samples. 

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
- Navigate to `http://localhost:8000` or other availabler server in a web browser
- Open the current working HTML file (check session documents for filename)
- The application runs entirely in the browser with no build process required

### Testing
- Manual testing through browser interaction
- No formal test framework is configured
- Multiple test files exist for different functionality levels

## Architecture Overview

### Technology Stack
- **Frontend Framework**: React 18 with JSX
- **Styling**: Tailwind CSS + custom CSS
- **Build System**: None (uses Babel Standalone for JSX transformation)
- **Deployment**: Static files served via Python HTTP server
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

### Application Structure
- **Single HTML File**: Complete application contained in one HTML file
- **Self-Contained**: No external dependencies beyond CDN-loaded libraries  
- **Component Architecture**: React components for UI, algorithms implemented in vanilla JavaScript
- **No Build Process**: Babel Standalone transforms JSX in real-time

### Core Implementation
**Single Component Architecture**: The application contains:
- **Matrix Operations**: Custom linear algebra utilities (multiply, transpose, norm)
- **SVD Implementation**: Power iteration method for singular value decomposition  
- **SSVD Algorithm**: Sparse matrix factorizations of rank1 (SSVD1) based iterative soft thresholding of singular vectors (proximal function of L1 regularizatiob)
- **eFDR Analysis**: Estimate empirical false discovery rate (eFDR) for each alpha of alpha-ladder (i.e., increasing sequence of alpha values starting from 0 and ending at alphaMax) using permutation testing
- **Alpha Analysis**: Compute detections and detection gradient for each alpha of alpha-ladder
- **UI Components**: Interactive parameter controls, progress indicators, visualization of results

**Key Algorithms**:
- `svd1()`: Basic SVD using power iteration method
- `SSVDR1Algorithm()`: Main sparse SVD algorithm for sparsity parameter alpha
- `runFDRAnalysis()`: Permutation-based FDR analysis across multiple alpha values
- `permuteMatrixRows()`: Matrix row permutation for null hypothesis testing

## Application Workflow
1. **Upload Data Matrix**: Various formats allowed including CSV, spreadsheets, etc.
2. **Examine Data Statistics**: Various histograms and statistics are generated
3. **Select Analysis Mode**: Single- or multi-alpha analysis
1. **Multi-Alpha Analysis**: define mininum alpha, maximum alpha, generate alpha "ladder", pi0 = expected 
2. **Alpha or eFDR Analysis**: Run algorithm on alpha ladder
2. ***eFDR Analysis***: Estimate FDR (eFDR) for each alpha with permutations
4. ***Alpha Analysis***: Compute detections and detection gradient for each alpha w/o permutations
5. **Analysis Results**: List of detections by index, heat map of solution submatrix (same as SSVD1 app)
6. **Export Results**: same as previously developed SSVD1 application 

## Key Configuration Parameters

**Alpha Configuration**: Set minimum alpha, maximum alpha (by formula), number of alphas, define sequence of increasing alphas starting with minimum alpha and ending with maximum alphaA

## Scientific Context

This application implements sparse version of the SVD for biomarker discovery in a P x N data matrix where we assume K signal rows where:
- P >> N (many more variables than samples)
- K ≪ P (sparse embedded signal)
- Typical applications: High-dimensional ML applications with limited samples; genomics, proteomics, diagnostic and predictive biomarkers

## Development Notes

- **No Build Process**: Application uses Babel Standalone for in-browser JSX transformation
- **Pure JavaScript**: All algorithms implemented in vanilla JavaScript with no external math libraries
- **Browser-Only**: No server-side computation required
- **Memory Limitations**: Handles matrices up to approximately 1000×100 efficiently
- **Performance**: Real-time parameter updates, ~2-3 second initial load time

## Common Issues

- **Blank Page**: Check browser console for JavaScript errors
- **Long Analysis Time**: Need to speedup eFDR analysis by parallel batching and other methods
- **UI Control Issues**: Unneeded controls; controls that don't work as expected
- **Context Window Limits**: Frequently runs out of context window space

## Browser Requirements

- Modern JavaScript support (ES6+)
- No additional plugins or extensions required
- Works offline once loaded
- Responsive design supports various screen sizes

## Working with This Codebase

### Code Style
- Be concise in responses to save context window space
- Focus on functionality over verbose explanations
- Use existing libraries and patterns already in latest versions of this application
- Follow security best practices (never expose secrets or keys)

### Common Patterns
- React components use functional components with hooks
- Algorithm implementations are separate from UI components
- State management through React context where appropriate
- Manual testing through browser interaction

### Mathematical Algorithm Development Rules

**CRITICAL**: Initially, prioritize mathematical correctness over UI/performance issues.

#### **1. Always Check Mathematical Foundations First**
When users report mathematical inconsistencies (e.g., "alphaMax values changed", "eFDR looks wrong"):
- **Immediately audit core algorithms** before touching UI/performance code
- **Question existing mathematical code** rather than assuming it's correct
- **Prioritize mathematical correctness** over other issues like styling or performance

#### **2. Use Systematic Investigation for Mathematical Problems**
For any mathematical issues, follow this order:
1. **Map dependencies** (e.g., alphaMax → SVD → matrix operations)
2. **Verify each layer** from bottom-up (core math functions first)

#### **3. Proactive Algorithm Auditing**
When starting work on scientific/mathematical code:
- **Request to review core algorithms early** in each session
- **Look for mathematical red flags** (e.g., oversimplified implementations)
- **Verify implementations match expected mathematical formulas**
- **Check that algorithm implementations use proper numerical methods**

#### **4. Context Window Awareness**
Due to context limitations:
- **Explicitly ask to examine mathematical functions** when issues arise
- **Don't get distracted by UI issues** when core math might be wrong
- **Remember that inherited code may contain mathematical errors**
- **Prioritize algorithm verification over component debugging**

**Example**: If user reports "alphaMax values are wrong", immediately check the SVD implementation and alphaMax calculation formula before investigating UI rendering or performance issues.

#### **5. Algorithmic Fingerprinting System**
The working HTML file contains algorithmic fingerprints embedded in core mathematical functions:
- **SVD_v2.1_VALIDATED**: Power iteration implementation with convergence criteria
- **SSVD-R1_v1.3_VALIDATED**: Sparse SVD with I/O specifications
- **ALPHAMAX_v1.2_VALIDATED**: Sparsity parameter calculation with expected ranges
- **FDR_ANALYSIS_v2.0_VALIDATED**: Permutation testing with monotonicity checks

**Fingerprint Maintenance Rules**:
- **Update version numbers** when modifying mathematical functions
- **Update validation criteria** if algorithm performance characteristics change
- **Preserve mathematical contracts** described in fingerprint comments
- **Never remove fingerprints** - they provide critical continuity context

#### **6. Mathematical Regression Suite**
The working HTML file contains a comprehensive regression test suite accessible via UI:
- **Test Coverage**: SVD convergence, alphaMax bounds, SSVD sparsity, performance benchmarks
- **UI Access**: Green "🧪 Run Tests" button in main application header
- **Console Output**: Detailed pass/fail results with timing and validation details
- **Usage**: Run `runMathRegressionSuite()` or click UI button before algorithm changes

**Regression Testing Rules**:
- **Run before modifications** - All tests must pass before changing mathematical functions
- **Update test expectations** if legitimate algorithm improvements change performance baselines
- **Never commit breaking changes** - Failing regression tests indicate mathematical errors
- **Console monitoring** - Review detailed test output for mathematical validation

## Code Output Guidelines

- Be concise in responses to save context window space for implementation
- Do NOT show lengthy code snippets or file dumps unless specifically needed for discussion
- Use brief confirmations like "✅ Changes applied" instead of displaying full tool outputs
- Focus on summarizing what was done and asking for next steps
- Reserve context space for actual feature development rather than verbose code display

## Session Documentation Standards

### Session Summary Requirements
When writing session summaries, **always include a "Current File Structure" section** showing:
- Current working file clearly marked with comment
- Key guidance files (CLAUDE.md)
- Other reference files that provide additional context (e.g., planning file for optimization of eFDR analysis)
- This ensures future sessions can quickly identify working files and understand project layout without outdated file structure references in the main guidance files.

## Getting Current Status

To understand the current state of the project, check session summary files for recent progress and current file structure.