// Electron Builder afterSign hook
// This runs after the DMG is created to sign it and remove quarantine

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const glob = require("glob");

exports.default = async function (context) {
  const { artifactPaths, packager } = context;

  // Find the DMG file
  const dmgPath = artifactPaths.find((p) => p.endsWith(".dmg"));

  if (dmgPath && fs.existsSync(dmgPath)) {
    console.log("🔐 Signing DMG to reduce Gatekeeper warnings...");
    try {
      // Ad-hoc sign the DMG itself
      execSync(`codesign --force --sign - "${dmgPath}"`, {
        stdio: "inherit",
      });
      console.log("✅ DMG signed with ad-hoc signature");
    } catch (error) {
      console.warn("⚠️  DMG signing failed (this is OK)");
    }
  }
};
