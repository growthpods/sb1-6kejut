import React from 'react';
import { Building2, Users, Award, BookOpen } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About InternJobs.ai</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Connecting High School Students with Local Employers for Flexible Jobs
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-8">
              At InternJobs.ai, we believe that high school students deserve access to meaningful work experiences that fit around their busy schedules. Our mission is to bridge the gap between local employers and talented young people looking for evening, weekend, and summer opportunities.
            </p>
            <p className="text-lg text-gray-700">
              We've created a platform that makes it easy for students to find jobs without the hassle of creating accounts, and for employers to quickly post opportunities and connect with motivated young talent.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Accessibility</h3>
              <p className="text-gray-600 text-center">
                We believe in removing barriers to entry for young people seeking work experience. No accounts required, no complicated processes.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Quality</h3>
              <p className="text-gray-600 text-center">
                We focus on connecting students with meaningful opportunities that provide real-world skills and valuable experience.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Community</h3>
              <p className="text-gray-600 text-center">
                We believe in strengthening local communities by connecting businesses with young talent in their area.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section (Placeholder) */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Jane Doe</h3>
              <p className="text-blue-600 mb-4">Founder & CEO</p>
              <p className="text-gray-600">
                Passionate about creating opportunities for young people to gain valuable work experience.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">John Smith</h3>
              <p className="text-blue-600 mb-4">CTO</p>
              <p className="text-gray-600">
                Tech enthusiast focused on creating simple, accessible platforms for students and employers.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Emily Johnson</h3>
              <p className="text-blue-600 mb-4">Head of Partnerships</p>
              <p className="text-gray-600">
                Building relationships with schools and businesses to create a strong network of opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <p className="text-gray-700 mb-4">
                InternJobs.ai was founded in 2024 with a simple idea: make it easier for high school students to find flexible work opportunities that fit around their school schedules.
              </p>
              <p className="text-gray-700 mb-4">
                We noticed that while there were plenty of job boards for college students and professionals, high school students were often overlooked. Yet these young people are eager to gain experience, develop skills, and earn money during evenings, weekends, and summer breaks.
              </p>
              <p className="text-gray-700">
                Today, we're proud to connect thousands of students with local employers, creating valuable opportunities for both. Our platform continues to grow, but our mission remains the same: making flexible job opportunities accessible to all high school students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
