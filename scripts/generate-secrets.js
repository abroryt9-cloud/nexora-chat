#!/usr/bin/env node

/**
 * Script для генерации безопасных секретов для .env
 * Использование: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function generateHexSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('\n🔐 Сгенерированные секреты для Nexora:\n');

console.log('JWT_SECRET:');
console.log(generateSecret());
console.log();

console.log('JWT_REFRESH_SECRET:');
console.log(generateSecret());
console.log();

console.log('ENCRYPTION_KEY (32 bytes):');
console.log(generateSecret(32));
console.log();

console.log('📋 Скопируйте эти значения в server/.env\n');
