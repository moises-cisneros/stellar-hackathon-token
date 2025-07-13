import StellarSdk from '@stellar/stellar-sdk';
import 'dotenv/config';

const server = new StellarSdk.Horizon.Server(process.env.STELLAR_HORIZON_URL);

const emisorKeypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_EMISOR_SECRET);
const distribuidorKeypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_DISTRIBUIDOR_SECRET);
const tokenBOB = new StellarSdk.Asset('BOB', emisorKeypair.publicKey());

console.log("Iniciando emisión del token BOB...");

try {
    // 1. Crear trustline del distribuidor hacia el emisor
    console.log("🔄 Creando trustline...");
    const cuentaDistribuidor = await server.loadAccount(distribuidorKeypair.publicKey());
    const txConfianza = new StellarSdk.TransactionBuilder(cuentaDistribuidor, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
    .addOperation(StellarSdk.Operation.changeTrust({ asset: tokenBOB }))
    .setTimeout(30)
    .build();

    txConfianza.sign(distribuidorKeypair);
    await server.submitTransaction(txConfianza);
    console.log("✅ Trustline creada");
    
    // 2. Emitir 1,000,000 BOB al distribuidor
    console.log("🔄 Emitiendo 1,000,000 BOB...");
    const cuentaEmisor = await server.loadAccount(emisorKeypair.publicKey());
    const txEmision = new StellarSdk.TransactionBuilder(cuentaEmisor, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: distribuidorKeypair.publicKey(),
        asset: tokenBOB,
        amount: '1000000',
    }))
    .setTimeout(30)
    .build();

    txEmision.sign(emisorKeypair);
    const resultado = await server.submitTransaction(txEmision);
    console.log("✅ Tokens BOB emitidos exitosamente");
    console.log(`🔗 Explorer: https://stellar.expert/explorer/testnet/account/${distribuidorKeypair.publicKey()}`);

} catch (e) {
    console.error("❌ Error:", e.response?.data?.extras?.result_codes || e);
}
