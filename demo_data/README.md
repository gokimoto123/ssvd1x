# SSVD1x Demo Datasets

This folder contains 5 demo datasets in CSV format for showcasing SSVD1x features and capabilities. Four of the datasets are synthetic with a noisy step signal contained in 50 randomly selected rows as described in the associated groundtruth files with the remaining 950 matrix rows containing only Gaussian noise. 

Also included in this folder is a large, real-world gene expression dataset composed of ~19K genes measured in 368 liver tumors. This dataset is fully pre-processed and ready for analysis by the SSVD algorithm. 

All demo datasets have labeled rows and columns that are extracted prior to analysis and preserved for downstream analysis and interpretation.

In practice, sparse signal detection has high specificity (>95%) because most matrix rows contain only noise and you're correctly not detecting them. The challenge is achieving high sensitivity (finding all 50 signal rows) while maintaining high precision (not getting too many false positives). 

## Dataset Overview

- **4 Synthetic Datasets**: 1000×100 matrices with 50 embedded step-function signals
- **1 Real Dataset**: 19,120×368 gene expression matrix from The Cancer Genome Atlas (TCGA)

---

## Synthetic Datasets (1000 × 100)

All synthetic datasets share these characteristics:
- **Dimensions**: 1000 features (rows) × 100 samples (columns)
- **Embedded Signal**: 50 step-function features (**randomly selected**, not consecutive)
- **Sparsity**: 5% (50/1000 features contain signal)
- **Headers**: Row labels (1-1000) + column labels (sample 1-100) included in CSV
- **Ground Truth**: Corresponding `ground_truth_SNRneg(*).csv` file lists which features contain signal along with other metadata
- **fSNR Formula**: fSNR (dB) = 10 x log10(FrobNrm(S)^2 / FrobNrm(N)^2) where: (1) FrobNrm(S) = Frobenius norm of the signal-only matrix S; and (2) FrobNrm(N) = Frobenius norm of noise-only matrix. 

### 1. dataset_1000x100_step_SNRneg5.csv

- **File Size**: ~923 KB
- **fSNR**: -5.07 dB (strong signal)
- **Signal Scale**: 2.5
- **Noise Variance**: 1.0
- **Difficulty**: ⭐ Easy - signals are easily detectable
- **Best For**: First-time users, quick testing, learning the interface
- **Ground Truth**: `ground_truth_SNRneg5.csv`

### 2. dataset_1000x100_step_SNRneg15.csv ⭐ RECOMMENDED

- **File Size**: ~922 KB
- **fSNR**: -15 dB (moderate signal)
- **Signal Scale**: ~0.8
- **Noise Variance**: 1.0
- **Difficulty**: ⭐⭐ Moderate - realistic biomarker discovery scenario
- **Best For**: General demonstrations, tutorials, first-time eFDR analysis
- **Ground Truth**: `ground_truth_SNRneg15.csv`

### 3. dataset_1000x100_step_SNRneg20.csv

- **File Size**: ~928 KB
- **fSNR**: -20 dB (weak signal)
- **Signal Scale**: 0.45
- **Noise Variance**: 1.0
- **Difficulty**: ⭐⭐⭐ Challenging - requires careful parameter tuning
- **Best For**: Testing algorithm sensitivity, advanced parameter exploration
- **Ground Truth**: `ground_truth_SNRneg20.csv`

### 4. dataset_1000x100_step_SNRneg25.csv

- **File Size**: ~929 KB
- **fSNR**: -25 dB (very weak signal)
- **Signal Scale**: 0.25
- **Noise Variance**: 1.0
- **Difficulty**: ⭐⭐⭐⭐ Difficult - demonstrates detection limits
- **Best For**: Performance benchmarking, testing edge cases
- **Ground Truth**: `ground_truth_SNRneg25.csv`

---

## Real Gene Expression Dataset

### 5. dataset_genes_369HCC_preproc.csv

- **Dimensions**: 19,120 genes × 368 patients
- **File Size**: ~77 MB
- **Source**: TCGA Hepatocellular Carcinoma (HCC) study
- **Preprocessing**: zero-filtered, glog-transformed, quantile normalized, centered, and Frobenius normlized gene expression values
- **Headers**: Gene symbols (rows) + TCGA patient IDs (columns)
- **Purpose**: Demonstrates real-world clinical biomarker discovery workflow
- **Load Time**: ~5 seconds (tested in modern browsers)
- **Ground Truth**: Not available (real clinical data)

**Clinical Context**: This dataset contains genome-wide, gene expression profiles for hepatocellular carcinoma in 368 patients. SSVD1x will identify small subsets of genes that act as multi-variate predictors of clinical outcomes and overall survival.

---

## Ground Truth Files (Synthetic Data Only)

