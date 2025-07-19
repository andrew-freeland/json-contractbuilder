#!/usr/bin/env node

/**
 * Caller Directory Setup Script
 * 
 * This script helps set up the Google Sheets Caller Directory
 * that matches your n8n workflow requirements.
 * 
 * Usage: node setup-caller-directory.js
 */

const { google } = require('googleapis');

// Configuration
const SHEET_ID = '122w46mkzpgbK-7z4GUnwZ87q18eUXQhK9IDoElv4_88'; // Update this with your sheet ID
const SHEET_NAME = 'CallerDirectory';

// Column structure matching your workflow
const COLUMNS = [
  'phone_number',
  'business_name', 
  'contact_email',
  'contact_method',
  'is_repeat',
  'last_contact_date',
  'created_date',
  'call_count'
];

// Sample data for testing
const SAMPLE_DATA = [
  [
    '+15551234567',
    'ABC Construction Co.',
    'john@abcconstruction.com',
    'sms',
    true,
    '2025-01-15',
    '2025-01-10',
    3
  ],
  [
    '+15559876543',
    'XYZ Remodeling',
    'sarah@xyzremodeling.com',
    'email',
    false,
    '2025-01-16',
    '2025-01-16',
    1
  ],
  [
    '+15555555555',
    'Premium Builders LLC',
    'mike@premiumbuilders.com',
    'sms',
    true,
    '2025-01-14',
    '2025-01-05',
    5
  ]
];

/**
 * Initialize Google Sheets API
 */
function initializeSheetsAPI() {
  // You'll need to set up authentication
  // For now, this is a template - you'll need to add your credentials
  console.log('⚠️  Authentication setup required:');
  console.log('1. Create a Google Cloud Project');
  console.log('2. Enable Google Sheets API');
  console.log('3. Create a Service Account');
  console.log('4. Download the JSON credentials');
  console.log('5. Share your Google Sheet with the service account email');
  
  // Example authentication setup:
  /*
  const auth = new google.auth.GoogleAuth({
    keyFile: 'path/to/your/service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  return google.sheets({ version: 'v4', auth });
  */
}

/**
 * Create the sheet structure
 */
async function createSheetStructure(sheets) {
  try {
    console.log('📋 Creating sheet structure...');
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:H1`,
      valueInputOption: 'RAW',
      resource: {
        values: [COLUMNS]
      }
    });
    
    console.log('✅ Headers added successfully');
    
    // Format headers
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0, // Assuming first sheet
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 8
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.6, blue: 1.0 },
                  textFormat: { bold: true },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: {
                  frozenRowCount: 1
                }
              },
              fields: 'gridProperties.frozenRowCount'
            }
          }
        ]
      }
    });
    
    console.log('✅ Headers formatted successfully');
    
  } catch (error) {
    console.error('❌ Error creating sheet structure:', error.message);
  }
}

/**
 * Add sample data
 */
async function addSampleData(sheets) {
  try {
    console.log('📊 Adding sample data...');
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:H${SAMPLE_DATA.length + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: SAMPLE_DATA
      }
    });
    
    console.log('✅ Sample data added successfully');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  }
}

/**
 * Set up data validation
 */
async function setupDataValidation(sheets) {
  try {
    console.log('🔧 Setting up data validation...');
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [
          // Contact method validation (Column D)
          {
            setDataValidation: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                startColumnIndex: 3,
                endColumnIndex: 4
              },
              rule: {
                condition: {
                  type: 'ONE_OF_LIST',
                  values: [
                    { userEnteredValue: 'sms' },
                    { userEnteredValue: 'email' }
                  ]
                },
                showCustomUi: true,
                strict: true
              }
            }
          },
          // Is repeat validation (Column E) - checkbox
          {
            setDataValidation: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                startColumnIndex: 4,
                endColumnIndex: 5
              },
              rule: {
                condition: {
                  type: 'BOOLEAN'
                },
                showCustomUi: true
              }
            }
          }
        ]
      }
    });
    
    console.log('✅ Data validation set up successfully');
    
  } catch (error) {
    console.error('❌ Error setting up data validation:', error.message);
  }
}

/**
 * Main setup function
 */
async function setupCallerDirectory() {
  console.log('🚀 Setting up Caller Directory...\n');
  
  // Check if authentication is set up
  const sheets = initializeSheetsAPI();
  
  if (!sheets) {
    console.log('\n📝 Manual Setup Instructions:');
    console.log('1. Create a new Google Sheets document');
    console.log('2. Name the first sheet: CallerDirectory');
    console.log('3. Add these headers in row 1:');
    COLUMNS.forEach((col, index) => {
      console.log(`   ${String.fromCharCode(65 + index)}1: ${col}`);
    });
    console.log('\n4. Add sample data:');
    SAMPLE_DATA.forEach((row, index) => {
      console.log(`   Row ${index + 2}: ${row.join(' | ')}`);
    });
    console.log('\n5. Format headers (bold, centered, colored background)');
    console.log('6. Set data validation for contact_method (sms, email)');
    console.log('7. Set data validation for is_repeat (checkbox)');
    console.log('8. Update your workflow Sheet ID');
    return;
  }
  
  try {
    await createSheetStructure(sheets);
    await addSampleData(sheets);
    await setupDataValidation(sheets);
    
    console.log('\n🎉 Caller Directory setup complete!');
    console.log(`📊 Sheet ID: ${SHEET_ID}`);
    console.log(`📋 Sheet Name: ${SHEET_NAME}`);
    console.log(`📏 Range: ${SHEET_NAME}!A:H`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

/**
 * Validate existing sheet structure
 */
async function validateSheetStructure(sheets) {
  try {
    console.log('🔍 Validating sheet structure...');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:H1`
    });
    
    const headers = response.data.values?.[0] || [];
    
    if (headers.length !== COLUMNS.length) {
      console.log('❌ Column count mismatch');
      console.log(`Expected: ${COLUMNS.length}, Found: ${headers.length}`);
      return false;
    }
    
    for (let i = 0; i < COLUMNS.length; i++) {
      if (headers[i] !== COLUMNS[i]) {
        console.log(`❌ Column ${i + 1} mismatch:`);
        console.log(`Expected: ${COLUMNS[i]}, Found: ${headers[i]}`);
        return false;
      }
    }
    
    console.log('✅ Sheet structure is valid');
    return true;
    
  } catch (error) {
    console.error('❌ Error validating sheet structure:', error.message);
    return false;
  }
}

// Run the setup
if (require.main === module) {
  setupCallerDirectory();
}

module.exports = {
  setupCallerDirectory,
  validateSheetStructure,
  COLUMNS,
  SAMPLE_DATA
}; 