import React from "react";

/**
 * Terms Page
 * Terms of service information
 */
const Terms: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 animate-fade-in">
      <h1 className="text-4xl font-black text-gray-900 mb-8">Terms of Service</h1>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using NexusSocial, you accept and agree to be bound by the terms and
            provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or
            software) on NexusSocial for personal, non-commercial transitory viewing only. This is
            the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on NexusSocial</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>
              Transfer the materials to another person or "mirror" the materials on any other server
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
          <p>
            The materials on NexusSocial are provided on an 'as is' basis. NexusSocial makes no
            warranties, expressed or implied, and hereby disclaims and negates all other warranties
            including, without limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of intellectual property or other
            violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations</h2>
          <p>
            In no event shall NexusSocial or its suppliers be liable for any damages (including,
            without limitation, damages for loss of data or profit, or due to business interruption)
            arising out of the use or inability to use the materials on NexusSocial.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
          <p>
            The materials appearing on NexusSocial could include technical, typographical, or
            photographic errors. NexusSocial does not warrant that any of the materials on
            NexusSocial are accurate, complete, or current.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at
            terms@nexussocial.com.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
        <p>Last updated: February 11, 2026</p>
      </div>
    </div>
  );
};

export default Terms;
