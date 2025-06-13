"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, FileText, Clock, ChevronRight } from "lucide-react";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            Please read these terms carefully before using our platform.
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-card-foreground">
                  Agreement to Terms
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These Terms of Service ("Terms") govern your access to and use
                  of the Learnify platform, including any content,
                  functionality, and services offered on or through learnify.com
                  (the "Service").
                </p>
                <p>
                  By accessing or using the Service, you agree to be bound by
                  these Terms. If you do not agree to these Terms, you must not
                  access or use the Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-card-foreground">Definitions</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-card-foreground">"Service"</strong> refers to the Learnify platform,
                  accessible at learnify.com.
                </p>
                <p>
                  <strong className="text-card-foreground">"User"</strong> refers to any individual who accesses
                  or uses the Service.
                </p>
                <p>
                  <strong className="text-card-foreground">"Content"</strong> refers to all information, data,
                  text, software, music, sound, photographs, graphics, videos,
                  messages, or other materials that are posted, uploaded, or
                  otherwise transmitted via the Service.
                </p>
                <p>
                  <strong className="text-card-foreground">"Subscription"</strong> refers to the paid access to
                  premium features of the Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <Brain className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-card-foreground">
                  Account Registration
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To access certain features of the Service, you may be required
                  to register for an account. You agree to provide accurate,
                  current, and complete information during the registration
                  process and to update such information to keep it accurate,
                  current, and complete.
                </p>
                <p>
                  You are responsible for safeguarding your password and for all
                  activities that occur under your account. You agree to notify
                  us immediately of any unauthorized use of your account.
                </p>
                <p>
                  We reserve the right to disable any user account at any time
                  if, in our opinion, you have failed to comply with any
                  provision of these Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                User Content
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The Service may allow you to post, upload, or otherwise make
                  available content, including but not limited to text, photos,
                  videos, and other materials ("User Content").
                </p>
                <p>
                  You retain all rights in, and are solely responsible for, the
                  User Content you post to the Service. By posting User Content,
                  you grant us a non-exclusive, transferable, sub-licensable,
                  royalty-free, worldwide license to use, modify, publicly
                  display, publicly perform, and distribute your User Content in
                  connection with operating and providing the Service.
                </p>
                <p className="text-card-foreground">You represent and warrant that:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You own or have the necessary rights to the User Content you
                    post.
                  </li>
                  <li>
                    The User Content does not violate the rights of any third
                    party, including intellectual property rights and privacy
                    rights.
                  </li>
                  <li>
                    The User Content does not violate any applicable law or
                    regulation.
                  </li>
                  <li>
                    The User Content is not harmful, abusive, offensive, or
                    otherwise objectionable.
                  </li>
                </ul>

                <p className="mt-4">
                  We reserve the right to remove any User Content that violates
                  these Terms or that we determine is harmful, offensive, or
                  otherwise objectionable.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Subscriptions and Payments
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Some features of the Service require a subscription. By
                  subscribing to the Service, you agree to pay the applicable
                  fees as they become due.
                </p>
                <p>
                  Subscriptions automatically renew unless canceled at least 24
                  hours before the end of the current billing period. You can
                  cancel your subscription at any time through your account
                  settings.
                </p>
                <p>
                  We reserve the right to change our subscription fees at any
                  time. If we change our fees, we will provide notice of the
                  change on the website or by email, at our discretion. Your
                  continued use of the Service after the fee change becomes
                  effective constitutes your agreement to pay the changed
                  amount.
                </p>
                <p>
                  Refunds may be available in accordance with our Refund Policy,
                  which is incorporated by reference into these Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Intellectual Property
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The Service and its original content (excluding User Content),
                  features, and functionality are and will remain the exclusive
                  property of Learnify and its licensors. The Service is
                  protected by copyright, trademark, and other laws of both the
                  United States and foreign countries.
                </p>
                <p>
                  Our trademarks and trade dress may not be used in connection
                  with any product or service without the prior written consent
                  of Learnify.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Limitation of Liability
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In no event will Learnify, its affiliates, or their licensors,
                  service providers, employees, agents, officers, or directors
                  be liable for damages of any kind, under any legal theory,
                  arising out of or in connection with your use, or inability to
                  use, the Service, including any direct, indirect, special,
                  incidental, consequential, or punitive damages.
                </p>
                <p>
                  The foregoing does not affect any liability which cannot be
                  excluded or limited under applicable law.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Indemnification
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You agree to defend, indemnify, and hold harmless Learnify,
                  its affiliates, licensors, and service providers, and its and
                  their respective officers, directors, employees, contractors,
                  agents, licensors, suppliers, successors, and assigns from and
                  against any claims, liabilities, damages, judgments, awards,
                  losses, costs, expenses, or fees (including reasonable
                  attorneys' fees) arising out of or relating to your violation
                  of these Terms or your use of the Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Governing Law
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of the State of California, without giving
                  effect to any principles of conflicts of law.
                </p>
                <p>
                  Any legal suit, action, or proceeding arising out of, or
                  related to, these Terms or the Service shall be instituted
                  exclusively in the federal courts of the United States or the
                  courts of the State of California, in each case located in the
                  City of San Francisco, although we retain the right to bring
                  any suit, action, or proceeding against you for breach of
                  these Terms in your country of residence or any other relevant
                  country.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                Changes to Terms
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may revise these Terms at any time by updating this page.
                  By continuing to access or use the Service after those
                  revisions become effective, you agree to be bound by the
                  revised Terms.
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
            Have Questions About Our Terms?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our support team is here to help you understand our policies and
            answer any questions you may have.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 rounded-full"
          >
            <Link to="/contact" className="flex items-center">
              Contact Support <ChevronRight className="ml-2 h-5 w-5" />
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
