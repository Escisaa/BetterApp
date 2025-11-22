import React from "react";
import Logo from "./Logo";
import { TwitterIcon, LinkedInIcon, GithubIcon } from "./Icons";

interface FooterProps {
  isDark?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDark = true }) => {
  return (
    <footer
      className={`border-t ${
        isDark ? "bg-black/30 border-gray-800" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3">
              <Logo size={32} className="rounded-lg" />
              <span
                className={`font-semibold text-xl tracking-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                AppScope
              </span>
            </div>
            <p
              className={`mt-4 max-w-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              AI-powered competitor analysis to help you build better mobile
              apps and grow your business.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <TwitterIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <GithubIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <LinkedInIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3
              className={`text-sm font-semibold tracking-wider uppercase ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#"
                  className={`text-base ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-base ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-base ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Live Demo
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-base ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Updates
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className={`text-sm font-semibold tracking-wider uppercase ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#"
                  className={`text-base ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-base ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-base ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className={`text-sm font-semibold tracking-wider uppercase ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#"
                  className={`text-base ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-base ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`mt-12 border-t pt-8 ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <p
            className={`text-base text-center ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
            &copy; {new Date().getFullYear()} AppScope. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
