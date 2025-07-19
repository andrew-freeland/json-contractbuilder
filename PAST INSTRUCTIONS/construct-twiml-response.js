// Function Node: Construct TwiML Response
// Input: $json.conversationState, $json.message, $json.callerInfo, $json.followUpQuestion
// Output: TwiML response for Twilio

const conversationState = $json.conversationState;
const message = $json.message;
const callerInfo = $json.callerInfo;
const followUpQuestion = $json.followUpQuestion;
const extractedData = $json.extractedData;
const hasFollowUp = $json.hasFollowUp;
const isReturningCaller = $json.isReturningCaller;
const callSid = $json.callSid;

// SSML voice configuration
const voiceConfig = {
  voice: 'alice',
  language: 'en-US',
  rate: 'medium',
  pitch: 'medium',
  volume: 'medium'
};

// SSML formatting functions
const ssml = {
  // Add pauses
  pause: (duration = '1s') => `<break time="${duration}"/>`,
  
  // Emphasize text
  emphasize: (text, level = 'moderate') => `<emphasis level="${level}">${text}</emphasis>`,
  
  // Say numbers clearly
  sayNumber: (number) => `<say-as interpret-as="cardinal">${number}</say-as>`,
  
  // Say currency
  sayCurrency: (amount) => `<say-as interpret-as="currency">${amount}</say-as>`,
  
  // Say dates
  sayDate: (date) => `<say-as interpret-as="date">${date}</say-as>`,
  
  // Say phone numbers
  sayPhone: (phone) => `<say-as interpret-as="telephone">${phone}</say-as>`,
  
  // Format address
  formatAddress: (address) => {
    if (!address) return '';
    return address.replace(/(\d+)/g, '<say-as interpret-as="cardinal">$1</say-as>');
  },
  
  // Format project details
  formatProjectDetails: (data) => {
    if (!data) return '';
    
    const parts = [];
    
    if (data.project_type) {
      parts.push(`a ${data.project_type}`);
    }
    
    if (data.project_address) {
      parts.push(`at ${ssml.formatAddress(data.project_address)}`);
    }
    
    if (data.budget) {
      parts.push(`with a budget of ${ssml.sayCurrency(data.budget)}`);
    }
    
    return parts.join(', ');
  }
};

// Base TwiML template with SSML support
const createTwiML = (message, gatherOptions = {}) => {
  const defaultGather = {
    input: 'speech',
    timeout: 10,
    speechTimeout: 'auto',
    action: '/webhook/process-speech',
    method: 'POST',
    language: 'en-US'
  };
  
  const gather = { ...defaultGather, ...gatherOptions };
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voiceConfig.voice}" language="${voiceConfig.language}">
    ${message}
  </Say>
  <Gather input="${gather.input}" 
          timeout="${gather.timeout}" 
          speechTimeout="${gather.speechTimeout}"
          action="${gather.action}" 
          method="${gather.method}"
          language="${gather.language}">
    <Say voice="${voiceConfig.voice}" language="${voiceConfig.language}">
      I didn't catch that. Could you repeat?
    </Say>
  </Gather>
  <Say voice="${voiceConfig.voice}" language="${voiceConfig.language}">
    Thanks for calling. We'll follow up with you soon.
  </Say>
  <Hangup/>
