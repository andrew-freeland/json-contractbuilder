// OpenAI Function Node: Extract Project Metadata
// Input: $json.SpeechResult
// Output: Structured JSON with extracted fields

const systemPrompt = `You are a construction contract specialist. Extract project metadata from voice messages into structured JSON. Only return valid JSON, no explanations.

Required fields to extract:
- business_name: Company name (string)
- project_type: Type of project (string)
- project_address: Full address (string)
- scope: Project description (string)
- budget: Total cost (string with $)
- payment_terms: Payment structure (string)
- materials_by: "client" or "contractor" (string)
- license_number: GC license if mentioned (string or null)
- start_date: Project start date (string or null)
- end_date: Project end date (string or null)
- preferred_contact_method: "SMS" or "email" (string or null)

Rules:
- If field not mentioned, use null
- Keep original wording for addresses and scope
- Extract dollar amounts as "$X,XXX" format
- Payment terms as "X%/Y%/Z% split" or "monthly" etc.
- Dates as "Month Day" or "Month Year" format`;

const userPrompt = `Extract project metadata from this voice message:

"${$json.SpeechResult}"

Return only valid JSON with the required fields.`;

// Return the prompt for OpenAI node
return {
  systemPrompt,
  userPrompt,
  temperature: 0.1,
  maxTokens: 500
}; 