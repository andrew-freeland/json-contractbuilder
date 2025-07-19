# Subflow Import Guide - BBP Voice Intake System

## 📁 Split Architecture Overview

The system is now split into **5 logical subflows** for better maintainability and debugging:

### **1. Webhook Validation Subflow** (`subflow-webhook-validation.json`)
- **Purpose**: Validates incoming Twilio webhooks
- **Components**: Webhook trigger, validation logic, response
- **Use Case**: Initial webhook processing and validation

### **2. Caller Directory Subflow** (`subflow-caller-directory.json`)
- **Purpose**: Manages caller lookup and directory updates
- **Components**: Google Sheets read, caller lookup, update logic
- **Use Case**: Caller identification and directory management

### **3. Speech Processing Subflow** (`subflow-speech-processing.json`)
- **Purpose**: Processes speech with OpenAI and extracts data
- **Components**: OpenAI prompt, extraction, follow-up logic
- **Use Case**: AI-powered speech analysis and data extraction

### **4. Conversation Flow Subflow** (`subflow-conversation-flow.json`)
- **Purpose**: Manages conversation state and Twilio responses
- **Components**: Conversation flow logic, Twilio response templates
- **Use Case**: Conversation state management and response generation

### **5. Notification Output Subflow** (`subflow-notification-output.json`)
- **Purpose**: Generates notifications for the founder
- **Components**: Notification formatting, SMS/email templates
- **Use Case**: Output formatting and notification generation

### **6. Main Orchestrator** (`main-workflow-orchestrator.json`)
- **Purpose**: Orchestrates all subflows together
- **Components**: Complete workflow with all nodes
- **Use Case**: Full system integration

## 🚀 Import Instructions

### **Option 1: Import Main Orchestrator (Recommended)**
```bash
# Import the complete system
main-workflow-orchestrator.json
```

### **Option 2: Import Individual Subflows**
```bash
# Import each subflow separately
subflow-webhook-validation.json
subflow-caller-directory.json
subflow-speech-processing.json
subflow-conversation-flow.json
subflow-notification-output.json
```

## 🔧 Setup Process

### **Step 1: Import Workflows**
1. **Open n8n** and go to Workflows
2. **Import** `main-workflow-orchestrator.json` (recommended)
3. **Or import** individual subflows if you prefer modular approach

### **Step 2: Set Up Credentials**
1. **Google Sheets** - Service account or OAuth2
2. **OpenAI** - API key
3. **Test credentials** in each node

### **Step 3: Configure Google Sheets**
1. **Create CallerDirectory sheet** (follow `caller-directory-setup.md`)
2. **Update sheet name** in Google Sheets nodes
3. **Test sheet access**

### **Step 4: Test the System**
1. **Activate the workflow**
2. **Test with sample webhook data**
3. **Verify all nodes execute correctly**

## 📊 Benefits of Split Architecture

### **Maintainability**
- ✅ **Easier debugging** - isolate issues to specific subflows
- ✅ **Independent updates** - modify one component without affecting others
- ✅ **Clear separation** - each subflow has a single responsibility

### **Scalability**
- ✅ **Modular deployment** - deploy subflows independently
- ✅ **Resource optimization** - scale specific components as needed
- ✅ **Team collaboration** - different teams can work on different subflows

### **Testing**
- ✅ **Unit testing** - test each subflow independently
- ✅ **Integration testing** - test subflow interactions
- ✅ **Error isolation** - identify issues faster

## 🔄 Data Flow Between Subflows

```
Webhook Validation → Caller Directory → Speech Processing → 
Conversation Flow → Notification Output
```

### **Data Passing**
- **Webhook data** flows through all subflows
- **Caller info** is enriched at each step
- **Extracted data** is processed and validated
- **Final response** is generated and returned

## 🛠️ Customization Options

### **Modify Individual Subflows**
- **Webhook Validation**: Add custom validation rules
- **Caller Directory**: Modify lookup logic or add new fields
- **Speech Processing**: Adjust OpenAI prompts or extraction logic
- **Conversation Flow**: Customize conversation states
- **Notification Output**: Change notification formats

### **Add New Subflows**
- **Error Handling**: Dedicated error processing subflow
- **Analytics**: Data collection and reporting subflow
- **Integration**: Connect to external systems subflow

## 📝 Usage Examples

### **Testing Individual Subflows**
```javascript
// Test webhook validation
{
  "CallSid": "CA1234567890",
  "From": "+14155552671",
  "SpeechResult": "Test message",
  "To": "+18777024493"
}

// Test caller lookup
{
  "callerPhone": "+14155552671",
  "callSid": "CA1234567890"
}

// Test speech processing
{
  "speechResult": "Hey, this is Mike from Rednic Construction..."
}
```

### **Monitoring Subflows**
- **Execution logs** for each subflow
- **Error tracking** by subflow
- **Performance metrics** per component
- **Success/failure rates** by subflow

## 🔐 Security Considerations

### **Credential Management**
- ✅ **Separate credentials** for each subflow
- ✅ **Minimal permissions** for each service
- ✅ **Secure storage** of API keys

### **Data Validation**
- ✅ **Input validation** at each subflow entry
- ✅ **Output validation** before passing to next subflow
- ✅ **Error handling** for malformed data

## 📞 Support and Troubleshooting

### **Common Issues**
1. **Credential errors** - Check API keys and permissions
2. **Data flow issues** - Verify node connections
3. **Google Sheets errors** - Check sheet permissions and format
4. **OpenAI errors** - Verify API key and quota

### **Debug Process**
1. **Test each subflow independently**
2. **Check execution logs** for errors
3. **Verify data format** between subflows
4. **Test with sample data** before production

## 🎯 Next Steps

1. **Import the main orchestrator** workflow
2. **Set up credentials** for Google Sheets and OpenAI
3. **Configure your Google Sheets** CallerDirectory
4. **Test with sample data**
5. **Deploy and configure Twilio webhook**
6. **Monitor and optimize** performance

The split architecture provides better maintainability, easier debugging, and more flexibility for future enhancements while maintaining all the functionality of the original system. 