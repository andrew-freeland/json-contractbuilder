# Caller Directory Setup Guide

## 📋 Required Google Sheets Structure

Based on your workflow analysis, your Caller Directory needs the following structure:

### **Sheet Name:** `CallerDirectory`
### **Range:** `A:H` (8 columns)

## 📊 Column Structure

| Column | Field Name | Data Type | Description | Example |
|--------|------------|-----------|-------------|---------|
| **A** | `phone_number` | Text | E.164 formatted phone number | `+15551234567` |
| **B** | `business_name` | Text | Company/business name | `ABC Construction Co.` |
| **C** | `contact_email` | Text | Email address | `john@abcconstruction.com` |
| **D** | `contact_method` | Text | Preferred contact method | `sms` or `email` |
| **E** | `is_repeat` | Boolean | Is returning customer | `true` or `false` |
| **F** | `last_contact_date` | Date | Last contact date | `2025-01-15` |
| **G** | `created_date` | Date | First contact date | `2025-01-10` |
| **H** | `call_count` | Number | Total number of calls | `3` |

## 🚀 Setup Instructions

### **Step 1: Create Google Sheets Document**
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: `Caller Directory - n8n Voice Intake`

### **Step 2: Set Up Sheet Structure**
1. Rename the first sheet to: `CallerDirectory`
2. Add the header row in row 1:

```
A1: phone_number
B1: business_name  
C1: contact_email
D1: contact_method
E1: is_repeat
F1: last_contact_date
G1: created_date
H1: call_count
```

### **Step 3: Format Headers**
1. Select row 1 (A1:H1)
2. Make it bold and center-aligned
3. Add a background color (e.g., light blue)
4. Freeze the header row

### **Step 4: Set Data Validation**
1. **Column D (contact_method):**
   - Select column D
   - Data → Data validation
   - Criteria: List of items
   - Values: `sms,email`
   - Check "Show validation help text"

2. **Column E (is_repeat):**
   - Select column E
   - Data → Data validation
   - Criteria: Checkbox

3. **Column F & G (dates):**
   - Select columns F and G
   - Format → Number → Date
   - Choose: `YYYY-MM-DD`

4. **Column H (call_count):**
   - Select column H
   - Format → Number → Number
   - Set decimal places to 0

### **Step 5: Add Sample Data**
Add a few sample rows to test the workflow:

```
A2: +15551234567
B2: ABC Construction Co.
C2: john@abcconstruction.com
D2: sms
E2: true
F2: 2025-01-15
G2: 2025-01-10
H2: 3

A3: +15559876543
B3: XYZ Remodeling
C3: sarah@xyzremodeling.com
D3: email
E3: false
F3: 2025-01-16
G3: 2025-01-16
H3: 1
```

## 🔧 Workflow Integration

### **Sheet ID Configuration**
Your workflow is configured to use:
- **Sheet ID:** `122w46mkzpgbK-7z4GUnwZ87q18eUXQhK9IDoElv4_88`
- **Range:** `CallerDirectory!A:H`

### **Update Your Workflow**
If you create a new sheet, update these nodes:

1. **Enhanced Caller Directory** node:
   - Sheet ID: Your new sheet ID
   - Range: `CallerDirectory!A:H`

2. **Update Caller Directory** node:
   - Sheet ID: Your new sheet ID
   - Sheet Name: `CallerDirectory`

## 📝 Data Flow Explanation

### **Reading Data (Enhanced Caller Directory):**
- Reads all rows from `CallerDirectory!A:H`
- Uses column A (phone_number) for lookup matching
- Returns array format: `[phone, business, email, method, repeat, last_contact, created, call_count]`

### **Writing Data (Update Caller Directory):**
- Uses `appendOrUpdate` operation
- Matches on phone number (column A)
- Updates existing records or creates new ones
- Automatically increments call_count

## 🛡️ Error Prevention

### **Phone Number Formatting**
The workflow automatically normalizes phone numbers:
- `5551234567` → `+15551234567`
- `15551234567` → `+15551234567`
- `+15551234567` → `+15551234567` (unchanged)

### **Data Sanitization**
- Business names: Title case formatting
- Email addresses: Lowercase
- Contact method: Normalized to `sms` or `email`

## 🔍 Testing the Setup

### **Test with Sample Data**
1. Add the sample data above
2. Run your workflow with a test call
3. Verify the data is read correctly
4. Check that new records are created properly

### **Common Issues & Solutions**
- **"Range not found"**: Check sheet name spelling
- **"Permission denied"**: Verify Google Sheets API access
- **"Invalid phone format"**: Ensure E.164 format (+1XXXXXXXXXX)

## 📈 Monitoring & Maintenance

### **Regular Tasks**
1. **Backup data** monthly
2. **Review call_count** for inactive customers
3. **Update contact_method** preferences
4. **Archive old records** (optional)

### **Performance Tips**
- Keep sheet under 10,000 rows for optimal performance
- Use filters for large datasets
- Consider archiving old records to separate sheets

---

## 🎯 Quick Setup Checklist

- [ ] Create Google Sheets document
- [ ] Name sheet: `CallerDirectory`
- [ ] Add headers (A1:H1)
- [ ] Format headers (bold, centered, colored)
- [ ] Set data validation rules
- [ ] Add sample data
- [ ] Update workflow Sheet ID
- [ ] Test with sample call
- [ ] Verify data flow

Your Caller Directory is now ready to work seamlessly with your enhanced n8n voice intake workflow! 🚀 