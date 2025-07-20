# 🧩 Enhanced Voice Intake System - Assembly Guide

## 📋 **Overview**

This guide will help you assemble the complete enhanced voice intake system from the 4 workflow parts provided. Each part is designed to be imported separately and then connected together.

## 🎯 **Workflow Parts Overview**

### **Part 1: Webhook & Validation**
- **File:** `enhanced-orchestrator-part1-webhook-validation.json`
- **Purpose:** Entry point, webhook validation, caller directory lookup
- **Nodes:** Webhook Entry, Validate Webhook, Check Caller Directory

### **Part 2: Speech Processing**
- **File:** `enhanced-orchestrator-part2-speech-processing.json`
- **Purpose:** Speech processing, OpenAI data extraction, response parsing
- **Nodes:** Process Speech Input, OpenAI Data Extraction, Parse OpenAI Response

### **Part 3: Compliance & Scope**
- **File:** `enhanced-orchestrator-part3-compliance-scope.json`
- **Purpose:** CSLB compliance checking, scope summary building
- **Nodes:** CSLB Compliance Check, Build Scope Summary

### **Part 4: Response & Notifications**
- **File:** `enhanced-orchestrator-part4-response-notifications.json`
- **Purpose:** TwiML response generation, notifications, logging
- **Nodes:** Construct TwiML Response, Send SMS/Email, Log to Sheets, HTTP Response

---

## 🚀 **Step-by-Step Assembly Instructions**

### **Step 1: Import All Workflow Parts**

1. **Open n8n workflow editor**
2. **Import Part 1:**
   - Click "Import from file"
   - Select `enhanced-orchestrator-part1-webhook-validation.json`
   - Position nodes on the left side of canvas

3. **Import Part 2:**
   - Click "Import from file"
   - Select `enhanced-orchestrator-part2-speech-processing.json`
   - Position nodes to the right of Part 1

4. **Import Part 3:**
   - Click "Import from file"
   - Select `enhanced-orchestrator-part3-compliance-scope.json`
   - Position nodes to the right of Part 2

5. **Import Part 4:**
   - Click "Import from file"
   - Select `enhanced-orchestrator-part4-response-notifications.json`
   - Position nodes to the right of Part 3

### **Step 2: Connect the Workflow Parts**

#### **Connection 1: Part 1 → Part 2**
- **From:** "Check Caller Directory" (Part 1)
- **To:** "Process Speech Input" (Part 2)
- **Connection Type:** Main output to main input

#### **Connection 2: Part 2 → Part 3**
- **From:** "Parse OpenAI Response" (Part 2)
- **To:** "CSLB Compliance Check" (Part 3)
- **Connection Type:** Main output to main input

#### **Connection 3: Part 3 → Part 4**
- **From:** "Build Scope Summary" (Part 3)
- **To:** "Construct TwiML Response" (Part 4)
- **Connection Type:** Main output to main input

### **Step 3: Configure Credentials**

#### **Required Credentials:**
1. **OpenAI API** (for Part 2)
   - Add OpenAI API key in credentials
   - Assign to "OpenAI Data Extraction" node

2. **Twilio API** (for Part 4)
   - Add Twilio Account SID and Auth Token
   - Assign to "Send SMS Notification" node

3. **SMTP** (for Part 4)
   - Add email server credentials
   - Assign to "Send Email Notification" node

4. **Google Sheets OAuth2** (for Part 4)
   - Add Google Sheets API credentials
   - Assign to "Log to Google Sheets" node

### **Step 4: Set Environment Variables**

Add these environment variables in your n8n settings:

```bash
# Twilio Configuration
ADMIN_EMAIL=contracts@mybuilderbot.com
ADMIN_PHONE=+14152728956
BASE_URL=https://api.openai.com/v1
BBP_PHONE_NUMBER=+18777024493
ENABLE_SHEETS_LOGGING=true
GOOGLE_API_KEY=****
GOOGLE_MAPS_API_KEY=****
GOOGLE_SEARCH_ENGINE_ID=***
GOOGLE_SERVICE_ACCOUNT_EMAIL=bbp-llc@contract-gen-prototype.iam.gserviceaccount.com
IS_SIMULATION_MODE=false
OPENAI_API_KEY=****
TWILIO_ACCOUNT_SID=***
TWILIO_AUTH_TOKEN=***
TWILIO_PHONE_NUMBER=+18777024493
FOUNDER_PHONE_NUMBER=+0987654321

# Email Configuration
NOTIFICATION_EMAIL=notifications@yourcompany.com
FOUNDER_EMAIL=founder@yourcompany.com

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your-google-sheets-id-here
```

### **Step 5: Configure Webhook URL**

1. **Set the webhook URL in Twilio:**
   - Go to your Twilio console
   - Navigate to Phone Numbers → Manage → Active numbers
   - Set the webhook URL for incoming calls to:
   ```
   https://your-n8n-instance.com/webhook/voice-intake
   ```