Each synthetic dataset has a corresponding `ground_truth_SNRneg(*).csv` file that identifies which matrix rows contain the embedded signal. Information provided include signal type, signal scale, and noise variance for each signal row. Useful for quantifying the performance of the SSVD algorithm. 

### File Format

```csv
feature_index, signal_type, signal_scale, noise_variance
14,step,2.50,1.0
16,step,2.50,1.0
20,step,2.50,1.0
.
.
.
201,ramp,1.75,1.0
255,double-peak,1.25,1.0 
...
```

### Important: Signal Features are Randomly Distributed

The 50 signal features are **randomly selected** from the 1000 total features, NOT the first 50 rows. Each dataset has **different random signal positions**.

For example, in `dataset_1000x100_step_SNRneg5.csv`, the signal features might be at indices: 14, 16, 20, 52, 76, 129, 138, 152, 185, 186, ... (randomly distributed across 0-999).

### How to Validate Your Detection Results

1. **Run SSVD analysis** on a synthetic dataset
2. **Download ground truth file** corresponding to your dataset
3. **Get true signal indices**: from groundtruth file 
4. **Compare detections**: Check which of the features detected by the algorithm are on the list of true signal rows 
5. **Calculate metrics**:
   - **True Positives (TP)**: Detected features that are in ground truth
   - **False Positives (FP)**: Detected features NOT in ground truth
   - **False Negatives (FN)**: Ground truth features you missed (50 - TP)
   - **Sensitivity (Recall)**: TP / 50  (what % of true signals did you find?)
   - **Precision**: TP / (TP + FP)  (what % of your detections are real?)

### Ground Truth File Mapping

- `ground_truth_SNRneg5.csv` → validates `dataset_1000x100_step_SNRneg5.csv`
- `ground_truth_SNRneg15.csv` → validates `dataset_1000x100_step_SNRneg15.csv`
- `ground_truth_SNRneg20.csv` → validates `dataset_1000x100_step_SNRneg20.csv`
- `ground_truth_SNRneg25.csv` → validates `dataset_1000x100_step_SNRneg25.csv`

### How to Download Ground Truth Files

**Method 1: Via GitHub Website (Easiest)**

1. Click on any ground truth file link below
2. Click the **"Download raw file"** button (top right of file view)
3. File downloads to your Downloads folder

