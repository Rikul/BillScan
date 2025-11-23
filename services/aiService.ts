import { BillData } from "../types";
import { extractBillData as extractWithGemini } from "./geminiService";
import { extractBillData as extractWithOllama } from "./ollamaService";
import { resizeImage } from "../utils";

// Determine which AI service to use based on environment
const AI_SERVICE = process.env.AI_SERVICE || "gemini";

/**
 * Extract bill data using the configured AI service
 * @param fileOrBase64 - Either a File object or base64 string
 * @returns Promise<BillData>
 */
export const extractBillData = async (fileOrBase64: File | string): Promise<BillData> => {
  if (AI_SERVICE === "ollama") {
    // For Ollama, send the original file without modifications
    let base64Image: string;
    
    if (fileOrBase64 instanceof File) {
      // Convert file to base64 without resizing
      base64Image = await fileToBase64(fileOrBase64);
    } else {
      base64Image = fileOrBase64;
    }
    
    return extractWithOllama(base64Image);
  } else {
    // For Gemini, resize the image first (existing behavior)
    let resizedImage: string;
    
    if (fileOrBase64 instanceof File) {
      resizedImage = await resizeImage(fileOrBase64);
    } else {
      resizedImage = fileOrBase64;
    }
    
    return extractWithGemini(resizedImage);
  }
};

/**
 * Convert a file to base64 without any modifications
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
