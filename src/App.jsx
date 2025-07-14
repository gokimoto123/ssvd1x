// SSVD-R1: Sparse Singular Value Decomposition for Biomarker Discovery
// Adapted from artifact code for browser environment

// Matrix operations utilities
const matrixMultiply = (A, B) => {
  if (!A.length || !B.length || A[0].length !== B.length) {
    throw new Error('Invalid matrix dimensions for multiplication');
  }
  const result = Array(A.length).fill().map(() => Array(B[0].length).fill(0));
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      for (let k = 0; k < B.length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
};

const transpose = (matrix) => {
  if (!matrix.length || !matrix[0].length) return [];
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

const norm = (vector) => {
  return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
};

// SVD implementation
const svd1 = (X) => {
  if (!X.length || !X[0].length) {
    throw new Error('Empty matrix provided to SVD');
  }
  
  const XT = transpose(X);
  const XTX = matrixMultiply(XT, X);
  
  let v = Array(XTX.length).fill().map(() => Math.random() - 0.5);
  let vnorm = norm(v);
  if (vnorm === 0) {
    v = Array(XTX.length).fill().map((_, i) => i === 0 ? 1 : 0);
    vnorm = 1;
  }
  v = v.map(x => x / vnorm);
  
  let prevV = [...v];
  for (let i = 0; i < 200; i++) {
    const newV = XTX.map(row => row.reduce((sum, val, idx) => sum + val * v[idx], 0));
    vnorm = norm(newV);
    if (vnorm === 0) break;
    v = newV.map(x => x / vnorm);
    
    const diff = v.reduce((sum, val, idx) => sum + Math.abs(val - prevV[idx]), 0);
    if (diff < 1e-10) break;
    prevV = [...v];
  }
  
  const u = X.map(row => row.reduce((sum, val, idx) => sum + val * v[idx], 0));
  const unorm = norm(u);
  if (unorm === 0) {
    return { u: Array(X.length).fill(0), s: 0, v };
  }
  const uNormalized = u.map(x => x / unorm);
  
  const s = Math.abs(uNormalized.reduce((sum, val, idx) => sum + val * X[idx].reduce((s2, v2, j) => s2 + v2 * v[j], 0), 0));
  
  return { u: uNormalized, s, v };
};

// SSVD-R1 Algorithm
const SSVDR1Algorithm = ({ matrix, alpha, maxIter = 5000, tolerance = 0.0001 }) => {
  if (!matrix || !matrix.length || !matrix[0].length) {
    throw new Error('Invalid matrix provided');
  }
  
  const { u: u0, s: s0, v: v0 } = svd1(matrix);
  
  let u = [...u0];
  let v = [...v0];
  let uPrev = [...u0];
  let aPrev = matrixMultiply(u0.map(x => [x * s0]), [v0]);
  
  let iterCount = 0;
  let error = 1;
  const errors = [];
  const sparsityHistory = [];
  const singularValues = [];
  
  while (error > tolerance && iterCount < maxIter) {
    iterCount++;
    
    const XT = transpose(matrix);
    v = XT.map(row => row.reduce((sum, val, idx) => sum + val * u[idx], 0));
    const vNorm = norm(v);
    if (vNorm > 0) {
      v = v.map(x => x / vNorm);
    }
    
    u = matrix.map(row => row.reduce((sum, val, idx) => sum + val * v[idx], 0));
    u = u.map(x => Math.sign(x) * Math.max(Math.abs(x) - alpha, 0));
    const uNorm = norm(u);
    if (uNorm > 0) {
      u = u.map(x => x / uNorm);
    }
    
    const sval = u.reduce((sum, uVal, i) => 
      sum + uVal * matrix[i].reduce((s2, xVal, j) => s2 + xVal * v[j], 0), 0);
    
    const nonZeros = u.filter(val => Math.abs(val) > 1e-10).length;
    const sparsity = (u.length - nonZeros) / u.length;
    sparsityHistory.push(sparsity);
    singularValues.push(Math.abs(sval));
    
    const a = matrixMultiply(u.map(x => [x * Math.abs(sval)]), [v]);
    
    error = 0;
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[0].length; j++) {
        const diff = a[i][j] - aPrev[i][j];
        error += diff * diff;
      }
    }
    error = Math.sqrt(error);
    errors.push(error);
    
    if (isNaN(error) || !isFinite(error)) {
      console.warn('Numerical instability detected');
      break;
    }
    
    uPrev = [...u];
    aPrev = a.map(row => [...row]);
  }
  
  const finalS = Math.abs(u.reduce((sum, uVal, i) => 
    sum + uVal * matrix[i].reduce((s2, xVal, j) => s2 + xVal * v[j], 0), 0));
  
  return {
    u,
    s: finalS,
    v,
    iterations: iterCount,
    converged: error <= tolerance,
    errors,
    sparsityHistory,
    singularValues
  };
};

