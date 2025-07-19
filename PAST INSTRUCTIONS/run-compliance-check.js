// Function Node: CSLB Compliance Checker
// Input: $json.contractData (extracted project data)
// Output: Compliance status, warnings, and recommendations

const contractData = $json.contractData || $json;
const callSid = contractData.callSid;

// CSLB §7159 Home Improvement Contract Requirements
const cslbRequirements = {
  // Required contract elements
  requiredElements: {
    contractorInfo: {
      name: 'Contractor Information',
      required: true,
      fields: ['contractorName', 'contractorAddress', 'licenseNumber', 'phoneNumber']
    },
    clientInfo: {
      name: 'Client Information', 
      required: true,
      fields: ['clientName', 'clientAddress', 'phoneNumber']
    },
    projectDetails: {
      name: 'Project Details',
      required: true,
      fields: ['projectAddress', 'scopeOfWork', 'projectType']
    },
    financialTerms: {
      name: 'Financial Terms',
      required: true,
      fields: ['contractPrice', 'paymentTerms', 'paymentSchedule']
    },
    timeline: {
      name: 'Project Timeline',
      required: true,
      fields: ['startDate', 'completionDate']
    },
    materials: {
      name: 'Materials Information',
      required: true,
      fields: ['materialsProvidedBy', 'materialsDescription']
    },
    permits: {
      name: 'Permits and Licenses',
      required: true,
      fields: ['permitsRequired', 'whoObtainsPermits']
    },
    warranties: {
      name: 'Warranties',
      required: true,
      fields: ['warrantyPeriod', 'warrantyCoverage']
    }
  },
  
  // Payment structure requirements
  paymentRequirements: {
    maxUpfront: 0.10, // Maximum 10% upfront for contracts > $1,000
    progressPayments: true,
    finalPayment: 'upon completion and acceptance',
    lienRights: true
  },
  
  // Prohibited terms
  prohibitedTerms: [
    'waiver of lien rights',
    'unconditional lien waiver',
    'pay when paid clauses',
    'no damages for delay',
    'unlimited indemnification'
  ]
};

// Validation functions
const validators = {
  // Check if all required fields are present
  checkRequiredFields: (data) => {
    const missing = [];
    const warnings = [];
    
    Object.entries(cslbRequirements.requiredElements).forEach(([key, requirement]) => {
      const hasRequiredFields = requirement.fields.some(field => data[field]);
      
      if (requirement.required && !hasRequiredFields) {
        missing.push(requirement.name);
      } else if (requirement.required && hasRequiredFields) {
        // Check for partial completion
        const completedFields = requirement.fields.filter(field => data[field]);
        if (completedFields.length < requirement.fields.length) {
          warnings.push(`⚠️ ${requirement.name}: Incomplete (${completedFields.length}/${requirement.fields.length} fields)`);
        }
      }
    });
    
    return { missing, warnings };
  },
  
  // Validate payment structure
  validatePaymentStructure: (paymentTerms) => {
    const warnings = [];
    
    if (!paymentTerms) return warnings;
    
    const terms = paymentTerms.toLowerCase();
    
    // Check for excessive upfront payment
    const upfrontMatch = terms.match(/(\d+)%\s*upfront/);
    if (upfrontMatch) {
      const upfrontPercent = parseInt(upfrontMatch[1]);
      if (upfrontPercent > 10) {
        warnings.push(`⚠️ Upfront payment (${upfrontPercent}%) exceeds CSLB maximum (10%)`);
      }
    }
    
    // Check for prohibited terms
    cslbRequirements.prohibitedTerms.forEach(term => {
      if (terms.includes(term)) {
        warnings.push(`🚫 Prohibited term detected: "${term}"`);
      }
    });
    
    // Check for progress payments
    if (!terms.includes('progress') && !terms.includes('milestone') && !terms.includes('completion')) {
      warnings.push('⚠️ Payment structure should include progress payments or completion-based terms');
    }
    
    return warnings;
  },
  
  // Validate project scope
  validateProjectScope: (scope, projectType) => {
    const warnings = [];
    
    if (!scope || scope.length < 10) {
      warnings.push('⚠️ Project scope is too brief - CSLB requires detailed description');
    }
    
    if (projectType && scope) {
      // Check for scope-type alignment
      const scopeLower = scope.toLowerCase();
      const typeLower = projectType.toLowerCase();
      
      if (!scopeLower.includes(typeLower) && !scopeLower.includes('renovation') && !scopeLower.includes('construction')) {
        warnings.push('⚠️ Project scope should clearly describe the type of work');
      }
    }
    
    return warnings;
  },
  
  // Validate timeline
  validateTimeline: (startDate, endDate) => {
    const warnings = [];
    
    if (!startDate) {
      warnings.push('⚠️ Start date is required for CSLB compliance');
    }
    
    if (!endDate) {
      warnings.push('⚠️ Completion date should be specified');
    } else if (startDate && endDate) {
      // Check if end date is after start date
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end <= start) {
        warnings.push('⚠️ Completion date should be after start date');
      }
    }
    
    return warnings;
  },
  
  // Validate license information
  validateLicense: (licenseNumber, contractorName) => {
    const warnings = [];
    
    if (!licenseNumber && contractorName) {
      warnings.push('⚠️ Contractor license number is required for CSLB compliance');
    }
    
    if (licenseNumber) {
      // Basic CA license format validation
      const caLicensePattern = /^[A-Z]\d{8}$/;
      if (!caLicensePattern.test(licenseNumber)) {
        warnings.push('⚠️ License number format appears invalid (should be A12345678)');
      }
    }
    
    return warnings;
  }
};

