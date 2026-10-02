import React from 'react';
import {
  ShieldCheck,
  Headphones,
  Award,
  CreditCard,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Contact us */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-tight mb-3">
              Contact us
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#support" className="hover:text-white transition-colors">
                  Customer support
                </a>
              </li>
              <li>
                <a href="#guarantee" className="hover:text-white transition-colors">
                  Service Guarantee
                </a>
              </li>
              <li>
                <a href="#service-info" className="hover:text-white transition-colors">
                  More service info
                </a>
              </li>
            </ul>

            {/* Social channels */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-2">
                Follow Us
              </span>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-tight mb-3">
              About
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Fligh.com
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-white transition-colors">
                  News
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy Statement
                </a>
              </li>
              <li>
                <a href="#accessibility" className="hover:text-white transition-colors">
                  Accessibility Statement
                </a>
              </li>
              <li>
                <a href="#ai-content" className="hover:text-white transition-colors">
                  AI generated personalized content
                </a>
              </li>
              <li>
                <a href="#group" className="hover:text-white transition-colors">
                  About Fligh.com Group
                </a>
              </li>
            </ul>
          </div>

          {/* Other services */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-tight mb-3">
              Other services
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#investors" className="hover:text-white transition-colors">
                  Investor relations
                </a>
              </li>
              <li>
                <a href="#rewards" className="hover:text-white transition-colors">
                  Fligh.com Rewards
                </a>
              </li>
              <li>
                <a href="#affiliate" className="hover:text-white transition-colors">
                  Affiliate Programme
                </a>
              </li>
              <li>
                <a href="#list-property" className="hover:text-white transition-colors">
                  List your property
                </a>
              </li>
              <li>
                <a href="#all-hotels" className="hover:text-white transition-colors">
                  All hotels
                </a>
              </li>
              <li>
                <a href="#supplier" className="hover:text-white transition-colors">
                  Become a Supplier
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Payment & Partners */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-tight mb-3">
              Payment methods
            </h4>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-2.5 py-1 bg-slate-800 rounded font-bold text-[11px] text-white tracking-wider border border-slate-700">
                MC
              </span>
              <span className="px-2.5 py-1 bg-slate-800 rounded font-bold text-[11px] text-white tracking-wider border border-slate-700">
                VISA
              </span>
              <span className="px-2.5 py-1 bg-slate-800 rounded font-bold text-[11px] text-amber-400 tracking-wider border border-slate-700">
                COINS
              </span>
              <span className="px-2.5 py-1 bg-slate-800 rounded font-bold text-[11px] text-emerald-400 tracking-wider border border-slate-700">
                eGIFT
              </span>
            </div>

            <h4 className="text-white font-bold text-sm tracking-tight mb-3">
              Our partners
            </h4>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 tracking-wider mb-6">
              <span className="flex items-center gap-1 hover:text-white transition-colors">
                <span className="text-blue-400">G</span>
                <span className="text-red-400">o</span>
                <span className="text-yellow-400">o</span>
                <span className="text-blue-400">g</span>
                <span className="text-green-400">l</span>
                <span className="text-red-400">e</span>
              </span>
              <span>·</span>
              <span className="hover:text-white transition-colors">
                TRIPADVISOR
              </span>
            </div>

            {/* Awards badge row */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>iF Design Award 2026</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Good Design Award 2024</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Headphones className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Contact Center of the year 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Worldwide Aviation Quick Links */}
        <div className="py-6 border-b border-slate-800/80 space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Worldwide Main Airports:
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
              <a href="#worldwide-directory" className="hover:text-blue-400">Dubai (DXB)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Doha Hamad (DOH)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Istanbul (IST)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Singapore Changi (SIN)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">London Heathrow (LHR)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Milan Malpensa (MXP)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Paris CDG (CDG)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Frankfurt (FRA)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">New York (JFK)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Karachi Jinnah (KHI)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Lahore (LHE)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Islamabad (ISB)</a>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Worldwide Leading Airlines:
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
              <a href="#worldwide-directory" className="hover:text-blue-400">Emirates (EK)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Qatar Airways (QR)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Turkish Airlines (TK)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Singapore Airlines (SQ)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">British Airways (BA)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Saudia (SV)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Lufthansa (LH)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Pakistan International Airlines (PIA)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Air France (AF)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">KLM (KL)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">Delta Air Lines (DL)</a>
              <span>·</span>
              <a href="#worldwide-directory" className="hover:text-blue-400">United Airlines (UA)</a>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/fligh_official_logo_1790967504892.jpg"
              alt="Fligh.com Logo"
              className="w-8 h-8 rounded-lg object-cover border border-slate-700"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-slate-300 font-semibold">Fligh.com Travel Pakistan</p>
              <p className="mt-0.5 text-slate-500">
                Copyright © 2026 Fligh.com Pte. Ltd. All rights reserved.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#terms" className="hover:text-slate-400">Terms of Use</a>
            <span>·</span>
            <a href="#privacy" className="hover:text-slate-400">Privacy Policy</a>
            <span>·</span>
            <a href="#security" className="hover:text-slate-400">Security Inquiries</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
