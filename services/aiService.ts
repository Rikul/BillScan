import { IAIService, AIServiceType } from "../types";

/**
 * Factory function to get the appropriate AI service based on configuration
 * Service type is determined by the AI_SERVICE environment variable
 * Defaults to 'gemini' for backward compatibility
 * 
 * Uses dynamic imports to avoid bundling unused services
 */
export const getAIService = async (): Promise<IAIService> => {
  const serviceType = (process.env.AI_SERVICE || 'gemini') as AIServiceType;
  
  switch (serviceType) {
    case 'gemini':
      const { geminiService } = await import('./geminiService');
      return geminiService;
    case 'ollama':
      const { ollamaService } = await import('./ollamaService');
      return ollamaService;
    case 'openai':
      const { openaiService } = await import('./openaiService');
      return openaiService;
    case 'claude':
      const { claudeService } = await import('./claudeService');
      return claudeService;
    default:
      console.warn(`Unknown AI service type: ${serviceType}. Falling back to gemini.`);
      const { geminiService: defaultService } = await import('./geminiService');
      return defaultService;
  }
};

/**
 * Convenience function to extract bill data using the configured AI service
 */
export const extractBillData = async (base64Image: string) => {
  const service = await getAIService();
  return service.extractBillData(base64Image);
};
