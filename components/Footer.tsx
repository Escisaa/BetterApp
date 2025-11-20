import React from 'react';
import Logo from './Logo';
import { TwitterIcon, LinkedInIcon, GithubIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3">
              <Logo size={32} className="rounded-lg" />
              <span className="font-semibold text-xl tracking-tight text-white">AppScope</span>
            </div>
            <p className="mt-4 text-gray-400 max-w-xs">
              AI-powered competitor analysis to help you build better mobile apps and grow your business.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><span className="sr-only">Twitter</span><TwitterIcon className="h-6 w-6" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><span className="sr-only">GitHub</span><GithubIcon className="h-6 w-6" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><span className="sr-only">LinkedIn</span><LinkedInIcon className="h-6 w-6" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Live Demo</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Updates</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#" className="text-base text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-500 text-center">&copy; {new Date().getFullYear()} AppScope. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;