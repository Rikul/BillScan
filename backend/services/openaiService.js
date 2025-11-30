const OpenAI = require("openai").default;

// Only initialize if key is present
const apiKey = process.env.OPENAI_API_KEY;

let openai = null;

const getClient = () => {
  if (!openai) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
};

/**
 * Extract bill data from a base64-encoded image using OpenAI
 * @param {string} base64Image - Base64 encoded image data
 * @returns {Promise<import('./types').BillData>}
 */
const extractBillData = async (base64Image) => {
  // Remove data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `Extract the following information from this receipt image: Store Name, Date (YYYY-MM-DD format), Subtotal, Tax, Total Amount, and a list of line items (description, quantity, price). If a field is not found, estimate reasonably or return 0/null. Normalize prices to numbers.

Return the data in valid JSON format with this exact structure:
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
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (content) {
    try {
      const data = JSON.parse(content);
      
      // Validate required fields
      if (!data.storeName || !data.date || data.subtotal === undefined || 
          data.tax === undefined || data.total === undefined || !data.lineItems) {
        throw new Error("Missing required fields in response");
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to parse bill data: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }
  
  throw new Error("No content in response");
};

// Export service implementation
const openaiService = {
  extractBillData,
};

module.exports = { openaiService, extractBillData };
