// Enhanced Caller Directory Check - Works with "Get row(s) in sheet"
// Input: $json (Twilio webhook data + Google Sheets data)
// Output: Enhanced caller directory information

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
    lookupMethod: 'google_sheets_get'
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
    // Get caller directory data from Google Sheets "Get row(s) in sheet"
    // The data structure depends on how the Google Sheets node is configured
    let sheetsData = [];
    
    // Handle different possible data structures from "Get row(s) in sheet"
    if ($json.values && Array.isArray($json.values)) {
      // Direct values array from Google Sheets
      sheetsData = $json.values;
    } else if ($json.data && Array.isArray($json.data)) {
      // Nested data structure
      sheetsData = $json.data;
    } else if (Array.isArray($json)) {
      // Direct array
      sheetsData = $json;
    } else {
      // Try to extract from any available structure
      sheetsData = $json.callerDirectory || $json.sheetsData || [];
    }
    
    // Filter out header row if present (assuming first row might be headers)
    if (sheetsData.length > 0 && typeof sheetsData[0] === 'string') {
      // If first row looks like headers, skip it
      if (sheetsData[0].toLowerCase().includes('phone') || 
          sheetsData[0].toLowerCase().includes('business')) {
        sheetsData = sheetsData.slice(1);
      }
    }
    
    callerDirectory.lookupResults = sheetsData;
    
    // Find matching caller with multiple phone number formats
    const findCaller = (phoneNumber) => {
      return sheetsData.find(caller => {
        // Handle different data structures
        let callerPhone;
        if (Array.isArray(caller)) {
          // Array format: [phone, business, email, method, repeat, last_contact, created, call_count]
          callerPhone = caller[0];
        } else if (typeof caller === 'object') {
          // Object format: { phone_number: "...", business_name: "..." }
          callerPhone = caller.phone_number || caller.phone;
        } else {
          // String format (unlikely but possible)
          callerPhone = caller;
        }
        
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
      
      // Extract caller info based on data structure
      let callerInfo;
      if (Array.isArray(existingCaller)) {
        // Array format: [phone, business, email, method, repeat, last_contact, created, call_count]
        callerInfo = {
          phone: existingCaller[0],
          businessName: existingCaller[1],
          contactEmail: existingCaller[2],
          preferredContact: existingCaller[3],
          lastCallDate: existingCaller[5],
          createdDate: existingCaller[6],
          callCount: parseInt(existingCaller[7]) || 1,
          isRepeat: true
        };
      } else if (typeof existingCaller === 'object') {
        // Object format
        callerInfo = {
          phone: existingCaller.phone_number || existingCaller.phone,
          businessName: existingCaller.business_name || existingCaller.businessName,
          contactEmail: existingCaller.contact_email || existingCaller.contactEmail,
          preferredContact: existingCaller.contact_method || existingCaller.preferredContact,
          lastCallDate: existingCaller.last_contact_date || existingCaller.lastCallDate,
          createdDate: existingCaller.created_date || existingCaller.createdDate,
          callCount: parseInt(existingCaller.call_count || existingCaller.callCount) || 1,
          isRepeat: true
        };
      }
      
      callerDirectory.callerInfo = callerInfo;
      
      // Set conversation state and cues
      callerDirectory.conversationCues = {
        welcomeMessage: `Welcome back! Should we still send this to ${callerInfo.businessName}?`,
        contactConfirmation: `Still OK to send the contract to ${callerInfo.preferredContact}?`,
        businessName: callerInfo.businessName,
        preferredContact: callerInfo.preferredContact
      };
      
      // Update call count for this interaction
      callerDirectory.updateOperation = {
        operation: 'UPDATE',
        searchCriteria: {
          value: normalizedPhone
        },
        data: {
          business_name: callerInfo.businessName,
          contact_email: callerInfo.contactEmail,
          contact_method: callerInfo.preferredContact,
          is_repeat: true,
          last_contact_date: new Date().toISOString().split('T')[0],
          call_count: callerInfo.callCount + 1
        },
        metadata: {
          businessName: callerInfo.businessName,
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
  error: callerDirectory.error || null,
  // Include debug information for troubleshooting
  debug: {
    sheetsDataReceived: callerDirectory.lookupResults.length,
    normalizedPhone: callerDirectory.lookupInfo.normalizedPhone,
    isReturningCaller: callerDirectory.isReturningCaller,
    dataStructure: Array.isArray(callerDirectory.lookupResults[0]) ? 'array' : 'object'
  }
}; 