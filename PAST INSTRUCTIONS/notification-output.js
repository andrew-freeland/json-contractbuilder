// Function Node: Generate Notification Output
// Input: $json.extractedData, $json.callerInfo, $json.complianceWarnings
// Output: Structured notification for founder

const extractedData = $json.extractedData;
const callerInfo = $json.callerInfo;
const complianceWarnings = $json.complianceWarnings || [];
const callSid = $json.CallSid;
const callerPhone = $json.From;

// Generate scope summary from extracted data
const generateScopeSummary = (data) => {
  const scopeParts = [];
  
  if (data.project_type) {
    scopeParts.push(data.project_type);
  }
  
  if (data.scope) {
    scopeParts.push(data.scope);
  }
  
  if (data.materials_by) {
    scopeParts.push(`Materials: ${data.materials_by}`);
  }
  
  return scopeParts.join(' - ') || 'Scope details pending';
};

// Format the notification payload
const notificationPayload = {
  business_name: extractedData.business_name || 'Unknown',
  project_type: extractedData.project_type || 'Unknown',
  address: extractedData.project_address || 'Address pending',
  budget: extractedData.budget || 'Budget pending',
  payment_terms: extractedData.payment_terms || 'Terms pending',
  start_date: extractedData.start_date || 'Date pending',
  contact_method: extractedData.preferred_contact_method || callerInfo?.preferredContact || 'Unknown',
  compliance_warnings: complianceWarnings,
  scope_summary: generateScopeSummary(extractedData),
  caller_info: {
    phone: callerPhone,
    is_returning: callerInfo?.isReturningCaller || false,
    call_sid: callSid,
    timestamp: new Date().toISOString()
  },
  extracted_data: extractedData
};

// Generate human-readable summary for SMS
const generateSMSSummary = () => {
  const parts = [];
  
  parts.push(`🏗️ ${notificationPayload.business_name}`);
  parts.push(`${notificationPayload.project_type}`);
  parts.push(`📍 ${notificationPayload.address}`);
  parts.push(`💰 ${notificationPayload.budget}`);
  parts.push(`📅 ${notificationPayload.start_date}`);
  parts.push(`📱 ${notificationPayload.contact_method}`);
  
  if (complianceWarnings.length > 0) {
    parts.push(`⚠️ ${complianceWarnings.join(', ')}`);
  }
  
  return parts.join('\n');
};

// Generate email subject line
const generateEmailSubject = () => {
  const business = notificationPayload.business_name;
  const project = notificationPayload.project_type;
  const budget = notificationPayload.budget;
  
  return `New Contract Request: ${business} - ${project} (${budget})`;
};

// Generate email body
const generateEmailBody = () => {
  return `
New Contract Request Received

Business: ${notificationPayload.business_name}
Project: ${notificationPayload.project_type}
Address: ${notificationPayload.address}
Budget: ${notificationPayload.budget}
Payment Terms: ${notificationPayload.payment_terms}
Start Date: ${notificationPayload.start_date}
Contact Method: ${notificationPayload.contact_method}

Scope Summary:
${notificationPayload.scope_summary}

Caller Info:
- Phone: ${notificationPayload.caller_info.phone}
- Returning Caller: ${notificationPayload.caller_info.is_returning ? 'Yes' : 'No'}
- Call ID: ${notificationPayload.caller_info.call_sid}

${complianceWarnings.length > 0 ? `Compliance Warnings:\n${complianceWarnings.join('\n')}\n` : ''}

Full extracted data available in JSON format.
  `.trim();
};

return {
  notificationPayload,
  smsSummary: generateSMSSummary(),
  emailSubject: generateEmailSubject(),
  emailBody: generateEmailBody(),
  timestamp: new Date().toISOString(),
  callSid: callSid
}; 