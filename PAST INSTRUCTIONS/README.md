# 🏗️ n8n Voice Intake System - Implementation Guide

**Version Target:** n8n Cloud v1.102.4 (June 2025 Stable)  
**System Type:** Contract Automation Voice Intake System

## 📋 **Overview**

This system processes construction contract requests via Twilio voice calls, extracts project metadata using OpenAI, manages caller directories in Google Sheets, and generates CSLB-compliant contracts with automated notifications.

## 🚀 **Installation Order**

### **Phase 1: Core Subflows (Import First)**
Import these workflows in the following order to establish the foundation:

1. **`log-to-sheets-workflow.json`** - Analytics and tracking foundation
2. **`parse-contract-workflow.json`** - Contract generation engine
3. **`send-notifications-workflow.json`** - Communication system
4. **`orchestrator-workflow-corrected.json`** - Main orchestrator (import last)

**Why this order?** The orchestrator depends on the subflows being available for execution.

## 🔐 **Required Credentials**

### **1. Google Sheets OAuth2**
- **Name:** `Google Sheets Service Account`
- **Type:** Service Account JSON
- **Required for:** Caller directory, analytics logging
- **Setup:** Upload service account JSON file

### **2. OpenAI API Key**
- **Name:** `OpenAI API`
- **Type:** API Key
- **Required for:** Speech-to-text extraction
- **Setup:** Enter your OpenAI API key

### **3. Twilio API**
- **Name:** `Twilio Account`
- **Type:** Account SID + Auth Token
- **Required for:** Voice webhooks, SMS notifications
- **Setup:** Enter Account SID and Auth Token

### **4. Email Send (SMTP)**
- **Name:** `Email SMTP`
- **Type:** SMTP Configuration
- **Required for:** Email notifications
- **Setup:** Configure SMTP server details

## 🌍 **Environment Variables**

Set these variables in your n8n instance before running:

```bash
# Google Sheets Configuration
SHEET_ID=your_google_sheet_id_here

# Twilio Configuration
TWILIO_PHONE_NUMBER=+1234567890
BBP_PHONE_NUMBER=+1234567890

# Notification Settings
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PHONE=+1234567890
ENABLE_SMS=true
ENABLE_SHEETS_LOGGING=true

# System Configuration
BASE_URL=https://your-n8n-instance.com
IS_SIMULATION_MODE=false
```

## 🔗 **Subflow Wiring**

### **Orchestrator → Subflow Connections**

The main orchestrator (`orchestrator-workflow-corrected.json`) executes subflows in this sequence:

1. **Parse Contract** → Generates CSLB-compliant contract
2. **Send Notifications** → Sends SMS/email to admin
3. **Log to Sheets** → Records analytics and caller data

### **Data Flow Between Workflows**

```
Twilio Webhook → Orchestrator → Parse Contract → Send Notifications → Log to Sheets
```

### **Subflow Input/Output Mapping**

| Subflow | Input Data | Output Data |
|---------|------------|-------------|
| Parse Contract | `extractedData`, `callerData` | `contractText`, `complianceStatus` |
| Send Notifications | `notificationPayload` | `smsStatus`, `emailStatus` |
| Log to Sheets | `callLogData`, `analytics` | `logStatus`, `rowCount` |

## 🧪 **Testing Instructions**

### **1. Test Parse Contract Workflow**

**Mock Payload:**
```json
{
  "projectType": "kitchen remodel",
  "clientName": "Test Construction Co",
  "projectAddress": "123 Test St, San Francisco, CA",
  "budget": "$25,000.00",
  "startDate": "March 15",
  "scopeOfWork": "Full kitchen renovation with new cabinets",
  "paymentTerms": "50% upfront, 50% on completion",
  "callSid": "CA1234567890"
}
```

**Expected Output:**
- CSLB-compliant contract text
- Compliance status: "COMPLIANT" or "REVIEW_REQUIRED"
- Contract metadata with warnings

### **2. Test Send Notifications Workflow**

