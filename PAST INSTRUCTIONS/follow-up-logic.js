// Function Node: Follow-Up Question Logic
// Input: $json.extractedData (from OpenAI)
// Output: Follow-up question or null if complete

const extractedData = $json.extractedData;
const speechResult = $json.SpeechResult.toLowerCase();

// Priority order for missing fields
const missingFields = [];

if (!extractedData.business_name) {
  missingFields.push('business_name');
}

if (!extractedData.project_type) {
  missingFields.push('project_type');
}

if (!extractedData.project_address) {
  missingFields.push('project_address');
}

if (!extractedData.budget) {
  missingFields.push('budget');
}

if (!extractedData.payment_terms) {
  missingFields.push('payment_terms');
}

if (!extractedData.start_date) {
  missingFields.push('start_date');
}

if (!extractedData.preferred_contact_method) {
  missingFields.push('preferred_contact_method');
}

// Smart follow-up questions based on context
const followUpQuestions = {
  business_name: "What's the name of your business?",
  project_type: "What type of project is this? (e.g., kitchen remodel, bathroom renovation, deck build)",
  project_address: "What's the project address?",
  budget: "What's the total budget for this project?",
  payment_terms: "How would you like to structure the payments? (e.g., 50% upfront, 50% on completion)",
  start_date: "When would you like to start this project?",
  preferred_contact_method: "What's the best way to get the contract to you — text or email?"
};

// Special logic for dates
if (speechResult.includes("next month") || speechResult.includes("following month")) {
  followUpQuestions.start_date = "Should we put the 1st of next month or leave it blank for you to fill in later?";
}

if (speechResult.includes("asap") || speechResult.includes("immediately")) {
  followUpQuestions.start_date = "Would you like to start within the next week, or do you have a specific date in mind?";
}

// Return the highest priority missing field question
if (missingFields.length > 0) {
  const nextField = missingFields[0];
  return {
    hasFollowUp: true,
    question: followUpQuestions[nextField],
    missingField: nextField,
    remainingFields: missingFields.slice(1)
  };
}

// Check for compliance warnings
const complianceWarnings = [];
if (!extractedData.license_number && extractedData.business_name) {
  complianceWarnings.push("Missing: GC License Number");
}

if (extractedData.payment_terms && extractedData.payment_terms.includes("50%") && extractedData.payment_terms.includes("upfront")) {
  complianceWarnings.push("⚠️ CSLB payment structure may be unclear");
}

return {
  hasFollowUp: false,
  isComplete: true,
  complianceWarnings,
  extractedData
}; 