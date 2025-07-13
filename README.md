# 🌟 WaruPay Backend - BOB Token

> **Implementación completa de un stablecoin (BOB) en Stellar con Firebase Cloud Functions**

Este proyecto implementa un **ecosistema completo** para el token BOB, incluyendo emisión, distribución, y Cloud Functions para integración con aplicaciones móviles/web. Preparado para integrarse con **contratos Soroban AMM**.

[![Stellar](https://img.shields.io/badge/Stellar-Network-blue)](https://stellar.org)
[![Firebase](https://img.shields.io/badge/Firebase-Functions-orange)](https://firebase.google.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)

---

## 📋 Índice

- [Características](#-características)
- [Arquitectura](#️-arquitectura)
- [Configuración Inicial](#⚡-configuración-inicial)
- [Scripts de Setup](#-scripts-de-setup)
- [Cloud Functions](#-cloud-functions)
- [Desarrollo Local](#-desarrollo-local)
- [Despliegue](#-despliegue)
- [Seguridad](#-seguridad)

---

## ✨ Características

- 🪙 **Token BOB Stablecoin** en Stellar Testnet
- 🔥 **Firebase Cloud Functions** para onRamp/sendPayment/getBalance
- 🛡️ **Gestión segura** de claves con variables de entorno
- 🔧 **Scripts automatizados** para setup y testing
- 📱 **API REST** lista para app móvil WaruPay
- 🎯 **Preparado para AMM Soroban** (contratos inteligentes)
- 🧪 **Testing completo** con reintentos y validaciones

---

## 🏗️ Arquitectura

## Estructura del Proyecto

```
warupay-backend/
├── 📁 .vscode/                   # Configuración de depuración de VSCode
│   └── launch.json               # Para ejecutar y depurar scripts
├── 📁 functions/                 # Firebase Cloud Functions
│   ├── index.js                  # Funciones principales (onRamp, sendPayment, getBalance)
│   ├── package.json              # Dependencias de las funciones
│   ├── .env.example              # Template de variables de entorno
│   └── eslint.config.js          # Configuración de ESLint
├── 📁 scripts/                   # Scripts de configuración inicial
│   ├── 1_crearCuentas.js         # Generar claves de cuentas
│   ├── 2_emitirToken.js          # Emitir tokens BOB iniciales
│   └── 3_enviarAUsuario.js       # Probar transferencias
├── .firebaserc                   # Configuración del proyecto Firebase
├── firebase.json                 # Configuración de Firebase
├── .env.example                  # Template de variables de entorno
├── .gitignore                    # Protección de archivos sensibles
├── package.json                  # Dependencias principales
└── README.md                     # Esta documentación
```

### Flujo de Datos

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WaruPay App   │    │ Firebase        │    │ Stellar Network │
│ (React Native)  │◄──►│ Cloud Functions │◄──►│ (BOB Token)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│ Mobile Wallets  │◄─────────────┘
                        │ (Lobstr/Albedo) │
                        └─────────────────┘
```

---

## Configuración Inicial

### ⚡ Setup Rápido

```bash
# 1. Clonar e instalar dependencias
npm install
cd functions && npm install && cd ..

# 2. Generar cuentas Stellar
npm run create-accounts

# 3. Configurar variables de entorno (usar output del paso 2)
cp .env.example .env
# Editar .env con las claves generadas

# 4. Financiar cuentas en testnet
# Usar Friendbot: https://friendbot.stellar.org

# 5. Emitir tokens BOB
npm run emit-tokens

# 6. Probar sistema completo
npm run send-to-user
```

### 🔧 Configuración Detallada

#### 1. Instalación de Dependencias

```bash
npm install
cd functions
npm install
cd ..
```

#### 2. Configuración de Firebase

**Instalar Firebase CLI:**

```bash
npm install -g firebase-tools
```

**Iniciar sesión:**

```bash
firebase login
```

**Crear proyecto en [Firebase Console](https://console.firebase.google.com/)**

**Actualizar `.firebaserc` con tu project ID:**

```json
{
  "projects": {
    "default": "tu-project-id"
  }
}
```

#### 3. Generar Claves de Stellar

```bash
npm run create-accounts
```

**⚠️ Importante:** Copia la salida del comando anterior y pégala en el archivo `.env` reemplazando las claves de ejemplo.

#### 4. Configurar Variables de Entorno

Crea el archivo `.env` basado en `.env.example`:

```env
# Claves de Stellar para el token BOB
STELLAR_EMISOR_PUBLIC=TU_CLAVE_PUBLICA_EMISOR
STELLAR_EMISOR_SECRET=TU_CLAVE_SECRETA_EMISOR
STELLAR_DISTRIBUIDOR_PUBLIC=TU_CLAVE_PUBLICA_DISTRIBUIDOR
STELLAR_DISTRIBUIDOR_SECRET=TU_CLAVE_SECRETA_DISTRIBUIDOR
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

#### 5. Financiar Cuentas en Testnet

**Opción 1: Friendbot (automático en scripts)**

- Los scripts financian automáticamente las cuentas

**Opción 2: Manual**

1. Ve a [Friendbot](https://friendbot.stellar.org)
2. Financia tanto la cuenta emisora como distribuidora

#### 6. Emitir Tokens BOB Iniciales

```bash
npm run emit-tokens
```

Este comando:

- ✅ Crea trustline del distribuidor hacia el emisor
- ✅ Emite 1,000,000 BOB tokens al distribuidor
- ✅ Muestra enlaces al explorer para verificar

---

## 🔧 Scripts de Setup

| Script | Comando | Descripción |
|--------|---------|-------------|
| **Crear Cuentas** | `npm run create-accounts` | Genera keypairs Stellar y muestra formato .env |
| **Emitir Tokens** | `npm run emit-tokens` | Emite 1M BOB tokens al distribuidor |
| **Enviar a Usuario** | `npm run send-to-user` | Prueba completa: crea usuario + envía 500 BOB |
| **Emulador** | `npm run serve` | Inicia Firebase Functions localmente |
| **Deploy** | `npm run deploy` | Deploya funciones a producción |

### 📝 Ejemplo de Uso

```bash
# 1. Setup inicial
npm run create-accounts
# Output: Claves para .env

# 2. Configurar .env con las claves generadas

# 3. Emitir tokens
npm run emit-tokens
# Output: ✅ 1,000,000 BOB emitidos

# 4. Probar transferencia
npm run send-to-user
# Output: ✅ Usuario creado, ✅ 500 BOB enviados
```

---

## ☁️ Cloud Functions

### 🎯 Endpoints Disponibles

| Función | Endpoint | Descripción | Parámetros |
|---------|----------|-------------|------------|
| **onRamp** | `POST /onRamp` | Convierte fiat → BOB | `toAccountId`, `amount` |
| **sendPayment** | `POST /sendPayment` | Transfiere BOB entre usuarios | `toAccountId`, `amount` |
| **getBalance** | `POST /getBalance` | Consulta balance BOB/XLM | `accountId` |

### 🧪 Testing de Cloud Functions

#### onRamp - Depositar fiat → BOB

```http
POST http://localhost:5001/tu-project-id/us-central1/onRamp
Content-Type: application/json

{
  "data": {
    "toAccountId": "GCUENTADEUSUARIO...",
    "amount": "100"
  }
}
```

**Respuesta exitosa:**

```json
{
  "result": {
    "success": true,
    "transactionHash": "abc123...",
    "amount": "100",
    "toAccount": "GCUENTA..."
  }
}
```

#### sendPayment - Enviar BOB entre usuarios

```http
POST http://localhost:5001/tu-project-id/us-central1/sendPayment
Content-Type: application/json

{
  "data": {
    "toAccountId": "GCUENTADESTINO...",
    "amount": "50"
  }
}
```

#### getBalance - Consultar balance

```http
POST http://localhost:5001/tu-project-id/us-central1/getBalance
Content-Type: application/json

{
  "data": {
    "accountId": "GCUENTACONSULTAR..."
  }
}
```

**Respuesta exitosa:**

```json
{
  "result": {
    "success": true,
    "accountId": "GCUENTA...",
    "bobBalance": "150.0000000",
    "xlmBalance": "9995.9999900"
  }
}
```

---

## 🛠️ Desarrollo Local

### Ejecutar Emulador Firebase

```bash
npm run serve
```

**URLs disponibles:**

- 🔥 Functions: `http://localhost:5001/tu-project-id/us-central1/`
- 📊 Firebase UI: `http://localhost:4000`

### Depurar Scripts

1. **Abrir VSCode**
2. **Ir a Run and Debug** (Ctrl+Shift+D)
3. **Seleccionar script** (crear cuentas, emitir, enviar)
4. **Presionar F5** para ejecutar con breakpoints

### Herramientas de Testing

**Thunder Client / Postman:**

- Probar Cloud Functions localmente
- Verificar respuestas y errores

**Stellar Tools:**

- 🔍 [Stellar Expert](https://stellar.expert/explorer/testnet) - Explorer de transacciones
- 🧪 [Stellar Laboratory](https://laboratory.stellar.org) - Testing manual
- 🤖 [Friendbot](https://friendbot.stellar.org) - Financiar cuentas testnet

---

## 🚀 Despliegue

### Deploy a Producción

```bash
# Deploy solo las funciones
firebase deploy --only functions

# Deploy completo (functions + hosting si está configurado)
firebase deploy
```

### Variables de Entorno en Producción

**Configurar secretos en Firebase:**

```bash
# Configurar variables una por una
firebase functions:config:set stellar.emisor_public="GXXX..."
firebase functions:config:set stellar.emisor_secret="SXXX..."
firebase functions:config:set stellar.distribuidor_public="GYYY..."
firebase functions:config:set stellar.distribuidor_secret="SYYY..."

# Deploy para aplicar cambios
firebase deploy --only functions
```

**Verificar configuración:**

```bash
firebase functions:config:get
```

---

## 🛡️ Seguridad

### ⚠️ Datos Sensibles

| Archivo | Estado | Descripción |
|---------|---------|-------------|
| `.env` | 🚫 **NO COMMIT** | Claves privadas locales |
| `.env.example` | ✅ **Seguro** | Template sin datos reales |
| `functions/.env` | 🚫 **NO COMMIT** | Variables del emulador |
| `functions/.env.example` | ✅ **Seguro** | Template de funciones |

### 🔒 Mejores Prácticas

- ✅ **Variables de entorno** para todas las claves
- ✅ **Firebase Config** en producción
- ✅ **Gitignore** protege archivos sensibles
- ✅ **Cuentas separadas** (emisor vs distribuidor)
- ⚠️ **Rotación de claves** periódica recomendada

### 🔑 Gestión de Claves

```bash
# Desarrollo (local)
.env → process.env

# Producción (Firebase)
Firebase Config → functions.config()

# Testing (temporal)
Friendbot → Cuentas financiadas automáticamente
```

## 🎯 API del Token BOB

### Identificación del Token

**Asset Code:** `BOB`  
**Asset Issuer:** `<CLAVE_PUBLICA_EMISOR>`  
**Full Asset ID:** `BOB:<CLAVE_PUBLICA_EMISOR>`

### Para Integración Soroban

```rust
// Usar en contratos Soroban AMM
let bob_asset = Address::from_string("BOB:<EMISOR_PUBLIC_KEY>");
```

---

## 🔄 Próximos Pasos

### Fase 1: Core Functionality ✅

- [x] Token BOB implementado
- [x] Cloud Functions operativas  
- [x] Scripts de setup automatizados
- [x] Testing completo

### Fase 2: WaruPay Mobile App 🚧

- [ ] Aplicación React Native (WaruPay)
- [ ] Conexión con wallets móviles Stellar
- [ ] UI nativa para todas las operaciones
- [ ] Testing en simuladores y dispositivos
- [ ] Autenticación biométrica

### Fase 3: Production Ready 📋

- [ ] Autenticación Firebase Auth
- [ ] KYC/compliance integrado
- [ ] Proveedores de pago reales
- [ ] Monitoreo y analytics
- [ ] Webhooks para eventos

### Fase 4: Soroban AMM 🔮

- [ ] Deploy contrato AMM
- [ ] Integración BOB/USDC pool
- [ ] Frontend para swaps
- [ ] Liquidez inicial

---

## 📊 Estado del Proyecto

```bash
🟢 Backend Stellar: COMPLETO
🟢 Cloud Functions: COMPLETO  
🟢 Scripts Setup: COMPLETO
🟡 WaruPay Mobile: EN DESARROLLO
🟡 Soroban AMM: PENDIENTE
🔴 Producción: PENDIENTE
```

---

## 📞 Support & Resources

**Documentación:**

- [Stellar Docs](https://developers.stellar.org)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Soroban Docs](https://soroban.stellar.org)

**Tools:**

- [Stellar Expert](https://stellar.expert) - Blockchain explorer
- [Stellar Laboratory](https://laboratory.stellar.org) - Development tools
- [Freighter Wallet](https://freighter.app) - Browser wallet

**Community:**

- [Stellar Discord](https://discord.gg/stellar)
- [Stellar Stack Overflow](https://stackoverflow.com/questions/tagged/stellar)

---

*🌟 **WaruPay Backend** - Powered by Stellar Network & Firebase*
