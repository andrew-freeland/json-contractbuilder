// Enhanced Caller Directory Check
// Input: $json (Twilio webhook data)
// Output: Enhanced caller directory information with Google Sheets integration

const inputData = $json;
const from = inputData.From;
const callSid = inputData.CallSid;

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

// Initialize caller directory structure
const callerDirectory = {
  lookupResults: [],
  isReturningCaller: false,
  callerInfo: null,
  lastCallDate: null,
  callHistory: [],
  lookupInfo: {
    originalPhone: from,
    normalizedPhone: null,
    callSid: callSid,
    lookupTimestamp: new Date().toISOString(),
    lookupMethod: 'google_sheets'
  }
};

// Check if caller exists in directory
if (from) {
  // Normalize phone number for lookup
  const normalizedPhone = normalizePhoneNumber(from);
  callerDirectory.lookupInfo.normalizedPhone = normalizedPhone;
  
  if (!normalizedPhone) {
    // Invalid phone number format
    callerDirectory.error = {
      code: 'INVALID_PHONE_NUMBER',
      message: 'Phone number format is invalid',
      originalPhone: from
    };
  } else {
    // Get caller directory data from Google Sheets
    // This assumes the Google Sheets Read node output is available
    const sheetsData = $json.callerDirectory || [];
    
    // Find matching caller with multiple phone number formats
    const findCaller = (phoneNumber) => {
      return sheetsData.find(caller => {
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
      callerDirectory.isReturningCaller = true;
      callerDirectory.callerInfo = {
        phone: existingCaller.phone_number,
        businessName: existingCaller.business_name,
        contactEmail: existingCaller.contact_email,
        preferredContact: existingCaller.contact_method,
        lastCallDate: existingCaller.last_contact_date,
        createdDate: existingCaller.created_date,
        callCount: parseInt(existingCaller.call_count) || 1,
        isRepeat: true
      };
      
      // Set conversation state and cues
      callerDirectory.conversationCues = {
        welcomeMessage: `Welcome back! Should we still send this to ${existingCaller.business_name}?`,
        contactConfirmation: `Still OK to send the contract to ${existingCaller.contact_method}?`,
        businessName: existingCaller.business_name,
        preferredContact: existingCaller.contact_method
      };
      
      // Update call count for this interaction
      callerDirectory.updateOperation = {
        operation: 'UPDATE',
        searchCriteria: {
          value: normalizedPhone
        },
        data: {
          business_name: existingCaller.business_name,
          contact_email: existingCaller.contact_email,
          contact_method: existingCaller.contact_method,
          is_repeat: true,
          last_contact_date: new Date().toISOString().split('T')[0],
          call_count: (parseInt(existingCaller.call_count) || 1) + 1
        },
        metadata: {
          businessName: existingCaller.business_name,
          phoneNumber: normalizedPhone,
          operation: 'increment_call_count'
        }
      };
      
    } else {
      // New caller
      callerDirectory.isReturningCaller = false;
      callerDirectory.callerInfo = {
        phone: normalizedPhone,
        businessName: null,
        contactEmail: null,
        preferredContact: null,
        lastCallDate: new Date().toISOString().split('T')[0],
        createdDate: new Date().toISOString().split('T')[0],
        callCount: 1,
        isRepeat: false
      };
      
      // Set conversation state and cues for new caller
      callerDirectory.conversationCues = {
        welcomeMessage: "What's the name of your business?",
        contactQuestion: "What's the best way to get this to you — text or email?",
        businessName: null,
        preferredContact: null
      };
      
      // Prepare insert operation for new caller
      callerDirectory.updateOperation = {
        operation: 'INSERT',
        data: [
          normalizedPhone,           // phone_number
          '',                        // business_name (will be filled during conversation)
          '',                        // contact_email (will be filled during conversation)
          '',                        // contact_method (will be filled during conversation)
          false,                     // is_repeat
          new Date().toISOString().split('T')[0], // last_contact_date
          new Date().toISOString().split('T')[0], // created_date
          1                          // call_count
        ],
        metadata: {
          phoneNumber: normalizedPhone,
          operation: 'create_new_caller'
        }
      };
    }
  }
} else {
  // No phone number provided
  callerDirectory.error = {
    code: 'MISSING_PHONE_NUMBER',
    message: 'No From phone number provided in webhook',
    callSid: callSid
  };
}

// Set conversation state based on caller type
const conversationState = callerDirectory.isReturningCaller ? 'returning_caller' : 'new_caller';

// Return enhanced data structure
return {
  ...inputData,
  callerDirectory,
  conversationState,
  timestamp: new Date().toISOString(),
  // Include Google Sheets operation for downstream processing
  googleSheetsOperation: callerDirectory.updateOperation || null,
  // Include error information if any
  error: callerDirectory.error || null
}; 