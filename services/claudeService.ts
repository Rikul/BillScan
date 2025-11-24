import Anthropic from "@anthropic-ai/sdk";
import { BillData, IAIService } from "../types";

// Only initialize if key is present
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

const anthropic = new Anthropic({ apiKey });

const extractBillData = async (base64Image: string): Promise<BillData> => {
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

  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
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
      const data = JSON.parse(content.text) as BillData;
      
      // Validate required fields
      if (!data.storeName || data.total === undefined || !data.lineItems) {
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
export const claudeService: IAIService = {
  extractBillData,
};

// For backward compatibility
export { extractBillData };
