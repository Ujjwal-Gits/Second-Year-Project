// Terms and Conditions page for HamroYatra.
// Covers platform usage rules, booking policies, agent obligations, liability, and dispute resolution.

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

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-display">
      <SEO
        title="Terms and Conditions"
        description="Read HamroYatra's terms and conditions for using Nepal's verified travel platform."
        canonical="/terms-and-conditions"
        noIndex={false}
      />
      {/* Header */}
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
            Terms & Conditions
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
            These Terms and Conditions ("Terms") govern your access to and use
            of the HamroYatra platform, accessible at{" "}
            <strong className="font-semibold text-[#0D1F18]">
              hamroyatra.ujjwalrupakheti.com.np
            </strong>
            . By accessing or using our platform, you agree to be bound by these
            Terms. If you do not agree, please do not use the platform.
          </p>

          <Section title="1. Definitions">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  "Platform"
                </strong>{" "}
                refers to the HamroYatra website and all associated services.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  "Traveller"
                </strong>{" "}
                refers to any registered user who browses listings and makes
                bookings.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  "Agent" or "Travel Agent"
                </strong>{" "}
                refers to a verified travel company or individual registered on
                the platform to offer travel services.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  "Listing"
                </strong>{" "}
                refers to any travel package, hotel, trekking route, or service
                published by an Agent on the platform.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  "Booking"
                </strong>{" "}
                refers to a reservation made by a Traveller for a Listing.
              </li>
              <li>
                <strong className="font-semibold text-[#0D1F18]">
                  "We", "Us", "Our"
                </strong>{" "}
                refers to HamroYatra and its administrators.
              </li>
            </ul>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 16 years of age to use this platform. By
              registering, you represent and warrant that all information you
              provide is accurate, current, and complete. HamroYatra reserves
              the right to suspend or terminate accounts found to contain false
              or misleading information.
            </p>
          </Section>

          <Section title="3. Account Registration and Security">
            <p>
              To access certain features, you must register an account. You are
              responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Maintaining the confidentiality of your login credentials.
              </li>
              <li>All activities that occur under your account.</li>
              <li>
                Notifying us immediately of any unauthorized use of your
                account.
              </li>
            </ul>
            <p>
              All new accounts require email OTP verification before activation.
              Google OAuth accounts are verified through Google's authentication
              system.
            </p>
            <p>
              HamroYatra will never ask for your password via email or phone.
            </p>
          </Section>

          <Section title="4. Traveller Obligations">
            <p>As a Traveller, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Provide accurate personal and contact information when making
                bookings.
              </li>
              <li>
                Honour confirmed bookings and communicate cancellations promptly
                to the relevant Agent.
              </li>
              <li>
                Use the platform solely for lawful purposes and not attempt to
                defraud Agents or other users.
              </li>
              <li>
                Submit honest and fair reviews based on genuine experiences.
              </li>
              <li>
                Not use the AI trip planning feature to generate harmful,
                misleading, or illegal content.
              </li>
            </ul>
          </Section>

          <Section title="5. Agent Obligations">
            <p>As a registered Travel Agent, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Provide accurate, up-to-date, and truthful information in all
                Listings.
              </li>
              <li>
                Hold all required licenses, permits, and registrations required
                by Nepalese law to operate as a travel service provider.
              </li>
              <li>
                Honour confirmed bookings and communicate any changes or
                cancellations to Travellers in a timely manner.
              </li>
              <li>
                Not engage in price manipulation, false advertising, or
                deceptive practices.
              </li>
              <li>
                Ensure that all guides registered under your account hold valid
                certifications.
              </li>
              <li>
                Maintain professional conduct in all communications with
                Travellers through the platform.
              </li>
            </ul>
            <p>
              HamroYatra reserves the right to remove any Listing or suspend any
              Agent account that violates these obligations without prior
              notice.
            </p>
          </Section>

          <Section title="6. Bookings and Payments">
            <p>
              HamroYatra is a platform that facilitates connections between
              Travellers and Agents. We are not a party to the booking contract
              between a Traveller and an Agent.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                All pricing displayed on Listings is set by the Agent and is
                subject to change.
              </li>
              <li>
                Payment terms, cancellation policies, and refund conditions are
                determined by the individual Agent.
              </li>
              <li>
                HamroYatra does not process payments directly and is not
                responsible for payment disputes between Travellers and Agents.
              </li>
              <li>
                Travellers are advised to confirm all booking details, pricing,
                and cancellation policies directly with the Agent before
                finalizing any reservation.
              </li>
            </ul>
          </Section>

          <Section title="7. AI Trip Planning Feature">
            <p>
              The AI-powered trip planning feature ("Plan with AI") is powered
              by Google's Gemini API and is provided for informational and
              inspirational purposes only.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                AI-generated suggestions are not guaranteed to be accurate,
                complete, or up-to-date.
              </li>
              <li>
                HamroYatra is not liable for any decisions made based on
                AI-generated content.
              </li>
              <li>
                Usage is subject to rate limits: 20 messages per day and 5
                messages per minute per user.
              </li>
              <li>
                Users must not use this feature to generate harmful, illegal, or
                misleading content.
              </li>
            </ul>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              All content on the HamroYatra platform — including but not limited
              to logos, design, text, graphics, and software — is the property
              of HamroYatra or its licensors and is protected by applicable
              intellectual property laws.
            </p>
            <p>
              Agents retain ownership of the content they upload (images,
              descriptions) but grant HamroYatra a non-exclusive, royalty-free
              license to display such content on the platform.
            </p>
            <p>
              You may not copy, reproduce, distribute, or create derivative
              works from any platform content without prior written permission.
            </p>
          </Section>

          <Section title="9. Prohibited Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Use the platform for any unlawful purpose or in violation of any
                applicable laws.
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the platform
                or its servers.
              </li>
              <li>
                Upload or transmit viruses, malware, or any other malicious
                code.
              </li>
              <li>
                Scrape, crawl, or harvest data from the platform without written
                permission.
              </li>
              <li>
                Impersonate any person or entity or misrepresent your
                affiliation with any person or entity.
              </li>
              <li>Post false, defamatory, or misleading reviews or content.</li>
              <li>
                Circumvent any rate limiting, authentication, or security
                measures.
              </li>
            </ul>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, HamroYatra and
              its administrators shall not be liable for:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Any indirect, incidental, special, consequential, or punitive
                damages arising from your use of the platform.
              </li>
              <li>
                Any loss or damage arising from the actions or omissions of
                Agents or Travellers.
              </li>
              <li>
                Any travel-related incidents, accidents, injuries, or losses
                that occur during a booked trip.
              </li>
              <li>
                Interruptions, errors, or unavailability of the platform or its
                services.
              </li>
              <li>
                Accuracy of AI-generated content provided through the trip
                planning feature.
              </li>
            </ul>
            <p>
              HamroYatra's total liability to you for any claim shall not exceed
              NPR 5,000 or the amount you paid to use the platform in the
              preceding 3 months, whichever is lower.
            </p>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless HamroYatra and
              its administrators from and against any claims, liabilities,
              damages, losses, and expenses (including legal fees) arising out
              of or in connection with your use of the platform, your violation
              of these Terms, or your violation of any rights of a third party.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              HamroYatra reserves the right to suspend or permanently terminate
              your account at any time, with or without notice, for conduct that
              we believe violates these Terms or is harmful to other users,
              third parties, or the platform.
            </p>
            <p>
              You may terminate your account at any time by contacting us at
              ujr.work@gmail.com. Upon termination, your right to use the
              platform ceases immediately.
            </p>
          </Section>

          <Section title="13. Governing Law and Dispute Resolution">
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of Nepal. Any disputes arising from or relating to these
              Terms or your use of the platform shall first be attempted to be
              resolved through good-faith negotiation.
            </p>
            <p>
              If negotiation fails, disputes shall be subject to the exclusive
              jurisdiction of the courts of Nepal.
            </p>
          </Section>

          <Section title="14. Changes to These Terms">
            <p>
              We reserve the right to modify these Terms at any time. Updated
              Terms will be posted on this page with a revised effective date.
              Your continued use of the platform after any changes constitutes
              your acceptance of the new Terms. We encourage you to review this
              page periodically.
            </p>
          </Section>

          <Section title="15. Contact Us">
            <p>
              For any questions or concerns regarding these Terms and
              Conditions, please contact us:
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
            to="/privacy-policy"
            className="hover:text-[#1D7447] transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