// Main compliance check function
const runComplianceCheck = () => {
  const startTime = Date.now();
  
  try {
    // Run all validations
    const requiredCheck = validators.checkRequiredFields(contractData);
    const paymentWarnings = validators.validatePaymentStructure(contractData.paymentTerms);
    const scopeWarnings = validators.validateProjectScope(contractData.scopeOfWork, contractData.projectType);
    const timelineWarnings = validators.validateTimeline(contractData.startDate, contractData.endDate);
    const licenseWarnings = validators.validateLicense(contractData.licenseNumber, contractData.contractorName);
    
    // Combine all warnings
    const allWarnings = [
      ...requiredCheck.warnings,
      ...paymentWarnings,
      ...scopeWarnings,
      ...timelineWarnings,
      ...licenseWarnings
    ];
    
    // Determine compliance status
    const isCompliant = requiredCheck.missing.length === 0 && allWarnings.length === 0;
    const needsReview = requiredCheck.missing.length === 0 && allWarnings.length > 0;
    const nonCompliant = requiredCheck.missing.length > 0;
    
    let complianceStatus;
    if (isCompliant) {
      complianceStatus = 'COMPLIANT';
    } else if (needsReview) {
      complianceStatus = 'REVIEW_REQUIRED';
    } else {
      complianceStatus = 'NON_COMPLIANT';
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (requiredCheck.missing.length > 0) {
      recommendations.push(`Add missing required elements: ${requiredCheck.missing.join(', ')}`);
    }
    
    if (allWarnings.length > 0) {
      recommendations.push('Review and address compliance warnings');
    }
    
    if (!contractData.licenseNumber) {
      recommendations.push('Include contractor license number');
    }
    
    if (!contractData.endDate) {
      recommendations.push('Specify project completion date');
    }
    
    // Calculate compliance score (0-100)
    const totalChecks = Object.keys(cslbRequirements.requiredElements).length + 4; // +4 for additional validations
    const passedChecks = totalChecks - requiredCheck.missing.length - (allWarnings.length * 0.5);
    const complianceScore = Math.max(0, Math.min(100, Math.round((passedChecks / totalChecks) * 100)));
    
    const processingTime = Date.now() - startTime;
    
    return {
      complianceStatus,
      complianceScore,
      isCompliant,
      needsReview,
      nonCompliant,
      missingElements: requiredCheck.missing,
      warnings: allWarnings,
      recommendations,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString(),
      callSid: callSid,
      
      // Detailed breakdown
      validationResults: {
        requiredElements: requiredCheck,
        paymentStructure: paymentWarnings,
        projectScope: scopeWarnings,
        timeline: timelineWarnings,
        license: licenseWarnings
      },
      
      // CSLB reference
      cslbReference: {
        section: '§7159',
        title: 'Home Improvement Contracts',
        url: 'https://www.leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=7159.&lawCode=BPC'
      }
    };
    
  } catch (error) {
    console.error('Error in compliance check:', error);
    return {
      complianceStatus: 'ERROR',
      error: 'COMPLIANCE_CHECK_FAILED',
      message: error.message,
      timestamp: new Date().toISOString(),
      callSid: callSid
    };
  }
};

// Execute compliance check
return runComplianceCheck(); 