import React from "react";
import { Link } from "react-router-dom";

interface FooterProps {
  isDark?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDark = true }) => {
  return (
    <footer
      className={`${
        isDark ? "bg-[#111213] text-gray-400" : "bg-white text-gray-600"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <Link
              to="/terms"
              className={`hover:underline ${
                isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Terms
            </Link>
            <span className={isDark ? "text-gray-600" : "text-gray-400"}>
              •
            </span>
            <Link
              to="/privacy"
              className={`hover:underline ${
                isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Privacy
            </Link>
            <span className={isDark ? "text-gray-600" : "text-gray-400"}>
              •
            </span>
            <a
              href="mailto:support@betterapp.pro"
              className={`hover:underline ${
                isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Support
            </a>
          </div>
          <p
            className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}
          >
            © {new Date().getFullYear()} BetterApp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
