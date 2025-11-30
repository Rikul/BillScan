/**
 * Type definitions for BillScan backend services
 * JavaScript equivalent of frontend TypeScript types
 */

/**
 * @typedef {Object} LineItem
 * @property {string} description
 * @property {number} quantity
 * @property {number} price
 */

/**
 * @typedef {Object} BillData
 * @property {string} storeName
 * @property {string} date - ISO Date string YYYY-MM-DD
 * @property {number} subtotal
 * @property {number} tax
 * @property {number} total
 * @property {LineItem[]} lineItems
 * @property {string} [currency]
 */

/**
 * @typedef {Object} IAIService
 * @property {function(string): Promise<BillData>} extractBillData
 */

/**
 * @typedef {'gemini' | 'ollama' | 'openai' | 'claude'} AIServiceType
 */

module.exports = {};
