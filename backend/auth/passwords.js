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

// Hash sintaticamente válido (mesmo formato "salt:hash" em hex de hashPassword, mesmo KEY_LENGTH)
// mas sem senha correspondente nenhuma — usado só pelos bots permanentes (ver seedBotPlayers em
// server.js), que precisam de uma linha em `users` mas nunca devem conseguir logar de verdade. O
// formato exato importa: sem o ":" o login estoura em Buffer.from(undefined,'hex'); um hash de
// tamanho errado faz timingSafeEqual LANÇAR (500 em vez de 401 — um oráculo de "essa conta é bot").
function unusableHash() {
  const salt = crypto.randomBytes(16).toString('hex');
  const fakeHash = crypto.randomBytes(KEY_LENGTH).toString('hex');
  return `${salt}:${fakeHash}`;
}

module.exports = { hashPassword, verifyPassword, unusableHash };
