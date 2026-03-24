import React from "react";
import { Link } from "react-router-dom";
import HamroLogo from "../assets/HamroLogo.png";

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white pt-32 pb-16 rounded-t-[4rem] mt-0">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24 border-b border-white/5 pb-24">
          <div className="space-y-10">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden -ml-2">
                <img
                  src={HamroLogo}
                  alt="Hamroyatra Logo"
                  className="w-full h-full object-contain brightness-0 invert scale-[2.5]"
                />
              </div>
              <span className="text-3xl font-serif font-bold text-white tracking-widest">
                Hamroyatra
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-light">
              Nepal's premier luxury travel curator. We specialize in high-end,
              sustainable journeys that connect you with the profound beauty of
              the Himalayas.
            </p>
            <div className="flex gap-6">
              <a
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:text-primary-dark transition-all duration-500"
                href="#"
              >
                <span className="text-[10px] font-bold tracking-ultra">FB</span>
              </a>
              <a
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:text-primary-dark transition-all duration-500"
                href="#"
              >
                <span className="text-[10px] font-bold tracking-ultra">IG</span>
              </a>
              <a
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-accent hover:text-primary-dark transition-all duration-500"
                href="#"
              >
                <span className="text-[10px] font-bold tracking-ultra">TW</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-xs mb-10 text-white tracking-ultra uppercase">
              Elite Collections
            </h4>
            <ul className="space-y-6 text-gray-400 text-sm font-light">
              <li>
                <a
                  className="hover:text-accent transition-colors hover-underline-gold inline-block pb-1"
                  href="#"
                >
                  Himalayan Helicopter Tours
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors hover-underline-gold inline-block pb-1"
                  href="#"
                >
                  Annapurna Boutique Lodges
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors hover-underline-gold inline-block pb-1"
                  href="#"
                >
                  Private Mustang Safaris
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors hover-underline-gold inline-block pb-1"
                  href="#"
                >
                  Wellness &amp; Yoga Retreats
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs mb-10 text-white tracking-ultra uppercase">
              Company
            </h4>
            <ul className="space-y-6 text-gray-400 text-sm font-light">
              <li>
                <a
                  className="hover:text-accent transition-colors hover-underline-gold inline-block pb-1"
                  href="#"
                >
                  Our Philosophy
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors hover-underline-gold inline-block pb-1"
                  href="#"
                >
                  Sustainability Pledge
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors hover-underline-gold inline-block pb-1"
                  href="#"
                >
                  Verified Partners
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent transition-colors hover-underline-gold inline-block pb-1"
                  href="#"
                >
                  Concierge Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs mb-10 text-white tracking-ultra uppercase">
              Inspiration
            </h4>
            <p className="text-gray-400 text-sm mb-8 font-light">
              Join our elite circle for private offers and rare travel stories.
            </p>
            <form className="flex flex-col gap-5">
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-xs text-white focus:outline-none focus:border-accent placeholder-gray-600 transition-colors"
                placeholder="Email Address"
                type="email"
              />
              <button className="bg-accent text-primary-dark font-bold py-4 rounded-xl hover:bg-white transition-all tracking-ultra uppercase text-[10px]">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-ultra">
          <p>© 2026 Hamroyatra Travel. Excellence defined.</p>
          <div className="flex gap-12 mt-8 md:mt-0">
            <Link
              className="hover:text-white transition-colors"
              to="/privacy-policy"
            >
              Privacy
            </Link>
            <Link
              className="hover:text-white transition-colors"
              to="/terms-and-conditions"
            >
              Terms
            </Link>
            <Link className="hover:text-white transition-colors" to="/partners">
              Partners
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
