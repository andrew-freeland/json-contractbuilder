// Enhanced Caller Directory Check - Two-Tier Matching System
// Input: $json (Twilio webhook data + Google Sheets data + extracted business info)
// Output: Enhanced caller directory information with business identity verification

const inputData = $json;
const from = inputData.From;
const callSid = inputData.CallSid;

// Get extracted business data from previous nodes
const extractedData = inputData.extractedData || {};
const businessName = extractedData.business_name || extractedData.businessName;
const licenseNumber = extractedData.license_number || extractedData.licenseNumber;
const contactEmail = extractedData.contact_email || extractedData.contactEmail;
const contactMethod = extractedData.contact_method || extractedData.contactMethod;

// Phone number normalization function
const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  
  let normalized = phone.replace(/[^\d+]/g, '');
  
  if (!normalized.startsWith('+')) {
    if (normalized.length === 10) {
      normalized = '+1' + normalized;
    } else if (normalized.length === 11 && normalized.startsWith('1')) {
      normalized = '+' + normalized;
    }
  }
  
  const e164Pattern = /^\+[1-9]\d{1,14}$/;
  return e164Pattern.test(normalized) ? normalized : null;
};

// Business name normalization function
const normalizeBusinessName = (name) => {
  if (!name) return null;
  return name.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim();
};

// License number normalization function
const normalizeLicenseNumber = (license) => {
  if (!license) return null;
  return license.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
};

// Initialize caller directory structure
const callerDirectory = {
  lookupResults: [],
  isReturningCaller: false,
  callerInfo: null,
  matchType: null, // 'phone_exact', 'business_identity', or null
  matchConfidence: 0,
  lookupInfo: {
    originalPhone: from,
    normalizedPhone: null,
    callSid: callSid,
    lookupTimestamp: new Date().toISOString(),
    lookupMethod: 'two_tier_matching'
  }
};

// Check if caller exists in directory
if (from) {
  const normalizedPhone = normalizePhoneNumber(from);
  callerDirectory.lookupInfo.normalizedPhone = normalizedPhone;
  
  if (!normalizedPhone) {
    callerDirectory.error = {
      code: 'INVALID_PHONE_NUMBER',
      message: 'Phone number format is invalid',
      originalPhone: from
    };
  } else {
    // Get caller directory data from Google Sheets "Get row(s) in sheet"
    let sheetsData = [];
    
    // Handle different possible data structures from "Get row(s) in sheet"
    if ($json.values && Array.isArray($json.values)) {
      sheetsData = $json.values;
    } else if ($json.data && Array.isArray($json.data)) {
      sheetsData = $json.data;
    } else if (Array.isArray($json)) {
      sheetsData = $json;
    } else {
      sheetsData = $json.callerDirectory || $json.sheetsData || [];
    }
    
    // Filter out header row if present
    if (sheetsData.length > 0 && typeof sheetsData[0] === 'string') {
      if (sheetsData[0].toLowerCase().includes('phone') || 
          sheetsData[0].toLowerCase().includes('business')) {
        sheetsData = sheetsData.slice(1);
      }
    }
    
    callerDirectory.lookupResults = sheetsData;
    
    // TIER 1: Exact Phone Number Match
    const findPhoneMatch = (phoneNumber) => {
      return sheetsData.find(caller => {
        let callerPhone;
        if (Array.isArray(caller)) {
          callerPhone = caller[0]; // phone_number column
        } else if (typeof caller === 'object') {
          callerPhone = caller.phone_number || caller.phone;
        } else {
          callerPhone = caller;
        }
        
        if (!callerPhone) return false;
        
        // Exact match and format variations
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
    
    // TIER 2: Business Identity Match
    const findBusinessIdentityMatch = () => {
      // Need at least 2 of 3: business name, license number, contact email
      const hasBusinessName = !!businessName;
      const hasLicenseNumber = !!licenseNumber;
      const hasContactEmail = !!contactEmail;
      
      const matchCriteria = [];
      if (hasBusinessName) matchCriteria.push('business_name');
      if (hasLicenseNumber) matchCriteria.push('license_number');
      if (hasContactEmail) matchCriteria.push('contact_email');
      
      // Require at least 2 criteria for business identity match
      if (matchCriteria.length < 2) {
        return null;
      }
      
      return sheetsData.find(caller => {
        let callerBusinessName, callerLicenseNumber, callerContactEmail;
        
        if (Array.isArray(caller)) {
          // [phone, business, email, method, repeat, last_contact, created, call_count]
          callerBusinessName = caller[1];
          callerContactEmail = caller[2];
          // Note: License number might be in a different column or separate sheet
          callerLicenseNumber = caller[8] || null; // Assuming license is column I
        } else if (typeof caller === 'object') {
          callerBusinessName = caller.business_name || caller.businessName;
          callerContactEmail = caller.contact_email || caller.contactEmail;
          callerLicenseNumber = caller.license_number || caller.licenseNumber;
        }
        
        let matchScore = 0;
        let totalPossibleMatches = 0;
        
        // Check business name match
        if (hasBusinessName && callerBusinessName) {
          totalPossibleMatches++;
          const normalizedInput = normalizeBusinessName(businessName);
          const normalizedStored = normalizeBusinessName(callerBusinessName);
          
          if (normalizedInput === normalizedStored) {
            matchScore++;
          } else if (normalizedInput.includes(normalizedStored) || normalizedStored.includes(normalizedInput)) {
            matchScore += 0.8; // Partial match
          }
        }
        
        // Check license number match
        if (hasLicenseNumber && callerLicenseNumber) {
          totalPossibleMatches++;
          const normalizedInput = normalizeLicenseNumber(licenseNumber);
          const normalizedStored = normalizeLicenseNumber(callerLicenseNumber);
          
          if (normalizedInput === normalizedStored) {
            matchScore++;
          }
        }
        
        // Check contact email match
        if (hasContactEmail && callerContactEmail) {
          totalPossibleMatches++;
          const normalizedInput = contactEmail.toLowerCase().trim();
          const normalizedStored = callerContactEmail.toLowerCase().trim();
          
          if (normalizedInput === normalizedStored) {
            matchScore++;
          }
        }
        
        // Require at least 2 matches with 80% confidence
        const confidence = totalPossibleMatches > 0 ? matchScore / totalPossibleMatches : 0;
        return confidence >= 0.8 && matchScore >= 2;
      });
    };
    
    // Execute matching logic
    const phoneMatch = findPhoneMatch(normalizedPhone);
    const businessIdentityMatch = findBusinessIdentityMatch();
    
    let matchedCaller = null;
    
    if (phoneMatch) {
      // TIER 1 MATCH: Exact phone number match
      matchedCaller = phoneMatch;
      callerDirectory.matchType = 'phone_exact';
      callerDirectory.matchConfidence = 1.0;
      callerDirectory.isReturningCaller = true;
      
    } else if (businessIdentityMatch) {
      // TIER 2 MATCH: Business identity verification
      matchedCaller = businessIdentityMatch;
      callerDirectory.matchType = 'business_identity';
      callerDirectory.matchConfidence = 0.9;
      callerDirectory.isReturningCaller = true;
      
      // Update the phone number to the new one
      if (Array.isArray(matchedCaller)) {
        matchedCaller[0] = normalizedPhone; // Update phone number
      } else if (typeof matchedCaller === 'object') {
        matchedCaller.phone_number = normalizedPhone;
      }
      
    } else {
      // NO MATCH: New caller
      callerDirectory.matchType = null;
      callerDirectory.matchConfidence = 0;
      callerDirectory.isReturningCaller = false;
    }
    
    // Process the matched caller or create new caller
    if (matchedCaller) {
      // Extract caller info based on data structure
      let callerInfo;
      if (Array.isArray(matchedCaller)) {
        callerInfo = {
          phone: matchedCaller[0],
          businessName: matchedCaller[1],
          contactEmail: matchedCaller[2],
          preferredContact: matchedCaller[3],
          lastCallDate: matchedCaller[5],
          createdDate: matchedCaller[6],
          callCount: parseInt(matchedCaller[7]) || 1,
          isRepeat: true
        };
      } else if (typeof matchedCaller === 'object') {
        callerInfo = {
          phone: matchedCaller.phone_number || matchedCaller.phone,
          businessName: matchedCaller.business_name || matchedCaller.businessName,
          contactEmail: matchedCaller.contact_email || matchedCaller.contactEmail,
          preferredContact: matchedCaller.contact_method || matchedCaller.preferredContact,
          lastCallDate: matchedCaller.last_contact_date || matchedCaller.lastCallDate,
          createdDate: matchedCaller.created_date || matchedCaller.createdDate,
          callCount: parseInt(matchedCaller.call_count || matchedCaller.callCount) || 1,
          isRepeat: true
        };
      }
      
      callerDirectory.callerInfo = callerInfo;
      
      // Set conversation cues based on match type
      if (callerDirectory.matchType === 'phone_exact') {
        callerDirectory.conversationCues = {
          welcomeMessage: `Welcome back! Should we still send this to ${callerInfo.businessName}?`,
          contactConfirmation: `Still OK to send the contract to ${callerInfo.preferredContact}?`,
          businessName: callerInfo.businessName,
          preferredContact: callerInfo.preferredContact
        };
      } else if (callerDirectory.matchType === 'business_identity') {
        callerDirectory.conversationCues = {
          welcomeMessage: `Welcome back! I recognize ${callerInfo.businessName}. Should we update your contact number to ${normalizedPhone}?`,
          contactConfirmation: `Still OK to send the contract to ${callerInfo.preferredContact}?`,
          businessName: callerInfo.businessName,
          preferredContact: callerInfo.preferredContact,
          phoneUpdate: true
        };
      }
      
      // Update operation for returning caller
      callerDirectory.updateOperation = {
        operation: 'UPDATE',
        searchCriteria: {
          value: callerDirectory.matchType === 'phone_exact' ? normalizedPhone : callerInfo.phone
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
          operation: callerDirectory.matchType === 'business_identity' ? 'update_phone_and_increment' : 'increment_call_count',
          matchType: callerDirectory.matchType
        }
      };
      
    } else {
      // New caller
      callerDirectory.callerInfo = {
        phone: normalizedPhone,
        businessName: businessName || null,
        contactEmail: contactEmail || null,
        preferredContact: contactMethod || null,
        lastCallDate: new Date().toISOString().split('T')[0],
        createdDate: new Date().toISOString().split('T')[0],
        callCount: 1,
        isRepeat: false
      };
      
      callerDirectory.conversationCues = {
        welcomeMessage: businessName ? `Welcome! I see you're from ${businessName}. What's the best way to get this to you — text or email?` : "What's the name of your business?",
        contactQuestion: "What's the best way to get this to you — text or email?",
        businessName: businessName,
        preferredContact: null
      };
      
      // Insert operation for new caller
      callerDirectory.updateOperation = {
        operation: 'INSERT',
        data: [
          normalizedPhone,
          businessName || '',
          contactEmail || '',
          contactMethod || '',
          false,
          new Date().toISOString().split('T')[0],
          new Date().toISOString().split('T')[0],
          1
        ],
        metadata: {
          phoneNumber: normalizedPhone,
          businessName: businessName,
          operation: 'create_new_caller',
          matchType: 'new_caller'
        }
      };
    }
  }
} else {
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
  googleSheetsOperation: callerDirectory.updateOperation || null,
  error: callerDirectory.error || null,
  debug: {
    sheetsDataReceived: callerDirectory.lookupResults.length,
    normalizedPhone: callerDirectory.lookupInfo.normalizedPhone,
    isReturningCaller: callerDirectory.isReturningCaller,
    matchType: callerDirectory.matchType,
    matchConfidence: callerDirectory.matchConfidence,
    businessNameProvided: !!businessName,
    licenseNumberProvided: !!licenseNumber,
    contactEmailProvided: !!contactEmail,
    dataStructure: Array.isArray(callerDirectory.lookupResults[0]) ? 'array' : 'object'
  }
}; 