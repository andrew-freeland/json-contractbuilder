// Function Node: Retry Wrapper
// Input: $json (data to process), $json.retryConfig (optional retry settings)
// Output: Result with retry metadata

const inputData = $json;
const retryConfig = $json.retryConfig || {};

// Default retry configuration
const defaultConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'TIMEOUT',
    'NETWORK_ERROR',
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_SERVER_ERROR'
  ],
  timeoutMs: 30000 // 30 seconds
};

const config = { ...defaultConfig, ...retryConfig };

// Exponential backoff calculator
const calculateDelay = (attempt) => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

// Error classification
const classifyError = (error) => {
  const errorMessage = error.message || error.toString();
  const errorCode = error.code || error.status || '';
  
  // Network/connection errors
  if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
    return 'NETWORK_ERROR';
  }
  
  // Rate limiting
  if (errorCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return 'RATE_LIMIT';
  }
  
  // Server errors
  if (errorCode >= 500 || errorMessage.includes('internal server error') || errorMessage.includes('service unavailable')) {
    return 'SERVICE_UNAVAILABLE';
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
    return 'TIMEOUT';
  }
  
  // Client errors (usually not retryable)
  if (errorCode >= 400 && errorCode < 500) {
    return 'CLIENT_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
};

// Retry wrapper for async operations
const retryWrapper = async (operation, operationName = 'operation') => {
  let lastError;
  const attempts = [];
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    const attemptStartTime = Date.now();
    
    try {
      // Execute the operation
      const result = await operation();
      
      const attemptDuration = Date.now() - attemptStartTime;
      const totalDuration = Date.now() - startTime;
      
      // Log successful attempt
      attempts.push({
        attempt,
        status: 'SUCCESS',
        duration: attemptDuration,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        result,
        attempts,
        totalAttempts: attempt,
        totalDuration: `${totalDuration}ms`,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const attemptDuration = Date.now() - attemptStartTime;
      const errorType = classifyError(error);
      
      // Log failed attempt
      attempts.push({
        attempt,
        status: 'FAILED',
        error: errorType,
        errorMessage: error.message,
        duration: attemptDuration,
        timestamp: new Date().toISOString()
      });
      
      lastError = error;
      
      // Check if error is retryable
      if (!config.retryableErrors.includes(errorType)) {
        console.log(`${operationName}: Non-retryable error (${errorType}), stopping retries`);
        break;
      }
      
      // Check if we have more attempts
      if (attempt < config.maxAttempts) {
        const delay = calculateDelay(attempt);
        console.log(`${operationName}: Attempt ${attempt} failed (${errorType}), retrying in ${delay}ms...`);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  const totalDuration = Date.now() - startTime;
  
  console.error(`${operationName}: All ${config.maxAttempts} attempts failed`);
  
  return {
    success: false,
    error: lastError,
    errorType: classifyError(lastError),
    attempts,
    totalAttempts: config.maxAttempts,
    totalDuration: `${totalDuration}ms`,
    timestamp: new Date().toISOString()
  };
};

// Specific retry wrappers for common operations

// OpenAI API retry wrapper
const retryOpenAI = async (openAICall) => {
  const openAIConfig = {
    ...config,
    retryableErrors: [
      'RATE_LIMIT',
      'SERVICE_UNAVAILABLE',
      'TIMEOUT',
      'NETWORK_ERROR'
    ],
    maxAttempts: 3,
    baseDelay: 2000 // Longer delay for OpenAI
  };
  
  return retryWrapper(openAICall, 'OpenAI API Call');
};

// Google Sheets API retry wrapper
const retryGoogleSheets = async (sheetsCall) => {
  const sheetsConfig = {
    ...config,
    retryableErrors: [
      'RATE_LIMIT',
      'SERVICE_UNAVAILABLE',
      'TIMEOUT',
      'NETWORK_ERROR'
    ],
    maxAttempts: 3,
    baseDelay: 1000
  };
  
  return retryWrapper(sheetsCall, 'Google Sheets API Call');
};

// Twilio API retry wrapper
const retryTwilio = async (twilioCall) => {
  const twilioConfig = {
    ...config,
    retryableErrors: [
      'RATE_LIMIT',
      'SERVICE_UNAVAILABLE',
      'TIMEOUT',
      'NETWORK_ERROR'
    ],
    maxAttempts: 2, // Fewer retries for Twilio
    baseDelay: 1000
  };
  
  return retryWrapper(twilioCall, 'Twilio API Call');
};

// HTTP request retry wrapper
const retryHTTPRequest = async (httpCall) => {
  const httpConfig = {
    ...config,
    retryableErrors: [
      'RATE_LIMIT',
      'SERVICE_UNAVAILABLE',
      'TIMEOUT',
      'NETWORK_ERROR',
      'INTERNAL_SERVER_ERROR'
    ],
    maxAttempts: 3,
    baseDelay: 1000
  };
  
  return retryWrapper(httpCall, 'HTTP Request');
};

// Main function - determine which retry wrapper to use
const executeWithRetry = () => {
  const operationType = inputData.operationType || 'generic';
  const operation = inputData.operation;
  
  if (!operation) {
    return {
      error: 'MISSING_OPERATION',
      message: 'No operation provided for retry wrapper',
      timestamp: new Date().toISOString()
    };
  }
  
  // Return the appropriate retry wrapper based on operation type
  switch (operationType.toLowerCase()) {
    case 'openai':
      return {
        retryFunction: retryOpenAI,
        config: {
          ...config,
          retryableErrors: ['RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR'],
          maxAttempts: 3,
          baseDelay: 2000
        },
        operationType: 'openai',
        timestamp: new Date().toISOString()
      };
      
    case 'googlesheets':
    case 'sheets':
      return {
        retryFunction: retryGoogleSheets,
        config: {
          ...config,
          retryableErrors: ['RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR'],
          maxAttempts: 3,
          baseDelay: 1000
        },
        operationType: 'googlesheets',
        timestamp: new Date().toISOString()
      };
      
    case 'twilio':
      return {
        retryFunction: retryTwilio,
        config: {
          ...config,
          retryableErrors: ['RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR'],
          maxAttempts: 2,
          baseDelay: 1000
        },
        operationType: 'twilio',
        timestamp: new Date().toISOString()
      };
      
    case 'http':
    case 'httprequest':
      return {
        retryFunction: retryHTTPRequest,
        config: {
          ...config,
          retryableErrors: ['RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR', 'INTERNAL_SERVER_ERROR'],
          maxAttempts: 3,
          baseDelay: 1000
        },
        operationType: 'http',
        timestamp: new Date().toISOString()
      };
      
    default:
      return {
        retryFunction: retryWrapper,
        config: config,
        operationType: 'generic',
        timestamp: new Date().toISOString()
      };
  }
};

// Usage examples and documentation
const usageExamples = {
  openai: `
// Example: Retry OpenAI API call
const result = await retryOpenAI(async () => {
  return await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello' }]
  });
});
  `,
  
  googlesheets: `
// Example: Retry Google Sheets API call
const result = await retryGoogleSheets(async () => {
  return await sheets.spreadsheets.values.append({
    spreadsheetId: 'your-sheet-id',
    range: 'Sheet1!A:Z',
    valueInputOption: 'RAW',
    resource: { values: [['data']] }
  });
});
  `,
  
  twilio: `
// Example: Retry Twilio API call
const result = await retryTwilio(async () => {
  return await twilio.messages.create({
    body: 'Hello',
    from: '+1234567890',
    to: '+0987654321'
  });
});
  `
};

// Return retry wrapper configuration and examples
return {
  ...executeWithRetry(),
  usageExamples,
  documentation: {
    description: 'Retry wrapper for API calls with exponential backoff',
    configOptions: config,
    supportedOperations: ['openai', 'googlesheets', 'twilio', 'http', 'generic'],
    retryableErrors: config.retryableErrors
  }
}; 