**Direct links:**
- [ground_truth_SNRneg5.csv](https://github.com/gokimoto123/ssvd1x/blob/main/demo_data/ground_truth_SNRneg5.csv)
- [ground_truth_SNRneg15.csv](https://github.com/gokimoto123/ssvd1x/blob/main/demo_data/ground_truth_SNRneg15.csv)
- [ground_truth_SNRneg20.csv](https://github.com/gokimoto123/ssvd1x/blob/main/demo_data/ground_truth_SNRneg20.csv)
- [ground_truth_SNRneg25.csv](https://github.com/gokimoto123/ssvd1x/blob/main/demo_data/ground_truth_SNRneg25.csv)

**Method 2: Using Command Line (For Scripts/Automation)**

```bash
# Download specific ground truth file
curl -O https://raw.githubusercontent.com/gokimoto123/ssvd1x/main/demo_data/ground_truth_SNRneg15.csv

# Or download all ground truth files at once
for snr in 5 15 20 25; do
  curl -O https://raw.githubusercontent.com/gokimoto123/ssvd1x/main/demo_data/ground_truth_SNRneg${snr}.csv
done
```

**Method 3: Clone Entire Repository**

```bash
git clone https://github.com/gokimoto123/ssvd1x.git
cd ssvd1x/demo_data
ls ground_truth*.csv
```

---

## Recommended Demo Parameters

### For Synthetic Datasets

**Purpose**: Illustrate application features with reasonable computation time

- **1-Alpha Mode**: Analyze data based on a selected alpha between 0 and  alphaMax
- **N-Alpha Mode**: Sequentially analyze 35 alphas from 0 to alphaMax and select "best" alpha based on detection and gradient dynamics over the alphas.
- **eFDR Mode**: Sequentially compute eFDR for 25 alphas based on 10 permutations and select "best" alpha based on eFDR, detection and gradient dynamics on the alphas
- **eFDR for selected alpha**: eFDR for a selected alpha is recommended but optional for 1-Alpha and N-Alpha analysis. eFDR is automatic in eFDR mode. 

**Expected Results**:
- At optimal alpha: ~50 detections (±10 depending on SNR level)
- Easier datasets (SNR -5, -15): Higher sensitivity/precision => more true detections, less false positives
- Harder datasets (SNR -20, -25): Lower sensitivity, more challenging => fewer true detections, more false positives

### For Real Gene Expression Dataset

**Purpose**: Demonstrate scalability and real-world workflow in a large dataset

- **1-Alpha Mode**: Try any alpha value less than alphaMax and compute individual eFDR for selected alpha based on number of detections
- **N-Alpha Mode**: Analyze data on a monotonically increasing sequence of 25 alphas from 0 to alphaMax (an alpha ladder) and select best alpha based on detection dynamics and detection gradient on the alpha ladder
- **eFDR Mode**:  Compute eFDR on an alpha-ladder of 20 alphas based on 5 permutations per alpha and select best alpha based on eFDR, detection or detection gradient on the alpha ladder. 

**Note for Production Use**: For publishable research results, increase permutations to greater than 30.

---

## Usage Instructions

### Via SSVD1x Web Application

1. Visit https://gokimoto123.github.io/ssvd1x/
2. Scroll to "Load Demo Dataset" section
3. Click button for desired dataset
4. Application loads dataset automatically (~1-2 sec for synthetic, ~5 sec for gene dataset)
5. Review data statistics and histograms in MatrixDataReview screen
6. Click "Proceed to Analysis"
7. Select analysis mode (1-Alpha, N-Alpha, or eFDR)
8. Application auto-fills recommended default parameters
9. Run analysis

### Manual Download

You can also download these datasets directly from GitHub:

```
https://github.com/gokimoto123/ssvd1x/tree/main/demo_data
```

Then upload via the file picker in the SSVD1x application.

---

## Example Workflow: Validation with Ground Truth

**Goal**: Run eFDR analysis on SNRneg15 dataset and validate detection performance

### Step 1: Load Dataset
- Click "SNR -15 dB (Moderate)" button
- Review matrix statistics (1000×100)
- Note: Row statistics histograms show ~50 outlier features (the signals!)

### Step 2: Run N-Alpha Analysis (fastest & accurate)
- Proceed to Analysis 
- Select "Multi-Alpha Analysis 
- Select w/o Permutations (N-Alpha analysis)"
- Set parameter: 35 alphas
- Click "Start N-Alpha Analysis"
- Wait for completion (~2-3 minutes)

### Step 3: Select Optimal Alpha
- Review N-Alpha table - look for interval of alphas where detections are linear or detection gradient is small and constant
- Hover & click on first or second alpha value within this interval that has at least 10 detections
- View displayed results for the selected alpha
- Download ZIP file of detection results for selected alpha

### Step 4: Download Ground Truth
- Download groundtruth from this repository
- Open in spreadsheet or text editor
- Extract the `feature_index` values (these are the rows that contain signal)

### Step 5: Compare detections agains ground truth
- Compare indices of your detected rows against those of signal rows (groundtruth)
- Calculate True Positives (TP): # of detected rows that ARE signal rows
- Calculate False Positives (FP): # of detected rows that were NOT signal rows
- Calculate True Negatives (TN): 1000 - 50 - FP (non-signal rows that were correctly undetected)
- Calculate False Negatives (FN): 50 - TP (signal rows  that were NOT detected 
- Sensitivity = TP/50
- Specificity = TN/950
- Precision = TP/(TP + FP)
- F1 Score = harmonic mean of precision and sensitivity
- ROC Curve = Plot TP vs FP 
- Area Under the ROC Curve (AUC) = area under the ROC (AUC)
- For SNRneg15 at optimal alpha, expect an AUC near 0.90
---
## Dataset Purpose

These demo datasets enable users to:

✓ **Explore features of the application** without preparing their own data
✓ **Learn the workflow** with predictable synthetic data
✓ **Validate algorithm** performance against known ground truth
✓ **Test scalability** with large real-world gene expression data
✓ **Understand trade-offs** between different analysis modes
✓ **Showcase capabilities** for presentations, tutorials, publications

**Important**: These datasets and recommended parameters are optimized for **showcasing application features**, not for final production research results.

---

## Technical Notes

### CSV Format
- All datasets include row and column headers
- First row: column headers (empty cell + sample/patient IDs)
- First column: row labels (feature/gene IDs)
- Data matrix starts at row 2, column 2 in the CSV file

### Synthetic Data Generation
- Generated signal-only matrix, S, where 50 rows out of 1000 were randomly selected to contain a scaled, noise-free step function and all other rows contained all zeros 
- Generated a noise-only matrix where all entries were sampled from a Gaussian random variable of mean zero and variance one
- Signal scale adjusted to achieve target fSNR defined by: fSNR = 10 x log10(frob(S)^2 /frob(N)^2) where frob(x) is the Frobenius norm of the matrix x.

### Browser Compatibility
- Tested on Chrome, Firefox, Safari, Edge (latest versions)
- Large dataset (77 MB gene data) works well in modern browsers with sufficient RAM
- Recommended: 8GB+ RAM for smooth performance with gene expression dataset

---

## Questions or Issues?

- **Application Issues**: https://github.com/gokimoto123/ssvd1x/issues
- **Dataset Questions**: Open an issue with tag `demo-data`
- **Documentation**: https://github.com/gokimoto123/ssvd1x/

---

**Last Updated**: November 17, 2025
**SSVD1x Version**: 1.0
