// Function Node: Main Conversation Flow Logic
// Input: $json (webhook payload + processed data)
// Output: Next conversation state and actions

const webhookData = $json;
const callSid = webhookData.CallSid;
const speechResult = webhookData.SpeechResult;
const callerPhone = webhookData.From;

// Get processed data from previous nodes
const extractedData = webhookData.extractedData || {};
const callerInfo = webhookData.callerInfo || {};
const followUpLogic = webhookData.followUpLogic || {};
const conversationHistory = webhookData.conversationHistory || [];

// Track conversation state
let currentState = webhookData.currentState || 'initial';
let nextState = 'initial';
let actions = [];

// State machine for conversation flow
const conversationStates = {
  initial: () => {
    // Check if this is a returning caller
    if (callerInfo.isReturningCaller) {
      nextState = 'returning_caller_greeting';
    } else {
      nextState = 'new_caller_greeting';
    }
  },
  
  new_caller_greeting: () => {
    if (speechResult && extractedData.business_name) {
      nextState = 'extract_project_details';
    } else {
      nextState = 'ask_business_name';
    }
  },
  
  returning_caller_greeting: () => {
    if (speechResult && speechResult.toLowerCase().includes('yes')) {
      nextState = 'extract_project_details';
    } else if (speechResult && speechResult.toLowerCase().includes('no')) {
      nextState = 'ask_business_name';
    } else {
      nextState = 'ask_business_name';
    }
  },
  
  ask_business_name: () => {
    if (speechResult && extractedData.business_name) {
      nextState = 'extract_project_details';
    } else {
      nextState = 'ask_business_name';
    }
  },
  
  extract_project_details: () => {
    // Check if we have enough project details
    const requiredFields = ['project_type', 'project_address', 'budget'];
    const hasRequiredFields = requiredFields.every(field => extractedData[field]);
    
    if (hasRequiredFields) {
      nextState = 'ask_contact_method';
    } else {
      nextState = 'follow_up_questions';
    }
  },
  
  follow_up_questions: () => {
    if (followUpLogic.hasFollowUp) {
      nextState = 'follow_up_questions';
    } else {
      nextState = 'ask_contact_method';
    }
  },
  
  ask_contact_method: () => {
    if (callerInfo.isReturningCaller) {
      nextState = 'confirm_contact_method';
    } else {
      nextState = 'ask_contact_method';
    }
  },
  
  confirm_contact_method: () => {
    if (speechResult && speechResult.toLowerCase().includes('yes')) {
      nextState = 'complete';
    } else if (speechResult && speechResult.toLowerCase().includes('no')) {
      nextState = 'ask_contact_method';
    } else {
      nextState = 'ask_contact_method';
    }
  },
  
  complete: () => {
    nextState = 'complete';
    actions.push('generate_notification');
    actions.push('update_caller_directory');
    actions.push('end_call');
  },
  
  error: () => {
    nextState = 'error';
    actions.push('log_error');
    actions.push('restart_conversation');
  }
};

// Execute current state logic
if (conversationStates[currentState]) {
  conversationStates[currentState]();
} else {
  nextState = 'error';
}

// Add conversation to history
conversationHistory.push({
  state: currentState,
  speechResult: speechResult,
  extractedData: extractedData,
  timestamp: new Date().toISOString()
});

// Limit history to last 10 interactions
if (conversationHistory.length > 10) {
  conversationHistory.splice(0, conversationHistory.length - 10);
}

// Determine if we should continue or end
const shouldContinue = nextState !== 'complete' && nextState !== 'error';
const maxInteractions = 15;
const shouldEndDueToLength = conversationHistory.length >= maxInteractions;

if (shouldEndDueToLength) {
  nextState = 'complete';
  actions.push('generate_notification');
  actions.push('end_call');
}

return {
  currentState: nextState,
  previousState: currentState,
  actions: actions,
  conversationHistory: conversationHistory,
  shouldContinue: shouldContinue,
  extractedData: extractedData,
  callerInfo: callerInfo,
  followUpLogic: followUpLogic,
  callSid: callSid,
  callerPhone: callerPhone
}; 