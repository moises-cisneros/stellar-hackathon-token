import StellarSdk from '@stellar/stellar-sdk';
import 'dotenv/config';

const server = new StellarSdk.Horizon.Server(process.env.STELLAR_HORIZON_URL);

// Función para reintentar operaciones con delay
async function reintentar(operacion, maxIntentos = 3, delay = 2000) {
    for (let intento = 1; intento <= maxIntentos; intento++) {
        try {
            return await operacion();
        } catch (error) {
            console.log(`⚠️ Intento ${intento}/${maxIntentos} falló:`, error.message);
            if (intento === maxIntentos) throw error;
            console.log(`⏳ Esperando ${delay/1000}s antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Usar claves del .env para distribuidor y emisor
const distribuidorKeypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_DISTRIBUIDOR_SECRET);
const tokenBOB = new StellarSdk.Asset('BOB', process.env.STELLAR_EMISOR_PUBLIC);

// Generar nueva cuenta de usuario para prueba
const usuarioKeypair = StellarSdk.Keypair.random();
console.log("👤 Cuenta de usuario generada:");
console.log("Pública:", usuarioKeypair.publicKey());
console.log("Secreta:", usuarioKeypair.secret());

// Financiar automáticamente la cuenta con Friendbot
console.log("� Financiando cuenta con Friendbot...");
try {
    const friendbotResponse = await fetch(`https://friendbot.stellar.org?addr=${usuarioKeypair.publicKey()}`);
    if (friendbotResponse.ok) {
        console.log("✅ Cuenta financiada exitosamente");
    } else {
        console.log("⚠️ Friendbot response:", friendbotResponse.status);
    }
    // Esperar un momento para que la transacción se procese
    await new Promise(resolve => setTimeout(resolve, 3000));
} catch (error) {
    console.log("⚠️ Error con Friendbot:", error.message);
    console.log("💡 Financia manualmente en: https://friendbot.stellar.org");
    console.log("📋 Presiona Enter para continuar...");
    await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
    });
}

console.log("Iniciando transferencia a usuario...");

try {
    // 1. Usuario crea trustline para BOB
    console.log("🔄 Creando trustline del usuario...");
    
    await reintentar(async () => {
        const cuentaUsuario = await server.loadAccount(usuarioKeypair.publicKey());
        const txConfianza = new StellarSdk.TransactionBuilder(cuentaUsuario, { 
            fee: await server.fetchBaseFee(), 
            networkPassphrase: StellarSdk.Networks.TESTNET 
        })
        .addOperation(StellarSdk.Operation.changeTrust({ asset: tokenBOB }))
        .setTimeout(30)
        .build();
        
        txConfianza.sign(usuarioKeypair);
        await server.submitTransaction(txConfianza);
    });
    
    console.log("✅ Trustline creada");

    // 2. Distribuidor envía 500 BOB al usuario
    console.log("🔄 Enviando 500 BOB...");
    
    await reintentar(async () => {
        const cuentaDistribuidor = await server.loadAccount(distribuidorKeypair.publicKey());
        const txEnvio = new StellarSdk.TransactionBuilder(cuentaDistribuidor, { 
            fee: await server.fetchBaseFee(), 
            networkPassphrase: StellarSdk.Networks.TESTNET 
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: usuarioKeypair.publicKey(),
            asset: tokenBOB,
            amount: '500',
        }))
        .setTimeout(30)
        .build();
        
        txEnvio.sign(distribuidorKeypair);
        await server.submitTransaction(txEnvio);
    });
    
    console.log("✅ 500 BOB enviados exitosamente");
    console.log(`🔗 Explorer: https://stellar.expert/explorer/testnet/account/${usuarioKeypair.publicKey()}`);

} catch (e) {
    console.error("❌ Error final:", e.response?.data?.extras?.result_codes || e.message || e);
    console.log("💡 Sugerencias:");
    console.log("- Verifica tu conexión a internet");
    console.log("- Intenta de nuevo en unos minutos");
    console.log("- Asegúrate de que las cuentas estén financiadas");
}
