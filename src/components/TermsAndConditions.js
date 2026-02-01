import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { AlertTriangle, Scale, FileText, Shield, Lock } from 'lucide-react';

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
                  Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
                </p>
              </div>
            </div>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. General Terms</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                These Terms and Conditions (&quot;Terms&quot;) govern your use of the Fiquant TaxPro website and services (collectively, the &quot;Service&quot;) operated by Fiquant Consult Limited (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Service Description and Availability</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Fiquant TaxPro provides online tax calculation tools, resources, and related services for Nigerian tax computations. Our Service includes Personal Income Tax (PAYE) calculators, Corporate Income Tax (CIT) calculators, VAT calculators, Capital Gains Tax calculators, bulk payroll processing, and report generation capabilities.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                We strive to maintain continuous service availability; however, we do not guarantee uninterrupted access to the Service. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice, for maintenance, updates, or other operational reasons.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Service features may vary based on your subscription level, geographic location, and applicable laws. We reserve the right to introduce new features, modify existing features, or discontinue features as we deem appropriate.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. User Accounts and Registration</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                To access certain features of our Service, you may be required to create an account. When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for maintaining the confidentiality of your account.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree not to disclose your password to any third party and to take sole responsibility for activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to refuse service, terminate accounts, or cancel orders in our sole discretion, particularly if we suspect fraudulent activity, violation of these Terms, or misuse of our Service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Acceptable Use Policy</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service in any way that could damage, disable, overburden, or impair our servers or networks, or interfere with any other party&apos;s use and enjoyment of the Service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>Prohibited activities include, but are not limited to:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1 mb-3">
                <li>Using the Service for any illegal or unauthorized purpose</li>
                <li>Attempting to gain unauthorized access to any part of the Service</li>
                <li>Uploading or transmitting viruses, malware, or other malicious code</li>
                <li>Attempting to reverse engineer, decompile, or hack the Service</li>
                <li>Using automated systems or bots to access the Service</li>
                <li>Sharing account credentials with unauthorized third parties</li>
                <li>Interfering with or disrupting the Service or servers</li>
                <li>Collecting or harvesting user information without consent</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to monitor usage and take appropriate action against users who violate these terms, including but not limited to account suspension or termination.
              </p>
            </section>

            {/* NDPR-Compliant Data Protection Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                5. Data Protection and Privacy (NDPR Compliance)
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">Your Data Rights Under Nigerian Law</h4>
                <p className="text-green-700 mb-2">
                  We are committed to protecting your personal data in compliance with the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act (NDPA). <strong>You retain full ownership of your personal data at all times.</strong>
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.1 Data We Collect:</strong> We collect only the personal data necessary to provide our tax calculation services, including:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1 mb-3">
                <li>Contact information (name, email address, phone number)</li>
                <li>Financial data you input for tax calculations (income, deductions, allowances)</li>
                <li>Account credentials and authentication data</li>
                <li>Usage data and service interaction logs</li>
              </ul>

              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.2 Legal Basis for Processing:</strong> We process your personal data based on:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1 mb-3">
                <li>Your explicit consent, which you may withdraw at any time</li>
                <li>Performance of our contract to provide tax calculation services</li>
                <li>Compliance with legal obligations under Nigerian law</li>
                <li>Our legitimate business interests, balanced against your rights</li>
              </ul>

              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.3 Your Data Subject Rights:</strong> Under the NDPR, you have the right to:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1 mb-3">
                <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Restriction:</strong> Request limitation of how we process your data</li>
                <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
                <li><strong>Withdraw Consent:</strong> Withdraw previously given consent at any time</li>
              </ul>

              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.4 Data Confidentiality and Non-Disclosure:</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800">
                  <strong>We do not own, sell, share, rent, or publicly display your personal data.</strong> Your financial information and tax calculations are kept strictly confidential and are used solely to provide you with our tax calculation services.
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.5 Data Security:</strong> We implement appropriate technical and organizational measures to protect your personal data, including:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1 mb-3">
                <li>Encryption of data in transit and at rest</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security assessments and audits</li>
                <li>Staff training on data protection</li>
              </ul>

              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.6 Data Retention:</strong> We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. You may request deletion of your account and associated data at any time.
              </p>

              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>5.7 Data Breach Notification:</strong> In the event of a personal data breach that poses a high risk to your rights and freedoms, we will notify the National Information Technology Development Agency (NITDA) within 72 hours and inform you without undue delay.
              </p>

              <p className="text-gray-700 leading-relaxed">
                <strong>5.8 Contact for Data Protection Matters:</strong> For any data protection inquiries, requests to exercise your rights, or complaints, please contact our Data Protection Officer at: <strong>dpo@fiquantconsult.com</strong>. You also have the right to lodge a complaint with NITDA if you believe your data protection rights have been violated.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Intellectual Property Rights</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                The Service and its original content, features, and functionality (excluding user data) are and will remain the exclusive property of Fiquant Consult Limited and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                You are granted a limited, non-exclusive, non-transferable, and revocable license to use the Service for your personal or business tax calculation needs. This license does not permit you to resell, redistribute, or create derivative works based on the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any feedback, suggestions, or improvements you voluntarily provide regarding the Service functionality (not including your personal or financial data) may be used by us to improve our services.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. User Data and Content</h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Your Data Belongs to You
                </h4>
                <p className="text-purple-700">
                  <strong>You retain full and exclusive ownership of all personal data, financial information, and tax calculation data you submit to our Service.</strong> We do not claim any ownership rights over your data.
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>7.1 Limited Processing License:</strong> By using our Service, you grant us a limited, non-exclusive license to process your data solely for the purpose of providing tax calculation services to you. This license:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1 mb-3">
                <li>Is strictly limited to service delivery purposes</li>
                <li>Does not transfer ownership of your data to us</li>
                <li>Does not permit us to sell, share, or publicly display your data</li>
                <li>Terminates when you delete your account or request data deletion</li>
              </ul>

              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>7.2 Data Accuracy:</strong> You represent and warrant that all data you submit is accurate and that you have the right to submit such data. You are solely responsible for the accuracy of information you provide.
              </p>

              <p className="text-gray-700 leading-relaxed">
                <strong>7.3 Data Deletion:</strong> You may request deletion of your data at any time by contacting us or using the account deletion feature. Upon deletion request, we will remove your personal data within 30 days, except where retention is required by law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Payment Terms and Billing</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Certain features of our Service may require payment of fees. All fees are stated in Nigerian Naira (₦) unless otherwise specified. You agree to pay all applicable fees as described on the Service at the time you place an order.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                We reserve the right to change our fees at any time. If you have a recurring subscription, fee changes will take effect at the beginning of your next billing cycle. We will notify you of fee changes in advance.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                All payments are non-refundable unless otherwise stated or required by law. We may suspend or terminate your access to paid features if payment is not received when due.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for any taxes, duties, or other governmental charges related to your use of the Service, including but not limited to value-added tax (VAT) where applicable.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Third-Party Services and Links</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Our Service may contain links to third-party websites, services, or resources that are not owned or controlled by Fiquant Consult Limited. We do not endorse or assume any responsibility for the content, privacy policies, or practices of any third-party websites or services.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused by or in connection with the use of any third-party content, goods, or services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We may integrate with third-party services to enhance functionality. Such integrations are subject to the terms and policies of those third-party providers, and we are not responsible for their availability or performance. Any data shared with third parties is done in compliance with NDPR requirements.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Service Modifications and Updates</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We reserve the right to modify, update, or enhance the Service at any time without prior notice. This includes adding new features, changing existing functionality, or discontinuing certain aspects of the Service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may perform scheduled maintenance that temporarily affects Service availability. We will attempt to minimize disruption and provide advance notice when possible, but emergency maintenance may be performed without notice.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Updates to tax calculations, rates, or regulations will be implemented as they become available. We strive to maintain current and accurate tax information but cannot guarantee immediate updates for all changes in tax laws.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Export Controls and Legal Compliance</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                The Service may be subject to export laws and trade sanctions of Nigeria and other jurisdictions. You agree to comply with all applicable laws and regulations regarding the export, import, and use of the Service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                You represent that you are not located in, or a resident or national of, any country subject to applicable trade sanctions, and that you are not on any government list of prohibited or restricted parties.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You agree to comply with all applicable laws, including but not limited to tax laws, employment laws, data protection regulations (including NDPR), and anti-corruption laws, in your use of the Service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">12. Force Majeure</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We shall not be liable for any failure or delay in performance under these Terms which is due to fire, flood, earthquake, elements of nature, acts of God, acts of war, terrorism, riots, civil disorders, rebellions or revolutions, or any other cause beyond our reasonable control.
              </p>
              <p className="text-gray-700 leading-relaxed">
                In the event of force majeure, we will use reasonable efforts to minimize the impact on Service availability and notify users of any significant disruptions when possible.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">13. Dispute Resolution and Arbitration</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Any disputes arising from these Terms or your use of the Service shall first be addressed through good faith negotiations. Both parties agree to engage in mediation before pursuing other legal remedies.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                If mediation fails, disputes shall be resolved through binding arbitration conducted in accordance with the Arbitration and Conciliation Act of Nigeria. The arbitration shall take place in Lagos, Nigeria, and shall be conducted in English.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You agree to waive any right to a jury trial and to participate in class action lawsuits, except where such waivers are prohibited by applicable law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">14. Severability and Entire Agreement</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be replaced with a valid provision that most closely reflects the original intent.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy and any other legal notices published by us on the Service, constitute the entire agreement between you and Fiquant Consult Limited regarding your use of the Service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">15. Contact Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                For questions about these Terms or our Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-1"><strong>Fiquant Consult Limited</strong></p>
                <p className="text-gray-700 mb-1">General Inquiries: support@fiquantconsult.com</p>
                <p className="text-gray-700 mb-1">Data Protection Officer: dpo@fiquantconsult.com</p>
                <p className="text-gray-700 mb-1">Website: www.fiquantconsult.com</p>
                <p className="text-gray-700">Nigeria</p>
              </div>
            </section>

            {/* ===== TAX CALCULATION SPECIFIC TERMS - LIABILITY DISCLAIMERS ===== */}
            <div className="border-t-2 border-amber-200 pt-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center bg-amber-50 p-3 rounded-lg">
                TAX CALCULATION SPECIFIC TERMS
              </h2>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">16. Acceptance of Terms</h3>
                <p className="text-gray-700 leading-relaxed">
                  By using the Fiquant TaxPro Nigerian Tax Calculator (&quot;the Service&quot;), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use this Service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">17. Service Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  Fiquant TaxPro provides automated tax calculation tools for Nigerian Personal Income Tax (PAYE), Corporate Income Tax (CIT), Value Added Tax (VAT), and Capital Gains Tax (CGT) based on current Nigerian tax laws including the Nigeria Tax Act 2025. The Service is designed to assist with tax computations and generate reports for informational purposes only.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">18. Limitation of Liability - Tax Obligations</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">19. Accuracy of Information - User Responsibility</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">20. User Due Diligence and Compliance</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">Your Responsibilities</h4>
                  <p className="text-green-700">
                    <strong>It is the user&apos;s sole responsibility to:</strong>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">21. Professional Consultation</h3>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">22. No Warranty</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Service is provided &quot;as is&quot; without warranties of any kind, either express or implied. Fiquant Consult does not warrant that the Service will be uninterrupted, error-free, or that calculations will always be accurate or up-to-date with the latest tax laws.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">23. Indemnification</h3>
                <p className="text-gray-700 leading-relaxed">
                  Users agree to indemnify and hold harmless Fiquant Consult from any claims, damages, losses, or expenses arising from their use of the Service or any tax-related matters.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">24. Changes to Terms</h3>
                <p className="text-gray-700 leading-relaxed">
                  Fiquant Consult reserves the right to modify these Terms and Conditions at any time. Users will be notified of significant changes, and continued use of the Service constitutes acceptance of updated terms.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">25. Governing Law</h3>
                <p className="text-gray-700 leading-relaxed">
                  These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act (NDPA). Any disputes shall be subject to the jurisdiction of Nigerian courts.
                </p>
              </section>
            </div>

            <div className="border-t pt-4 mt-6">
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-NG')} | Fiquant Consult Limited | NDPR Compliant
              </p>
            </div>

          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TermsAndConditions;
