# 📞 Caller Directory Reference Card

## 🎯 **EXACT STRUCTURE FOR YOUR WORKFLOW**

Based on your `My workflow.json` analysis, here's the **exact** structure your Caller Directory needs:

---

## 📊 **Google Sheets Setup**

### **Sheet Name:** `CallerDirectory`
### **Range:** `A:H` (8 columns)
### **Sheet ID:** `122w46mkzpgbK-7z4GUnwZ87q18eUXQhK9IDoElv4_88`

---

## 📋 **Column Structure**

| Column | Field Name | Data Type | Required | Example |
|--------|------------|-----------|----------|---------|
| **A** | `phone_number` | Text | ✅ | `+15551234567` |
| **B** | `business_name` | Text | ✅ | `ABC Construction Co.` |
| **C** | `contact_email` | Text | ❌ | `john@abcconstruction.com` |
| **D** | `contact_method` | Text | ✅ | `sms` or `email` |
| **E** | `is_repeat` | Boolean | ✅ | `true` or `false` |
| **F** | `last_contact_date` | Date | ✅ | `2025-01-15` |
| **G** | `created_date` | Date | ✅ | `2025-01-10` |
| **H** | `call_count` | Number | ✅ | `3` |

---

## 🔧 **Workflow Integration Points**

### **1. Enhanced Caller Directory Node**
```json
{
  "sheetId": "122w46mkzpgbK-7z4GUnwZ87q18eUXQhK9IDoElv4_88",
  "range": "CallerDirectory!A:H"
}
```

### **2. Enhanced Caller Lookup Logic**
```javascript
// Reads data as array format:
const callerData = {
  phone_number: existingCaller[0],    // Column A
  business_name: existingCaller[1],   // Column B
  contact_email: existingCaller[2],   // Column C
  contact_method: existingCaller[3],  // Column D
  is_repeat: true,                    // Column E
  last_contact_date: existingCaller[5], // Column F
  created_date: existingCaller[6],    // Column G
  call_count: parseInt(existingCaller[7]) || 1 // Column H
}
```

### **3. Enhanced Caller Update Logic**
```javascript
const updateData = {
  phone_number: sanitizeData.phoneNumber(callerData.phone_number),
  business_name: sanitizeData.businessName(callerData.business_name),
  contact_email: sanitizeData.contactEmail(callerData.contact_email),
  contact_method: sanitizeData.contactMethod(callerData.contact_method),
  is_repeat: true,
  last_contact_date: today,
  created_date: callerData.created_date || today,
  call_count: (parseInt(callerData.call_count) || 0) + 1
}
```

---

## 📝 **Sample Data**

### **Row 1 (Headers):**
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

### **Row 2 (Sample Data):**
```
A2: +15551234567
B2: ABC Construction Co.
C2: john@abcconstruction.com
D2: sms
E2: true
F2: 2025-01-15
G2: 2025-01-10
H2: 3
```

---

## ⚠️ **Critical Requirements**

### **1. Phone Number Format**
- **Must be E.164 format:** `+1XXXXXXXXXX`
- **Workflow normalizes:** `5551234567` → `+15551234567`
- **No spaces or special characters**

### **2. Contact Method Values**
- **Only allowed:** `sms` or `email`
- **Case sensitive:** lowercase only
- **No variations:** `SMS`, `Email`, `text` will fail

### **3. Date Format**
- **Format:** `YYYY-MM-DD`
- **Example:** `2025-01-15`
- **No time component**

### **4. Boolean Values**
- **For `is_repeat`:** `true` or `false`
- **For `call_count`:** Numbers only (no text)

---

## 🚨 **Common Errors & Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| `"Range not found"` | Wrong sheet name | Check: `CallerDirectory` (exact spelling) |
| `"Invalid phone format"` | Wrong phone format | Use: `+15551234567` |
| `"Contact method invalid"` | Wrong contact method | Use: `sms` or `email` only |
| `"Permission denied"` | API access issue | Check Google Sheets API permissions |
| `"Column mismatch"` | Wrong column order | Follow exact A:H structure |

---

## 🔍 **Validation Checklist**

- [ ] Sheet named exactly: `CallerDirectory`
- [ ] 8 columns: A through H
- [ ] Headers in row 1 match exactly
- [ ] Phone numbers in E.164 format
- [ ] Contact method is `sms` or `email`
- [ ] Dates in `YYYY-MM-DD` format
- [ ] Boolean values are `true`/`false`
- [ ] Call count is numeric
- [ ] Sheet ID updated in workflow nodes

---

## 📞 **Quick Test**

1. **Add test row:**
   ```
   +15551234567 | Test Company | test@example.com | sms | false | 2025-01-17 | 2025-01-17 | 1
   ```

2. **Run workflow test call**
3. **Verify data is read correctly**
4. **Check that new records are created**

---

**✅ Your Caller Directory is now perfectly aligned with your n8n workflow!** 