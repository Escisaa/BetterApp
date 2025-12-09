import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const Terms: React.FC = () => {
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
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert prose-gray max-w-none space-y-6 text-gray-300">
          <p className="text-gray-400 text-sm">Last updated: December 2024</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using BetterApp ("the Service"), you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              2. Description of Service
            </h2>
            <p>
              BetterApp is an AI-powered app competitor analysis platform that
              helps app developers and marketers understand the competitive
              landscape, analyze user reviews, track keywords, and discover
              market opportunities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              3. Account Registration
            </h2>
            <p>
              To use certain features of the Service, you must create an
              account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              4. Subscription and Payments
            </h2>
            <p>BetterApp offers paid subscription plans. By subscribing:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You authorize us to charge your payment method on a recurring
                basis
              </li>
              <li>
                Subscriptions auto-renew unless cancelled before the renewal
                date
              </li>
              <li>
                We offer a 14-day money-back guarantee for new subscriptions
              </li>
              <li>
                Refund requests must be made within 14 days of initial purchase
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              5. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Scrape or collect data in violation of app store terms</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems to access the Service excessively</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              6. Intellectual Property
            </h2>
            <p>
              The Service, including its design, features, and content, is owned
              by BetterApp. You retain ownership of any data you upload or
              create using the Service. We do not claim ownership of your
              analyses or reports.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              7. Data and Analytics
            </h2>
            <p>Our Service uses publicly available data from app stores. We:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not guarantee the accuracy of third-party data</li>
              <li>Use AI to generate insights and analyses</li>
              <li>May update algorithms that affect metric calculations</li>
              <li>Store your tracked keywords and analysis history</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              8. Limitation of Liability
            </h2>
            <p>
              BetterApp is provided "as is" without warranties. We are not
              liable for any indirect, incidental, or consequential damages
              arising from your use of the Service. Our total liability shall
              not exceed the amount paid by you in the past 12 months.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">9. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for
              violations of these terms. You may cancel your subscription at any
              time. Upon termination, your access to the Service will be
              revoked.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              10. Changes to Terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of the
              Service after changes constitutes acceptance of the updated terms.
              We will notify users of significant changes via email.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">11. Contact</h2>
            <p>
              For questions about these Terms, please contact us at:{" "}
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

export default Terms;
