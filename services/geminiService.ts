import { GoogleGenAI, Type } from "@google/genai";
import { BillData } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractBillData = async (base64Image: string): Promise<BillData> => {
  // Remove data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const response = await genAI.models.generateContent({
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
    return JSON.parse(response.text) as BillData;
  }
  
  throw new Error("Failed to parse bill data");
};
