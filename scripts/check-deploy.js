#!/usr/bin/env node

/**
 * Script для проверки готовности проекта к деплою на Render
 * Использование: node scripts/check-deploy.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message) {
  const status = condition ? '✅' : '❌';
  checks.push({ name, status, message });
  if (condition) passed++;
  else failed++;
}

console.log('\n🔍 Проверка готовности к деплою на Render\n');
console.log('='.repeat(50));

// 1. Проверка package.json
const rootPackagePath = path.join(__dirname, '..', 'package.json');
const serverPackagePath = path.join(__dirname, '..', 'server', 'package.json');
const clientPackagePath = path.join(__dirname, '..', 'client', 'package.json');

if (fs.existsSync(rootPackagePath)) {
  const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
  check('Root package.json', true, 'Существует');
  check('Build script', rootPackage.scripts?.build !== undefined, 'Есть скрипт build');
  check('Engines', rootPackage.engines?.node !== undefined, 'Указана версия Node.js');
} else {
  check('Root package.json', false, 'Файл не найден');
}

// 2. Проверка server/package.json
if (fs.existsSync(serverPackagePath)) {
  const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
  check('Server package.json', true, 'Существует');
  check('Server build script', serverPackage.scripts?.build !== undefined, 'Есть скрипт build');
  check('Server start script', serverPackage.scripts?.start !== undefined, 'Есть скрипт start');
} else {
  check('Server package.json', false, 'Файл не найден');
}

// 3. Проверка client/package.json
if (fs.existsSync(clientPackagePath)) {
  const clientPackage = JSON.parse(fs.readFileSync(clientPackagePath, 'utf8'));
  check('Client package.json', true, 'Существует');
  check('Client build script', clientPackage.scripts?.build !== undefined, 'Есть скрипт build');
} else {
  check('Client package.json', false, 'Файл не найден');
}

// 4. Проверка render.yaml
const renderYamlPath = path.join(__dirname, '..', 'render.yaml');
check('render.yaml', fs.existsSync(renderYamlPath), 'Файл конфигурации Render');

// 5. Проверка .env.example
const envExamplePath = path.join(__dirname, '..', 'server', '.env.example');
check('server/.env.example', fs.existsSync(envExamplePath), 'Шаблон переменных окружения');

// 6. Проверка .gitignore
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  check('.gitignore', true, 'Существует');
  check('node_modules в .gitignore', gitignore.includes('node_modules'), 'Игнорируются node_modules');
  check('.env в .gitignore', gitignore.includes('.env'), 'Игнорируются .env файлы');
} else {
  check('.gitignore', false, 'Файл не найден');
}

// 7. Проверка TypeScript конфигов
const serverTsConfig = path.join(__dirname, '..', 'server', 'tsconfig.json');
const clientTsConfig = path.join(__dirname, '..', 'client', 'tsconfig.json');
check('server/tsconfig.json', fs.existsSync(serverTsConfig), 'TypeScript конфиг сервера');
check('client/tsconfig.json', fs.existsSync(clientTsConfig), 'TypeScript конфиг клиента');

// Вывод результатов
console.log('\n' + '='.repeat(50));
console.log('\nРезультаты:\n');

checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
  if (check.message && check.status === '❌') {
    console.log(`   ⚠️  ${check.message}`);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\nИтого: ${passed} прошло, ${failed} не прошло\n`);

if (failed > 0) {
  console.log('⚠️  Исправьте ошибки перед деплоем!\n');
  process.exit(1);
} else {
  console.log('✅ Все проверки пройдены! Готово к деплою.\n');
  console.log('📝 Следующие шаги:');
  console.log('   1. Настройте MongoDB Atlas');
  console.log('   2. Сгенерируйте секреты: node scripts/generate-secrets.js');
  console.log('   3. Создайте server/.env с нужными переменными');
  console.log('   4. Закоммитьте изменения и отправьте в GitHub');
  console.log('   5. Подключите репозиторий на Render\n');
}
