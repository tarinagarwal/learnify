"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Clock, ChevronRight } from "lucide-react";

export default function PrivacyPage() {
  const lastUpdated = "April 15, 2024";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-24 py-12 md:py-20 bg-gradient-to-br from-muted to-primary/10 overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 z-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/20"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px hsl(var(--primary) / 0.3)`,
                animation: `float ${Math.random() * 10 + 20}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 border border-accent text-sm font-medium rounded-full text-foreground bg-accent/20 backdrop-blur-sm mb-4">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            Last Updated: {lastUpdated}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary pb-4">
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            Your privacy is important to us. This policy outlines how we
            collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-card-foreground">Introduction</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  At Learnify, we respect your privacy and are committed to
                  protecting your personal data. This privacy policy will inform
                  you about how we look after your personal data when you visit
                  our website and tell you about your privacy rights and how the
                  law protects you.
                </p>
                <p>
                  This privacy policy applies to all users of our platform,
                  including registered users, subscribers, and visitors.
                </p>
                <p>
                  Please read this privacy policy carefully to understand our
                  policies and practices regarding your personal data and how we
                  will treat it.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-card-foreground">
                  Information We Collect
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We collect several types of information from and about users
                  of our platform, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-card-foreground">Personal Data:</strong> Personal data, or personal
                    information, means any information about an individual from
                    which that person can be identified. This includes your
                    name, email address, telephone number, address, and payment
                    information.
                  </li>
                  <li>
                    <strong className="text-card-foreground">Usage Data:</strong> Information about how you use
                    our platform, including your browsing actions and patterns,
                    the features you use, the content you access, and the time,
                    frequency, and duration of your activities.
                  </li>
                  <li>
                    <strong className="text-card-foreground">Technical Data:</strong> Information about your
                    device and internet connection, including your IP address,
                    browser type and version, time zone setting, operating
                    system, and platform.
                  </li>
                  <li>
                    <strong className="text-card-foreground">Learning Data:</strong> Information about your
                    learning activities, progress, quiz results, and other
                    educational data generated through your use of the platform.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-card-foreground">
                  How We Use Your Information
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We use the information we collect about you for various
                  purposes, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and maintain our platform</li>
                  <li>
                    To personalize your experience and deliver content relevant
                    to your interests
                  </li>
                  <li>To improve our platform and develop new features</li>
                  <li>
                    To communicate with you, including sending you updates,
                    security alerts, and support messages
                  </li>
                  <li>To process payments and provide customer support</li>
                  <li>
                    To analyze usage patterns and optimize our platform's
                    performance
                  </li>
                  <li>
                    To detect, prevent, and address technical issues and
                    security threats
                  </li>
                  <li>To comply with legal obligations</li>
                </ul>
                <p>
                  We will only use your personal data for the purposes for which
                  we collected it, unless we reasonably consider that we need to
                  use it for another reason and that reason is compatible with
                  the original purpose.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <Lock className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-card-foreground">Data Security</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We have implemented appropriate technical and organizational
                  measures to secure your personal data from accidental loss,
                  unauthorized access, alteration, and disclosure. These
                  measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of sensitive data</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Access controls and authentication procedures</li>
                  <li>Regular backups and disaster recovery planning</li>
                  <li>
                    Employee training on data protection and security practices
                  </li>
                </ul>
                <p>
                  While we strive to protect your personal information, no
                  method of transmission over the Internet or electronic storage
                  is 100% secure. We cannot guarantee the absolute security of
                  your data.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Data Sharing and Disclosure
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may share your personal data with the following categories
                  of recipients:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-card-foreground">Service Providers:</strong> Third-party vendors who
                    perform services on our behalf, such as payment processing,
                    data analysis, email delivery, hosting, and customer
                    service.
                  </li>
                  <li>
                    <strong className="text-card-foreground">Business Partners:</strong> Companies with whom we
                    partner to offer joint promotional offers or related
                    products and services.
                  </li>
                  <li>
                    <strong className="text-card-foreground">Affiliates:</strong> Companies related by common
                    ownership or control.
                  </li>
                  <li>
                    <strong className="text-card-foreground">Legal Authorities:</strong> Law enforcement,
                    regulatory authorities, courts, or other public bodies when
                    we are legally required to do so.
                  </li>
                </ul>
                <p>
                  We require all third parties to respect the security of your
                  personal data and to treat it in accordance with the law. We
                  do not allow our third-party service providers to use your
                  personal data for their own purposes and only permit them to
                  process your personal data for specified purposes and in
                  accordance with our instructions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Your Privacy Rights
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Depending on your location, you may have certain rights
                  regarding your personal data, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The right to access your personal data</li>
                  <li>
                    The right to rectify inaccurate or incomplete personal data
                  </li>
                  <li>The right to erase your personal data</li>
                  <li>
                    The right to restrict the processing of your personal data
                  </li>
                  <li>The right to data portability</li>
                  <li>
                    The right to object to processing of your personal data
                  </li>
                  <li>The right to withdraw consent at any time</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the
                  information provided in the "Contact Us" section below. We may
                  need to request specific information from you to help us
                  confirm your identity and ensure your right to access your
                  personal data.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We use cookies and similar tracking technologies to track
                  activity on our platform and hold certain information. Cookies
                  are files with a small amount of data which may include an
                  anonymous unique identifier.
                </p>
                <p>We use the following types of cookies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-card-foreground">Essential Cookies:</strong> Necessary for the
                    platform to function properly.
                  </li>
                  <li>
                    <strong className="text-card-foreground">Analytical/Performance Cookies:</strong> Allow us to
                    recognize and count the number of visitors and see how
                    visitors move around our platform.
                  </li>
                  <li>
                    <strong className="text-card-foreground">Functionality Cookies:</strong> Enable us to
                    personalize content and remember your preferences.
                  </li>
                  <li>
                    <strong className="text-card-foreground">Targeting Cookies:</strong> Record your visit to our
                    platform, the pages you have visited, and the links you have
                    followed.
                  </li>
                </ul>
                <p>
                  You can instruct your browser to refuse all cookies or to
                  indicate when a cookie is being sent. However, if you do not
                  accept cookies, you may not be able to use some portions of
                  our platform.
                </p>
                <p>
                  For more information about the cookies we use, please see our{" "}
                  <Link
                    to="/cookies"
                    className="text-primary hover:underline"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Children's Privacy
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our platform is not intended for children under the age of 13.
                  We do not knowingly collect personal data from children under
                  13. If you are a parent or guardian and you are aware that
                  your child has provided us with personal data, please contact
                  us. If we become aware that we have collected personal data
                  from children without verification of parental consent, we
                  take steps to remove that information from our servers.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                International Transfers
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Your personal data may be transferred to, and processed in,
                  countries other than the country in which you are resident.
                  These countries may have data protection laws that are
                  different from the laws of your country.
                </p>
                <p>
                  We have implemented appropriate safeguards to ensure that your
                  personal data remains protected in accordance with this
                  privacy policy when transferred internationally, including
                  when transferred to our service providers and other third
                  parties.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Changes to This Privacy Policy
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update our privacy policy from time to time. We will
                  notify you of any changes by posting the new privacy policy on
                  this page and updating the "Last Updated" date at the top of
                  this policy.
                </p>
                <p>
                  You are advised to review this privacy policy periodically for
                  any changes. Changes to this privacy policy are effective when
                  they are posted on this page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/20 to-muted text-foreground overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
            Have Questions About Your Privacy?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our privacy team is here to help you understand how we protect your
            data and answer any questions you may have.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 rounded-full"
          >
            <Link to="/contact" className="flex items-center">
              Contact Us <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Add keyframes for floating animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
