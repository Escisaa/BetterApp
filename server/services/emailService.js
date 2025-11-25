// Email Service - Sends license keys using Resend API
import { Resend } from "resend";

let resendClient = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.EMAIL_PASSWORD || process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn(
        "Resend API key not configured. Set EMAIL_PASSWORD or RESEND_API_KEY in environment variables"
      );
      return null;
    }

    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Send license key to customer email using Resend
 */
export async function sendLicenseKey(email, licenseKey, plan = "yearly") {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.error("Resend client not configured");
      return { success: false, error: "Email service not configured" };
    }

    // Validate email configuration
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom || !emailFrom.includes("@")) {
      console.error(
        "EMAIL_FROM must be a valid email address (e.g., noreply@yourdomain.com)"
      );
      return {
        success: false,
        error: "Email sender address not configured properly",
      };
    }

    const planText = plan === "yearly" ? "Yearly" : "Monthly";
    const expiryDate = new Date();
    expiryDate.setFullYear(
      expiryDate.getFullYear() + (plan === "yearly" ? 1 : 0)
    );

    const { data, error } = await resend.emails.send({
      from: `BetterApp <${emailFrom}>`,
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
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error: error.message || "Failed to send email" };
    }

    console.log(`License email sent to ${email} via Resend (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Error sending license email:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