</Response>`;
};

// Response templates for different scenarios
const responseTemplates = {
  // Initial greeting for new callers
  newCallerGreeting: () => {
    const welcomeMessage = callerInfo?.welcomeMessage || "What's the name of your business?";
    const message = `Hi! I'm here to help you generate a construction contract. ${ssml.pause('0.5s')} ${welcomeMessage}`;
    return createTwiML(message);
  },
  
  // Welcome back for returning callers
  returningCallerGreeting: () => {
    const businessName = callerInfo?.businessName;
    const welcomeMessage = callerInfo?.welcomeMessage || "Welcome back! How can I help you today?";
    
    let message = `Welcome back!`;
    
    if (businessName) {
      message += ` ${ssml.pause('0.3s')} Should we still send this to ${ssml.emphasize(businessName)}?`;
    } else {
      message += ` ${ssml.pause('0.3s')} ${welcomeMessage}`;
    }
    
    return createTwiML(message);
  },
  
  // Follow-up question with context
  followUpQuestion: () => {
    const question = followUpQuestion || "Could you provide more details about your project?";
    const projectDetails = extractedData ? ssml.formatProjectDetails(extractedData) : '';
    
    let message = '';
    
    if (projectDetails) {
      message = `I have ${projectDetails}. ${ssml.pause('0.5s')} ${question}`;
    } else {
      message = question;
    }
    
    return createTwiML(message);
  },
  
  // Contact method confirmation for returning callers
  contactConfirmation: () => {
    const contactMethod = callerInfo?.preferredContact;
    const businessName = callerInfo?.businessName;
    
    let message = '';
    
    if (contactMethod && businessName) {
      message = `Still OK to send the contract to ${ssml.emphasize(contactMethod)} for ${ssml.emphasize(businessName)}?`;
    } else if (contactMethod) {
      message = `Still OK to send the contract to ${ssml.emphasize(contactMethod)}?`;
    } else {
      message = "What's the best way to get this contract to you — text or email?";
    }
    
    return createTwiML(message);
  },
  
  // Contact method question for new callers
  contactQuestion: () => {
    const question = callerInfo?.contactQuestion || "What's the best way to get this contract to you — text or email?";
    return createTwiML(question);
  },
  
  // Completion message with project summary
  completion: () => {
    const projectType = extractedData?.project_type || 'project';
    const projectDetails = ssml.formatProjectDetails(extractedData);
    
    let message = `Perfect! ${ssml.pause('0.3s')} I've got all the details for your ${ssml.emphasize(projectType)} project.`;
    
    if (projectDetails) {
      message += ` ${ssml.pause('0.5s')} ${projectDetails}.`;
    }
    
    message += ` ${ssml.pause('0.5s')} I'll generate the contract and send it to you right away. ${ssml.pause('0.3s')} Thanks for calling!`;
    
    return createTwiML(message, { action: '/webhook/end-call' });
  },
  
  // Error handling with recovery options
  error: (errorMessage = "I'm having trouble processing that. Let me start over.") => {
    const message = `${errorMessage} ${ssml.pause('0.5s')} Could you try again?`;
    return createTwiML(message, { action: '/webhook/restart' });
  },
  
  // Budget clarification
  budgetClarification: () => {
    const message = `Could you clarify the budget? ${ssml.pause('0.3s')} For example, say something like "The budget is ${ssml.sayCurrency('$25,000')}" or "We're looking to spend around ${ssml.sayCurrency('$15,000')}."`;
    return createTwiML(message);
  },
  
  // Address clarification
  addressClarification: () => {
    const message = `Could you provide the project address? ${ssml.pause('0.3s')} Please include the street number, street name, city, and state.`;
    return createTwiML(message);
  },
  
  // Payment terms clarification
  paymentTermsClarification: () => {
    const message = `How would you like to structure the payments? ${ssml.pause('0.3s')} For example, you could say "50% upfront and 50% on completion" or "Monthly payments of ${ssml.sayCurrency('$5,000')}."`;
    return createTwiML(message);
  },
  
  // Start date clarification
  startDateClarification: () => {
    const message = `When would you like to start this project? ${ssml.pause('0.3s')} You can say something like "Next month" or "As soon as possible" or give me a specific date.`;
    return createTwiML(message);
  }
};

// Smart response selection based on conversation state and context
const selectResponse = () => {
  // Handle specific follow-up scenarios
  if (hasFollowUp && followUpQuestion) {
    const missingField = $json.missingField;
    
    // Route to specific clarification templates
    switch (missingField) {
      case 'budget':
        return responseTemplates.budgetClarification();
      case 'project_address':
        return responseTemplates.addressClarification();
      case 'payment_terms':
        return responseTemplates.paymentTermsClarification();
      case 'start_date':
        return responseTemplates.startDateClarification();
      default:
        return responseTemplates.followUpQuestion();
    }
  }
  
  // Handle conversation states
  switch (conversationState) {
    case 'new_caller':
      return responseTemplates.newCallerGreeting();
      
    case 'returning_caller':
      return responseTemplates.returningCallerGreeting();
      
    case 'follow_up':
      return responseTemplates.followUpQuestion();
      
    case 'contact_confirmation':
      return responseTemplates.contactConfirmation();
      
    case 'contact_question':
      return responseTemplates.contactQuestion();
      
    case 'complete':
      return responseTemplates.completion();
      
    case 'error':
      return responseTemplates.error();
      
    default:
      // Fallback logic based on available data
      if (isReturningCaller) {
        return responseTemplates.returningCallerGreeting();
      } else if (hasFollowUp) {
        return responseTemplates.followUpQuestion();
      } else {
        return responseTemplates.newCallerGreeting();
      }
  }
};

// Generate the TwiML response
const generateTwiMLResponse = () => {
  try {
    const twiML = selectResponse();
    
    return {
      twiML,
      conversationState,
      callerInfo,
      followUpQuestion,
      hasFollowUp,
      isReturningCaller,
      extractedData,
      callSid,
      timestamp: new Date().toISOString(),
      voiceConfig,
      success: true
    };
    
  } catch (error) {
    console.error('Error generating TwiML response:', error);
    
    // Fallback to error response
    const fallbackTwiML = responseTemplates.error();
    
    return {
      twiML: fallbackTwiML,
      conversationState: 'error',
      error: 'TWiML_GENERATION_ERROR',
      message: error.message,
      callSid,
      timestamp: new Date().toISOString(),
      success: false
    };
  }
};

// Execute and return the TwiML response
return generateTwiMLResponse(); 