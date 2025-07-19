// Function Node: Google Sheets Operations Handler
// Input: $json.updateOperation (from caller-update-logic.js)
// Output: Formatted operations for Google Sheets nodes

const updateOperation = $json.updateOperation;
const callSid = $json.CallSid;

// Rate limiting configuration
const RATE_LIMIT_DELAY = 250; // milliseconds
const MAX_RETRIES = 3;

// Operation templates for Google Sheets nodes
const sheetOperations = {
  // Insert new caller row
  INSERT: (data) => {
    return {
      operation: 'append',
      sheetName: 'CallerDirectory',
      options: {
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS'
      },
      data: {
        values: [data]
      },
      metadata: {
        operation: 'insert_new_caller',
        timestamp: new Date().toISOString(),
        callSid: callSid,
        retryCount: 0
      }
    };
  },
  
  // Update existing caller row
  UPDATE: (searchCriteria, updateData) => {
    return {
      operation: 'update',
      sheetName: 'CallerDirectory',
      options: {
        valueInputOption: 'RAW'
      },
      searchCriteria: {
        range: 'CallerDirectory!A:A', // phone_number column
        value: searchCriteria.value
      },
      updateData: {
        range: 'CallerDirectory!B:F', // business_name through call_count
        values: [
          [
            updateData.business_name,
            updateData.contact_email,
            updateData.contact_method,
            updateData.is_repeat,
            updateData.last_contact_date,
            updateData.call_count
          ]
        ]
      },
      metadata: {
        operation: 'update_existing_caller',
        timestamp: new Date().toISOString(),
        callSid: callSid,
        retryCount: 0
      }
    };
  }
};

// Error handling for sheet operations
const handleSheetError = (error, operation) => {
  const errorTypes = {
    'PERMISSION_DENIED': {
      severity: 'critical',
      recovery: 'check_credentials',
      message: 'Google Sheets access denied. Check service account permissions.'
    },
    'NOT_FOUND': {
      severity: 'critical',
      recovery: 'check_sheet_exists',
      message: 'CallerDirectory sheet not found. Verify sheet name and permissions.'
    },
    'QUOTA_EXCEEDED': {
      severity: 'high',
      recovery: 'retry_with_delay',
      message: 'Google Sheets API quota exceeded. Retrying with delay.'
    },
    'RATE_LIMIT_EXCEEDED': {
      severity: 'medium',
      recovery: 'retry_with_delay',
      message: 'Rate limit exceeded. Retrying with delay.'
    },
    'INVALID_ARGUMENT': {
      severity: 'high',
      recovery: 'validate_data',
      message: 'Invalid data format. Check input validation.'
    }
  };
  
  const errorInfo = errorTypes[error.code] || {
    severity: 'medium',
    recovery: 'retry',
    message: 'Unknown Google Sheets error occurred.'
  };
  
  return {
    error: true,
    errorCode: error.code,
    errorMessage: errorInfo.message,
    severity: errorInfo.severity,
    recovery: errorInfo.recovery,
    operation: operation,
    callSid: callSid,
    timestamp: new Date().toISOString()
  };
};

// Validate operation before execution
const validateOperation = (operation) => {
  if (!operation || !operation.operation) {
    return {
      isValid: false,
      error: 'INVALID_OPERATION',
      message: 'Operation object is missing or invalid'
    };
  }
  
  if (!['INSERT', 'UPDATE'].includes(operation.operation)) {
    return {
      isValid: false,
      error: 'UNSUPPORTED_OPERATION',
      message: `Unsupported operation: ${operation.operation}`
    };
  }
  
  if (operation.operation === 'INSERT' && (!operation.data || !Array.isArray(operation.data))) {
    return {
      isValid: false,
      error: 'INVALID_INSERT_DATA',
      message: 'Insert operation requires valid data array'
    };
  }
  
  if (operation.operation === 'UPDATE' && (!operation.searchCriteria || !operation.updateData)) {
    return {
      isValid: false,
      error: 'INVALID_UPDATE_DATA',
      message: 'Update operation requires search criteria and update data'
    };
  }
  
  return { isValid: true };
};

// Main operation handler
const handleOperation = () => {
  // Validate the operation
  const validation = validateOperation(updateOperation);
  if (!validation.isValid) {
    return {
      error: true,
      errorCode: validation.error,
      errorMessage: validation.message,
      callSid: callSid,
      timestamp: new Date().toISOString()
    };
  }
  
  // Generate the appropriate sheet operation
  let sheetOperation;
  
  if (updateOperation.operation === 'INSERT') {
    sheetOperation = sheetOperations.INSERT(updateOperation.data);
  } else if (updateOperation.operation === 'UPDATE') {
    sheetOperation = sheetOperations.UPDATE(
      updateOperation.searchCriteria,
      updateOperation.updateData
    );
  }
  
  // Add rate limiting delay
  sheetOperation.rateLimitDelay = RATE_LIMIT_DELAY;
  sheetOperation.maxRetries = MAX_RETRIES;
  
  // Add operation metadata
  sheetOperation.originalOperation = updateOperation;
  sheetOperation.callSid = callSid;
  
  return {
    success: true,
    sheetOperation: sheetOperation,
    metadata: {
      operation: updateOperation.operation,
      callSid: callSid,
      timestamp: new Date().toISOString(),
      businessName: updateOperation.metadata?.businessName,
      phoneNumber: updateOperation.metadata?.phoneNumber
    }
  };
};

// Execute the operation handler
return handleOperation(); 