import StellarSdk from '@stellar/stellar-sdk';

const emisorKeypair = StellarSdk.Keypair.random();
console.log("✅ CUENTA EMISORA (ISSUER)");
console.log("Pública:", emisorKeypair.publicKey());
console.log("Secreta:", emisorKeypair.secret());
console.log("---");

const distribuidorKeypair = StellarSdk.Keypair.random();
console.log("✅ CUENTA DISTRIBUIDORA (DISTRIBUTOR)");
console.log("Pública:", distribuidorKeypair.publicKey());
console.log("Secreta:", distribuidorKeypair.secret());
console.log("---");

console.log("\n🚨 Guarda estas claves de forma segura");

console.log("\n📋 Para .env (scripts):");
console.log(`STELLAR_EMISOR_PUBLIC=${emisorKeypair.publicKey()}`);
console.log(`STELLAR_EMISOR_SECRET=${emisorKeypair.secret()}`);
console.log(`STELLAR_DISTRIBUIDOR_PUBLIC=${distribuidorKeypair.publicKey()}`);
console.log(`STELLAR_DISTRIBUIDOR_SECRET=${distribuidorKeypair.secret()}`);
console.log("STELLAR_NETWORK=testnet");
console.log("STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org");

console.log("\n📋 Para functions/.env:");
console.log(`STELLAR_EMISOR_PUBLIC=${emisorKeypair.publicKey()}`);
console.log(`STELLAR_EMISOR_SECRET=${emisorKeypair.secret()}`);
console.log(`STELLAR_DISTRIBUIDOR_PUBLIC=${distribuidorKeypair.publicKey()}`);
console.log(`STELLAR_DISTRIBUIDOR_SECRET=${distribuidorKeypair.secret()}`);
console.log("STELLAR_NETWORK=testnet");
console.log("STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org");
