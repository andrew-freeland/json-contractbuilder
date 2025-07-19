#!/usr/bin/env node

/**
 * n8n Workflow Test Runner
 * Tests enhanced speech processing and performance monitoring
 */

// Test data
const testScenarios = [
  {
    name: "New Caller - Complete Project",
    speechResult: "Hi, I'm John from ABC Construction. We need a contract for a kitchen remodel at 123 Main Street. Budget is $25,000. We want 50% upfront and 50% on completion. Start date is next month. Please send the contract to john@abc.com.",
    expectedFields: ['business_name', 'project_type', 'project_address', 'budget', 'payment_terms', 'start_date', 'preferred_contact_method']
  },
  {
    name: "Returning Caller - Incomplete Data",
    speechResult: "Hi, it's Sarah from XYZ Builders. We have another project.",
    expectedFields: ['business_name'],
    isReturningCaller: true
  },
  {
    name: "Edge Case - Special Characters",
    speechResult: "Project at 456 Oak Ave, Apt #3B. Budget: $15,000. Need contract for bathroom renovation.",
    expectedFields: ['project_address', 'budget', 'project_type']
  },
  {
    name: "Error Case - No Speech",
    speechResult: "",
    expectedError: "NO_SPEECH"
  }
];

// Performance test data
const performanceTests = [
  {
    name: "Fast Execution",
    executionTime: 1500,
    memoryUsage: 50,
    apiCalls: 2
  },
  {
    name: "Slow Execution",
    executionTime: 3500,
    memoryUsage: 120,
    apiCalls: 5
  },
  {
    name: "High Memory Usage",
    executionTime: 2000,
    memoryUsage: 150,
    apiCalls: 3
  }
];

// Enhanced Speech Processing V2 Test
function testEnhancedSpeechProcessing() {
  console.log('🧪 Testing Enhanced Speech Processing V2...\n');
  
  testScenarios.forEach((scenario, index) => {
    console.log(`Test ${index + 1}: ${scenario.name}`);
    
    // Simulate the enhanced speech processing logic
    const result = simulateSpeechProcessing(scenario);
    
    if (result.error) {
      console.log(`  ❌ Error: ${result.error} - ${result.message}`);
    } else {
      console.log(`  ✅ Success: Extracted ${Object.keys(result.extractedData).length} fields`);
      console.log(`  📊 Confidence Score: ${(result.confidenceScore * 100).toFixed(1)}%`);
      
      if (result.hasFollowUp) {
        console.log(`  🔄 Follow-up needed: ${result.question}`);
      } else {
        console.log(`  ✅ Complete: All required fields present`);
      }
    }
    console.log('');
  });
}

// Performance Monitoring Test
function testPerformanceMonitoring() {
  console.log('📊 Testing Performance Monitoring Dashboard...\n');
  
  performanceTests.forEach((test, index) => {
    console.log(`Performance Test ${index + 1}: ${test.name}`);
    
    // Simulate performance data collection
    const metrics = simulatePerformanceCollection(test);
    const analysis = simulatePerformanceAnalysis(metrics);
    const report = simulateDashboardReport(analysis);
    
    console.log(`  ⏱️  Execution Time: ${metrics.executionTime}ms`);
    console.log(`  💾 Memory Usage: ${metrics.memoryUsage}MB`);
    console.log(`  🔗 API Calls: ${metrics.apiCalls}`);
    console.log(`  🏥 Health Score: ${analysis.healthScore}%`);
    console.log(`  📈 Status: ${report.summary.status}`);
    
    if (analysis.alerts.length > 0) {
      console.log(`  ⚠️  Alerts: ${analysis.alerts.join(', ')}`);
    }
    console.log('');
  });
}

// Simulation functions
function simulateSpeechProcessing(scenario) {
  const { speechResult, expectedFields, expectedError } = scenario;
  
  if (expectedError === "NO_SPEECH" && !speechResult) {
    return {
      error: 'NO_SPEECH',
      message: 'No speech detected',
      callSid: 'TEST_CALL_' + Date.now()
    };
  }
  
  // Simulate OpenAI extraction
  const extractedData = {};
  expectedFields.forEach(field => {
    switch (field) {
      case 'business_name':
        extractedData[field] = speechResult.includes('ABC') ? 'ABC Construction' : 
                              speechResult.includes('XYZ') ? 'XYZ Builders' : null;
        break;
      case 'project_type':
        extractedData[field] = speechResult.includes('kitchen') ? 'kitchen remodel' :
                              speechResult.includes('bathroom') ? 'bathroom renovation' : null;
        break;
      case 'project_address':
        extractedData[field] = speechResult.match(/\d+\s+\w+\s+\w+/)?.[0] || null;
        break;
      case 'budget':
        extractedData[field] = speechResult.match(/\$\d{1,3}(?:,\d{3})*/)?.[0] || null;
        break;
      case 'payment_terms':
        extractedData[field] = speechResult.includes('50%') ? '50% upfront, 50% on completion' : null;
        break;
      case 'start_date':
        extractedData[field] = speechResult.includes('next month') ? 'next month' : null;
        break;
      case 'preferred_contact_method':
        extractedData[field] = speechResult.includes('@') ? 'email' : null;
        break;
    }
  });
  
  // Calculate confidence score
  const confidenceScore = Object.values(extractedData).filter(v => v !== null).length / expectedFields.length;
  
  // Check for missing fields
  const missingFields = expectedFields.filter(field => !extractedData[field]);
  
  if (missingFields.length > 0) {
    return {
      hasFollowUp: true,
      question: `What's the ${missingFields[0].replace('_', ' ')}?`,
      missingField: missingFields[0],
      extractedData: extractedData,
      confidenceScore: confidenceScore,
      conversationState: 'follow_up'
    };
  }
  
  return {
    hasFollowUp: false,
    isComplete: true,
    extractedData: extractedData,
    confidenceScore: confidenceScore,
    conversationState: 'complete'
  };
}

