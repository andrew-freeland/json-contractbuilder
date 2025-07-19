// Function Node: Error Handling and Validation
// Input: $json (webhook payload + any errors)
// Output: Error status and recovery actions

const webhookData = $json;
const callSid = webhookData.CallSid;
const speechResult = webhookData.SpeechResult;
const callerPhone = webhookData.From;

// Error types and their handling
const errorTypes = {
  // Twilio webhook validation errors
  INVALID_WEBHOOK: {
    code: 'INVALID_WEBHOOK',
    message: 'Invalid webhook payload received',
    recovery: 'restart_conversation',
    severity: 'critical'
  },
  
  // OpenAI extraction failures
  EXTRACTION_FAILED: {
    code: 'EXTRACTION_FAILED',
    message: 'Failed to extract data from speech',
    recovery: 'retry_extraction',
    severity: 'high'
  },
  
  // Invalid phone number
  INVALID_PHONE: {
    code: 'INVALID_PHONE',
    message: 'Invalid phone number format',
    recovery: 'end_call',
    severity: 'critical'
  },
  
  // Speech recognition issues
  SPEECH_RECOGNITION_ERROR: {
    code: 'SPEECH_RECOGNITION_ERROR',
    message: 'Speech recognition failed or unclear',
    recovery: 'ask_for_repeat',
    severity: 'medium'
  },
  
  // Google Sheets access issues
  SHEETS_ACCESS_ERROR: {
    code: 'SHEETS_ACCESS_ERROR',
    message: 'Cannot access caller directory',
    recovery: 'continue_without_directory',
    severity: 'medium'
  },
  
  // Conversation timeout
  CONVERSATION_TIMEOUT: {
    code: 'CONVERSATION_TIMEOUT',
    message: 'Conversation exceeded maximum length',
    recovery: 'end_call',
    severity: 'low'
  },
  
  // Missing required fields
  MISSING_REQUIRED_FIELDS: {
    code: 'MISSING_REQUIRED_FIELDS',
    message: 'Required project fields are missing',
    recovery: 'continue_with_partial_data',
    severity: 'medium'
  }
};

// Validation functions
const validations = {
  // Validate webhook payload
  validateWebhook: (data) => {
    const required = ['CallSid', 'From', 'SpeechResult', 'To'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      return {
        isValid: false,
        error: errorTypes.INVALID_WEBHOOK,
        details: `Missing fields: ${missing.join(', ')}`
      };
    }
    
    // Validate CallSid format
    if (!data.CallSid.match(/^CA[a-zA-Z0-9]{32}$/)) {
      return {
        isValid: false,
        error: errorTypes.INVALID_WEBHOOK,
        details: 'Invalid CallSid format'
      };
    }
    
    // Validate phone number format
    if (!data.From.match(/^\+[1-9]\d{1,14}$/)) {
      return {
        isValid: false,
        error: errorTypes.INVALID_PHONE,
        details: 'Invalid phone number format'
      };
    }
    
    return { isValid: true };
  },
  
  // Validate extracted data
  validateExtractedData: (data) => {
    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        error: errorTypes.EXTRACTION_FAILED,
        details: 'No data extracted from speech'
      };
    }
    
    // Check for minimum required fields
    const requiredFields = ['business_name', 'project_type', 'project_address'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length === requiredFields.length) {
      return {
        isValid: false,
        error: errorTypes.EXTRACTION_FAILED,
        details: 'No project details extracted'
      };
    }
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: errorTypes.MISSING_REQUIRED_FIELDS,
        details: `Missing fields: ${missingFields.join(', ')}`
      };
    }
    
    return { isValid: true };
  },
  
  // Validate speech result
  validateSpeechResult: (speech) => {
    if (!speech || speech.trim().length < 3) {
      return {
        isValid: false,
        error: errorTypes.SPEECH_RECOGNITION_ERROR,
        details: 'Speech result too short or empty'
      };
    }
    
    // Check for common speech recognition errors
    const errorPatterns = [
      /unclear/i,
      /didn't catch/i,
      /could not understand/i,
      /speech not recognized/i
    ];
    
    for (const pattern of errorPatterns) {
      if (pattern.test(speech)) {
        return {
          isValid: false,
          error: errorTypes.SPEECH_RECOGNITION_ERROR,
          details: 'Speech recognition indicated unclear audio'
        };
      }
    }
    
    return { isValid: true };
  }
};

// Main error handling function
const handleErrors = () => {
  const errors = [];
  const warnings = [];
  
  // Validate webhook
  const webhookValidation = validations.validateWebhook(webhookData);
  if (!webhookValidation.isValid) {
    errors.push(webhookValidation.error);
  }
  
  // Validate speech result
  if (speechResult) {
    const speechValidation = validations.validateSpeechResult(speechResult);
    if (!speechValidation.isValid) {
      errors.push(speechValidation.error);
    }
  }
  
  // Validate extracted data if available
  if (webhookData.extractedData) {
    const dataValidation = validations.validateExtractedData(webhookData.extractedData);
    if (!dataValidation.isValid) {
      errors.push(dataValidation.error);
    }
  }
  
  // Check for conversation length
  if (webhookData.conversationHistory && webhookData.conversationHistory.length >= 15) {
    warnings.push(errorTypes.CONVERSATION_TIMEOUT);
  }
  
  // Determine recovery action
  let recoveryAction = 'continue';
  let errorMessage = '';
  
  if (errors.length > 0) {
    // Sort by severity (critical > high > medium > low)
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    errors.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    
    const primaryError = errors[0];
    recoveryAction = primaryError.recovery;
    errorMessage = primaryError.message;
  }
  
  return {
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    errors: errors,
    warnings: warnings,
    recoveryAction: recoveryAction,
    errorMessage: errorMessage,
    callSid: callSid,
    callerPhone: callerPhone,
    timestamp: new Date().toISOString()
  };
};

// Execute error handling
const errorResult = handleErrors();

// Add error context for logging
if (errorResult.hasErrors || errorResult.hasWarnings) {
  errorResult.context = {
    webhookData: {
      CallSid: webhookData.CallSid,
      From: webhookData.From,
      SpeechResultLength: webhookData.SpeechResult?.length || 0,
      HasExtractedData: !!webhookData.extractedData
    },
    conversationState: webhookData.currentState,
    conversationLength: webhookData.conversationHistory?.length || 0
  };
}

return errorResult; 