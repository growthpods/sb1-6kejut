import React from 'react';
import { Shield } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Last Updated: April 22, 2025
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg">
              <div className="flex items-center mb-8">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold">Your Privacy Matters</h2>
              </div>
              
              <p>
                At InternJobs.ai, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
              </p>
              
              <h3>Information We Collect</h3>
              <p>
                We collect information that you provide directly to us when you:
              </p>
              <ul>
                <li>Create an account (for employers)</li>
                <li>Post a job listing</li>
                <li>Contact us</li>
                <li>Subscribe to our newsletter</li>
              </ul>
              
              <p>
                This information may include your name, email address, phone number, company information, and any other information you choose to provide.
              </p>
              
              <h3>How We Use Your Information</h3>
              <p>
                We use the information we collect to:
              </p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about products, services, offers, and events</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
              </ul>
              
              <h3>Information Sharing and Disclosure</h3>
              <p>
                We may share your information as follows:
              </p>
              <ul>
                <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf</li>
                <li>In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process</li>
                <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of InternJobs.ai or others</li>
                <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company</li>
                <li>With your consent or at your direction</li>
              </ul>
              
              <h3>Data Security</h3>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
              </p>
              
              <h3>Your Choices</h3>
              <p>
                You may update, correct, or delete your information at any time by contacting us at admin@internjobs.ai. You may also opt out of receiving promotional emails from us by following the instructions in those emails.
              </p>
              
              <h3>Changes to this Privacy Policy</h3>
              <p>
                We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice (such as adding a statement to our homepage or sending you a notification).
              </p>
              
              <h3>Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p>
                Email: admin@internjobs.ai<br />
                Address: 123 Innovation Way, Suite 400, San Francisco, CA 94107
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
