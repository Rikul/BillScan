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
    case 'gemini': {
      const { geminiService: service } = await import('./geminiService');
      return service;
    }
    case 'ollama': {
      const { ollamaService: service } = await import('./ollamaService');
      return service;
    }
    case 'openai': {
      const { openaiService: service } = await import('./openaiService');
      return service;
    }
    case 'claude': {
      const { claudeService: service } = await import('./claudeService');
      return service;
    }
    default:
      // Invalid service type - throw error to fail fast
      throw new Error(
        `Invalid AI_SERVICE value: "${serviceType}". Valid options are: gemini, ollama, openai, claude`
      );
  }
};

/**
 * Convenience function to extract bill data using the configured AI service
 */
export const extractBillData = async (base64Image: string) => {
  const service = await getAIService();
  return service.extractBillData(base64Image);
};
