import React from 'react';
import { createPortal } from 'react-dom';

const PrivacyPolicy = () => {
    return createPortal(
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white text-gray-800">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
                <p className="italic text-sm mb-8 text-gray-600">Last updated: 3/7/2025</p>

                <div className="space-y-8">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900">1. Introduction</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how our ecommerce platform collects, uses, stores, and shares your information when you use our services—including integrations with your Google Drive, Google Spreadsheet, Facebook, Instagram, and Threads business accounts.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-4">
                            By using our website, you agree to the practices described in this Privacy Policy.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900">2. Information We Collect</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-900">2.1 Personal Information</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    When you use our platform, we may collect personal information that you provide during the login or registration process, including:
                                </p>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li className="text-gray-700">
                                        <span className="font-semibold">Facebook Account Information:</span> When you log in with your Facebook account, we may collect your Facebook user ID, name, email address, and profile picture as provided by Facebook’s API.
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-semibold">Other Social Media Identifiers:</span> For Instagram and Threads, we collect user IDs and other publicly available profile information as allowed by their respective APIs.
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-900">2.2 Usage Data</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    We collect information about how you interact with our platform:
                                </p>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li className="text-gray-700">
                                        <span className="font-semibold">Product Posts and Comments:</span> When you post an item on our platform, details such as media files and product descriptions are stored and later automatically shared to your linked Instagram, Facebook, and Threads business accounts.
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-semibold">Analytics Data:</span> We collect data from your social media posts (likes, comments, impressions, etc.) to generate insights on your product performance.
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-900">2.3 API Credentials and Tokens</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    To facilitate seamless integration with third-party services:
                                </p>
                                <ul className="list-disc pl-6 mt-2 space-y-2">
                                    <li className="text-gray-700">
                                        <span className="font-semibold">Access Tokens:</span> When you authenticate using your Facebook account, the access token along with your Facebook, Instagram, and Threads user IDs are stored securely (for example, in a Google Spreadsheet) for use in our analytics and controlled access systems.
                                    </li>
                                    <li className="text-gray-700">
                                        <span className="font-semibold">Google API Integration:</span> We use your Google Drive API for storing media and your Google Spreadsheet for storing data related to posts, comments, and user credentials.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section>
                        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li className="text-gray-700">
                                <span className="font-semibold">Authentication & Authorization:</span>
                                <p className="mt-1 leading-relaxed">
                                    Your Facebook login information is used to authenticate you as a user. The first user to log in with Facebook becomes the owner of the website, and subsequent admin access is controlled via passkeys created by this owner.
                                </p>
                            </li>
                            <li className="text-gray-700">
                                <span className="font-semibold">Content Distribution:</span>
                                <p className="mt-1 leading-relaxed">
                                    When you post an item on our platform, it is automatically shared to your connected Instagram, Facebook, and Threads business accounts.
                                </p>
                            </li>
                            <li className="text-gray-700">
                                <span className="font-semibold">Analytics & Insights:</span>
                                <p className="mt-1 leading-relaxed">
                                    Data collected from your social media accounts is used to provide performance insights on your product posts. This includes metrics like likes, comments, impressions, and engagement trends.
                                </p>
                            </li>
                            <li className="text-gray-700">
                                <span className="font-semibold">Access Control:</span>
                                <p className="mt-1 leading-relaxed">
                                    Access tokens and user IDs are used to manage controlled privileges. The owner of the website can generate passkeys with specific privileges for secondary users to access the admin page.
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* Data Storage and Security */}
                    <section>
                        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900">4. Data Storage and Security</h2>
                        <div className="space-y-4">
                            <div>
                                <span className="font-semibold text-gray-900">Storage:</span>
                                <p className="mt-2 text-gray-700 leading-relaxed">
                                    Your media files are stored via your Google Drive, and data such as social media access tokens and analytics are stored in Google Spreadsheets. We do not retain these files or tokens on our own servers beyond what is necessary to provide our service.
                                </p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Security Measures:</span>
                                <p className="mt-2 text-gray-700 leading-relaxed">
                                    We implement industry-standard security measures to protect your data. This includes secure storage practices, encrypted connections (HTTPS), and limited access to sensitive information. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Third-Party Integrations */}
                    <section>
                        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900">5. Third-Party Integrations</h2>
                        <div className="space-y-4">
                            <div>
                                <span className="font-semibold text-gray-900">Facebook, Instagram, and Threads:</span>
                                <p className="mt-2 text-gray-700 leading-relaxed">
                                    We integrate with these platforms using their official APIs and in accordance with their terms of service. We only use data provided by these APIs for authentication, content posting, and analytics. You should review the
                                    <a href="https://developers.facebook.com/terms/" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Facebook Terms of Service</a> and
                                    <a href="https://help.instagram.com/581066165581870" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Instagram Platform Policies</a> for additional information.
                                </p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Google APIs:</span>
                                <p className="mt-2 text-gray-700 leading-relaxed">
                                    We use your Google Drive and Google Spreadsheet APIs to store and manage your media and data. The use of these services is subject to
                                    <a href="https://developers.google.com/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Google’s API Services User Data Policy</a>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Ownership and Controlled Access */}
                    <section>
                        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900">6. Ownership and Controlled Access</h2>
                        <div className="space-y-4">
                            <div>
                                <span className="font-semibold text-gray-900">Admin Ownership:</span>
                                <p className="mt-2 text-gray-700 leading-relaxed">
                                    When the site is first hosted, the first user to log in with a Facebook account is designated as the owner. No other Facebook account can directly log into the admin area unless granted access via a passkey generated by the owner.
                                </p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Passkey Functionality:</span>
                                <p className="mt-2 text-gray-700 leading-relaxed">
                                    The owner can create passkeys with controlled privileges to allow secondary users limited access to the admin area. All operations performed by secondary users are logged and monitored by the owner.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Your Rights and Choices */}
                    <section>
                        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900">7. Your Rights and Choices</h2>
                        <div className="space-y-4">
                            <div>
                                <span className="font-semibold text-gray-900">Data Retention:</span>
                                <p className="mt-2 text-gray-700 leading-relaxed">
                                    We do not retain your data. All data is stored in your Google Spreadsheet.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Changes to Policy */}
                    <section>
                        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900">8. Changes to This Privacy Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this Privacy Policy from time to time. When we do, we will post the new policy on our website and update the "Last Updated" date. We encourage you to review the policy periodically to stay informed about our data practices.
                        </p>
                    </section>

                    {/* Contact Us */}
                    <section>
                        <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900">9. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed">
                            If you have any questions about this Privacy Policy or our data practices, please contact us at:
                            <br />
                            <a
                                href="mailto:onuertey1997@gmail.com?subject=Inquiry%20from%20[Your%20Website%20Name]&body=Hello,%0D%0A%0D%0APlease include your website domain name and any other relevant information in your message.%0D%0A%0D%0AThank you."
                                className="text-blue-600 hover:text-blue-800 underline transition-colors"
                            >
                                onuertey1997@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PrivacyPolicy;