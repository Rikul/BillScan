let Ollama = null;
let ollamaInstance = null;

const getOllama = async () => {
  if (!ollamaInstance) {
    if (!Ollama) {
      const ollamaModule = await import("ollama");
      Ollama = ollamaModule.Ollama;
    }
    ollamaInstance = new Ollama({ 
      host: process.env.OLLAMA_HOST || "http://localhost:11434"
    });
  }
  return ollamaInstance;
};

/**
 * Extract bill data from a base64-encoded image using Ollama
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

  const ollama = await getOllama();
  const response = await ollama.chat({
    model: process.env.OLLAMA_MODEL || "gemma3",
    messages: [
      {
        role: "user",
        content: prompt,
        images: [base64Data],
      },
    ],
    format: "json",
  });

  if (response.message.content) {
    try {
      const data = JSON.parse(response.message.content);
      
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
  
  throw new Error("No content in response");
};

// Export service implementation
const ollamaService = {
  extractBillData,
};

module.exports = { ollamaService, extractBillData };
