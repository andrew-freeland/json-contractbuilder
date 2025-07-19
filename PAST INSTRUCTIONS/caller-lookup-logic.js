// Function Node: Caller Directory Lookup
// Input: $json.From (phone number from Twilio webhook)
// Output: Caller info if found, null if new caller

const callerPhone = $json.From;
const callSid = $json.CallSid;

// Phone number normalization function
const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    // Assume US number if no country code
    if (normalized.length === 10) {
      normalized = '+1' + normalized;
    } else if (normalized.length === 11 && normalized.startsWith('1')) {
      normalized = '+' + normalized;
    }
  }
  
  // Validate E.164 format
  const e164Pattern = /^\+[1-9]\d{1,14}$/;
  return e164Pattern.test(normalized) ? normalized : null;
};

// Normalize the incoming phone number
const normalizedPhone = normalizePhoneNumber(callerPhone);

if (!normalizedPhone) {
  return {
    error: 'INVALID_PHONE_NUMBER',
    message: 'Phone number format is invalid',
    originalPhone: callerPhone,
    callSid: callSid
  };
}

// Get caller directory data from Google Sheets Read node
// This assumes the Google Sheets node output is in $json.callerDirectory
const callerDirectory = $json.callerDirectory || [];

// Find matching caller with multiple phone number formats
const findCaller = (phoneNumber) => {
  return callerDirectory.find(caller => {
    const callerPhone = caller.phone_number;
    if (!callerPhone) return false;
    
    // Exact match
    if (callerPhone === phoneNumber) return true;
    
    // Try different formats
    const formats = [
      phoneNumber,
      phoneNumber.replace('+1', ''),
      '+1' + phoneNumber.replace('+1', ''),
      phoneNumber.replace('+', ''),
      '+' + phoneNumber.replace('+', '')
    ];
    
    return formats.includes(callerPhone);
  });
};

const existingCaller = findCaller(normalizedPhone);

if (existingCaller) {
  // Returning caller found
  return {
    isReturningCaller: true,
    callerData: {
      phone_number: existingCaller.phone_number,
      business_name: existingCaller.business_name,
      contact_email: existingCaller.contact_email,
      contact_method: existingCaller.contact_method,
      is_repeat: true, // Will be updated to true
      last_contact_date: existingCaller.last_contact_date,
      created_date: existingCaller.created_date,
      call_count: parseInt(existingCaller.call_count) || 1
    },
    conversationCues: {
      welcomeMessage: `Welcome back! Should we still send this to ${existingCaller.business_name}?`,
      contactConfirmation: `Still OK to send the contract to ${existingCaller.contact_method}?`,
      businessName: existingCaller.business_name,
      preferredContact: existingCaller.contact_method
    },
    lookupInfo: {
      originalPhone: callerPhone,
      normalizedPhone: normalizedPhone,
      callSid: callSid,
      lookupTimestamp: new Date().toISOString()
    }
  };
} else {
  // New caller
  return {
    isReturningCaller: false,
    callerData: {
      phone_number: normalizedPhone,
      business_name: null,
      contact_email: null,
      contact_method: null,
      is_repeat: false,
      last_contact_date: new Date().toISOString().split('T')[0],
      created_date: new Date().toISOString().split('T')[0],
      call_count: 1
    },
    conversationCues: {
      welcomeMessage: "What's the name of your business?",
      contactQuestion: "What's the best way to get this to you — text or email?",
      businessName: null,
      preferredContact: null
    },
    lookupInfo: {
      originalPhone: callerPhone,
      normalizedPhone: normalizedPhone,
      callSid: callSid,
      lookupTimestamp: new Date().toISOString()
    }
  };
} 