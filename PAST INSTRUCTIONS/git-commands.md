# 🚀 Git Commands for Integration Project

## 📋 **Commands to Execute**

### **1. Create and Switch to New Branch**
```bash
git checkout -b workflow-integration
```

### **2. Add Integration Files**
```bash
# Add core integration files
git add enhanced-workflow-part1.json
git add enhanced-workflow-part2.json
git add enhanced-workflow-part3.json
git add integration-guide.md
git add workflow-integration-visualization.md
git add README-INTEGRATION.md

# Add original workflow for reference
git add "Main Workflow - Voice Intake Handler (1).json"

# Add subflow components (optional - for reference)
git add subflow-*.json
git add main-workflow-*.json
```

### **3. Commit the Integration**
```bash
git commit -m "Add n8n voice intake workflow integration

- Enhanced speech processing with OpenAI
- Improved caller directory management
- Dynamic Twilio response generation
- Comprehensive integration guide and visualization
- Preserves all existing workflow functionality"
```

### **4. Push to Remote Repository**
```bash
# If pushing to andrew-freeland repository
git remote add andrew-freeland https://github.com/andrew-freeland/n8n-JSON-crafts.git
git push andrew-freeland workflow-integration

# Or if it's already configured as origin
git push origin workflow-integration
```

## 🔧 **Alternative: Create New Repository**

If you want to create a completely new repository:

### **1. Initialize New Repository**
```bash
mkdir n8n-voice-intake-integration
cd n8n-voice-intake-integration
git init
```

### **2. Copy Integration Files**
```bash
# Copy the core integration files
cp ../enhanced-workflow-part*.json .
cp ../integration-guide.md .
cp ../workflow-integration-visualization.md .
cp ../README-INTEGRATION.md .
cp "../Main Workflow - Voice Intake Handler (1).json" .
```

### **3. Add and Commit**
```bash
git add .
git commit -m "Initial commit: n8n voice intake workflow integration"
```

### **4. Create Remote Repository**
```bash
# Create new repository on GitHub, then:
git remote add origin https://github.com/andrew-freeland/n8n-voice-intake-integration.git
git branch -M main
git push -u origin main
```

## 📁 **File Organization**

### **Core Integration Files:**
- `enhanced-workflow-part1.json` - Speech processing
- `enhanced-workflow-part2.json` - Caller directory
- `enhanced-workflow-part3.json` - Response generation
- `integration-guide.md` - Step-by-step guide
- `workflow-integration-visualization.md` - Visual diagram
- `README-INTEGRATION.md` - Project overview

### **Reference Files:**
- `Main Workflow - Voice Intake Handler (1).json` - Original workflow
- `subflow-*.json` - Individual subflow components
- `main-workflow-*.json` - Alternative workflow versions

## 🎯 **Repository Structure**

```
n8n-voice-intake-integration/
├── README-INTEGRATION.md
├── integration-guide.md
├── workflow-integration-visualization.md
├── enhanced-workflow-part1.json
├── enhanced-workflow-part2.json
├── enhanced-workflow-part3.json
├── Main Workflow - Voice Intake Handler (1).json
├── subflow-*.json (reference)
└── main-workflow-*.json (reference)
```

## 🚨 **Important Notes**

### **Before Pushing:**
1. **Review files** - Ensure all integration files are complete
2. **Test locally** - Verify JSON files are valid
3. **Check permissions** - Ensure you have access to push to andrew-freeland
4. **Backup** - Keep a local copy of your current workflow

### **After Pushing:**
1. **Verify branch** - Check that the new branch was created
2. **Review files** - Ensure all files are properly uploaded
3. **Test integration** - Import and test the enhanced workflow
4. **Document** - Update any additional documentation as needed

## 📞 **Support**

If you encounter issues:
1. **Permission errors** - Check repository access
2. **Merge conflicts** - Resolve any conflicts before pushing
3. **File size issues** - Ensure JSON files are within limits
4. **Branch issues** - Verify branch name and remote configuration 