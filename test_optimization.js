// Test script to compare baseline vs optimized eFDR analysis
// To be run in browser console after loading both versions

console.log('=== SSVD1x Optimization Test ===');

// Generate test data - small matrix for quick testing
const P = 100;  // rows
const N = 20;   // columns  
const K = 5;    // signal rows
const testMatrix = [];

// Create synthetic data with embedded signal
for (let i = 0; i < P; i++) {
    const row = [];
    for (let j = 0; j < N; j++) {
        // Add signal to first K rows
        const signal = i < K ? 0.8 : 0;
        const noise = (Math.random() - 0.5) * 0.2;
        row.push(signal + noise);
    }
    testMatrix.push(row);
}

// Test parameters
const testParams = {
    matrix: testMatrix,
    alpha0: 0.001,
    alphaMax: 0.1,  // Will be calculated properly in actual app
    Nalpha: 10,     // Reduced for testing
    Nperm: 5,       // Reduced for testing
    nsupp: K,
    useFixedPermutations: true  // Use fixed patterns for comparison
};

console.log('Test matrix created:', P, 'x', N, 'with', K, 'signal rows');
console.log('Test parameters:', testParams);
console.log('Ready to test - run both versions with these parameters');
console.log('Navigate to:');
console.log('  Baseline: http://localhost:8001/current.html');
console.log('  Optimized: http://localhost:8001/current_optimized.html');