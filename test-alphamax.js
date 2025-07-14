// AlphaMax calculation test
function log(msg) {
    console.log(msg);
}

// Matrix operations
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

// SVD implementation from artifact
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

// Generate test data like in the main app
function generateTestData() {
    const P = 100, N = 50, K = 5;
    const signalScale = 0.6, noiseVariance = 0.14;
    
    log(`Generating test matrix: P=${P}, N=${N}, K=${K}`);
    log(`Signal scale: ${signalScale}, Noise variance: ${noiseVariance}`);
    
    // Generate Gaussian noise
    const generateGaussianNoise = (variance) => {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * Math.sqrt(variance);
    };
    
    // Initialize matrix with noise
    const matrix = Array(P).fill().map(() => 
        Array(N).fill().map(() => generateGaussianNoise(noiseVariance))
    );
    
    // Add signal to first K rows
    for (let i = 0; i < K; i++) {
        for (let j = 0; j < N; j++) {
            const stepValue = j < N/2 ? -signalScale : signalScale;
            matrix[i][j] += stepValue;
        }
    }
    
    log(`Matrix created. Sample values from signal row 0:`);
    log(`  First 5: [${matrix[0].slice(0, 5).map(x => x.toFixed(3)).join(', ')}]`);
    log(`  Last 5:  [${matrix[0].slice(-5).map(x => x.toFixed(3)).join(', ')}]`);
    
    return matrix;
}

function runTest() {
    log('=== AlphaMax Debug Test ===');
    
    try {
        const matrix = generateTestData();
        
        log('\nRunning SVD...');
        const { u, s, v } = svd1(matrix);
        
        log(`SVD Results:`);
        log(`  Singular value s = ${s}`);
        log(`  max(|u|) = ${Math.max(...u.map(val => Math.abs(val)))}`);
        log(`  u[0:5] = [${u.slice(0, 5).map(x => x.toFixed(6)).join(', ')}]`);
        
        const maxAbsU1 = Math.max(...u.map(val => Math.abs(val)));
        const baseAlphaMax = maxAbsU1 * s;
        const alphaMax = 0.75 * baseAlphaMax;
        
        log(`\nAlphaMax Calculation:`);
        log(`  max(|u1|) = ${maxAbsU1}`);
        log(`  s1 = ${s}`);
        log(`  base = max(|u1|) * s1 = ${baseAlphaMax}`);
        log(`  alphaMax = 0.75 * base = ${alphaMax}`);
        
        log(`\n=== FINAL RESULT ===`);
        log(`alphaMax = ${alphaMax}`);
        
    } catch (error) {
        log(`ERROR: ${error.message}`);
    }
}

// Run the test
runTest();