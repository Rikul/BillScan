const Anthropic = require("@anthropic-ai/sdk").default;

// Only initialize if key is present
const apiKey = process.env.ANTHROPIC_API_KEY;

let anthropic = null;

const getClient = () => {
  if (!anthropic) {
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
};

/**
 * Extract bill data from a base64-encoded image using Claude
 * @param {string} base64Image - Base64 encoded image data
 * @returns {Promise<import('./types').BillData>}
 */
const extractBillData = async (base64Image) => {

    console.log('Extracting bill data using Claude service');
  // Remove data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `Extract the following information from this receipt image: Store Name, Date (YYYY-MM-DD format), Subtotal, Tax, Total Amount, and a list of line items (description, quantity, price). If a field is not found, estimate reasonably or return 0/null. Normalize prices to numbers.

Return ONLY valid JSON with this exact structure (no markdown, no additional text):
{
  "storeName": "string",
  "date": "YYYY-MM-DD",
  "subtotal": number,
  "tax": number,
  "total": number,
  "currency": "string",
  "lineItems": [
    {
      "description": "string",
      "quantity": number,
      "price": number
    }
  ]
}`;

  const client = getClient();
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Data,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type === "text") {
    try {
      const data = JSON.parse(content.text);
      
      // Validate required fields
      /*
      if (!data.storeName || !data.date || data.subtotal === undefined || 
          data.tax === undefined || data.total === undefined || !data.lineItems) {
        throw new Error("Missing required fields in response");
      }*/
      
      return data;
    } catch (error) {
      throw new Error(`Failed to parse bill data: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }
  
  throw new Error("No text content in response");
};

// Export service implementation
const claudeService = {
  extractBillData,
    name: 'Claude'
};

module.exports = { claudeService, extractBillData };
