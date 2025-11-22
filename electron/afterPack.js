// Electron Builder afterPack hook
// This runs after the app is packaged but before DMG is created

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

exports.default = async function (context) {
  const { appOutDir, packager } = context;
  const appPath = path.join(
    appOutDir,
    `${packager.appInfo.productFilename}.app`
  );

  if (fs.existsSync(appPath)) {
    console.log("🔐 Ad-hoc signing app to reduce Gatekeeper warnings...");
    try {
      // Ad-hoc sign (free, no certificate needed)
      execSync(`codesign --force --deep --sign - "${appPath}"`, {
        stdio: "inherit",
      });
      console.log("✅ App signed with ad-hoc signature");
    } catch (error) {
      console.warn("⚠️  Code signing failed (app will still work)");
    }

    try {
      // Remove quarantine attribute
      execSync(`xattr -cr "${appPath}"`, { stdio: "inherit" });
      console.log("✅ Quarantine attribute removed");
    } catch (error) {
      console.warn("⚠️  Could not remove quarantine (this is OK)");
    }
  }
};
