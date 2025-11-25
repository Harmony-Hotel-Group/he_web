import { randomBytes } from "node:crypto";

const secret = randomBytes(32).toString("hex");

console.log("\n==================================================");
console.log("   🔑  GENERATED SECURE CACHE PRIVATE KEY  🔑");
console.log("==================================================\n");
console.log(`CACHE_PRIVATE_KEY=${secret}\n`);
console.log("--------------------------------------------------");
console.log("Copy the line above and add it to your .env file.");
console.log("==================================================\n");
