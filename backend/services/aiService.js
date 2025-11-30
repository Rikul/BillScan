/**
 * Factory function to get the appropriate AI service based on configuration
 * Service type is determined by the AI_SERVICE environment variable
 * Defaults to 'gemini' for backward compatibility
 *
 * Uses dynamic imports to avoid loading unused services
 * @returns {Promise<import('./types').IAIService>}
 */
const getAIService = async () => {
    const serviceType = process.env.AI_SERVICE || "gemini";

    console.log(`Configured AI service: ${serviceType}`);
    switch (serviceType) {
        case "gemini": {
            const { geminiService } = await import("./geminiService.js");
            return geminiService;
        }
        case "ollama": {
            const { ollamaService } = await import("./ollamaService.js");
            return ollamaService;
        }
        case "openai": {
            const { openaiService } = await import("./openaiService.js");
            return openaiService;
        }
        case "claude": {
            const { claudeService } = await import("./claudeService.js");
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
    console.log(`Using AI service: ${service.name}`);
    return service.extractBillData(base64Image);
};

module.exports = { getAIService, extractBillData };
