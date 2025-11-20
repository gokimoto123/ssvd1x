# CLAUDE.md

This file provides guidance to Claude Code when working with the SSVD1x codebase.

---

## Quick Reference

- **Working File**: `current_optimized.html` (check session summaries)
- **Demo Data**: `./demo_data/` (4 synthetic + 1 gene expression dataset)
- **Server**: `python3 -m http.server 8000` → `http://localhost:8000/current_optimized.html`
- **Golden Rule**: Prioritize mathematical correctness over UI/performance

---

## Project Overview

SSVD1x is a browser-based sparse SVD application for biomarker discovery in high-dimensional data (P >> N). It identifies sparse signal-bearing rows from P×N matrices using L1 regularization and provides statistical validation via empirical False Discovery Rate (eFDR) analysis.

**Tech Stack**: React 18 + Babel Standalone (no build), Tailwind CSS, vanilla JS for algorithms
**Problem**: Find K << P signal rows in P×N matrix where P >> N (e.g., 1000×100, 5% sparsity)
**Applications**: Genomics, proteomics, clinical biomarker discovery

---

## Analysis Modes

### 1. Single-Alpha (1-Alpha)
- Single user-specified alpha value
- Fastest (~seconds)
- Optional eFDR for selected alpha
- **Use when**: Quick exploration, known optimal alpha

### 2. Multi-Alpha (N-Alpha)
- Alpha ladder (0 to alphaMax)
- Tracks detections + gradients
- No permutations (faster)
- **Use when**: Exploring detection dynamics

### 3. eFDR Analysis
- N-Alpha + permutation testing
- Computes eFDR per alpha
- Most intensive (~minutes)
- **Use when**: Statistical validation needed

**Key**: eFDR Analysis = N-Alpha Analysis + Permutation Testing

---

## Core Algorithms

- **svd1()**: Power iteration SVD
- **SSVDR1Algorithm()**: Sparse rank-1 factorization via soft thresholding
- **runFDRAnalysis()**: Permutation-based eFDR estimation
- **permuteMatrixRows()**: Row permutation for null hypothesis

**Algorithmic Fingerprints** (version tags in code):
- SVD_v2.1_VALIDATED
- SSVD-R1_v1.3_VALIDATED
- ALPHAMAX_v1.2_VALIDATED
- FDR_ANALYSIS_v2.0_VALIDATED

---

## Mathematical Development Rules

### CRITICAL: Math First, UI Second

When users report mathematical issues:
1. **Audit algorithms immediately** before touching UI
2. **Question existing code** - inherited code may have errors
3. **Map dependencies** (e.g., alphaMax → SVD → matrix ops)
4. **Verify bottom-up** (core math → derived functions)

### Fingerprint Maintenance
- Update version numbers when modifying math functions
- Never remove fingerprints
- Preserve mathematical contracts in comments

### Regression Testing
- Run tests BEFORE modifying algorithms
- Access via UI button: 🧪 Run Tests
- Console shows detailed validation
- Failing tests = mathematical errors

---

## Code Style

**Context Management**:
- Be concise to save context window
- No lengthy code snippets unless necessary
- Brief confirmations: "✅ Changes applied"
- Reserve space for implementation

**Development**:
- Use existing patterns from latest app version
- Don't break existing features when adding new ones
- Ask questions if prompt is vague or unclear
- Follow security best practices

**React Patterns**:
- Functional components with hooks
- Algorithms separate from UI
- Manual browser testing

---

## Session Documentation

When writing session summaries, include:
- Current working file (clearly marked)
- Key guidance files (CLAUDE.md)
- Recent session summaries for context
- File structure snapshot

Check session summaries for current project state.

---

## Common Pitfalls to Avoid

❌ Don't assume inherited math code is correct
❌ Don't get distracted by UI when core math might be wrong
❌ Don't skip regression tests before algorithm changes
❌ Don't remove algorithmic fingerprints
✅ Always verify mathematical foundations first
✅ Always check session summaries for current context
✅ Always run regression suite before math changes