---

## 🔧 **Detailed Connection Map**

### **Complete Workflow Flow:**
```
Part 1: Webhook Entry → Validate Webhook → Check Caller Directory
                                                    ↓
Part 2: Process Speech Input → OpenAI Data Extraction → Parse OpenAI Response
                                                                        ↓
Part 3: CSLB Compliance Check → Build Scope Summary
                                        ↓
Part 4: Construct TwiML Response → [SMS/Email/Sheets] → HTTP Response
```

### **Data Flow Between Parts:**

#### **Part 1 → Part 2:**
```json
{
  "CallSid": "CA1234567890",
  "From": "+1234567890",
  "To": "+0987654321",
  "SpeechResult": "My business is ABC Construction...",
  "validation": { "isValid": true, "errors": [], "warnings": [] },
  "callerDirectory": {
    "isReturningCaller": false,
    "callerInfo": null
  },
  "conversationState": "new_caller"
}
```

#### **Part 2 → Part 3:**
```json
{
  "extractedData": {
    "business_name": "ABC Construction",
    "project_type": "renovation",
    "project_address": "123 Main St, City, CA",
    "budget": "$25,000",
    "payment_terms": "50% upfront, 50% on completion"
  },
  "hasFollowUp": false,
  "followUpQuestion": null,
  "missingField": null
}
```

#### **Part 3 → Part 4:**
```json
{
  "complianceResults": {
    "complianceStatus": "REVIEW_REQUIRED",
    "complianceScore": 85,
    "warnings": ["⚠️ Payment structure should include progress payments"]
  },
  "scopeSummary": "Renovation at 123 Main St, City, CA, budget $25,000.",
  "smsSummary": "ABC Construction\nRenovation\n123 Main St, City, CA\n$25,000\ntext\n⚠️ Review required\nID: CA1234567890",
  "emailSummary": "New Construction Contract Request\n\nCall Details:\n...",
  "notificationPayload": {
    "callSid": "CA1234567890",
    "caller": { "business": "ABC Construction", "contactMethod": "text" },
    "project": { "type": "renovation", "address": "123 Main St, City, CA", "budget": "$25,000" }
  }
}
```

---

## 🧪 **Testing Each Part**

### **Test Part 1: Webhook Validation**
```bash
curl -X POST https://your-n8n-instance.com/webhook/voice-intake \
  -H "Content-Type: application/json" \
  -d '{
    "CallSid": "CA1234567890",
    "From": "+1234567890",
    "To": "+0987654321",
    "SpeechResult": "Hello, this is a test call"
  }'
```

### **Test Part 2: Speech Processing**
- Use the output from Part 1
- Verify OpenAI extraction works
- Check that follow-up logic functions correctly

### **Test Part 3: Compliance & Scope**
- Use extracted data from Part 2
- Verify CSLB compliance checking
- Confirm scope summary generation

### **Test Part 4: Response & Notifications**
- Use scope summary from Part 3
- Verify TwiML response generation
- Test SMS/email notifications
- Confirm Google Sheets logging

---

## 🚨 **Troubleshooting Common Issues**

### **Issue: Parts not connecting properly**
**Solution:** 
- Ensure all nodes have unique IDs
- Check that connection points match exactly
- Verify data structure compatibility

### **Issue: Credentials not working**
**Solution:**
- Double-check credential configuration
- Verify API keys are valid and active
- Test credentials individually

### **Issue: Environment variables not found**
**Solution:**
- Restart n8n after adding environment variables
- Check variable names match exactly
- Verify variable values are correct

### **Issue: Webhook not receiving calls**
**Solution:**
- Verify webhook URL is accessible
- Check Twilio webhook configuration
- Test webhook endpoint directly

---

## 📊 **Performance Optimization**

### **Recommended Settings:**
- **Execution Order:** v1 (already set)
- **Timeout:** 30 seconds per node
- **Retry Logic:** 3 attempts for API calls
- **Rate Limiting:** Respect API limits

### **Monitoring:**
- Monitor execution times
- Track success/failure rates
- Watch for API rate limit issues
- Monitor Google Sheets quota usage

---

## 🎉 **Final Steps**

### **Before Going Live:**
1. **Test the complete workflow** with real phone calls
2. **Verify all notifications** are working correctly
3. **Check Google Sheets logging** is functioning
4. **Monitor performance** and adjust as needed
5. **Set up error monitoring** and alerts

### **Production Checklist:**
- [ ] All parts imported and connected
- [ ] All credentials configured
- [ ] Environment variables set
- [ ] Webhook URL configured in Twilio
- [ ] Complete end-to-end testing done
- [ ] Error handling verified
- [ ] Performance monitoring in place

---

**🎯 Your enhanced voice intake system is now ready for production!**

For additional support, refer to the individual part files and the implementation guide in this folder. 