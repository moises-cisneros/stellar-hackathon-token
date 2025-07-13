#!/usr/bin/env node

/**
 * Script de instalación para el proyecto WaruPay Backend
 * Este script automatiza la configuración inicial del proyecto
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

console.log('🚀 Configurando WaruPay Backend...\n');

try {
    // 1. Instalar dependencias principales
    console.log('📦 Instalando dependencias principales...');
    execSync('npm install', { stdio: 'inherit' });

    // 2. Instalar dependencias de Firebase Functions
    console.log('\n📦 Instalando dependencias de Firebase Functions...');
    process.chdir('./functions');
    execSync('npm install', { stdio: 'inherit' });
    process.chdir('..');

    // 3. Verificar si Firebase CLI está instalado
    console.log('\n🔥 Verificando Firebase CLI...');
    try {
        execSync('firebase --version', { stdio: 'pipe' });
        console.log('✅ Firebase CLI ya está instalado');
    } catch (error) {
        console.log('❌ Firebase CLI no está instalado');
        console.log('💡 Ejecuta: npm install -g firebase-tools');
    }

    // 4. Crear directorio público si no existe
    if (!existsSync('./public')) {
        mkdirSync('./public');
        writeFileSync('./public/index.html', `<!DOCTYPE html>
<html>
<head>
    <title>WaruPay Backend</title>
</head>
<body>
    <h1>WaruPay Backend</h1>
    <p>¡El backend está funcionando correctamente!</p>
</body>
</html>`);
        console.log('✅ Directorio público creado');
    }

    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ejecuta: node scripts/1_crearCuentas.js');
    console.log('2. Actualiza las claves en keys.json');
    console.log('3. Financia las cuentas en Stellar testnet');
    console.log('4. Ejecuta: firebase emulators:start');
    console.log('\n📖 Lee el README.md para más detalles');

} catch (error) {
    console.error('❌ Error durante la instalación:', error.message);
    process.exit(1);
}
