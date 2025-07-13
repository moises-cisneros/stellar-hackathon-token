const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const StellarSdk = require("@stellar/stellar-sdk");

// Cargar variables de entorno solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

setGlobalOptions({ maxInstances: 10 });

// Configuración flexible: .env en desarrollo, Firebase Config en producción
const getStellarConfig = () => {
    if (process.env.NODE_ENV === 'production') {
        // En producción, usar Firebase Config
        const functions = require("firebase-functions");
        return {
            emisorSecret: functions.config().stellar?.emisor_secret,
            distributorSecret: functions.config().stellar?.distribuidor_secret,
            emisorPublic: functions.config().stellar?.emisor_public,
            horizonUrl: functions.config().stellar?.horizon_url || "https://horizon.stellar.org"
        };
    } else {
        // En desarrollo, usar variables de entorno
        return {
            emisorSecret: process.env.STELLAR_EMISOR_SECRET,
            distributorSecret: process.env.STELLAR_DISTRIBUIDOR_SECRET,
            emisorPublic: process.env.STELLAR_EMISOR_PUBLIC,
            horizonUrl: process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org"
        };
    }
};

const config = getStellarConfig();
const server = new StellarSdk.Horizon.Server(config.horizonUrl);

/**
 * onRamp - Simula depósito fiat y emite BOB
 */
exports.onRamp = onCall(async (request) => {
    try {
        const { toAccountId, amount } = request.data;

        if (!toAccountId || !amount) {
            throw new HttpsError("invalid-argument", "toAccountId y amount requeridos");
        }

        if (!config.emisorSecret || !config.distributorSecret) {
            throw new HttpsError("internal", "Configuración Stellar no encontrada");
        }

        const issuerKeypair = StellarSdk.Keypair.fromSecret(config.emisorSecret);
        const distributorKeypair = StellarSdk.Keypair.fromSecret(config.distributorSecret);
        const tokenBOB = new StellarSdk.Asset("BOB", issuerKeypair.publicKey());

        // Verificar cuenta destino
        await server.loadAccount(toAccountId);

        // Verificar trustline
        const destinationAccount = await server.loadAccount(toAccountId);
        const hasTrustline = destinationAccount.balances.some(balance =>
            balance.asset_code === "BOB" && balance.asset_issuer === issuerKeypair.publicKey()
        );

        if (!hasTrustline) {
            throw new HttpsError("failed-precondition", "Cuenta destino necesita trustline para BOB");
        }

        // Enviar tokens desde distribuidor
        const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
        const transaction = new StellarSdk.TransactionBuilder(distributorAccount, {
            fee: await server.fetchBaseFee(),
            networkPassphrase: config.horizonUrl.includes("testnet") ? 
                StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC,
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: toAccountId,
            asset: tokenBOB,
            amount: amount.toString(),
        }))
        .setTimeout(30)
        .build();

        transaction.sign(distributorKeypair);
        const result = await server.submitTransaction(transaction);

        return {
            success: true,
            message: `${amount} BOB enviados a ${toAccountId}`,
            transactionId: result.hash,
            explorerUrl: `https://stellar.expert/explorer/${config.horizonUrl.includes("testnet") ? "testnet" : "public"}/tx/${result.hash}`
        };

    } catch (error) {
        console.error("Error en onRamp:", error);
        throw new HttpsError("internal", `Error: ${error.message}`);
    }
});

/**
 * sendPayment - Envía BOB entre cuentas
 */
exports.sendPayment = onCall(async (request) => {
    try {
        const { toAccountId, amount } = request.data;

        if (!toAccountId || !amount) {
            throw new HttpsError("invalid-argument", "toAccountId y amount requeridos");
        }

        if (!config.distributorSecret || !config.emisorPublic) {
            throw new HttpsError("internal", "Configuración Stellar no encontrada");
        }

        const distributorKeypair = StellarSdk.Keypair.fromSecret(config.distributorSecret);
        const tokenBOB = new StellarSdk.Asset("BOB", config.emisorPublic);

        await server.loadAccount(toAccountId);

        const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
        const transaction = new StellarSdk.TransactionBuilder(distributorAccount, {
            fee: await server.fetchBaseFee(),
            networkPassphrase: config.horizonUrl.includes("testnet") ? 
                StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC,
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: toAccountId,
            asset: tokenBOB,
            amount: amount.toString(),
        }))
        .setTimeout(30)
        .build();

        transaction.sign(distributorKeypair);
        const result = await server.submitTransaction(transaction);

        return {
            success: true,
            message: `${amount} BOB enviados a ${toAccountId}`,
            transactionId: result.hash,
            explorerUrl: `https://stellar.expert/explorer/${config.horizonUrl.includes("testnet") ? "testnet" : "public"}/tx/${result.hash}`
        };

    } catch (error) {
        console.error("Error en sendPayment:", error);
        throw new HttpsError("internal", `Error: ${error.message}`);
    }
});

/**
 * getBalance - Consulta balance de BOB
 */
exports.getBalance = onCall(async (request) => {
    try {
        const { accountId } = request.data;

        if (!accountId) {
            throw new HttpsError("invalid-argument", "accountId requerido");
        }

        if (!config.emisorPublic) {
            throw new HttpsError("internal", "Configuración Stellar no encontrada");
        }

        const account = await server.loadAccount(accountId);
        const bobBalance = account.balances.find(balance =>
            balance.asset_code === "BOB" && balance.asset_issuer === config.emisorPublic
        );

        return {
            success: true,
            accountId: accountId,
            bobBalance: bobBalance ? bobBalance.balance : "0",
            xlmBalance: account.balances.find(b => b.asset_type === "native")?.balance || "0"
        };

    } catch (error) {
        console.error("Error obteniendo balance:", error);
        throw new HttpsError("internal", `Error: ${error.message}`);
    }
});
