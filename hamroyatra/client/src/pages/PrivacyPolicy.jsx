// Privacy Policy page for HamroYatra.
// Covers data collection, usage, cookies, third-party services, user rights, and contact info.

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import HamroLogo from "../assets/HamroLogo.png";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-[15px] font-black text-[#0D1F18] uppercase tracking-[0.15em] mb-4 pb-2 border-b border-gray-100">
      {title}
    </h2>
    <div className="text-[13px] text-gray-600 leading-relaxed space-y-3 font-light">
      {children}
    </div>
  </div>
);

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-display">
      <SEO
        title="Privacy Policy"
        description="Read HamroYatra's privacy policy — how we collect, use and protect your data on Nepal's verified travel platform."
        canonical="/privacy-policy"
        noIndex={false}
      />
      <div className="bg-[#0D1F18] text-white py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="flex items-center gap-3 mb-10 w-fit">
            <img
              src={HamroLogo}
              alt="HamroYatra"
              className="w-8 h-8 object-contain brightness-0 invert"
            />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60">
              HamroYatra
            </span>
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059] mb-3">
            Legal Document
          </p>
          <h1 className="text-[32px] md:text-[42px] font-black tracking-tight leading-none mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/50 text-[12px] font-light">
            Effective Date: March 25, 2026 &nbsp;·&nbsp; Domain:
            hamroyatra.ujjwalrupakheti.com.np
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
          <p className="text-[13px] text-gray-600 leading-relaxed mb-10 font-light">
            HamroYatra ("we", "our", or "us") operates the platform accessible
            at{" "}
            <strong className="font-semibold text-[#0D1F18]">
              hamroyatra.ujjwalrupakheti.com.np
            </strong>
            . This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our platform. Please read
            this policy carefully. By using HamroYatra, you consent to the
            practices described herein.
          </p>

          <Section title="1. Information We Collect">
            <p>
              <strong className="font-semibold text-[#0D1F18]">
                Personal Information:
              </strong>{" "}
              When you register as a Traveller or Travel Agent, we collect your
              full name, email address, contact number, company name (agents
              only), and password (stored as a bcrypt hash — never in plain
              text).
            </p>
            <p>
              <strong className="font-semibold text-[#0D1F18]">
                Google OAuth:
              </strong>{" "}
              If you sign in via Google, we receive your name, email address,
              and Google profile ID from Google's OAuth 2.0 service. We do not
              receive or store your Google password.
            </p>
            <p>
              <strong className="font-semibold text-[#0D1F18]">
                Booking Information:
              </strong>{" "}
              When a booking is made, we collect guest name, contact details,
              travel dates, selected services, and payment amounts for
              record-keeping purposes.
            </p>
            <p>
              <strong className="font-semibold text-[#0D1F18]">
                Usage Data:
              </strong>{" "}
              We automatically collect session identifiers, pages visited,
              listing views, and interaction patterns to improve our
              recommendation engine and platform experience.
            </p>
            <p>
              <strong className="font-semibold text-[#0D1F18]">
                Communications:
              </strong>{" "}
              Messages sent through our in-platform messaging system are stored
              to facilitate communication between travellers and agents.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Create and manage your account and authenticate your identity
                securely.
              </li>
              <li>
                Process and manage travel bookings between travellers and
                verified agents.
              </li>
              <li>
                Deliver personalized listing recommendations based on your
                browsing preferences and history.
              </li>
              <li>
                Send transactional emails including OTP verification codes,
                booking confirmations, and account notifications.
              </li>
              <li>
                Enable communication between travellers and travel agents
                through our messaging system.
              </li>
              <li>
                Monitor and improve platform performance, security, and user
                experience.
              </li>
              <li>
                Comply with applicable legal obligations and enforce our Terms
                and Conditions.
              </li>
            </ul>
          </Section>

          <Section title="3. Cookies and Tracking Technologies">
            <p>HamroYatra uses the following technologies:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  JWT Authentication Cookie (hv_token):
                </strong>{" "}
                An HTTP-only, secure cookie used to maintain your login session.
                This cookie expires after 24 hours and cannot be accessed by
                JavaScript.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  Session Storage:
                </strong>{" "}
                Used client-side to track whether the preloader animation has
                been shown in the current browser tab session.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  Anonymous Session IDs:
                </strong>{" "}
                Used to track listing views for preference-based recommendations
                without requiring login.
              </li>
            </ul>
            <p>
              We do not use third-party advertising cookies or sell your data to
              advertisers.
            </p>
          </Section>

          <Section title="4. Data Sharing and Disclosure">
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your data only in the following
              circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  With Travel Agents:
                </strong>{" "}
                When you make a booking, your name, contact details, and booking
                information are shared with the relevant verified travel agent
                to fulfill your reservation.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  Google OAuth:
                </strong>{" "}
                Authentication is handled via Google's OAuth 2.0 service.
                Google's own privacy policy governs data processed on their end.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  Google Gemini AI:
                </strong>{" "}
                Our AI trip planning feature sends anonymized travel queries to
                Google's Gemini API. No personally identifiable information is
                included in these requests.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  Legal Requirements:
                </strong>{" "}
                We may disclose your information if required by law, court
                order, or governmental authority.
              </li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your personal data for as long as your account is active
              or as needed to provide services. You may request deletion of your
              account and associated data at any time by contacting us. Booking
              records may be retained for up to 5 years for legal and financial
              compliance purposes.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>bcrypt password hashing with a cost factor of 12.</li>
              <li>HTTP-only JWT cookies to prevent XSS-based session theft.</li>
              <li>
                OTP-based email verification for all new account registrations.
              </li>
              <li>
                Rate limiting on authentication and OTP endpoints to prevent
                brute-force attacks.
              </li>
              <li>
                CORS restrictions limiting API access to authorized frontend
                origins only.
              </li>
            </ul>
            <p>
              No method of transmission over the internet is 100% secure. While
              we strive to protect your data, we cannot guarantee absolute
              security.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>
                Request deletion of your personal data ("right to be
                forgotten").
              </li>
              <li>
                Withdraw consent for data processing where consent is the legal
                basis.
              </li>
              <li>
                Lodge a complaint with a relevant data protection authority.
              </li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <strong className="font-semibold text-[#0D1F18]">
                ujr.work@gmail.com
              </strong>
              .
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              HamroYatra is not directed at individuals under the age of 16. We
              do not knowingly collect personal information from children. If
              you believe a child has provided us with personal data, please
              contact us immediately and we will delete it.
            </p>
          </Section>

          <Section title="9. Third-Party Links">
            <p>
              Our platform may contain links to third-party websites (e.g.,
              partner agencies, Google Maps). We are not responsible for the
              privacy practices of those sites and encourage you to review their
              privacy policies independently.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated effective date. Continued
              use of the platform after changes constitutes acceptance of the
              revised policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy, please contact us:
            </p>
            <div className="mt-3 p-5 bg-[#F7F6F3] rounded-xl space-y-1">
              <p>
                <strong className="font-semibold text-[#0D1F18]">
                  HamroYatra
                </strong>
              </p>
              <p>Website: hamroyatra.ujjwalrupakheti.com.np</p>
              <p>Email: ujr.work@gmail.com</p>
              <p>Country: Nepal</p>
            </div>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-10 flex flex-wrap gap-6 justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-[#1D7447] transition-colors">
            ← Back to Home
          </Link>
          <Link
            to="/terms-and-conditions"
            className="hover:text-[#1D7447] transition-colors"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
