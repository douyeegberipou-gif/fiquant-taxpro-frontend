import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { AlertTriangle, Scale, FileText } from 'lucide-react';

export const TermsAndConditions = () => {
  return (
    <Card className="bg-white border-amber-200 shadow-lg max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <Scale className="h-5 w-5" />
          <span>Terms and Conditions</span>
        </CardTitle>
        <CardDescription className="text-amber-100">
          Fiquant TaxPro - Nigerian Tax Calculator
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-6 text-sm">
            
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800">Important Notice</h4>
                <p className="text-amber-700 mt-1">
                  These calculations are for guidance purposes only. Please consult a qualified tax professional for official tax advice and compliance.
                </p>
              </div>
            </div>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                By using the Fiquant TaxPro Nigerian Tax Calculator ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use this Service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Service Description</h3>
              <p className="text-gray-700 leading-relaxed">
                Fiquant TaxPro provides automated tax calculation tools for Nigerian Personal Income Tax (PAYE) and Corporate Income Tax (CIT) based on 2026 tax laws. The Service is designed to assist with tax computations and generate reports for informational purposes only.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Limitation of Liability - Tax Obligations</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">IMPORTANT DISCLAIMER</h4>
                <p className="text-red-700">
                  <strong>Fiquant Consult hereby disclaims and is absolved of all liability for:</strong>
                </p>
                <ul className="list-disc list-inside mt-2 text-red-700 space-y-1">
                  <li>Any taxes owed, payable, or accrued by the user to any tax authority</li>
                  <li>Penalties, interest, or additional charges imposed by tax authorities</li>
                  <li>Any consequences arising from incorrect tax calculations or filings</li>
                  <li>Late payment penalties or compliance issues</li>
                  <li>Any legal or financial consequences related to tax matters</li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Users acknowledge that they remain solely responsible for all tax obligations, regardless of calculations provided by this Service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Accuracy of Information - User Responsibility</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Data Accuracy Disclaimer</h4>
                <p className="text-blue-700">
                  <strong>Fiquant Consult is absolved of responsibility for the accuracy of information supplied by users.</strong> This includes but is not limited to:
                </p>
                <ul className="list-disc list-inside mt-2 text-blue-700 space-y-1">
                  <li>Income amounts, allowances, and deductions entered by users</li>
                  <li>Company financial data and business information</li>
                  <li>Personal details and employment information</li>
                  <li>Any other data input into the calculation system</li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Users are solely responsible for verifying and ensuring the accuracy of all information they provide to the Service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. User Due Diligence and Compliance</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">Your Responsibilities</h4>
                <p className="text-green-700">
                  <strong>It is the user's sole responsibility to:</strong>
                </p>
                <ul className="list-disc list-inside mt-2 text-green-700 space-y-1">
                  <li>Conduct proper due diligence on all tax matters</li>
                  <li>Ensure tax calculations are complete and correct</li>
                  <li>Verify compliance with current Nigerian tax laws</li>
                  <li>Consult qualified tax professionals when necessary</li>
                  <li>File accurate and timely tax returns with relevant authorities</li>
                  <li>Maintain proper documentation and records</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Professional Consultation</h3>
              <p className="text-gray-700 leading-relaxed">
                The calculations provided by this Service are for guidance purposes only and should not be considered as professional tax advice. Users are strongly advised to consult with qualified tax professionals, chartered accountants, or legal advisors for:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1 ml-4">
                <li>Official tax advice and compliance guidance</li>
                <li>Complex tax situations and planning</li>
                <li>Verification of calculation accuracy</li>
                <li>Tax filing and submission procedures</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. No Warranty</h3>
              <p className="text-gray-700 leading-relaxed">
                The Service is provided "as is" without warranties of any kind, either express or implied. Fiquant Consult does not warrant that the Service will be uninterrupted, error-free, or that calculations will always be accurate or up-to-date with the latest tax laws.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Indemnification</h3>
              <p className="text-gray-700 leading-relaxed">
                Users agree to indemnify and hold harmless Fiquant Consult from any claims, damages, losses, or expenses arising from their use of the Service or any tax-related matters.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to Terms</h3>
              <p className="text-gray-700 leading-relaxed">
                Fiquant Consult reserves the right to modify these Terms and Conditions at any time. Users will be notified of significant changes, and continued use of the Service constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Governing Law</h3>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the jurisdiction of Nigerian courts.
              </p>
            </section>

            <div className="border-t pt-4 mt-6">
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-NG')} | Fiquant Consult Limited
              </p>
            </div>

          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TermsAndConditions;