// Permutation function for FDR analysis
const permuteMatrixRows = (matrix) => {
  const permuted = matrix.map(row => [...row]);
  
  for (let i = 0; i < permuted.length; i++) {
    for (let j = permuted[i].length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [permuted[i][j], permuted[i][k]] = [permuted[i][k], permuted[i][j]];
    }
  }
  
  return permuted;
};

// FDR Analysis Implementation
const runFDRAnalysis = async ({ matrix, alpha0, alphaMax, Nalpha, Nperm, nsupp, onProgress, trueSignalRows }) => {
  const P = matrix.length;
  const pi0 = (P - nsupp) / P;
  
  const alphaValues = [];
  for (let i = 0; i < Nalpha; i++) {
    const alpha = alpha0 + (alphaMax - alpha0) * i / (Nalpha - 1);
    alphaValues.push(alpha);
  }
  
  const results = [];
  let totalProgress = 0;
  const totalRuns = Nalpha * (1 + Nperm);
  
  for (let alphaIdx = 0; alphaIdx < alphaValues.length; alphaIdx++) {
    const alpha = alphaValues[alphaIdx];
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const originalResult = SSVDR1Algorithm({ matrix, alpha, maxIter: 1000, tolerance: 0.001 });
    const detectedRows = originalResult.u.map((val, idx) => Math.abs(val) > 1e-6 ? idx : -1).filter(idx => idx !== -1);
    const originalDetections = detectedRows.length;
    
    const tp = detectedRows.filter(row => trueSignalRows.includes(row)).length;
    const fp = detectedRows.filter(row => !trueSignalRows.includes(row)).length;
    const fn = trueSignalRows.filter(row => !detectedRows.includes(row)).length;
    const tn = P - tp - fp - fn;
    
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const accuracy = P > 0 ? (tp + tn) / P : 0;
    const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    
    totalProgress++;
    if (onProgress) onProgress((totalProgress / totalRuns) * 100);
    
    const permDetections = [];
    for (let perm = 0; perm < Nperm; perm++) {
      try {
        if (perm % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        const permMatrix = permuteMatrixRows(matrix);
        const permResult = SSVDR1Algorithm({ matrix: permMatrix, alpha, maxIter: 1000, tolerance: 0.001 });
        const detections = permResult.u.filter(val => Math.abs(val) > 1e-6).length;
        permDetections.push(detections);
      } catch (error) {
        console.warn(`Permutation ${perm} failed for alpha ${alpha}:`, error);
        permDetections.push(0);
      }
      
      totalProgress++;
      if (onProgress) onProgress((totalProgress / totalRuns) * 100);
    }
    
    const meanPermDetections = permDetections.reduce((sum, val) => sum + val, 0) / permDetections.length;
    const expectedFalsePos = pi0 * meanPermDetections;
    const fdr = originalDetections > 0 ? expectedFalsePos / originalDetections : 0;
    const fdrPercentage = Math.min(fdr * 100, 100);
    
    results.push({
      alpha,
      originalDetections,
      meanPermDetections,
      expectedFalsePos,
      fdr: fdrPercentage,
      precision: precision,
      accuracy: accuracy,
      f1Score: f1Score,
      permDetections,
      sparsity: ((P - originalDetections) / P) * 100
    });
  }
  
  return {
    results,
    alphaValues,
    pi0,
    totalRuns
  };
};

// Main SSVD-R1 Analyzer Component
function SSVDR1Analyzer() {
  const { useState, useMemo } = React;
  
  const [P, setP] = useState(1000);
  const [N, setN] = useState(100);
  const [K, setK] = useState(50);
  const [signalScale, setSignalScale] = useState(0.6);
  const [noiseVariance, setNoiseVariance] = useState(0.14);
  const [alpha, setAlpha] = useState(0.95);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testMatrix, setTestMatrix] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(null);

  const [Nalpha, setNalpha] = useState(10);
  const [alpha0, setAlpha0] = useState(0);
  const [alphaMaxMultiplier, setAlphaMaxMultiplier] = useState(0.75);
  const [Nperm, setNperm] = useState(10);
  const [nsupp, setNsupp] = useState(50);
  const [isRunningFDR, setIsRunningFDR] = useState(false);
  const [fdrResults, setFdrResults] = useState(null);
  const [fdrProgress, setFdrProgress] = useState(0);
  const [selectedAlpha, setSelectedAlpha] = useState(null);

  const resetApplication = () => {
    setShowModal('reset');
  };

  const confirmReset = () => {
    setP(1000);
    setN(100);
    setK(50);
    setSignalScale(0.6);
    setNoiseVariance(0.14);
    setAlpha(0.95);
    setNalpha(10);
    setAlpha0(0);
    setAlphaMaxMultiplier(0.75);
    setNperm(10);
    setNsupp(50);
    setTestMatrix(null);
    setResults(null);
    setFdrResults(null);
    setSelectedAlpha(null);
    setFdrProgress(0);
    setIsRunning(false);
    setIsGenerating(false);
    setIsRunningFDR(false);
    setShowModal(null);
  };

  const cancelModal = () => {
    setShowModal(null);
  };

  const snr = useMemo(() => {
    const validP = typeof P === 'number' ? P : parseInt(P) || 1000;
    const validK = typeof K === 'number' ? K : parseInt(K) || 50;
    
    if (validK === 0) {
      return -Infinity;
    }
    
    const sigPwr = validK * signalScale * signalScale;
    const noisePwr = validP * noiseVariance;
    return 10 * Math.log10(sigPwr / noisePwr);
  }, [signalScale, noiseVariance, P, K]);

  const alphaMax = useMemo(() => {
    if (!testMatrix) return 0;
    try {
      const { u: u1, s: s1 } = svd1(testMatrix.matrix);
      const maxAbsU1 = Math.max(...u1.map(val => Math.abs(val)));
      const computedAlphaMax = maxAbsU1 * s1;
      return alphaMaxMultiplier * computedAlphaMax;
    } catch (error) {
      console.warn('Could not calculate AlphaMax:', error);
      return 0;
    }
  }, [testMatrix, alphaMaxMultiplier]);

  const generateTestMatrix = async () => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (K > P) {
        alert('K (Active Rows) cannot be greater than P (Variables)');
        setIsGenerating(false);
        return;
      }
      
      const matrix = Array(P).fill().map(() => 
        Array(N).fill().map(() => {
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          return z0 * Math.sqrt(noiseVariance);
        })
      );
      
      const selectedRows = [];
      while (selectedRows.length < K) {
        const row = Math.floor(Math.random() * P);
        if (!selectedRows.includes(row)) {
          selectedRows.push(row);
        }
      }
      selectedRows.sort((a, b) => a - b);
      
      selectedRows.forEach(rowIdx => {
        for (let j = 0; j < N; j++) {
          const stepValue = j < N/2 ? -signalScale : signalScale;
          matrix[rowIdx][j] += stepValue;
        }
      });
      
      setTestMatrix({ matrix, selectedRows });
      setResults(null);
      setFdrResults(null);
      setSelectedAlpha(null);
    } catch (error) {
      console.error('Error generating matrix:', error);
      alert('Error generating test matrix');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFDRAnalysis = async () => {
    if (!testMatrix) {
      alert('Please generate test data first!');
      return;
    }
    
    setIsRunningFDR(true);
    setFdrProgress(0);
    
    try {
      const fdrResult = await runFDRAnalysis({
        matrix: testMatrix.matrix,
        alpha0,
        alphaMax,
        Nalpha,
        Nperm,
        nsupp,
        trueSignalRows: testMatrix.selectedRows,
        onProgress: setFdrProgress
      });
      
      setFdrResults(fdrResult);
      setSelectedAlpha(null);
      
    } catch (error) {
      console.error('FDR Analysis failed:', error);
      alert('FDR Analysis failed: ' + error.message);
    } finally {
      setIsRunningFDR(false);
      setFdrProgress(0);
    }
  };

  const handleManualAlphaSelection = async (alphaValue) => {
    if (!testMatrix) return;
    
    setSelectedAlpha(alphaValue);
    setAlpha(alphaValue);
    
    setIsRunning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = SSVDR1Algorithm({
        matrix: testMatrix.matrix,
        alpha: alphaValue,
        maxIter: 5000,
        tolerance: 0.0001
      });
      
      setResults(result);
    } catch (error) {
      console.error('SSVD-R1 failed for selected alpha:', error);
      alert('SSVD-R1 algorithm failed: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const detectedActiveRows = results ? 
    results.u?.map((val, idx) => ({ idx, val: Math.abs(val) }))
           ?.filter(item => item.val > 1e-6)
           ?.sort((a, b) => b.val - a.val)
           ?.map(item => item.idx) || [] : [];

  const accuracy = testMatrix && results && results.u ? 
    testMatrix.selectedRows?.length > 0 
      ? (detectedActiveRows.filter(row => testMatrix.selectedRows?.includes(row)).length / testMatrix.selectedRows?.length * 100).toFixed(1)
      : "N/A"
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Help Modal */}
      {showModal === 'help' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">SSVD-R1 User Guide</h3>
              <button onClick={() => setShowModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">🎯 Purpose</h4>
                <p className="text-gray-600">
                  SSVD-R1 computes a sparse rank1 approximation of a P x N data matrix to find a sparse subset of K signal rows where P ≫ N and K ≪ P. The algorithm identifies biomarker signals that are sparse in the data matrix.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">📋 Quick Start Workflow</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li><strong>Configure test data:</strong> Set P (variables), N (samples), K (signal rows)</li>
                  <li><strong>Configure signal parameters:</strong> Set signal scale and noise variance</li>
                  <li><strong>Generate test data:</strong> Click "Generate Test Data" to create test data matrix</li>
                  <li><strong>Run FDR analysis:</strong> Configure parameters for eFDR analysis and click "Run FDR Analysis"</li>
                  <li><strong>Select optimal alpha:</strong> Click any row in the resulting eFDR table to run SSVD-R1 with selected lambda</li>
                  <li><strong>Analyze results:</strong> Review detection performance and visualizations</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              SSVD-R1: Sparse SVD of Rank-1 Biomarker Discovery
            </h1>
            <p className="text-gray-600 mb-3">
              Sparse Singular Value Decomposition with False Discovery Rate analysis for optimal alpha selection
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>🧬 Biomarker Discovery</span>
              <span>📊 FDR Analysis</span>
              <span>🎯 Research Tool</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowModal('help')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors shadow-md"
            >
              <span>❓</span>
              <span>Help</span>
            </button>
            <button
              onClick={resetApplication}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors shadow-md"
            >
              <span>🔄</span>
              <span>Reset All</span>
            </button>
          </div>
        </div>
        
        {/* Quick Start Guide */}
        {!testMatrix && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
              <span className="text-lg mr-2">🚀</span>
              Quick Start Guide
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Step 1:</strong> Configure matrix dimensions and signal parameters below</p>
              <p><strong>Step 2:</strong> Click "Generate Test Data" to create synthetic biomarker data</p>
              <p><strong>Step 3:</strong> Run FDR Analysis to find optimal detection parameters</p>
              <p><strong>Step 4:</strong> Select alpha values from results table to analyze detection performance</p>
              <p className="text-xs mt-2 text-blue-600">💡 Click the "Help" button above for detailed documentation</p>
            </div>
          </div>
        )}
        
        {/* Configuration Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <span className="text-lg mr-2">📊</span>
              Matrix Dimensions
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                P (Variables/Features)
                <span className="text-xs text-gray-500 ml-1">(e.g., genes, proteins)</span>
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={P}
                onChange={(e) => setP(parseInt(e.target.value) || 1000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                N (Samples/Observations)
                <span className="text-xs text-gray-500 ml-1">(e.g., patients)</span>
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={N}
                onChange={(e) => setN(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                K (True Signal Variables)
                <span className="text-xs text-gray-500 ml-1">(known biomarkers)</span>
              </label>
              <input
                type="number"
                min="0"
                max={P}
                value={K}
                onChange={(e) => setK(Math.max(0, Math.min(P, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 50"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Set to 0 for null hypothesis testing
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <span className="text-lg mr-2">⚙️</span>
              Signal Parameters
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Signal Scale: {signalScale.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.01"
                value={signalScale}
                onChange={(e) => setSignalScale(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Weak (0.1)</span>
                <span>Strong (3.0)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Noise Variance: {noiseVariance.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.01"
                max="3"
                step="0.001"
                value={noiseVariance}
                onChange={(e) => setNoiseVariance(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low (0.01)</span>
                <span>High (3.0)</span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-1">📡 Signal-to-Noise Ratio</p>
              <p className="text-2xl font-bold text-blue-900">
                {K === 0 ? "No Signal" : `${snr.toFixed(2)} dB`}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {K === 0 ? "Perfect for null hypothesis testing" : 
                 snr > 0 ? "Good detectability" : "Challenging detection"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Generate Button */}
        <div className="mb-6">
          <button
            onClick={generateTestMatrix}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Test Data...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="text-lg mr-2">🧬</span>
                Generate Biomarker Test Data
              </span>
            )}
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Creates synthetic data matrix with embedded biomarker signals for analysis
          </p>
        </div>

        {/* Test Matrix Success Message */}
        {testMatrix && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <span className="text-lg mr-2">✅</span>
              Test Data Successfully Generated
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-700">
              <div>
                <p className="font-medium">Matrix Size</p>
                <p>{P} × {N}</p>
              </div>
              <div>
                <p className="font-medium">Signal Variables</p>
                <p>{K} ({(K/P*100).toFixed(1)}%)</p>
              </div>
              <div>
                <p className="font-medium">SNR</p>
                <p>{K === 0 ? "No Signal" : `${snr.toFixed(2)} dB`}</p>
              </div>
              <div>
                <p className="font-medium">Signal Indices</p>
                <p className="text-xs font-mono">{testMatrix.selectedRows?.length > 10 
                  ? `${testMatrix.selectedRows?.slice(0, 10).join(', ')}...` 
                  : testMatrix.selectedRows?.join(', ') || 'None'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the application - only show if test matrix exists */}
      {testMatrix && (
        <div className="space-y-6">
          {/* Sample Signal Visualization */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📈</span>
              Sample Signal Visualization
            </h3>
            <p className="text-gray-600 mb-4">
              {testMatrix.selectedRows.length === 0 ? 
                "No signal rows present (K=0). Perfect for testing null hypothesis scenarios." :
                `Displaying the first signal variable (row ${testMatrix.selectedRows[0]}) with embedded biomarker pattern.`
              }
            </p>
            
            {testMatrix.selectedRows.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-600 mb-2">🔍 Null Hypothesis Scenario</p>
                  <p className="text-sm text-gray-500">No signal rows present - ideal for testing false discovery rates</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-64 border border-gray-300 rounded bg-white relative">
                  <svg width="100%" height="100%" viewBox="0 0 600 200" className="border">
                    <text x="300" y="180" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="500">
                      Sample Signal Data Visualization
                    </text>
                    <text x="20" y="100" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="500" transform="rotate(-90, 20, 100)">
                      Signal Amplitude
                    </text>
                  </svg>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-0.5 bg-blue-600"></div>
                    <span>Observed Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-0.5 bg-green-600 border-t-2 border-dashed border-green-600"></div>
                    <span>True Signal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-0.5 bg-red-500 opacity-70"></div>
                    <span>Noise</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FDR Analysis Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              False Discovery Rate (FDR) Analysis
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                <span className="text-lg mr-2">💡</span>
                Analysis Purpose
              </h4>
              <p className="text-sm text-yellow-700">
                FDR analysis tests multiple alpha values to find optimal sparsity parameters that control false discoveries 
                while maximizing true biomarker detection.
              </p>
            </div>
            
            {/* FDR Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Alpha Range Configuration</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Number of Alpha Values: {Nalpha}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={Nalpha}
                    onChange={(e) => setNalpha(parseInt(e.target.value))}
                    className="w-full"
                    disabled={isRunningFDR}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Minimum Alpha: {alpha0.toFixed(3)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={testMatrix ? (alphaMax/2).toFixed(3) : "0.05"}
                    step="0.001"
                    value={alpha0}
                    onChange={(e) => setAlpha0(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={isRunningFDR}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Maximum Alpha: {testMatrix ? alphaMax.toFixed(3) : 'Generate data first'}
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.01"
                    value={alphaMaxMultiplier}
                    onChange={(e) => setAlphaMaxMultiplier(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={!testMatrix || isRunningFDR}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Permutation Testing</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Permutations: {Nperm}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={Nperm}
                    onChange={(e) => setNperm(parseInt(e.target.value))}
                    className="w-full"
                    disabled={isRunningFDR}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Expected True Signals: {nsupp}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={Math.floor(P/2)}
                    value={nsupp}
                    onChange={(e) => setNsupp(parseInt(e.target.value) || 50)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isRunningFDR}
                  />
                </div>
              </div>
            </div>
            
            {/* FDR Analysis Button */}
            <button
              onClick={handleFDRAnalysis}
              disabled={isRunningFDR}
              className="w-full font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg mb-4"
              style={{
                backgroundColor: isRunningFDR ? '#EAB308' : '#9333EA',
                color: 'white',
                cursor: isRunningFDR ? 'not-allowed' : 'pointer'
              }}
            >
              {isRunningFDR ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running FDR Analysis... {fdrProgress.toFixed(0)}%
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="text-lg mr-2">🔬</span>
                  {fdrResults ? 'Re-run FDR Analysis' : 'Start FDR Analysis'}
                </span>
              )}
            </button>
            
            {/* Progress Bar */}
            {isRunningFDR && (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${fdrProgress}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* FDR Results Placeholder */}
          {fdrResults && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">FDR Analysis Results</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-semibold">✅ FDR Analysis Complete</p>
                <p className="text-green-700 text-sm mt-1">
                  Analyzed {fdrResults.results.length} alpha values with {Nperm} permutations each.
                  Click on table rows below to select optimal alpha values.
                </p>
              </div>
              
              {/* Results Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alpha</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Detections</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">FDR (%)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">F1 Score</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precision</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fdrResults.results.slice(0, 10).map((result, idx) => (
                      <tr 
                        key={idx}
                        onClick={() => handleManualAlphaSelection(result.alpha)}
                        className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                          selectedAlpha === result.alpha ? 'bg-blue-100' : ''
                        }`}
                      >
                        <td className="px-4 py-2 text-sm font-mono">{result.alpha.toFixed(4)}</td>
                        <td className="px-4 py-2 text-sm">{result.originalDetections}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={result.fdr <= 5 ? 'text-green-600 font-semibold' : 
                            result.fdr <= 10 ? 'text-yellow-600' : 'text-red-600'}>
                            {result.fdr.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={result.f1Score >= 0.8 ? 'text-green-600 font-semibold' : 
                            result.f1Score >= 0.6 ? 'text-yellow-600' : 'text-red-600'}>
                            {result.f1Score.toFixed(3)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={result.precision >= 0.9 ? 'text-green-600 font-semibold' : 
                            result.precision >= 0.8 ? 'text-yellow-600' : 'text-red-600'}>
                            {result.precision.toFixed(3)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={result.accuracy >= 0.95 ? 'text-green-600 font-semibold' : 
                            result.accuracy >= 0.9 ? 'text-yellow-600' : 'text-red-600'}>
                            {result.accuracy.toFixed(3)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detection Results */}
          {selectedAlpha && results && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Detection Results</h3>
              
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-blue-800">Selected Alpha</p>
                  <p className="text-xl font-bold text-blue-900">{alpha.toFixed(4)}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-indigo-800">Test SNR</p>
                  <p className="text-xl font-bold text-indigo-900">{K === 0 ? "No Signal" : `${snr.toFixed(2)} dB`}</p>
                </div>
              </div>
              
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-green-800">True Positives</p>
                  <p className="text-2xl font-bold text-green-900">
                    {detectedActiveRows.filter(row => testMatrix.selectedRows?.includes(row)).length}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-red-800">False Positives</p>
                  <p className="text-2xl font-bold text-red-900">
                    {detectedActiveRows.filter(row => !testMatrix.selectedRows?.includes(row)).length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-yellow-800">False Negatives</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {testMatrix.selectedRows?.filter(row => !detectedActiveRows.includes(row)).length || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-purple-800">F1 Score</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {(() => {
                      const tp = detectedActiveRows.filter(row => testMatrix.selectedRows?.includes(row)).length;
                      const fp = detectedActiveRows.filter(row => !testMatrix.selectedRows?.includes(row)).length;
                      const fn = testMatrix.selectedRows?.filter(row => !detectedActiveRows.includes(row)).length || 0;
                      const precision = tp > 0 ? tp / (tp + fp) : 0;
                      const recall = tp > 0 || fn > 0 ? tp / (tp + fn) : 0;
                      const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
                      return f1.toFixed(3);
                    })()}
                  </p>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-green-800">Detection Accuracy</p>
                  <p className="text-xl font-bold text-green-900">{accuracy}{accuracy !== "N/A" ? "%" : ""}</p>
                  <p className="text-xs text-green-700 mt-1">
                    {accuracy === "N/A" 
                      ? "No signal rows to detect (K = 0)" 
                      : "Percentage of true signal rows correctly identified"
                    }
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-blue-800">Algorithm Status</p>
                  <p className="text-xl font-bold text-blue-900">
                    {results.converged ? `Converged` : `Max Iters`}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {results.converged ? `Converged in ${results.iterations} iterations` : `Reached ${results.iterations} max iterations`}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Signal Rows ({testMatrix.selectedRows?.length || 0}):</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md font-mono">
                    {testMatrix.selectedRows?.join(', ') || 'None'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Detected Rows ({detectedActiveRows.length}):</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md font-mono">
                    {detectedActiveRows?.sort((a, b) => a - b).join(', ') || 'None detected'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Matrix Placeholder for Simple Start */}
      {!testMatrix && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧬</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Start</h3>
            <p className="text-gray-600">Configure your parameters above and generate test data to begin analysis</p>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showModal === 'reset' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Reset</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset the application? This will clear all test data, results, and reset parameters to defaults.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmReset}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Yes, Reset All
              </button>
              <button
                onClick={cancelModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Make the component available globally
window.SSVDR1Analyzer = SSVDR1Analyzer;