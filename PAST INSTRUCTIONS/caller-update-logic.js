// Function Node: Caller Directory Update Logic
// Input: $json.callerData, $json.extractedData, $json.conversationResult
// Output: Update/Insert operations for Google Sheets

const callerData = $json.callerData;
const extractedData = $json.extractedData || {};
const conversationResult = $json.conversationResult || {};
const callSid = $json.CallSid;

// Data sanitization functions
const sanitizeData = {
  phoneNumber: (phone) => {
    if (!phone) return null;
    return phone.replace(/[^\d+]/g, '').replace(/^(\d{10})$/, '+1$1').replace(/^(\d{11})$/, '+$1');
  },
  
  businessName: (name) => {
    if (!name) return null;
    return name.trim().replace(/\s+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },
  
  contactEmail: (email) => {
    if (!email) return null;
    return email.trim().toLowerCase();
  },
  
  contactMethod: (method) => {
    if (!method) return null;
    const normalized = method.toLowerCase().trim();
    return ['sms', 'email'].includes(normalized) ? normalized : null;
  }
};

// Prepare update data
const prepareUpdateData = () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Base data from existing caller or new caller
  const baseData = {
    phone_number: sanitizeData.phoneNumber(callerData.phone_number),
    business_name: sanitizeData.businessName(callerData.business_name || extractedData.business_name),
    contact_email: sanitizeData.contactEmail(callerData.contact_email || extractedData.contact_email),
    contact_method: sanitizeData.contactMethod(callerData.contact_method || extractedData.preferred_contact_method),
    is_repeat: true, // Always true after first call
    last_contact_date: today,
    call_count: (parseInt(callerData.call_count) || 0) + 1
  };
  
  // Preserve created_date for existing callers
  if (callerData.created_date) {
    baseData.created_date = callerData.created_date;
  } else {
    baseData.created_date = today;
  }
  
  return baseData;
};

// Validate required fields
const validateUpdateData = (data) => {
  const errors = [];
  
  if (!data.phone_number) {
    errors.push('phone_number is required');
  }
  
  if (!data.business_name) {
    errors.push('business_name is required');
  }
  
  if (!data.contact_method) {
    errors.push('contact_method is required');
  }
  
  if (!data.last_contact_date) {
    errors.push('last_contact_date is required');
  }
  
  // Validate phone number format
  const phonePattern = /^\+[1-9]\d{1,14}$/;
  if (data.phone_number && !phonePattern.test(data.phone_number)) {
    errors.push('phone_number must be in E.164 format');
  }
  
  // Validate email format if provided
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (data.contact_email && !emailPattern.test(data.contact_email)) {
    errors.push('contact_email format is invalid');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Prepare the update operation
const updateData = prepareUpdateData();
const validation = validateUpdateData(updateData);

if (!validation.isValid) {
  return {
    error: 'VALIDATION_ERROR',
    message: 'Data validation failed',
    errors: validation.errors,
    callSid: callSid,
    timestamp: new Date().toISOString()
  };
}

// Determine if this is an insert or update operation
const isNewCaller = !callerData.created_date || callerData.call_count === 1;

if (isNewCaller) {
  // Insert new caller
  return {
    operation: 'INSERT',
    sheetName: 'CallerDirectory',
    data: [
      updateData.phone_number,
      updateData.business_name,
      updateData.contact_email,
      updateData.contact_method,
      updateData.is_repeat,
      updateData.last_contact_date,
      updateData.created_date,
      updateData.call_count
    ],
    metadata: {
      callSid: callSid,
      operation: 'new_caller_insert',
      timestamp: new Date().toISOString(),
      businessName: updateData.business_name,
      phoneNumber: updateData.phone_number
    }
  };
} else {
  // Update existing caller
  return {
    operation: 'UPDATE',
    sheetName: 'CallerDirectory',
    searchCriteria: {
      column: 'phone_number',
      value: updateData.phone_number
    },
    updateData: {
      business_name: updateData.business_name,
      contact_email: updateData.contact_email,
      contact_method: updateData.contact_method,
      is_repeat: updateData.is_repeat,
      last_contact_date: updateData.last_contact_date,
      call_count: updateData.call_count
    },
    metadata: {
      callSid: callSid,
      operation: 'existing_caller_update',
      timestamp: new Date().toISOString(),
      businessName: updateData.business_name,
      phoneNumber: updateData.phone_number,
      previousCallCount: callerData.call_count,
      newCallCount: updateData.call_count
    }
  };
} 