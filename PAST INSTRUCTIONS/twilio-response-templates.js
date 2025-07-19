// Function Node: Twilio Response Templates
// Input: $json.conversationState, $json.followUpQuestion, $json.callerInfo
// Output: TwiML response for Twilio

const conversationState = $json.conversationState;
const followUpQuestion = $json.followUpQuestion;
const callerInfo = $json.callerInfo;
const extractedData = $json.extractedData;

// Base TwiML template
const createTwiML = (message, gatherOptions = {}) => {
  const defaultGather = {
    input: 'speech',
    timeout: 10,
    speechTimeout: 'auto',
    action: '/webhook/process-speech',
    method: 'POST'
  };
  
  const gather = { ...defaultGather, ...gatherOptions };
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${message}</Say>
  <Gather input="${gather.input}" 
          timeout="${gather.timeout}" 
          speechTimeout="${gather.speechTimeout}"
          action="${gather.action}" 
          method="${gather.method}">
    <Say voice="alice">I didn't catch that. Could you repeat?</Say>
  </Gather>
  <Say voice="alice">Thanks for calling. We'll follow up with you soon.</Say>
  <Hangup/>
</Response>`;
};

// Response templates for different scenarios
const responseTemplates = {
  // Initial greeting for new callers
  newCallerGreeting: () => {
    const message = `Hi! I'm here to help you generate a construction contract. ${callerInfo.welcomeMessage}`;
    return createTwiML(message);
  },
  
  // Welcome back for returning callers
  returningCallerGreeting: () => {
    const message = callerInfo.welcomeMessage;
    return createTwiML(message);
  },
  
  // Follow-up question
  followUpQuestion: () => {
    const message = followUpQuestion;
    return createTwiML(message);
  },
  
  // Contact method confirmation for returning callers
  contactConfirmation: () => {
    const message = callerInfo.contactConfirmation;
    return createTwiML(message);
  },
  
  // Contact method question for new callers
  contactQuestion: () => {
    const message = callerInfo.contactQuestion;
    return createTwiML(message);
  },
  
  // Completion message
  completion: () => {
    const message = `Perfect! I've got all the details for your ${extractedData.project_type} project. I'll generate the contract and send it to you right away. Thanks for calling!`;
    return createTwiML(message, { action: '/webhook/end-call' });
  },
  
  // Error handling
  error: (errorMessage = "I'm having trouble processing that. Let me start over.") => {
    return createTwiML(errorMessage, { action: '/webhook/restart' });
  }
};

// Determine which template to use based on conversation state
let response;
switch (conversationState) {
  case 'new_caller':
    response = responseTemplates.newCallerGreeting();
    break;
  case 'returning_caller':
    response = responseTemplates.returningCallerGreeting();
    break;
  case 'follow_up':
    response = responseTemplates.followUpQuestion();
    break;
  case 'contact_confirmation':
    response = responseTemplates.contactConfirmation();
    break;
  case 'contact_question':
    response = responseTemplates.contactQuestion();
    break;
  case 'complete':
    response = responseTemplates.completion();
    break;
  case 'error':
    response = responseTemplates.error();
    break;
  default:
    response = responseTemplates.error();
}

return {
  twiML: response,
  conversationState,
  callerInfo,
  followUpQuestion
}; 