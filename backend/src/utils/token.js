/**
 * Token Utility Functions
 * Generates secure random tokens for email verification and password resets.
 */

const crypto = require('crypto');

/**
 * Generates a secure hexadecimal token (used for password reset links)
 * @returns {string} - 64-character hex string
 */
const generateHexToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generates a numeric token/OTP (used for email verification codes)
 * @param {number} length - Length of the numeric token (default 6)
 * @returns {string} - String of random digits
 */
const generateNumericToken = (length = 6) => {
  let token = '';
  for (let i = 0; i < length; i++) {
    token += Math.floor(Math.random() * 10).toString();
  }
  return token;
};

module.exports = { generateHexToken, generateNumericToken };