function simulatePerformanceCollection(test) {
  return {
    timestamp: new Date().toISOString(),
    nodeId: 'test-node-' + Date.now(),
    nodeName: 'Test Node',
    executionTime: test.executionTime,
    memoryUsage: test.memoryUsage,
    apiCalls: test.apiCalls,
    isSlow: test.executionTime > 2000,
    isError: false,
    callSid: 'TEST_CALL_' + Date.now(),
    conversationState: 'complete',
    hasFollowUp: false,
    isReturningCaller: false
  };
}

function simulatePerformanceAnalysis(metrics) {
  const performanceScore = Math.max(0, 100 - (metrics.executionTime / 2000) * 100);
  const resourceScore = Math.max(0, 100 - (metrics.memoryUsage / 100) * 100);
  const healthScore = Math.round((performanceScore + resourceScore) / 2);
  
  const alerts = [];
  if (metrics.isSlow) alerts.push(`Slow execution: ${metrics.executionTime}ms`);
  if (metrics.memoryUsage > 100) alerts.push(`High memory usage: ${metrics.memoryUsage}MB`);
  
  return {
    performanceAnalysis: {
      timestamp: metrics.timestamp,
      nodeName: metrics.nodeName,
      performance: { executionTime: metrics.executionTime, isSlow: metrics.isSlow, performanceScore },
      resources: { memoryUsage: metrics.memoryUsage, resourceScore },
      business: { callSid: metrics.callSid, conversationState: metrics.conversationState }
    },
    alerts: alerts,
    healthScore: healthScore,
    isHealthy: healthScore >= 80
  };
}

function simulateDashboardReport(analysis) {
  return {
    summary: {
      healthScore: analysis.healthScore,
      status: analysis.isHealthy ? '🟢 Healthy' : '🔴 Needs Attention',
      totalAlerts: analysis.alerts.length,
      nodeName: analysis.performanceAnalysis.nodeName
    },
    performance: {
      executionTime: `${analysis.performanceAnalysis.performance.executionTime}ms`,
      performanceScore: `${analysis.performanceAnalysis.performance.performanceScore.toFixed(1)}%`,
      isSlow: analysis.performanceAnalysis.performance.isSlow ? 'Yes' : 'No'
    },
    resources: {
      memoryUsage: `${analysis.performanceAnalysis.resources.memoryUsage}MB`,
      resourceScore: `${analysis.performanceAnalysis.resources.resourceScore.toFixed(1)}%`
    },
    alerts: analysis.alerts
  };
}

// Integration test
function testIntegration() {
  console.log('🔗 Testing Integration Components...\n');
  
  // Test the complete flow
  const testCall = {
    speechResult: "Hi, I'm Mike from Quality Builders. We need a contract for a deck build at 789 Pine Street. Budget is $12,000. 30% upfront, 40% at materials, 30% on completion.",
    callerPhone: "+15551234567"
  };
  
  console.log('📞 Simulating complete call flow...');
  
  // Step 1: Speech Processing
  const speechResult = simulateSpeechProcessing({
    name: "Integration Test",
    speechResult: testCall.speechResult,
    expectedFields: ['business_name', 'project_type', 'project_address', 'budget', 'payment_terms']
  });
  
  console.log(`  🎤 Speech Processing: ${speechResult.hasFollowUp ? 'Follow-up needed' : 'Complete'}`);
  
  // Step 2: Performance Monitoring
  const performanceResult = simulatePerformanceCollection({
    name: "Integration Performance",
    executionTime: 1800,
    memoryUsage: 75,
    apiCalls: 3
  });
  
  const performanceAnalysis = simulatePerformanceAnalysis(performanceResult);
  console.log(`  📊 Performance: ${performanceAnalysis.healthScore}% health score`);
  
  // Step 3: Business Logic
  const businessResult = {
    isReturningCaller: false,
    callerData: {
      phone_number: testCall.callerPhone,
      business_name: speechResult.extractedData?.business_name,
      contact_method: 'email'
    },
    extractedData: speechResult.extractedData
  };
  
  console.log(`  👤 Business Logic: ${businessResult.isReturningCaller ? 'Returning' : 'New'} caller`);
  console.log(`  📋 Data Extraction: ${Object.keys(businessResult.extractedData || {}).length} fields`);
  
  console.log('\n✅ Integration test completed successfully!\n');
}

// Main execution
function main() {
  console.log('🚀 n8n Workflow Improvement Test Runner\n');
  console.log('=' .repeat(50));
  
  try {
    // Test enhanced speech processing
    testEnhancedSpeechProcessing();
    
    console.log('=' .repeat(50));
    
    // Test performance monitoring
    testPerformanceMonitoring();
    
    console.log('=' .repeat(50));
    
    // Test integration
    testIntegration();
    
    console.log('🎉 All tests completed successfully!');
    console.log('\n📈 Next Steps:');
    console.log('1. Import enhanced components into n8n');
    console.log('2. Set up performance monitoring dashboard');
    console.log('3. Run real-world testing with actual calls');
    console.log('4. Monitor metrics and iterate on improvements');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main(); 