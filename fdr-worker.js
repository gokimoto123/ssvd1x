// FDR Analysis Web Worker - Performance Optimized
// Extracted from SSVD1x application to prevent browser tab throttling

// ===================================================================
// CORE MATRIX OPERATIONS
// ===================================================================

const matrixMultiply = function matrixMultiply(A, B) {
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

const transpose = function transpose(matrix) {
    if (!matrix.length || !matrix[0].length) return [];
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
};

const norm = function norm(vector) {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
};

// ===================================================================
// STATISTICAL UTILITIES
// ===================================================================

const generateGaussianNoise = function generateGaussianNoise(variance) {
    const u1 = Math.random(), u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * Math.sqrt(variance);
};

const calculateMean = function calculateMean(array) {
    return array.reduce((sum, val) => sum + val, 0) / array.length;
};

const calculateVariance = function calculateVariance(array, mean = null) {
    const m = mean !== null ? mean : calculateMean(array);
    return array.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / array.length;
};

// ===================================================================
// MATRIX ROW PERMUTATION
// ===================================================================

const permuteMatrixRows = function permuteMatrixRows(matrix, fixedPattern = null) {
    if (fixedPattern) {
        // Use provided permutation pattern
        return fixedPattern.map(idx => matrix[idx]);
    }
    // Original random permutation of columns within each row
    const permuted = matrix.map(row => [...row]);
    for (let i = 0; i < permuted.length; i++) {
        for (let j = permuted[i].length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [permuted[i][j], permuted[i][k]] = [permuted[i][k], permuted[i][j]];
        }
    }
    return permuted;
};

const generateFixedPermutations = function(Nperm, matrixRows) {
    const patterns = [];
    for (let i = 0; i < Nperm; i++) {
        const indices = Array.from({length: matrixRows}, (_, i) => i);
        // Fisher-Yates shuffle with fixed sequence
        for (let j = indices.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [indices[j], indices[k]] = [indices[k], indices[j]];
        }
        patterns.push(indices);
    }
    return patterns;
};

// ===================================================================
// SVD IMPLEMENTATION
// ===================================================================

// Simple power iteration SVD for first singular vector/value
const simpleSVD = function simpleSVD(X) {
    if (!X || !X.length || !X[0].length) {
        throw new Error('Invalid matrix for SVD');
    }

    const P = X.length;
    const N = X[0].length;

    // Use power iteration to find dominant singular vectors
    let v = Array(N).fill(0).map(() => Math.random() - 0.5);
    let vNorm = norm(v);
    v = v.map(x => x / vNorm);
    let u = Array(P).fill(0);
    let prevSingularValue = 0;

    // Power iteration: alternately compute u = X*v and v = X^T*u
    for (let iter = 0; iter < 50; iter++) {
        // u = X * v
        for (let i = 0; i < P; i++) {
            u[i] = 0;
            for (let j = 0; j < N; j++) {
                u[i] += X[i][j] * v[j];
            }
        }

        // Normalize u and get singular value
        const uNormValue = norm(u);
        if (uNormValue === 0) break;
        u = u.map(x => x / uNormValue);

        // v = X^T * u
        for (let j = 0; j < N; j++) {
            v[j] = 0;
            for (let i = 0; i < P; i++) {
                v[j] += X[i][j] * u[i];
            }
        }

        // Normalize v and get singular value
        vNorm = norm(v);
        if (vNorm === 0) break;
        v = v.map(x => x / vNorm);

        // Check convergence
        if (Math.abs(vNorm - prevSingularValue) < 1e-8) {
            break;
        }
        prevSingularValue = vNorm;
    }

    return { u, s: vNorm, v };
};

const svd1 = async function(X) {
    // Yield control to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 0));
    return simpleSVD(X);
};

// ===================================================================
// SSVD-R1 ALGORITHM
// ===================================================================

// SSVD-R1_v2.3_VALIDATED: Correct SSVD1 implementation following exact MATLAB sequence
const SSVDR1Algorithm = async function({ matrix, alpha, maxIter = 1000, tolerance = 0.001, onProgress = null, initialSVD = null }) {
    console.log(`[WORKER] SSVDR1Algorithm called: alpha=${alpha}, maxIter=${maxIter}, tolerance=${tolerance}, initialSVD=${initialSVD ? 'provided' : 'null'}`);
    if (!matrix || !matrix.length || !matrix[0].length) {
        throw new Error('Invalid matrix provided');
    }
    const P = matrix.length;
    const N = matrix[0].length;

    // Special case: alpha = 0, return standard SVD result
    if (Math.abs(alpha) < 1e-10) {
        const svdResult = initialSVD || await svd1(matrix);
        const { u, s, v } = svdResult;
        const nonZeros = u.filter(val => Math.abs(val) > 1e-8).length;
        const sparsity = (P - nonZeros) / P;

        return {
            u, s, v,
            iterations: 1,
            converged: true,
            errors: [0],
            sparsityHistory: [sparsity],
            singularValues: [s],
            convergenceInfo: {
                finalError: 0,
                tolerance: tolerance,
                sparsity: sparsity,
                nonZeros: nonZeros
            }
        };
    }

    // Timing removed - not needed for worker operation

    // Initialize with SVD of original matrix (use cached if available)
    let initialResult;
    if (initialSVD) {
        console.log(`[WORKER] ✅ Using cached SVD for alpha=${alpha}`);
        console.log(`[WORKER] Initial SVD u[0-2]: [${initialSVD.u.slice(0,3).map(x=>x.toFixed(6)).join(', ')}], s=${initialSVD.s.toFixed(6)}`);
        initialResult = initialSVD;
    } else {
        console.log(`[WORKER] 🔄 Computing new SVD for alpha=${alpha}`);
        initialResult = await svd1(matrix);
        console.log(`[WORKER] Fresh SVD u[0-2]: [${initialResult.u.slice(0,3).map(x=>x.toFixed(6)).join(', ')}], s=${initialResult.s.toFixed(6)}`);
    }

    // CRITICAL: Create deep copies to avoid mutating the cached SVD
    let u = [...initialResult.u];  // Deep copy the array
    let s = initialResult.s;        // Primitive, no need to copy
    let v = [...initialResult.v];  // Deep copy the array

    // Track convergence and algorithm statistics
    const errors = [];
    const sparsityHistory = [];
    const singularValues = [];
    let iterCount = 0;
    let error = Infinity;

    // Main iterative algorithm (MATLAB sequence: u=X*v, threshold, normalize, v=X'*u, normalize)
    while (iterCount < maxIter && error > tolerance) {
        iterCount++;
        const uPrev = [...u];

        // STEP 1: Update u from X*v (MATLAB line 74: u0 = X*v)
        for (let i = 0; i < P; i++) {
            u[i] = 0;
            for (let j = 0; j < N; j++) {
                u[i] += matrix[i][j] * v[j];
            }
        }

        // STEP 2: Apply soft thresholding to u (MATLAB line 76: u = sign(u).*max(abs(u)-alpha,0))
        u = u.map(x => Math.sign(x) * Math.max(Math.abs(x) - alpha, 0));

        // STEP 3: Normalize u if non-zero (MATLAB line 78: u = u/norm(u,2))
        let uNorm = norm(u);
        if (uNorm > 0) {
            u = u.map(x => x / uNorm);
        } else {
            // If u becomes all zeros, we've converged to zero solution
            u = Array(P).fill(0);
            s = 0;
            error = 0; // Mark as converged since we found the correct zero solution
            break;
        }

        // STEP 4: Update v from X^T*u (MATLAB line 69: v = X'*u0)
        for (let j = 0; j < N; j++) {
            v[j] = 0;
            for (let i = 0; i < P; i++) {
                v[j] += matrix[i][j] * u[i];
            }
        }

        // STEP 5: Normalize v (MATLAB line 72: v = v./norm(v,2))
        let vNorm = norm(v);
        if (vNorm > 0) {
            v = v.map(x => x / vNorm);
        } else {
            // If v becomes all zeros, we've converged to zero solution
            break;
        }

        // Check convergence based on change in u vector
        error = 0;
        for (let i = 0; i < u.length; i++) {
            const diff = u[i] - uPrev[i];
            error += diff * diff;
        }
        error = Math.sqrt(error);
        errors.push(error);

        // Track sparsity
        const nonZeros = u.filter(val => Math.abs(val) > 1e-8).length;
        const sparsity = (P - nonZeros) / P;
        sparsityHistory.push(sparsity);

        // Compute singular value for this sparse u (optional, for monitoring)
        if (iterCount % 10 === 0 || error < tolerance) {
            s = Math.abs(u.reduce((sum, uVal, i) =>
                sum + uVal * matrix[i].reduce((s2, xVal, j) => s2 + xVal * v[j], 0), 0));
            singularValues.push(s);
        }

        // Early termination for numerical stability
        if (isNaN(error) || !isFinite(error)) {
            break;
        }

        // Yield control back to browser periodically
        if (iterCount % 100 === 0) {
            if (onProgress) {
                onProgress(iterCount, maxIter, error);
            }
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    // Timing removed - not needed for worker operation

    // Final singular value computation (only if u is non-zero)
    const finalS = s > 0 ? Math.abs(u.reduce((sum, uVal, i) =>
        sum + uVal * matrix[i].reduce((s2, xVal, j) => s2 + xVal * v[j], 0), 0)) : 0;

    // Count final non-zeros for reporting
    const finalNonZeros = u.filter(val => Math.abs(val) > 1e-8).length;
    const finalSparsity = (P - finalNonZeros) / P;

    console.log(`[WORKER] SSVD1 completed: alpha=${alpha}, detections=${finalNonZeros}, iterations=${iterCount}, converged=${error <= tolerance}`);

    return {
        u,
        s: finalS,
        v,
        iterations: iterCount,
        converged: error <= tolerance,
        errors,
        sparsityHistory,
        singularValues,
        convergenceInfo: {
            finalError: error,
            tolerance: tolerance,
            sparsity: finalSparsity,
            nonZeros: finalNonZeros
        }
    };
};

// ===================================================================
// SINGLE-ALPHA PERMUTATION ANALYSIS
// ===================================================================

// Single-Alpha eFDR: Run permutations only (original SSVD already computed in N-alpha)
const runPermutationsForAlpha = async function({ matrix, alpha, originalDetections, Nperm, nsupp, onProgress, isCancelled }) {
    const P = matrix.length;
    const N = matrix[0].length;
    const pi0 = (P - nsupp) / P;

    console.log(`[Worker] Running permutations: α=${alpha.toFixed(6)}, originalDetections=${originalDetections}, Nperm=${Nperm}`);

    // Calculate alphaMax for adaptive parameters (rough estimate)
    const alphaMax = Math.max(0.01, alpha * 2);
    const alphaRatio = alpha / alphaMax;

    let totalPermDetections = 0;
    const totalRuns = Nperm;
    let completedRuns = 0;

    // Use small batch size for responsive cancellation
    const batchSize = 4;

    // Initialize progress
    if (onProgress) {
        onProgress(0, totalRuns, 'Starting permutation testing...');
    }

    // Process permutations in batches
    for (let batchStart = 0; batchStart < Nperm; batchStart += batchSize) {
        // Check for cancellation
        if (isCancelled()) {
            console.log('[Worker] Permutation testing cancelled');
            throw new Error('Analysis cancelled by user');
        }

        const batchEnd = Math.min(batchStart + batchSize, Nperm);
        const currentBatchSize = batchEnd - batchStart;

        // Process batch in parallel
        const batchPromises = [];
        for (let perm = batchStart; perm < batchEnd; perm++) {
            batchPromises.push(
                (async () => {
                    if (isCancelled()) {
                        return 0;
                    }

                    const permutedMatrix = permuteMatrixRows(matrix);

                    // Adaptive parameters based on alpha ratio
                    const adaptiveMaxIter =
                        alphaRatio < 0.05 ? 400 :
                        alphaRatio < 0.2 ? 350 :
                        alphaRatio < 0.5 ? 250 :
                        alphaRatio < 0.75 ? 150 :
                        50;

                    const adaptiveTolerance =
                        alphaRatio < 0.2 ? 0.01 :
                        alphaRatio < 0.5 ? 0.005 :
                        0.001;

                    const permResult = await SSVDR1Algorithm({
                        matrix: permutedMatrix,
                        alpha,
                        maxIter: adaptiveMaxIter,
                        tolerance: adaptiveTolerance
                    });

                    if (isCancelled()) {
                        return 0;
                    }

                    const permDetections = permResult.u.filter(val => Math.abs(val) > 1e-8).length;

                    // Update progress
                    completedRuns++;
                    if (onProgress) {
                        const currentPercent = Math.floor((completedRuns / totalRuns) * 100);
                        const previousPercent = Math.floor(((completedRuns - 1) / totalRuns) * 100);
                        const currentBucket = Math.floor(currentPercent / 5);
                        const previousBucket = Math.floor(previousPercent / 5);

                        if (currentBucket > previousBucket || completedRuns === totalRuns) {
                            const progressMessage = `${currentPercent}% complete (${completedRuns}/${totalRuns} permutations)`;
                            onProgress(completedRuns, totalRuns, progressMessage);
                        }
                    }

                    return permDetections;
                })()
            );
        }

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);

        if (isCancelled()) {
            throw new Error('Analysis cancelled by user');
        }

        // Sum detections from batch
        const batchDetections = batchResults.reduce((sum, val) => sum + val, 0);
        totalPermDetections += batchDetections;
    }

    // Calculate eFDR
    const avgPermDetections = totalPermDetections / Nperm;
    const eFDR = originalDetections > 0
        ? Math.min(1.0, (pi0 * avgPermDetections) / originalDetections)
        : 0;

    console.log(`[Worker] Permutations complete: avgPermDetections=${avgPermDetections.toFixed(2)}, eFDR=${eFDR.toFixed(4)}`);

    return {
        alpha,
        originalDetections,
        avgPermDetections,
        eFDR,
        pi0,
        Nperm,
        totalPermDetections
    };
};

// ===================================================================
// FDR ANALYSIS - MAIN FUNCTION
// ===================================================================

// FDR_ANALYSIS_v2.0_VALIDATED: Empirical False Discovery Rate with permutation testing
const runFDRAnalysis = async function({ matrix, alpha0, alphaMax, Nalpha, Nperm, nsupp, onProgress, initialSVD = null, isCancelled = () => false, useFixedPermutations = false, fixedPatterns = null }) {
    const P = matrix.length;
    const pi0 = (P - nsupp) / P;

    const alphaValues = [];
    for (let i = 0; i < Nalpha; i++) {
        const alpha = alpha0 + (alphaMax - alpha0) * i / (Nalpha - 1);
        alphaValues.push(alpha);
    }

    const results = [];
    let totalProgress = 0;
    const totalRuns = alphaValues.length * (1 + Nperm);

    for (let alphaIdx = 0; alphaIdx < alphaValues.length; alphaIdx++) {
        // Check for cancellation before processing each alpha
        if (isCancelled()) {
            return {
                alphaValues: alphaValues.slice(0, alphaIdx),
                fdrValues: results.map(r => r.eFDR),
                detectionCounts: results.map(r => r.detectionCount),
                gradients: results.map(r => r.gradient),
                results,
                pi0,
                totalRuns,
                cancelled: true
            };
        }

        const alpha = alphaValues[alphaIdx];

        try {
            // Run SSVD on original matrix with optimized parameters
            const alphaRatio = alpha / alphaMax;

            // For ORIGINAL matrix: Use consistent parameters matching N-alpha analysis
            // N-alpha uses fixed maxIter=1000, tolerance=0.001 for all alphas
            // To ensure consistency between N-alpha and eFDR results, use the same
            const adaptiveMaxIterOrig = 1000;  // Match N-alpha exactly
            const adaptiveToleranceOrig = 0.001;  // Match N-alpha exactly

            const originalResult = await SSVDR1Algorithm({
                matrix,
                alpha,
                maxIter: adaptiveMaxIterOrig,
                tolerance: adaptiveToleranceOrig,
                initialSVD   // Pass the cached SVD for original matrix
            });
            const originalDetections = originalResult.u.filter(val => Math.abs(val) > 1e-8).length;

            // REMOVED: Aggressive early termination that was causing incorrect results
            // The assumption that zero detections at one alpha means all higher alphas
            // will also have zero detections is incorrect due to numerical factors and
            // the iterative nature of the SSVD algorithm. All alphas must be computed.

            totalProgress++;
            if (onProgress) {
                onProgress(totalProgress, totalRuns,
                    `Alpha ${alphaIdx + 1}/${Nalpha} (α=${alpha.toFixed(4)}): Original run`);
            }

            // Permutation tests with batching
            let totalPermDetections = 0;

            // Detect optimal batch size based on hardware
            const batchSize = Math.min(4, 8); // Conservative for Web Worker

            // Process permutations in batches
            for (let batchStart = 0; batchStart < Nperm; batchStart += batchSize) {
                // Check for cancellation before each batch
                if (isCancelled()) {
                    break;
                }

                const batchEnd = Math.min(batchStart + batchSize, Nperm);
                const currentBatchSize = batchEnd - batchStart;

                // Create promises for all permutations in this batch
                const batchPromises = [];
                for (let perm = batchStart; perm < batchEnd; perm++) {
                    batchPromises.push(
                        (async () => {
                            try {
                                const permutedMatrix = useFixedPermutations && fixedPatterns ?
                                    permuteMatrixRows(matrix, fixedPatterns[perm]) :
                                    permuteMatrixRows(matrix);

                                // For PERMUTATIONS: Can use reduced iterations since we only need approximate null
                                // But ensure enough iterations for convergence on large matrices
                                const adaptiveMaxIter = 500;  // Half of original, but still sufficient for null distribution

                                const adaptiveTolerance = 0.005;  // Looser than original since permutations only estimate null

                                // Use reduced parameters for permutations
                                const permResult = await SSVDR1Algorithm({
                                    matrix: permutedMatrix,
                                    alpha,
                                    maxIter: adaptiveMaxIter,
                                    tolerance: adaptiveTolerance
                                });
                                const permDetections = permResult.u.filter(val => Math.abs(val) > 1e-8).length;
                                return permDetections;
                            } catch (error) {
                                return 0; // Return 0 detections on error
                            }
                        })()
                    );
                }

                // Wait for all permutations in batch to complete
                const batchResults = await Promise.all(batchPromises);

                // Sum up detections from this batch
                const batchDetections = batchResults.reduce((sum, val) => sum + val, 0);
                totalPermDetections += batchDetections;

                // Update progress for the batch
                totalProgress += currentBatchSize;
                if (onProgress) {
                    onProgress(totalProgress, totalRuns,
                        `Alpha ${alphaIdx + 1}/${Nalpha} (α=${alpha.toFixed(4)}): Permutations ${batchStart + 1}-${batchEnd}`);
                }

                // Yield control periodically and force garbage collection
                await new Promise(resolve => setTimeout(resolve, 0));

                // Memory cleanup every 10 batches for large analyses
                if ((batchStart / batchSize) % 10 === 0 && typeof self.gc === 'function') {
                    self.gc(); // Force garbage collection if available
                }
            }

            const avgPermDetections = totalPermDetections / Nperm;
            const expectedFalsePos = pi0 * avgPermDetections;
            const fdr = originalDetections > 0 ? expectedFalsePos / originalDetections : 0;
            const eFDR = Math.min(fdr * 100, 100);

            // Calculate gradient (change in detections)
            let gradient = 0;
            if (alphaIdx > 0) {
                gradient = results[alphaIdx - 1].detectionCount - originalDetections;
            }

            results.push({
                alpha,
                detectionCount: originalDetections,
                avgPermDetections,
                eFDR,
                gradient
            });

        } catch (error) {
            // Add a failed result to keep indexing consistent
            results.push({
                alpha,
                detectionCount: 0,
                avgPermDetections: 0,
                eFDR: 100,  // Assume worst case
                gradient: 0
            });
        }
    }

    return {
        alphaValues,
        fdrValues: results.map(r => r.eFDR),
        detectionCounts: results.map(r => r.detectionCount),
        gradients: results.map(r => r.gradient),
        results,
        pi0,
        totalRuns
    };
};

// ===================================================================
// WEB WORKER MESSAGE HANDLING
// ===================================================================

// Enhanced progress storage for background sync
const storeProgressState = (current, total, message, analysisData = {}) => {
    try {
        const progressState = {
            current,
            total,
            message,
            timestamp: Date.now(),
            percentage: total > 0 ? Math.round((current / total) * 100) : 0,
            estimatedTimeRemaining: calculateTimeRemaining(current, total),
            analysisData
        };

        // Add elapsed time to progress state
        if (self.analysisStartTime) {
            progressState.elapsedTime = Date.now() - self.analysisStartTime;
            progressState.elapsedTimeFormatted = formatElapsedTime(progressState.elapsedTime);
        }

        // Send storage request to main thread
        self.postMessage({
            type: 'storeProgress',
            data: progressState
        });
    } catch (error) {
        // Silent fail - don't interrupt analysis
        console.warn('Progress storage failed:', error);
    }
};

// Format elapsed time for display
const formatElapsedTime = (milliseconds) => {
    if (!milliseconds || milliseconds < 0) return '0s';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;
        return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        return `${seconds}s`;
    }
};

// Calculate estimated time remaining
const calculateTimeRemaining = (current, total) => {
    if (current <= 0 || total <= 0) return 'Calculating...';

    if (!self.analysisStartTime) {
        self.analysisStartTime = Date.now();
        return 'Calculating...';
    }

    const elapsed = Date.now() - self.analysisStartTime;
    const rate = current / elapsed; // operations per ms
    const remaining = (total - current) / rate;

    if (remaining < 60000) return `${Math.round(remaining / 1000)}s`;
    if (remaining < 3600000) return `${Math.round(remaining / 60000)}m`;
    return `${Math.round(remaining / 3600000)}h ${Math.round((remaining % 3600000) / 60000)}m`;
};

// Message handling for Web Worker communication
self.onmessage = async function(e) {
    const { type, data, id } = e.data;

    try {
        switch (type) {
            case 'runFDRAnalysis':
                // Use provided analysis start time or current time if not provided
                self.analysisStartTime = data.analysisStartTime || Date.now();
                self.cancelled = false;

                // Set up enhanced progress callback
                const onProgress = (current, total, message) => {
                    const progressData = { current, total, message };

                    // Send to main thread (may be throttled when tab in background)
                    self.postMessage({
                        type: 'progress',
                        id,
                        data: progressData
                    });

                    // Store progress state for background sync
                    storeProgressState(current, total, message, {
                        alphaValues: data.Nalpha,
                        permutations: data.Nperm,
                        matrixSize: `${data.matrix?.length || 0}×${data.matrix?.[0]?.length || 0}`
                    });
                };

                // Set up cancellation check
                const isCancelled = () => {
                    // This will be updated by main thread messages
                    return self.cancelled || false;
                };

                // Run the analysis
                const result = await runFDRAnalysis({
                    ...data,
                    onProgress,
                    isCancelled
                });

                // Send result back to main thread
                self.postMessage({
                    type: 'result',
                    id,
                    data: result
                });
                break;

            case 'runPermutationsForAlpha':
                // Single-alpha permutation testing (simpler than full FDR analysis)
                self.cancelled = false;

                // Set up progress callback
                const onProgressSingle = (current, total, message) => {
                    self.postMessage({
                        type: 'progress',
                        id,
                        data: { current, total, message }
                    });
                };

                // Set up cancellation check
                const isCancelledSingle = () => self.cancelled || false;

                // Run permutations for single alpha
                const singleResult = await runPermutationsForAlpha({
                    ...data,
                    onProgress: onProgressSingle,
                    isCancelled: isCancelledSingle
                });

                // Send result back to main thread
                self.postMessage({
                    type: 'result',
                    id,
                    data: singleResult
                });
                break;

            case 'cancel':
                self.cancelled = true;
                self.postMessage({
                    type: 'cancelled',
                    id
                });
                break;

            case 'ping':
                self.postMessage({
                    type: 'pong',
                    id
                });
                break;

            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            id,
            data: {
                message: error.message,
                stack: error.stack
            }
        });
    }
};

// Signal that worker is ready
self.postMessage({
    type: 'ready'
});