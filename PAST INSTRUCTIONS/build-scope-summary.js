// Function Node: Build Scope Summary
// Input: $json.extractedData or $json (project data)
// Output: Formatted scope summary and project details

const projectData = $json.extractedData || $json;
const callSid = projectData.callSid;

// Scope summary builder
const buildScopeSummary = (data) => {
  const parts = [];
  
  // Project type
  if (data.project_type || data.projectType) {
    const projectType = data.project_type || data.projectType;
    parts.push(projectType.charAt(0).toUpperCase() + projectType.slice(1));
  }
  
  // Location
  if (data.project_address || data.projectAddress) {
    const address = data.project_address || data.projectAddress;
    parts.push(`at ${address}`);
  }
  
  // Budget
  if (data.budget) {
    const budget = data.budget.startsWith('$') ? data.budget : `$${data.budget}`;
    parts.push(`budget ${budget}`);
  }
  
  // Timeline
  if (data.start_date || data.startDate) {
    const startDate = data.start_date || data.startDate;
    parts.push(`starting ${startDate}`);
  }
  
  // Materials
  if (data.materials_by || data.materialsProvidedBy) {
    const materials = data.materials_by || data.materialsProvidedBy;
    parts.push(`materials by ${materials}`);
  }
  
  return parts.length > 0 ? parts.join(', ') + '.' : 'Project details pending.';
};

// Generate detailed project summary
const generateDetailedSummary = (data) => {
  const summary = {
    projectType: data.project_type || data.projectType || 'Not specified',
    address: data.project_address || data.projectAddress || 'Not provided',
    scope: data.scope || data.scopeOfWork || 'Not provided',
    budget: data.budget || 'Not specified',
    paymentTerms: data.payment_terms || data.paymentTerms || 'Not specified',
    startDate: data.start_date || data.startDate || 'Not specified',
    endDate: data.end_date || data.endDate || 'Not specified',
    materialsBy: data.materials_by || data.materialsProvidedBy || 'Not specified',
    contactMethod: data.preferred_contact_method || data.preferredContactMethod || 'Not specified',
    businessName: data.business_name || data.clientName || 'Not provided'
  };
  
  // Format budget for display
  if (summary.budget && !summary.budget.startsWith('$')) {
    summary.budget = `$${summary.budget}`;
  }
  
  // Format payment terms
  if (summary.paymentTerms) {
    summary.paymentTerms = summary.paymentTerms.replace(/(\d+)%/g, '$1%');
  }
  
  return summary;
};

// Generate SMS-friendly summary (160 char limit)
const generateSMSSummary = (data) => {
  const parts = [];
  
  // Business name (truncated if needed)
  const business = data.business_name || data.clientName || 'New Client';
  parts.push(business.length > 20 ? business.substring(0, 17) + '...' : business);
  
  // Project type
  const projectType = data.project_type || data.projectType || 'Project';
  parts.push(projectType);
  
  // Address (truncated)
  const address = data.project_address || data.projectAddress || 'Address pending';
  parts.push(address.length > 30 ? address.substring(0, 27) + '...' : address);
  
  // Budget
  const budget = data.budget || 'Budget pending';
  parts.push(budget);
  
  // Contact method
  const contact = data.preferred_contact_method || data.preferredContactMethod || 'Contact pending';
  parts.push(contact);
  
  let smsText = parts.join('\n');
  
  // Add compliance warnings if any
  if (data.complianceWarnings && data.complianceWarnings.length > 0) {
    smsText += '\n⚠️ Review required';
  }
  
  // Add call ID
  smsText += `\nID: ${callSid || 'N/A'}`;
  
  // Ensure we don't exceed 160 characters
  if (smsText.length > 160) {
    smsText = smsText.substring(0, 157) + '...';
  }
  
  return smsText;
};

// Generate email summary
const generateEmailSummary = (data) => {
  const summary = generateDetailedSummary(data);
  
  return `New Construction Contract Request

Call Details:
- Call ID: ${callSid || 'N/A'}
- Timestamp: ${new Date().toLocaleString()}
- Caller Phone: ${data.callerPhone || data.From || 'N/A'}

Business Information:
- Business Name: ${summary.businessName}
- Contact Method: ${summary.contactMethod}
- Returning Customer: ${data.isReturningCaller || data.is_Repeat ? 'Yes' : 'No'}

Project Details:
- Project Type: ${summary.projectType}
- Address: ${summary.address}
- Scope: ${summary.scope}
- Budget: ${summary.budget}
- Payment Terms: ${summary.paymentTerms}
- Materials By: ${summary.materialsBy}
- Start Date: ${summary.startDate}
- End Date: ${summary.endDate}

Scope Summary:
${buildScopeSummary(data)}

${data.complianceWarnings && data.complianceWarnings.length > 0 ? 
`Compliance Warnings:
${data.complianceWarnings.join('\n')}

` : ''}Next Steps:
1. Review project details
2. Generate contract document
3. Send to customer via ${summary.contactMethod}
4. Follow up within 24 hours`;
};

// Generate contract summary for document generation
const generateContractSummary = (data) => {
  const summary = generateDetailedSummary(data);
  
  return {
    projectOverview: buildScopeSummary(data),
    detailedScope: summary.scope,
    financialSummary: {
      budget: summary.budget,
      paymentTerms: summary.paymentTerms
    },
    timeline: {
      startDate: summary.startDate,
      endDate: summary.endDate
    },
    materials: summary.materialsBy,
    contactInfo: {
      businessName: summary.businessName,
      contactMethod: summary.contactMethod
    }
  };
};

// Generate notification payload
const generateNotificationPayload = (data) => {
  const summary = generateDetailedSummary(data);
  
  return {
    callSid: callSid,
    timestamp: new Date().toISOString(),
    caller: {
      phone: data.callerPhone || data.From,
      business: summary.businessName,
      contactMethod: summary.contactMethod,
      isReturning: data.isReturningCaller || data.is_Repeat
    },
    project: {
      type: summary.projectType,
      address: summary.address,
      scope: summary.scope,
      budget: summary.budget,
      paymentTerms: summary.paymentTerms,
      materialsBy: summary.materialsBy,
      startDate: summary.startDate,
      endDate: summary.endDate
    },
    compliance: {
      warnings: data.complianceWarnings || [],
      licenseNumber: data.license_number || data.licenseNumber
    },
    scopeSummary: buildScopeSummary(data)
  };
};

// Main function
const buildScopeSummaryData = () => {
  try {
    const scopeSummary = buildScopeSummary(projectData);
    const detailedSummary = generateDetailedSummary(projectData);
    const smsSummary = generateSMSSummary(projectData);
    const emailSummary = generateEmailSummary(projectData);
    const contractSummary = generateContractSummary(projectData);
    const notificationPayload = generateNotificationPayload(projectData);
    
    return {
      scopeSummary,
      detailedSummary,
      smsSummary,
      emailSummary,
      contractSummary,
      notificationPayload,
      timestamp: new Date().toISOString(),
      callSid: callSid,
      success: true
    };
    
  } catch (error) {
    console.error('Error building scope summary:', error);
    return {
      error: 'SCOPE_SUMMARY_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      callSid: callSid,
      success: false
    };
  }
};

// Execute and return results
return buildScopeSummaryData(); 