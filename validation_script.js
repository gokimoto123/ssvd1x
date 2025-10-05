// Browser console validation script for eFDR optimization
// Run this in both current.html and current_optimized.html

console.log('=== Starting eFDR Optimization Validation ===');

// Test 1: Verify fixed permutation functions exist
console.log('Test 1: Checking function availability...');
try {
    const testPatterns = generateFixedPermutations(3, 10);
    console.log('✅ generateFixedPermutations works, sample:', testPatterns[0].slice(0, 5));
    
    savePermutationPatterns(testPatterns);
    console.log('✅ savePermutationPatterns works');
    
    const loaded = loadPermutationPatterns();
    console.log('✅ loadPermutationPatterns works, loaded', loaded.length, 'patterns');
    
} catch (error) {
    console.error('❌ Fixed permutation functions failed:', error);
}

// Test 2: Check if alphaMax-based logic exists (optimized version only)
console.log('\\nTest 2: Checking for optimization indicators...');
if (typeof runFDRAnalysis === 'function') {
    const funcString = runFDRAnalysis.toString();
    if (funcString.includes('alphaRatio = alpha / alphaMax')) {
        console.log('✅ Optimized version detected - alphaMax-based logic present');
    } else if (funcString.includes('alpha > 0.1 ? 500 : alpha > 0.01 ? 750 : 1000')) {
        console.log('✅ Baseline version detected - original logic present');
    } else {
        console.log('⚠️ Unknown version - could not detect optimization status');
    }
} else {
    console.error('❌ runFDRAnalysis function not found');
}

// Test 3: Create small test matrix
console.log('\\nTest 3: Creating test matrix...');
const testMatrix = [];
for (let i = 0; i < 20; i++) {
    const row = [];
    for (let j = 0; j < 10; j++) {
        row.push(Math.random() - 0.5);
    }
    testMatrix.push(row);
}
console.log('✅ Test matrix created: 20x10');

// Clear any existing permutation patterns for fresh test
localStorage.removeItem('ssvd1x_fixed_permutations');
console.log('✅ Cleared existing permutation patterns');

console.log('\\n=== Validation Complete ===');
console.log('Ready for manual testing with UI controls');
console.log('Suggested test parameters:');
console.log('- Use generated test matrix or upload small CSV');
console.log('- Set Nalpha = 5, Nperm = 3 for quick testing');
console.log('- Compare timing between versions');
console.log('- Verify console output shows adaptive parameters');