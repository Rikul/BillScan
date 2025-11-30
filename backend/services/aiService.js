/**
 * Factory function to get the appropriate AI service based on configuration
 * Service type is determined by the AI_SERVICE environment variable
 * Defaults to 'gemini' for backward compatibility
 * 
 * Uses dynamic imports to avoid loading unused services
 * @returns {Promise<import('./types').IAIService>}
 */
const getAIService = async () => {
  const serviceType = process.env.AI_SERVICE || 'gemini';
  
  switch (serviceType) {
    case 'gemini': {
      const { geminiService } = require('./geminiService');
      return geminiService;
    }
    case 'ollama': {
      const { ollamaService } = require('./ollamaService');
      return ollamaService;
    }
    case 'openai': {
      const { openaiService } = require('./openaiService');
      return openaiService;
    }
    case 'claude': {
      const { claudeService } = require('./claudeService');
      return claudeService;
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
 * @param {string} base64Image - Base64 encoded image data
 * @returns {Promise<import('./types').BillData>}
 */
const extractBillData = async (base64Image) => {
  const service = await getAIService();
  return service.extractBillData(base64Image);
};

module.exports = { getAIService, extractBillData };
