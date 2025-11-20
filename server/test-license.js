// Quick test script for license validation
// Run: node test-license.js

import dotenv from "dotenv";
import { validateLicense, getLicenseInfo } from "./services/licenseService.js";

dotenv.config();

async function testLicenseValidation() {
  console.log("🧪 Testing License Validation...\n");

  // Test 1: Valid license (you need to create this in Supabase first)
  console.log("Test 1: Valid license");
  try {
    const result = await validateLicense("TEST-1234-5678-9012", "test-device-123");
    console.log("Result:", result);
    console.log(result.valid ? "✅ PASS" : "❌ FAIL");
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  console.log("\n");

  // Test 2: Invalid license
  console.log("Test 2: Invalid license");
  try {
    const result = await validateLicense("INVALID-KEY-12345");
    console.log("Result:", result);
    console.log(result.valid === false ? "✅ PASS" : "❌ FAIL");
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }

  console.log("\n");

  // Test 3: Get license info
  console.log("Test 3: Get license info");
  try {
    const info = await getLicenseInfo("TEST-1234-5678-9012");
    console.log("Info:", info);
    console.log(info ? "✅ PASS" : "❌ FAIL");
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

testLicenseValidation();

