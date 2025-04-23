import React from 'react';
import { FileText } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Terms of Service</h1>
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
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold">Terms and Conditions</h2>
              </div>
              
              <p>
                Welcome to InternJobs.ai. Please read these Terms of Service ("Terms") carefully as they contain important information about your legal rights, remedies, and obligations. By accessing or using the InternJobs.ai website, you agree to comply with and be bound by these Terms.
              </p>
              
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing or using our website, you agree to these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use our website.
              </p>
              
              <h3>2. Changes to Terms</h3>
              <p>
                We may modify these Terms at any time. If we make changes, we will provide notice by revising the date at the top of these Terms and, in some cases, we may provide additional notice. Your continued use of our website after any such changes constitutes your acceptance of the new Terms.
              </p>
              
              <h3>3. Using InternJobs.ai</h3>
              <p>
                InternJobs.ai provides a platform for employers to post job opportunities and for high school students to find and apply for those opportunities.
              </p>
              
              <h4>3.1 Employer Accounts</h4>
              <p>
                If you are an employer, you may create an account to post job listings. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              
              <h4>3.2 Job Listings</h4>
              <p>
                Employers may post job listings on our platform. By posting a job listing, you represent and warrant that:
              </p>
              <ul>
                <li>You have the right to post the job listing</li>
                <li>The job listing complies with all applicable laws and regulations</li>
                <li>The job listing does not violate any third-party rights</li>
                <li>The job listing is accurate and not misleading</li>
              </ul>
              
              <h4>3.3 Student Use</h4>
              <p>
                Students may browse job listings without creating an account. When applying for jobs, students will be directed to the employer's application page or contact information.
              </p>
              
              <h3>4. Prohibited Conduct</h3>
              <p>
                You agree not to:
              </p>
              <ul>
                <li>Violate any applicable law or regulation</li>
                <li>Infringe any third-party rights</li>
                <li>Post false, misleading, or deceptive content</li>
                <li>Use our website for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt our website or servers</li>
                <li>Attempt to gain unauthorized access to our website or systems</li>
                <li>Collect or harvest user data without permission</li>
                <li>Post content that is discriminatory, offensive, or inappropriate</li>
              </ul>
              
              <h3>5. Intellectual Property</h3>
              <p>
                Our website and its contents, features, and functionality are owned by InternJobs.ai and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              
              <h3>6. Disclaimer of Warranties</h3>
              <p>
                Our website is provided "as is" and "as available" without any warranties of any kind, either express or implied.
              </p>
              
              <h3>7. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, InternJobs.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
              </p>
              
              <h3>8. Indemnification</h3>
              <p>
                You agree to indemnify and hold harmless InternJobs.ai and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of our website or your violation of these Terms.
              </p>
              
              <h3>9. Termination</h3>
              <p>
                We may terminate or suspend your access to our website at any time, without prior notice or liability, for any reason whatsoever.
              </p>
              
              <h3>10. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
              </p>
              
              <h3>11. Contact Us</h3>
              <p>
                If you have any questions about these Terms, please contact us at:
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
