import React from "react";

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
          <div className="flex items-center space-x-4 text-sm">
            <a
              href="#"
              className={`hover:underline ${
                isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Terms
            </a>
            <span className={isDark ? "text-gray-600" : "text-gray-400"}>
              •
            </span>
            <a
              href="#"
              className={`hover:underline ${
                isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Privacy
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
