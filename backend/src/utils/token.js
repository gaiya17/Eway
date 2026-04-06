const crypto = require('crypto');

const generateHexToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateNumericToken = (length = 6) => {
  let token = '';
  for (let i = 0; i < length; i++) {
    token += Math.floor(Math.random() * 10).toString();
  }
  return token;
};

module.exports = { generateHexToken, generateNumericToken };
