import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#111213] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-white">BetterApp</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-gray max-w-none space-y-6 text-gray-300">
          <p className="text-gray-400 text-sm">Last updated: December 2024</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              1. Introduction
            </h2>
            <p>
              At BetterApp, we respect your privacy and are committed to
              protecting your personal data. This Privacy Policy explains how we
              collect, use, and safeguard your information when you use our app
              competitor analysis platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              2. Information We Collect
            </h2>

            <h3 className="text-lg font-medium text-white">
              Account Information
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address (required for account creation)</li>
              <li>Name (optional)</li>
              <li>Password (securely hashed)</li>
            </ul>

            <h3 className="text-lg font-medium text-white">Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Apps you analyze and track</li>
              <li>Keywords you monitor</li>
              <li>Analysis history</li>
              <li>Feature usage patterns</li>
            </ul>

            <h3 className="text-lg font-medium text-white">Technical Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              3. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Process your subscription and payments</li>
              <li>Send you important updates about your account</li>
              <li>Improve our platform and develop new features</li>
              <li>Respond to your support requests</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              4. Data Storage and Security
            </h2>
            <p>
              We use industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All data is encrypted in transit (HTTPS/TLS)</li>
              <li>Passwords are hashed using secure algorithms</li>
              <li>We use Supabase for secure database storage</li>
              <li>Payment processing is handled by Stripe (PCI compliant)</li>
              <li>Regular security audits and monitoring</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              5. Third-Party Services
            </h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Supabase</strong> - Authentication and database
              </li>
              <li>
                <strong>Stripe</strong> - Payment processing
              </li>
              <li>
                <strong>Google Gemini</strong> - AI-powered analysis
              </li>
              <li>
                <strong>Vercel</strong> - Hosting and analytics
              </li>
              <li>
                <strong>Resend</strong> - Email notifications
              </li>
            </ul>
            <p>
              These services have their own privacy policies, and we encourage
              you to review them.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">6. Cookies</h2>
            <p>
              We use essential cookies for authentication and session
              management. We also use analytics cookies through Vercel to
              understand how users interact with our platform. You can disable
              cookies in your browser settings, but this may affect
              functionality.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              7. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. Upon
              account deletion:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal data is deleted within 30 days</li>
              <li>Anonymized usage statistics may be retained</li>
              <li>Payment records are kept as required by law</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access</strong> - Request a copy of your data
              </li>
              <li>
                <strong>Correction</strong> - Update inaccurate information
              </li>
              <li>
                <strong>Deletion</strong> - Request account and data deletion
              </li>
              <li>
                <strong>Export</strong> - Download your data in a portable
                format
              </li>
              <li>
                <strong>Opt-out</strong> - Unsubscribe from marketing emails
              </li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:support@betterapp.pro"
                className="text-orange-500 hover:text-orange-400"
              >
                support@betterapp.pro
              </a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              9. Children's Privacy
            </h2>
            <p>
              BetterApp is not intended for users under 16 years of age. We do
              not knowingly collect data from children. If we learn we have
              collected data from a child, we will delete it promptly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              10. International Transfers
            </h2>
            <p>
              Your data may be processed in countries outside your residence. We
              ensure appropriate safeguards are in place for international data
              transfers in compliance with applicable data protection laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes via email or through the
              Service. Your continued use after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">12. Contact Us</h2>
            <p>
              For privacy-related questions or concerns, please contact us at:{" "}
              <a
                href="mailto:support@betterapp.pro"
                className="text-orange-500 hover:text-orange-400"
              >
                support@betterapp.pro
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link to="/" className="text-orange-500 hover:text-orange-400">
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
