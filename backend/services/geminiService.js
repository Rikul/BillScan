const { GoogleGenAI, Type } = require("@google/genai");

// Only initialize if key is present to avoid crash on load
const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;

const getClient = () => {
  if (!genAI) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

/**
 * Extract bill data from a base64-encoded image using Gemini
 * @param {string} base64Image - Base64 encoded image data
 * @returns {Promise<import('./types').BillData>}
 */
const extractBillData = async (base64Image) => {
  // Remove data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const client = getClient();
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        },
        {
          text: "Extract the following information from this receipt image: Store Name, Date (YYYY-MM-DD format), Subtotal, Tax, Total Amount, and a list of line items (description, quantity, price). If a field is not found, estimate reasonably or return 0/null. Normalize prices to numbers."
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          storeName: { type: Type.STRING, description: "Name of the merchant or store" },
          date: { type: Type.STRING, description: "Date of purchase in YYYY-MM-DD format" },
          subtotal: { type: Type.NUMBER, description: "Subtotal amount before tax" },
          tax: { type: Type.NUMBER, description: "Tax amount" },
          total: { type: Type.NUMBER, description: "Final total amount paid" },
          currency: { type: Type.STRING, description: "Currency code e.g. USD, EUR" },
          lineItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                price: { type: Type.NUMBER },
              },
              required: ["description", "price"],
            },
          },
        },
        required: ["storeName", "total", "lineItems"],
      },
    },
  });

  if (response.text) {
    try {
      const data = JSON.parse(response.text);
      
      // Validate required fields (consistent with other AI services)
      if (!data.storeName || !data.date || data.subtotal === undefined || 
          data.tax === undefined || data.total === undefined || !data.lineItems) {
        throw new Error("Missing required fields in response");
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to parse bill data: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }
  
  throw new Error("No text content in response");
};

// Export service implementation
const geminiService = {
  extractBillData,
};

module.exports = { geminiService, extractBillData };