**Mock Payload:**
```json
{
  "callSid": "CA1234567890",
  "caller": {
    "phone": "+14155552671",
    "business": "Test Business",
    "contactMethod": "email"
  },
  "project": {
    "type": "bathroom remodel",
    "address": "456 Oak Ave",
    "budget": "$15,000"
  }
}
```

**Expected Output:**
- SMS sent to admin phone
- Email sent to admin email
- Notification status confirmation

### **3. Test Log to Sheets Workflow**

**Mock Payload:**
```json
{
  "callSid": "CA1234567890",
  "callerPhone": "+14155552671",
  "clientName": "Test Client",
  "projectType": "deck build",
  "budget": "$8,000",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

**Expected Output:**
- Row added to Google Sheets
- Analytics metrics calculated
- Processing time recorded

### **4. Test Full Orchestrator**

**Twilio Webhook Payload:**
```json
{
  "CallSid": "CA1234567890",
  "From": "+14155552671",
  "SpeechResult": "Hi, this is John from ABC Construction. We're doing a kitchen remodel at 789 Pine Street, Oakland. Budget is $35,000 with 30% upfront payment.",
  "To": "+18777024493"
}
```

**Expected Flow:**
1. Webhook validation passes
2. OpenAI extracts structured data
3. Caller directory lookup
4. Follow-up questions if needed
5. Contract generation
6. Notifications sent
7. Analytics logged

## ⚠️ **Known Limitations**

### **1. Speech Recognition Accuracy**
- **Issue:** OpenAI extraction may miss details in noisy environments
- **Workaround:** Implement follow-up questions for missing fields
- **Status:** ✅ Handled by enhanced follow-up logic

### **2. Phone Number Format Variations**
- **Issue:** Different phone number formats may not match in caller directory
- **Workaround:** Phone number normalization in caller lookup
- **Status:** ✅ Handled by enhanced caller lookup

### **3. Google Sheets Rate Limits**
- **Issue:** Google Sheets API has rate limits
- **Workaround:** Implement retry logic and error handling
- **Status:** ✅ Handled by retry configuration

### **4. Twilio Webhook Timeouts**
- **Issue:** Long processing times may cause webhook timeouts
- **Workaround:** Async processing and quick initial response
- **Status:** ✅ Handled by immediate webhook response

### **5. CSLB Compliance Edge Cases**
- **Issue:** Some complex payment structures may need manual review
- **Workaround:** Warning system flags potential compliance issues
- **Status:** ✅ Handled by compliance check system

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Workflow not found" errors**
   - Ensure all subflows are imported before orchestrator
   - Check workflow IDs match in orchestrator

2. **Credential errors**
   - Verify all credentials are properly configured
   - Check API keys are valid and have correct permissions

3. **Google Sheets access errors**
   - Ensure service account has edit permissions
   - Verify sheet ID is correct and accessible

4. **Twilio webhook failures**
   - Check webhook URL is publicly accessible
   - Verify Twilio phone number is configured for voice

### **Debug Mode**

Enable simulation mode for testing:
```bash
IS_SIMULATION_MODE=true
```

This will log all operations without sending actual notifications.

## 📊 **Monitoring & Analytics**

### **Key Metrics to Track**
- Call volume and success rates
- Speech recognition accuracy
- Contract generation success
- Notification delivery rates
- Error frequency by type

### **Google Sheets Analytics**
The system automatically logs:
- Call details and metadata
- Processing times
- Error rates
- Compliance warnings
- Caller return rates

## 🔄 **Updates & Maintenance**

### **Regular Maintenance Tasks**
1. **Monthly:** Review error logs and optimize prompts
2. **Quarterly:** Update CSLB compliance requirements
3. **Annually:** Review and update notification templates

### **Version Compatibility**
- All workflows tested with n8n Cloud v1.102.4
- Backward compatible with v1.100+
- Forward compatible with v1.105+

## 📞 **Support**

For implementation issues:
1. Check this README for troubleshooting steps
2. Review the `PAST INSTRUCTIONS/` folder for additional context
3. Refer to n8n documentation for platform-specific questions

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Compatibility:** n8n Cloud v1.102.4+ 