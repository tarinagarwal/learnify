"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Clock, Shield, FileText, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CookiesPage() {
  const lastUpdated = "April 15, 2024";

  const cookieCategories = [
    {
      name: "Essential",
      description:
        "These cookies are necessary for the website to function and cannot be switched off in our systems.",
      examples: [
        {
          name: "session",
          purpose: "Maintains your session while you browse the site",
          duration: "Session",
        },
        {
          name: "csrf_token",
          purpose: "Protects against Cross-Site Request Forgery attacks",
          duration: "Session",
        },
        {
          name: "auth",
          purpose: "Keeps you logged in to your account",
          duration: "30 days",
        },
      ],
    },
    {
      name: "Functional",
      description:
        "These cookies enable the website to provide enhanced functionality and personalization.",
      examples: [
        {
          name: "language",
          purpose: "Remembers your preferred language",
          duration: "1 year",
        },
        {
          name: "theme",
          purpose: "Remembers your preferred theme (light/dark)",
          duration: "1 year",
        },
        {
          name: "ui_preferences",
          purpose: "Stores your UI preferences",
          duration: "1 year",
        },
      ],
    },
    {
      name: "Analytics",
      description:
        "These cookies help us understand how visitors interact with our website.",
      examples: [
        {
          name: "_ga",
          purpose: "Google Analytics - Distinguishes users",
          duration: "2 years",
        },
        {
          name: "_gid",
          purpose: "Google Analytics - Identifies user session",
          duration: "24 hours",
        },
        {
          name: "_gat",
          purpose: "Google Analytics - Throttles request rate",
          duration: "1 minute",
        },
      ],
    },
    {
      name: "Marketing",
      description:
        "These cookies are used to track visitors across websites to display relevant advertisements.",
      examples: [
        {
          name: "_fbp",
          purpose: "Facebook Pixel - Identifies browsers for ad delivery",
          duration: "3 months",
        },
        {
          name: "_gcl_au",
          purpose: "Google Adsense - Stores ad click information",
          duration: "3 months",
        },
        {
          name: "ads_prefs",
          purpose: "Stores ad preferences",
          duration: "1 year",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      {/* Hero Section */}
      <section className="relative pt-24 py-12 md:py-20 bg-gradient-to-br from-gray-950 to-gray-900 overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 z-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: `rgba(${Math.random() * 100 + 155}, ${
                  Math.random() * 100 + 155
                }, 255, ${Math.random() * 0.5 + 0.5})`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${
                  Math.random() * 100 + 155
                }, ${Math.random() * 100 + 155}, 255, ${
                  Math.random() * 0.5 + 0.5
                })`,
                animation: `float ${Math.random() * 10 + 20}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-purple-500/20 backdrop-blur-sm mb-4">
            <Clock className="w-4 h-4 mr-2" />
            Last Updated: {lastUpdated}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 pb-4">
            Cookie Policy
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300 leading-relaxed">
            This policy explains how we use cookies and similar technologies to
            recognize you when you visit our platform.
          </p>
        </div>
      </section>

      {/* Cookies Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <Cookie className="h-6 w-6 text-purple-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">
                  What Are Cookies
                </h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  Cookies are small text files that are placed on your computer
                  or mobile device when you visit a website. They are widely
                  used to make websites work more efficiently and provide
                  information to the owners of the site.
                </p>
                <p>
                  Cookies allow a website to recognize your device and remember
                  if you've been to the website before. They can be used to
                  store your preferences, remember your settings, analyze how
                  you use the website, and personalize content and
                  advertisements.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">
                  How We Use Cookies
                </h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>We use cookies for a variety of reasons, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To make our platform work as you would expect</li>
                  <li>To remember your settings during and between visits</li>
                  <li>To improve the speed and security of the platform</li>
                  <li>To allow you to share content on social media</li>
                  <li>
                    To analyze how our platform is used so we can improve it
                  </li>
                  <li>
                    To personalize your experience and show you content relevant
                    to your interests
                  </li>
                </ul>
                <p>
                  We do not use cookies to collect personally identifiable
                  information about you, although we may combine information
                  that we collect from the cookies with other personal
                  information that you provide to us for the purposes described
                  in our Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-purple-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">
                  Types of Cookies We Use
                </h2>
              </div>
              <div className="space-y-6 text-gray-300">
                {cookieCategories.map((category, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">
                      {category.name} Cookies
                    </h3>
                    <p>{category.description}</p>
                    <div className="rounded-md border border-gray-700">
                      <Table>
                        <TableHeader className="bg-gray-800">
                          <TableRow className="border-b border-gray-700">
                            <TableHead className="text-white">
                              Cookie Name
                            </TableHead>
                            <TableHead className="text-white">
                              Purpose
                            </TableHead>
                            <TableHead className="text-white">
                              Duration
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.examples.map((cookie, cookieIndex) => (
                            <TableRow
                              key={cookieIndex}
                              className="border-b border-gray-700"
                            >
                              <TableCell className="font-medium text-purple-400">
                                {cookie.name}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {cookie.purpose}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {cookie.duration}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Managing Cookies
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Most web browsers allow you to manage your cookie preferences.
                  You can set your browser to refuse cookies, or to alert you
                  when cookies are being sent. The help function within your
                  browser should tell you how to do this.
                </p>
                <p>
                  Please note that if you disable or refuse cookies, some parts
                  of our platform may not function properly.
                </p>
                {/* <p>
                  You can manage your cookie preferences on our platform by
                  clicking the "Cookie Settings" button below:
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-400/10 rounded-full"
                  >
                    Cookie Settings
                  </Button>
                </div> */}
                <p className="mt-4">
                  Below are links to instructions on how to manage cookies in
                  common web browsers:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <a
                      href="https://support.google.com/chrome/answer/95647"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      Google Chrome
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      Mozilla Firefox
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      Safari
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      Microsoft Edge
                    </a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Third-Party Cookies
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  In addition to our own cookies, we may also use various
                  third-party cookies to report usage statistics, deliver
                  advertisements, and so on. These cookies may be placed by:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Analytics providers (such as Google Analytics)</li>
                  <li>Advertising networks</li>
                  <li>Social media platforms</li>
                  <li>Content delivery networks</li>
                </ul>
                <p>
                  The privacy policies of these third parties may differ from
                  ours. We encourage you to read their privacy policies to
                  understand how they use cookies and how you can manage them.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Other Tracking Technologies
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Cookies are not the only way to recognize or track visitors to
                  a website. We may use other, similar technologies from time to
                  time, like web beacons (sometimes called "tracking pixels" or
                  "clear gifs"). These are tiny graphics files that contain a
                  unique identifier that enables us to recognize when someone
                  has visited our platform. This allows us, for example, to
                  monitor the traffic patterns of users from one page within our
                  platform to another, to deliver or communicate with cookies,
                  to understand whether you have come to our platform from an
                  online advertisement displayed on a third-party website, to
                  improve site performance, and to measure the success of email
                  marketing campaigns.
                </p>
                <p>
                  In many instances, these technologies are reliant on cookies
                  to function properly, and so declining cookies will impair
                  their functioning.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Changes to This Cookie Policy
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  We may update this Cookie Policy from time to time in order to
                  reflect changes to the cookies we use or for other
                  operational, legal, or regulatory reasons. Please therefore
                  revisit this Cookie Policy regularly to stay informed about
                  our use of cookies and related technologies.
                </p>
                <p>
                  The date at the top of this Cookie Policy indicates when it
                  was last updated.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900/40 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Have Questions About Our Cookie Policy?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Our privacy team is here to help you understand how we use cookies
            and answer any questions you may have.
          </p>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 rounded-full"
          >
            <Link to="/contact" className="flex items-center">
              Contact Us <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Add keyframes for floating animation */}
      <style
        // @ts-expect-error: 'jsx' prop not recognized by TypeScript for style tag, but needed for styled-jsx

        jsx
      >{`
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
