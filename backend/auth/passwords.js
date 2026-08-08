const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [salt, hashHex] = stored.split(':');
  const hashBuffer = Buffer.from(hashHex, 'hex');
  const candidateBuffer = await scrypt(password, salt, KEY_LENGTH);
  return crypto.timingSafeEqual(hashBuffer, candidateBuffer);
}

module.exports = { hashPassword, verifyPassword };
