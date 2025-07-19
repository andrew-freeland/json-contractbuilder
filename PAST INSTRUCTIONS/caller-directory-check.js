// Function Node: Check Caller Directory
// Input: $json.From (phone number), $json.CallSid
// Output: Caller info if found, null if new

// This function would be used with Google Sheets node to check CallerDirectory
// Assume we have a sheet with columns: PhoneNumber, BusinessName, PreferredContact, LastCallDate

const callerPhone = $json.From;
const callSid = $json.CallSid;

// Query the CallerDirectory sheet for this phone number
// This would be the output from a Google Sheets "Read" node
const callerDirectory = $json.callerDirectory || [];

// Find matching caller
const existingCaller = callerDirectory.find(caller => 
  caller.PhoneNumber === callerPhone || 
  caller.PhoneNumber === callerPhone.replace('+1', '') ||
  caller.PhoneNumber === '+1' + callerPhone.replace('+1', '')
);

if (existingCaller) {
  return {
    isReturningCaller: true,
    businessName: existingCaller.BusinessName,
    preferredContact: existingCaller.PreferredContact,
    lastCallDate: existingCaller.LastCallDate,
    phoneNumber: callerPhone,
    callSid: callSid,
    welcomeMessage: `Welcome back! Should we still send this to ${existingCaller.BusinessName}?`,
    contactConfirmation: `Still OK to send the contract to ${existingCaller.PreferredContact}?`
  };
} else {
  return {
    isReturningCaller: false,
    phoneNumber: callerPhone,
    callSid: callSid,
    welcomeMessage: "What's the name of your business?",
    contactQuestion: "What's the best way to get this to you — text or email?"
  };
} 