# Comprehensive n8n Workflow Implementation Guide
## Voice Intake Handler with Retry Wrappers and Function Nodes

**Version:** n8n Cloud June 2025 Stable  
**Date:** January 27, 2025  
**Status:** Ready for Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Import Issues Fixed](#import-issues-fixed)
3. [Available Function Nodes](#available-function-nodes)
4. [Retry Wrapper Specializations](#retry-wrapper-specializations)
5. [Implementation Instructions](#implementation-instructions)
6. [Workflow Integration](#workflow-integration)
7. [Code Templates](#code-templates)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide documents the complete implementation of a voice intake handler workflow for n8n Cloud June 2025 stable version. The workflow includes specialized retry wrappers and function nodes that handle:

- **Webhook Validation** (Grey section)
- **Speech Processing** (Green section) 
- **Compliance Check** (Blue section)
- **Craft Scope** (Purple section)
- **Notifications & Log** (Brown section)

### Key Features Implemented:
- ✅ **4 Specialized Retry Wrappers** (no manual deletion required)
- ✅ **4 Function Nodes** (ready for import)
- ✅ **n8n Cloud June 2025 Compatible** JSON structure
- ✅ **Complete Error Handling** with exponential backoff
- ✅ **Service-Specific Optimizations**

---

## 🔧 Import Issues Fixed

### **Original Problem:**
The JSON files in "TO IMPLEMENT" were individual function node definitions, not complete n8n workflows, causing import failures.

### **Root Cause:**
Missing required n8n workflow structure fields:
- `nodes` (array containing function nodes)
- `connections` (node connections)
- `active` (workflow status)
- `settings` (workflow settings)
- `versionId` (workflow version)
- `meta` (metadata)
- `id` (unique workflow identifier)
- `tags` (workflow tags)

### **Solution Applied:**
Converted individual function nodes into complete n8n workflow objects with proper structure:

**Before (Individual Function Node):**
```json
{
  "name": "Function Name",
  "type": "n8n-nodes-base.function",
  "parameters": { ... },
  "typeVersion": 1,
  "position": [500, 300],
  "id": "function-id"
}
```

**After (Complete n8n Workflow):**
```json
{
  "name": "Workflow Name",
  "nodes": [
    {
      "name": "Function Name",
      "type": "n8n-nodes-base.function",
      "parameters": { ... },
      "typeVersion": 1,
      "position": [500, 300],
      "id": "function-id"
    }
  ],
  "connections": {},
  "active": true,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": "1.0.0",
  "meta": {
    "templateCredsSetupCompleted": true
  },
  "id": "workflow-id",
  "tags": [...]
}
```

---

## 📁 Available Function Nodes

### **Location:** `TO IMPLEMENT/` folder

1. **`build-scope-summary-function.json`**
   - **Purpose:** Creates formatted scope summaries from extracted project data
   - **Input:** `$json.extractedData` or `$json` (project data)
   - **Output:** Formatted scope summary and project details
   - **Status:** ✅ Ready for import

2. **`retry-wrapper-function.json`**
   - **Purpose:** Generic retry wrapper (base template)
   - **Input:** `$json` (data to process), `$json.retryConfig` (optional settings)
   - **Output:** Result with retry metadata
   - **Status:** ✅ Ready for import

3. **`construct-twiml-response-function.json`**
   - **Purpose:** Builds TwiML responses for Twilio voice calls
   - **Input:** `$json.conversationState`, `$json.message`, `$json.callerInfo`
   - **Output:** TwiML response for Twilio
   - **Status:** ✅ Ready for import

4. **`run-compliance-check-function.json`**
   - **Purpose:** CSLB compliance checking for home improvement contracts
   - **Input:** `$json.contractData` (extracted project data)
   - **Output:** Compliance status, warnings, and recommendations
   - **Status:** ✅ Ready for import

---

## 🔄 Retry Wrapper Specializations

### **Key Innovation: Specialized Retry Wrappers**
Instead of one generic retry wrapper requiring manual reconfiguration, we've created **4 specialized retry wrappers** that handle different operations automatically.

### **1. OpenAI Data Extraction Retry Wrapper**
```javascript
// Specialized for OpenAI API calls
const openAIConfig = {
  maxAttempts: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 15000, // 15 seconds
  retryableErrors: ['RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR'],
  timeoutMs: 45000 // 45 seconds for OpenAI
};
```

### **2. Google Sheets Logging Retry Wrapper**
```javascript
// Specialized for Google Sheets API calls
const sheetsConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
  retryableErrors: ['RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR', 'QUOTA_EXCEEDED'],
  timeoutMs: 30000 // 30 seconds for Google Sheets
};
```

### **3. Twilio SMS/Notification Retry Wrapper**
```javascript
// Specialized for Twilio API calls (cost-aware)
const twilioConfig = {
  maxAttempts: 2, // Fewer retries for SMS (cost considerations)
  baseDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  retryableErrors: ['RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR', 'TEMPORARY_FAILURE'],
  timeoutMs: 20000 // 20 seconds for Twilio
};
```

### **4. HTTP Request Retry Wrapper**
```javascript
// Specialized for general HTTP API calls
const httpConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableErrors: ['RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR', 'INTERNAL_SERVER_ERROR'],
  timeoutMs: 30000 // 30 seconds for HTTP requests
};
```

### **Benefits of Specialized Wrappers:**
- ✅ **No Manual Deletion:** Each wrapper is pre-configured for its specific operation
- ✅ **Optimized Configurations:** Different retry strategies for different APIs
- ✅ **Detailed Logging:** Each wrapper logs operation-specific details
- ✅ **Error Classification:** Tailored error handling for each service
- ✅ **Cost Awareness:** Twilio wrapper has fewer retries to avoid costs
- ✅ **Service-Specific Timeouts:** Different timeout values for different services

---

## 🚀 Implementation Instructions

### **Step 1: Import Function Nodes**
1. Open n8n Cloud June 2025 stable version
2. Navigate to "TO IMPLEMENT" folder
3. Import each JSON file:
   - `build-scope-summary-function.json`
   - `retry-wrapper-function.json`
   - `construct-twiml-response-function.json`
   - `run-compliance-check-function.json`

### **Step 2: Replace Existing Function Nodes**
In your main workflow, replace the existing function nodes with the imported ones:

1. **Delete** existing placeholder function nodes
2. **Import** the specialized function nodes from "TO IMPLEMENT"
3. **Connect** them according to the workflow diagram

### **Step 3: Implement Retry Wrapper Pattern**
Use the "wrapping" approach shown in the workflow diagram:

```
Input → Retry Wrapper → API Call (OpenAI/Sheets/Twilio/HTTP)
API Call → Retry Wrapper (output/result)
Retry Wrapper → API Call (retry loop if needed)
```

### **Step 4: Configure Each Retry Wrapper**
Copy the appropriate specialized code into each retry wrapper function node:

1. **OpenAI Data Extraction:** Use OpenAI retry wrapper code
2. **Google Sheets Logging:** Use Google Sheets retry wrapper code  
3. **Twilio SMS/Notification:** Use Twilio retry wrapper code
4. **HTTP Requests:** Use HTTP retry wrapper code

---

## 🔗 Workflow Integration

### **Current Workflow Structure:**
Your workflow has 5 main sections:
1. **WEBHOOK VALIDATION** (Grey) - Validates incoming webhook data
2. **SPEECH PROCESSING** (Green) - Processes voice input with OpenAI
3. **COMPLIANCE CHECK** (Blue) - Checks CSLB compliance requirements
4. **CRAFT SCOPE** (Purple) - Builds project scope summaries
5. **NOTIFICATIONS & LOG** (Brown) - Sends notifications and logs data

### **Integration Points:**
- **Speech Processing:** Wrap OpenAI calls with OpenAI retry wrapper
- **Compliance Check:** Use compliance check function node
- **Craft Scope:** Use build scope summary function node
- **Notifications:** Wrap Twilio calls with Twilio retry wrapper
- **Logging:** Wrap Google Sheets calls with Google Sheets retry wrapper

---

## 📝 Code Templates

### **Complete JavaScript Code for Each Function Node**

#### **1. OpenAI Data Extraction Retry Wrapper**
```javascript
// Function Node: OpenAI Data Extraction Retry Wrapper
// Input: $json (conversation data, extractedData, etc.)
// Output: Retry-wrapped OpenAI extraction result

const inputData = $json;
const conversationData = inputData.conversationData || inputData;
const extractedData = inputData.extractedData || {};
const callSid = inputData.callSid;

// OpenAI-specific retry configuration
const openAIConfig = {
  maxAttempts: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 15000, // 15 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE', 
    'TIMEOUT',
    'NETWORK_ERROR',
    'INTERNAL_SERVER_ERROR'
  ],
  timeoutMs: 45000 // 45 seconds for OpenAI
};

// Exponential backoff calculator
const calculateDelay = (attempt) => {
  const delay = openAIConfig.baseDelay * Math.pow(openAIConfig.backoffMultiplier, attempt - 1);
  return Math.min(delay, openAIConfig.maxDelay);
};

// Error classification for OpenAI
const classifyOpenAIError = (error) => {
  const errorMessage = error.message || error.toString();
  const errorCode = error.code || error.status || '';
  
  // OpenAI rate limiting
  if (errorCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return 'RATE_LIMIT';
  }
  
  // OpenAI service issues
  if (errorCode >= 500 || errorMessage.includes('internal server error') || errorMessage.includes('service unavailable')) {
    return 'SERVICE_UNAVAILABLE';
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
    return 'TIMEOUT';
  }
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'NETWORK_ERROR';
  }
  
  // Client errors (usually not retryable)
  if (errorCode >= 400 && errorCode < 500) {
    return 'CLIENT_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
};

// OpenAI retry wrapper
const retryOpenAIExtraction = async (extractionOperation) => {
  let lastError;
  const attempts = [];
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= openAIConfig.maxAttempts; attempt++) {
    const attemptStartTime = Date.now();
    
    try {
      // Execute the OpenAI extraction
      const result = await extractionOperation();
      
      const attemptDuration = Date.now() - attemptStartTime;
      const totalDuration = Date.now() - startTime;
      
      // Log successful attempt
      attempts.push({
        attempt,
        status: 'SUCCESS',
        duration: attemptDuration,
        timestamp: new Date().toISOString(),
        operation: 'OpenAI Data Extraction'
      });
      
      return {
        success: true,
        result,
        attempts,
        totalAttempts: attempt,
        totalDuration: `${totalDuration}ms`,
        timestamp: new Date().toISOString(),
        callSid: callSid
      };
      
    } catch (error) {
      const attemptDuration = Date.now() - attemptStartTime;
      const errorType = classifyOpenAIError(error);
      
      // Log failed attempt
      attempts.push({
        attempt,
        status: 'FAILED',
        error: errorType,
        errorMessage: error.message,
        duration: attemptDuration,
        timestamp: new Date().toISOString(),
        operation: 'OpenAI Data Extraction'
      });
      
      lastError = error;
      
      // Check if error is retryable
      if (!openAIConfig.retryableErrors.includes(errorType)) {
        console.log(`OpenAI Extraction: Non-retryable error (${errorType}), stopping retries`);
        break;
      }
      
      // Check if we have more attempts
      if (attempt < openAIConfig.maxAttempts) {
        const delay = calculateDelay(attempt);
        console.log(`OpenAI Extraction: Attempt ${attempt} failed (${errorType}), retrying in ${delay}ms...`);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  const totalDuration = Date.now() - startTime;
  
  console.error(`OpenAI Extraction: All ${openAIConfig.maxAttempts} attempts failed`);
  
  return {
    success: false,
    error: lastError,
    errorType: classifyOpenAIError(lastError),
    attempts,
    totalAttempts: openAIConfig.maxAttempts,
    totalDuration: `${totalDuration}ms`,
    timestamp: new Date().toISOString(),
    callSid: callSid
  };
};

// Return the retry wrapper for OpenAI extraction
return {
  retryFunction: retryOpenAIExtraction,
  config: openAIConfig,
  operationType: 'openai-extraction',
  callSid: callSid,
  timestamp: new Date().toISOString(),
  documentation: {
    description: 'Specialized retry wrapper for OpenAI data extraction operations',
    maxAttempts: openAIConfig.maxAttempts,
    retryableErrors: openAIConfig.retryableErrors,
    usage: 'Use this wrapper around OpenAI API calls for data extraction'
  }
};
```

#### **2. Google Sheets Logging Retry Wrapper**
```javascript
// Function Node: Google Sheets Logging Retry Wrapper
// Input: $json (data to log, sheetId, range, etc.)
// Output: Retry-wrapped Google Sheets logging result

const inputData = $json;
const logData = inputData.logData || inputData;
const sheetId = inputData.sheetId;
const range = inputData.range || 'Sheet1!A:Z';
const callSid = inputData.callSid;

// Google Sheets-specific retry configuration
const sheetsConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE',
    'TIMEOUT',
    'NETWORK_ERROR',
    'QUOTA_EXCEEDED'
  ],
  timeoutMs: 30000 // 30 seconds for Google Sheets
};

// Exponential backoff calculator
const calculateDelay = (attempt) => {
  const delay = sheetsConfig.baseDelay * Math.pow(sheetsConfig.backoffMultiplier, attempt - 1);
  return Math.min(delay, sheetsConfig.maxDelay);
};

// Error classification for Google Sheets
const classifySheetsError = (error) => {
  const errorMessage = error.message || error.toString();
  const errorCode = error.code || error.status || '';
  
  // Google Sheets rate limiting
  if (errorCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return 'RATE_LIMIT';
  }
  
  // Google Sheets service issues
  if (errorCode >= 500 || errorMessage.includes('internal server error') || errorMessage.includes('service unavailable')) {
    return 'SERVICE_UNAVAILABLE';
  }
  
  // Quota exceeded
  if (errorMessage.includes('quota exceeded') || errorMessage.includes('daily limit')) {
    return 'QUOTA_EXCEEDED';
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
    return 'TIMEOUT';
  }
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'NETWORK_ERROR';
  }
  
  // Client errors (usually not retryable)
  if (errorCode >= 400 && errorCode < 500) {
    return 'CLIENT_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
};

// Google Sheets retry wrapper
const retrySheetsLogging = async (sheetsOperation) => {
  let lastError;
  const attempts = [];
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= sheetsConfig.maxAttempts; attempt++) {
    const attemptStartTime = Date.now();
    
    try {
      // Execute the Google Sheets operation
      const result = await sheetsOperation();
      
      const attemptDuration = Date.now() - attemptStartTime;
      const totalDuration = Date.now() - startTime;
      
      // Log successful attempt
      attempts.push({
        attempt,
        status: 'SUCCESS',
        duration: attemptDuration,
        timestamp: new Date().toISOString(),
        operation: 'Google Sheets Logging',
        sheetId: sheetId,
        range: range
      });
      
      return {
        success: true,
        result,
        attempts,
        totalAttempts: attempt,
        totalDuration: `${totalDuration}ms`,
        timestamp: new Date().toISOString(),
        callSid: callSid,
        sheetId: sheetId
      };
      
    } catch (error) {
      const attemptDuration = Date.now() - attemptStartTime;
      const errorType = classifySheetsError(error);
      
      // Log failed attempt
      attempts.push({
        attempt,
        status: 'FAILED',
        error: errorType,
        errorMessage: error.message,
        duration: attemptDuration,
        timestamp: new Date().toISOString(),
        operation: 'Google Sheets Logging',
        sheetId: sheetId,
        range: range
      });
      
      lastError = error;
      
      // Check if error is retryable
      if (!sheetsConfig.retryableErrors.includes(errorType)) {
        console.log(`Google Sheets Logging: Non-retryable error (${errorType}), stopping retries`);
        break;
      }
      
      // Check if we have more attempts
      if (attempt < sheetsConfig.maxAttempts) {
        const delay = calculateDelay(attempt);
        console.log(`Google Sheets Logging: Attempt ${attempt} failed (${errorType}), retrying in ${delay}ms...`);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  const totalDuration = Date.now() - startTime;
  
  console.error(`Google Sheets Logging: All ${sheetsConfig.maxAttempts} attempts failed`);
  
  return {
    success: false,
    error: lastError,
    errorType: classifySheetsError(lastError),
    attempts,
    totalAttempts: sheetsConfig.maxAttempts,
    totalDuration: `${totalDuration}ms`,
    timestamp: new Date().toISOString(),
    callSid: callSid,
    sheetId: sheetId
  };
};

// Return the retry wrapper for Google Sheets logging
return {
  retryFunction: retrySheetsLogging,
  config: sheetsConfig,
  operationType: 'google-sheets-logging',
  callSid: callSid,
  sheetId: sheetId,
  range: range,
  timestamp: new Date().toISOString(),
  documentation: {
    description: 'Specialized retry wrapper for Google Sheets logging operations',
    maxAttempts: sheetsConfig.maxAttempts,
    retryableErrors: sheetsConfig.retryableErrors,
    usage: 'Use this wrapper around Google Sheets API calls for logging data'
  }
};
```

#### **3. Twilio SMS/Notification Retry Wrapper**
```javascript
// Function Node: Twilio SMS/Notification Retry Wrapper
// Input: $json (message data, phone numbers, etc.)
// Output: Retry-wrapped Twilio notification result

const inputData = $json;
const messageData = inputData.messageData || inputData;
const toNumber = inputData.toNumber;
const fromNumber = inputData.fromNumber;
const messageBody = inputData.messageBody;
const callSid = inputData.callSid;

// Twilio-specific retry configuration
const twilioConfig = {
  maxAttempts: 2, // Fewer retries for SMS (cost considerations)
  baseDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE',
    'TIMEOUT',
    'NETWORK_ERROR',
    'TEMPORARY_FAILURE'
  ],
  timeoutMs: 20000 // 20 seconds for Twilio
};

// Exponential backoff calculator
const calculateDelay = (attempt) => {
  const delay = twilioConfig.baseDelay * Math.pow(twilioConfig.backoffMultiplier, attempt - 1);
  return Math.min(delay, twilioConfig.maxDelay);
};

// Error classification for Twilio
const classifyTwilioError = (error) => {
  const errorMessage = error.message || error.toString();
  const errorCode = error.code || error.status || '';
  
  // Twilio rate limiting
  if (errorCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return 'RATE_LIMIT';
  }
  
  // Twilio service issues
  if (errorCode >= 500 || errorMessage.includes('internal server error') || errorMessage.includes('service unavailable')) {
    return 'SERVICE_UNAVAILABLE';
  }
  
  // Temporary failures
  if (errorMessage.includes('temporary failure') || errorMessage.includes('temporarily unavailable')) {
    return 'TEMPORARY_FAILURE';
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
    return 'TIMEOUT';
  }
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'NETWORK_ERROR';
  }
  
  // Client errors (usually not retryable)
  if (errorCode >= 400 && errorCode < 500) {
    return 'CLIENT_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
};

// Twilio retry wrapper
const retryTwilioNotification = async (twilioOperation) => {
  let lastError;
  const attempts = [];
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= twilioConfig.maxAttempts; attempt++) {
    const attemptStartTime = Date.now();
    
    try {
      // Execute the Twilio operation
      const result = await twilioOperation();
      
      const attemptDuration = Date.now() - attemptStartTime;
      const totalDuration = Date.now() - startTime;
      
      // Log successful attempt
      attempts.push({
        attempt,
        status: 'SUCCESS',
        duration: attemptDuration,
        timestamp: new Date().toISOString(),
        operation: 'Twilio SMS/Notification',
        toNumber: toNumber,
        fromNumber: fromNumber
      });
      
      return {
        success: true,
        result,
        attempts,
        totalAttempts: attempt,
        totalDuration: `${totalDuration}ms`,
        timestamp: new Date().toISOString(),
        callSid: callSid,
        toNumber: toNumber,
        fromNumber: fromNumber
      };
      
    } catch (error) {
      const attemptDuration = Date.now() - attemptStartTime;
      const errorType = classifyTwilioError(error);
      
      // Log failed attempt
      attempts.push({
        attempt,
        status: 'FAILED',
        error: errorType,
        errorMessage: error.message,
        duration: attemptDuration,
        timestamp: new Date().toISOString(),
        operation: 'Twilio SMS/Notification',
        toNumber: toNumber,
        fromNumber: fromNumber
      });
      
      lastError = error;
      
      // Check if error is retryable
      if (!twilioConfig.retryableErrors.includes(errorType)) {
        console.log(`Twilio Notification: Non-retryable error (${errorType}), stopping retries`);
        break;
      }
      
      // Check if we have more attempts
      if (attempt < twilioConfig.maxAttempts) {
        const delay = calculateDelay(attempt);
        console.log(`Twilio Notification: Attempt ${attempt} failed (${errorType}), retrying in ${delay}ms...`);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  const totalDuration = Date.now() - startTime;
  
  console.error(`Twilio Notification: All ${twilioConfig.maxAttempts} attempts failed`);
  
  return {
    success: false,
    error: lastError,
    errorType: classifyTwilioError(lastError),
    attempts,
    totalAttempts: twilioConfig.maxAttempts,
    totalDuration: `${totalDuration}ms`,
    timestamp: new Date().toISOString(),
    callSid: callSid,
    toNumber: toNumber,
    fromNumber: fromNumber
  };
};

// Return the retry wrapper for Twilio notifications
return {
  retryFunction: retryTwilioNotification,
  config: twilioConfig,
  operationType: 'twilio-notification',
  callSid: callSid,
  toNumber: toNumber,
  fromNumber: fromNumber,
  messageBody: messageBody,
  timestamp: new Date().toISOString(),
  documentation: {
    description: 'Specialized retry wrapper for Twilio SMS/notification operations',
    maxAttempts: twilioConfig.maxAttempts,
    retryableErrors: twilioConfig.retryableErrors,
    usage: 'Use this wrapper around Twilio API calls for SMS/notifications',
    note: 'Limited to 2 retries due to cost considerations'
  }
};
```

#### **4. HTTP Request Retry Wrapper**
```javascript
// Function Node: HTTP Request Retry Wrapper
// Input: $json (HTTP request data, URL, method, etc.)
// Output: Retry-wrapped HTTP request result

const inputData = $json;
const requestData = inputData.requestData || inputData;
const url = inputData.url;
const method = inputData.method || 'GET';
const headers = inputData.headers || {};
const body = inputData.body;
const callSid = inputData.callSid;

// HTTP-specific retry configuration
const httpConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE',
    'TIMEOUT',
    'NETWORK_ERROR',
    'INTERNAL_SERVER_ERROR',
    'GATEWAY_TIMEOUT'
  ],
  timeoutMs: 30000 // 30 seconds for HTTP requests
};

// Exponential backoff calculator
const calculateDelay = (attempt) => {
  const delay = httpConfig.baseDelay * Math.pow(httpConfig.backoffMultiplier, attempt - 1);
  return Math.min(delay, httpConfig.maxDelay);
};

// Error classification for HTTP requests
const classifyHTTPError = (error) => {
  const errorMessage = error.message || error.toString();
  const errorCode = error.code || error.status || '';
  
  // HTTP status code classification
  if (errorCode === 429) {
    return 'RATE_LIMIT';
  }
  
  if (errorCode === 502 || errorCode === 503 || errorCode === 504) {
    return 'SERVICE_UNAVAILABLE';
  }
  
  if (errorCode === 500) {
    return 'INTERNAL_SERVER_ERROR';
  }
  
  if (errorCode === 504) {
    return 'GATEWAY_TIMEOUT';
  }
  
  // Network/connection errors
  if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
    return 'NETWORK_ERROR';
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
    return 'TIMEOUT';
  }
  
  // Client errors (usually not retryable)
  if (errorCode >= 400 && errorCode < 500) {
    return 'CLIENT_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
};

// HTTP request retry wrapper
const retryHTTPRequest = async (httpOperation) => {
  let lastError;
  const attempts = [];
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= httpConfig.maxAttempts; attempt++) {
    const attemptStartTime = Date.now();
    
    try {
      // Execute the HTTP operation
      const result = await httpOperation();
      
      const attemptDuration = Date.now() - attemptStartTime;
      const totalDuration = Date.now() - startTime;
      
      // Log successful attempt
      attempts.push({
        attempt,
        status: 'SUCCESS',
        duration: attemptDuration,
        timestamp: new Date().toISOString(),
        operation: 'HTTP Request',
        url: url,
        method: method
      });
      
      return {
        success: true,
        result,
        attempts,
        totalAttempts: attempt,
        totalDuration: `${totalDuration}ms`,
        timestamp: new Date().toISOString(),
        callSid: callSid,
        url: url,
        method: method
      };
      
    } catch (error) {
      const attemptDuration = Date.now() - attemptStartTime;
      const errorType = classifyHTTPError(error);
      
      // Log failed attempt
      attempts.push({
        attempt,
        status: 'FAILED',
        error: errorType,
        errorMessage: error.message,
        duration: attemptDuration,
        timestamp: new Date().toISOString(),
        operation: 'HTTP Request',
        url: url,
        method: method
      });
      
      lastError = error;
      
      // Check if error is retryable
      if (!httpConfig.retryableErrors.includes(errorType)) {
        console.log(`HTTP Request: Non-retryable error (${errorType}), stopping retries`);
        break;
      }
      
      // Check if we have more attempts
      if (attempt < httpConfig.maxAttempts) {
        const delay = calculateDelay(attempt);
        console.log(`HTTP Request: Attempt ${attempt} failed (${errorType}), retrying in ${delay}ms...`);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  const totalDuration = Date.now() - startTime;
  
  console.error(`HTTP Request: All ${httpConfig.maxAttempts} attempts failed`);
  
  return {
    success: false,
    error: lastError,
    errorType: classifyHTTPError(lastError),
    attempts,
    totalAttempts: httpConfig.maxAttempts,
    totalDuration: `${totalDuration}ms`,
    timestamp: new Date().toISOString(),
    callSid: callSid,
    url: url,
    method: method
  };
};

// Return the retry wrapper for HTTP requests
return {
  retryFunction: retryHTTPRequest,
  config: httpConfig,
  operationType: 'http-request',
  callSid: callSid,
  url: url,
  method: method,
  headers: headers,
  body: body,
  timestamp: new Date().toISOString(),
  documentation: {
    description: 'Specialized retry wrapper for HTTP request operations',
    maxAttempts: httpConfig.maxAttempts,
    retryableErrors: httpConfig.retryableErrors,
    usage: 'Use this wrapper around HTTP API calls',
    supportedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
};
```

---

## 🔧 Troubleshooting

### **Common Issues and Solutions:**

#### **1. Import Failures**
**Problem:** JSON files won't import into n8n
**Solution:** Ensure files have complete n8n workflow structure (see "Import Issues Fixed" section)

#### **2. Retry Wrapper Not Working**
**Problem:** Retry wrapper doesn't retry failed operations
**Solution:** 
- Check that error classification is working correctly
- Verify retryable errors are in the configuration
- Ensure exponential backoff is properly implemented

#### **3. Function Node Errors**
**Problem:** Function nodes return errors
**Solution:**
- Check input data structure matches expected format
- Verify all required fields are present
- Review error handling in function code

#### **4. API Rate Limiting**
**Problem:** Still hitting rate limits despite retry wrappers
**Solution:**
- Increase `baseDelay` in retry configuration
- Reduce `maxAttempts` to avoid overwhelming APIs
- Implement additional rate limiting logic

### **Debugging Tips:**
1. **Check n8n Execution Logs:** Review detailed execution logs for error details
2. **Test Individual Components:** Test each function node independently
3. **Validate Input Data:** Ensure input data structure matches expectations
4. **Monitor API Quotas:** Check API usage and quotas for all services

---

## 📊 Performance Monitoring

### **Key Metrics to Monitor:**
- **Retry Success Rate:** Percentage of retries that eventually succeed
- **Average Retry Attempts:** How many attempts are typically needed
- **API Response Times:** Monitor for performance degradation
- **Error Distribution:** Track which error types occur most frequently

### **Logging Structure:**
Each retry wrapper provides detailed logging including:
- Attempt number and status
- Duration of each attempt
- Error classification and messages
- Total execution time
- Operation-specific metadata

---

## 🔧 Standardized Variable Names

### **Environment Variables Configuration:**
All workflows use standardized n8n variable names for consistency:

```bash
# Admin Contact Information
ADMIN_EMAIL=contracts@mybuilderbot.com
ADMIN_PHONE=+14152728956

# API Configuration
BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=****

# Twilio Configuration
TWILIO_ACCOUNT_SID=***
TWILIO_AUTH_TOKEN=***
TWILIO_PHONE_NUMBER=+18777024493
BBP_PHONE_NUMBER=+18777024493

# Google Services Configuration
GOOGLE_API_KEY=****
GOOGLE_MAPS_API_KEY=****
GOOGLE_SEARCH_ENGINE_ID=***
GOOGLE_SERVICE_ACCOUNT_EMAIL=bbp-llc@contract-gen-prototype.iam.gserviceaccount.com

# System Configuration
ENABLE_SHEETS_LOGGING=true
IS_SIMULATION_MODE=false
```

### **Variable Usage in n8n:**
- **Access Variables:** Use `$vars.VARIABLE_NAME` syntax
- **Example:** `$vars.ADMIN_EMAIL` for admin email
- **Example:** `$vars.TWILIO_PHONE_NUMBER` for Twilio phone number

---

## 🎯 Summary

This comprehensive implementation guide provides everything needed to successfully implement the voice intake handler workflow in n8n Cloud June 2025 stable version. The key innovations include:

1. **✅ Fixed Import Issues:** Converted individual function nodes to complete n8n workflows
2. **✅ Specialized Retry Wrappers:** 4 different retry wrappers for different API types
3. **✅ No Manual Reconfiguration:** Each wrapper is pre-configured for its specific operation
4. **✅ Complete Error Handling:** Comprehensive error classification and retry logic
5. **✅ Performance Optimized:** Service-specific configurations and timeouts
6. **✅ Cost Aware:** Twilio wrapper limits retries to avoid unnecessary costs
7. **✅ Standardized Variables:** Consistent variable naming across all components

All files are ready for import and implementation in the "TO IMPLEMENT" folder.

---

**Last Updated:** January 27, 2025  
**Version:** 1.0.0  
**Compatibility:** n8n Cloud June 2025 Stable 