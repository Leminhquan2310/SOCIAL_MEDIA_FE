import React from "react";

/**
 * Privacy Page
 * Privacy policy information
 */
const Privacy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 animate-fade-in">
      <h1 className="text-4xl font-black text-gray-900 mb-8">Privacy Policy</h1>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account,
            update your profile, or contact us for support.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, as
            well as to send you technical notices, updates, security alerts, and support messages.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information to
            third parties without your consent, except as necessary to provide our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at
            privacy@nexussocial.com.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
        <p>Last updated: February 11, 2026</p>
      </div>
    </div>
  );
};

export default Privacy;
