const crypto = require("crypto");

function encrypt(text) {
  const SECRET_KEY = process.env.SECRET_KEY;
  const IV = process.env.IV;
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'hex'), Buffer.from(IV, 'hex'));
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(text) {
  const SECRET_KEY = process.env.SECRET_KEY;
  const IV = process.env.IV;
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'hex'), Buffer.from(IV, 'hex'));
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };
