// Email Service - Sends license keys and download links to customers
import nodemailer from "nodemailer";

let transporter = null;

function getEmailTransporter() {
  if (!transporter) {
    // Resend configuration
    const emailHost = process.env.EMAIL_HOST || "smtp.resend.com";
    const emailPort = parseInt(process.env.EMAIL_PORT || "587");
    const emailUser = process.env.EMAIL_USER || "resend";
    const emailPassword = process.env.EMAIL_PASSWORD; // Resend API key

    if (!emailPassword) {
      console.warn(
        "Email not configured. Set EMAIL_PASSWORD (Resend API key) in .env"
      );
      return null;
    }

    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: false, // Resend uses port 587 with STARTTLS
      auth: {
        user: emailUser,
        pass: emailPassword, // This is the Resend API key
      },
    });
  }
  return transporter;
}

/**
 * Send download link to customer email
 */
export async function sendDownloadLink(email) {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.error("Email transporter not configured");
      return { success: false, error: "Email not configured" };
    }

    const downloadUrl =
      "https://github.com/Escisaa/BetterApp/releases/download/v1.0.0/BetterApp-1.0.0-arm64.dmg";

    const mailOptions = {
      from: `"BetterApp" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Download BetterApp",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📥 Your BetterApp Download</h1>
            </div>
            <div class="content">
              <p>Thank you for your interest in BetterApp!</p>
              
              <p>Click the button below to download BetterApp for macOS:</p>
              
              <div style="text-align: center;">
                <a href="${downloadUrl}" class="button">Download BetterApp.dmg</a>
              </div>
              
              <p><strong>Installation Instructions:</strong></p>
              <ol>
                <li>Open the downloaded DMG file</li>
                <li>Drag BetterApp to your Applications folder</li>
                <li>Open BetterApp from Applications</li>
              </ol>
              
              <p><strong>Note:</strong> If macOS shows a security warning, right-click the app and select "Open", then click "Open" in the dialog.</p>
              
              <p>If the download doesn't start automatically, <a href="${downloadUrl}">click here</a>.</p>
            </div>
            <div class="footer">
              <p>BetterApp - Competitive Intelligence for App Developers</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Thank you for your interest in BetterApp!

Download BetterApp: ${downloadUrl}

Installation Instructions:
1. Open the downloaded DMG file
2. Drag BetterApp to your Applications folder
3. Open BetterApp from Applications

Note: If macOS shows a security warning, right-click the app and select "Open", then click "Open" in the dialog.

If the download doesn't start automatically, visit: ${downloadUrl}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Download link email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending download email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send license key to customer email
 */
export async function sendLicenseKey(email, licenseKey, plan = "yearly") {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.error("Email transporter not configured");
      return { success: false, error: "Email not configured" };
    }

    const planText = plan === "yearly" ? "Yearly" : "Monthly";
    const expiryDate = new Date();
    expiryDate.setFullYear(
      expiryDate.getFullYear() + (plan === "yearly" ? 1 : 0)
    );

    const mailOptions = {
      from: `"BetterApp" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your BetterApp License Key",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .license-box { background: #1f2937; color: #f97316; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 18px; font-weight: bold; margin: 20px 0; letter-spacing: 2px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to BetterApp Premium!</h1>
            </div>
            <div class="content">
              <p>Thank you for subscribing to BetterApp Premium!</p>
              
              <p>Your license key is:</p>
              <div class="license-box">${licenseKey}</div>
              
              <p><strong>Plan:</strong> ${planText} (£120/year)</p>
              <p><strong>Expires:</strong> ${expiryDate.toLocaleDateString(
                "en-GB",
                { day: "numeric", month: "long", year: "numeric" }
              )}</p>
              
              <p>To activate your license:</p>
              <ol>
                <li>Open BetterApp</li>
                <li>Click on "License" in the sidebar</li>
                <li>Enter your license key: <strong>${licenseKey}</strong></li>
                <li>Click "Activate License"</li>
              </ol>
              
              <p><strong>What you get:</strong></p>
              <ul>
                <li>✅ AI Chat with Any App</li>
                <li>✅ AI Review Analysis</li>
                <li>✅ Smart Tags & Export</li>
                <li>✅ Keyword Tracking (ASO)</li>
                <li>✅ App Performance Tracking</li>
                <li>✅ Unlimited Usage</li>
              </ul>
              
              <p>If you have any questions, just reply to this email.</p>
              
              <p>Happy analyzing! 🚀</p>
            </div>
            <div class="footer">
              <p>BetterApp - Competitive Intelligence for App Developers</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to BetterApp Premium!

Your license key: ${licenseKey}

Plan: ${planText} (£120/year)
Expires: ${expiryDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}

To activate:
1. Open BetterApp
2. Click "License" in the sidebar
3. Enter your license key: ${licenseKey}
4. Click "Activate License"

What you get:
- AI Chat with Any App
- AI Review Analysis
- Smart Tags & Export
- Keyword Tracking (ASO)
- App Performance Tracking
- Unlimited Usage

Happy analyzing!
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`License email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending license email:", error);
    return { success: false, error: error.message };
  }
}
