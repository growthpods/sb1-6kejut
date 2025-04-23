import React from 'react';
import { Cookie } from 'lucide-react';

export function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Cookie Policy</h1>
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
                <Cookie className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold">Our Cookie Policy</h2>
              </div>
              
              <p>
                This Cookie Policy explains how InternJobs.ai uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
              
              <h3>What Are Cookies?</h3>
              <p>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
              <p>
                Cookies set by the website owner (in this case, InternJobs.ai) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
              </p>
              
              <h3>Why Do We Use Cookies?</h3>
              <p>
                We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our website. Third parties serve cookies through our website for advertising, analytics, and other purposes.
              </p>
              
              <h3>Types of Cookies We Use</h3>
              <p>
                The specific types of first and third-party cookies served through our website and the purposes they perform are described below:
              </p>
              
              <h4>Essential Cookies</h4>
              <p>
                These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website, you cannot refuse them without impacting how our website functions.
              </p>
              
              <h4>Performance and Functionality Cookies</h4>
              <p>
                These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.
              </p>
              
              <h4>Analytics and Customization Cookies</h4>
              <p>
                These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.
              </p>
              
              <h4>Advertising Cookies</h4>
              <p>
                These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests.
              </p>
              
              <h3>How Can You Control Cookies?</h3>
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in the cookie banner on our website.
              </p>
              <p>
                You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information.
              </p>
              
              <h3>How Often Will We Update This Cookie Policy?</h3>
              <p>
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
              </p>
              <p>
                The date at the top of this Cookie Policy indicates when it was last updated.
              </p>
              
              <h3>Where Can You Get Further Information?</h3>
              <p>
                If you have any questions about our use of cookies or other technologies, please email us at admin@internjobs.ai or contact us at:
              </p>
              <p>
                InternJobs.ai<br />
                123 Innovation Way, Suite 400<br />
                San Francisco, CA 94107
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
