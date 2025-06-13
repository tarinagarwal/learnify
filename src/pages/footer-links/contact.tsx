"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would handle the form submission here
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const faqs = [
    {
      question: "How can I get support for technical issues?",
      answer:
        "For technical support, please email support@learnify.com with details of your issue. Our team typically responds within 24 hours on business days.",
    },
    {
      question: "Do you offer educational partnerships?",
      answer:
        "Yes, we partner with educational institutions, nonprofits, and businesses. Please select 'Partnership' in the contact form for more information.",
    },
    {
      question: "Can I request a custom learning solution?",
      answer:
        "We offer custom solutions for organizations. Select 'Enterprise' in the contact form and provide details about your needs.",
    },
    {
      question: "How do I apply for a job at Learnify?",
      answer: "We are not currently hiring.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      {/* Hero Section */}
      <section className="relative pt-24 py-20 md:py-32 bg-gradient-to-br from-gray-950 to-gray-900 overflow-hidden">
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 pb-4">
            Get in Touch
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300 leading-relaxed">
            Have questions or feedback? We'd love to hear from you. Our team is
            here to help with any inquiries you might have.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-gray-800 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Send Us a Message
                </h2>

                {formSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-purple-500/20 p-4 rounded-full mb-4">
                      <CheckCircle className="h-12 w-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      Message Sent!
                    </h3>
                    <p className="text-gray-400 max-w-md">
                      Thank you for reaching out. We've received your message
                      and will get back to you as soon as possible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="first-name"
                          className="text-sm font-medium text-gray-300"
                        >
                          First Name
                        </label>
                        <Input
                          id="first-name"
                          placeholder="John"
                          required
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="last-name"
                          className="text-sm font-medium text-gray-300"
                        >
                          Last Name
                        </label>
                        <Input
                          id="last-name"
                          placeholder="Doe"
                          required
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-300"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        required
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="inquiry-type"
                        className="text-sm font-medium text-gray-300"
                      >
                        Inquiry Type
                      </label>
                      <Select>
                        <SelectTrigger
                          id="inquiry-type"
                          className="bg-gray-700 border-gray-600 text-white focus:border-purple-400 focus:ring-purple-400"
                        >
                          <SelectValue placeholder="Select an inquiry type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="general">
                            General Question
                          </SelectItem>
                          <SelectItem value="support">
                            Technical Support
                          </SelectItem>
                          <SelectItem value="partnership">
                            Partnership
                          </SelectItem>
                          <SelectItem value="enterprise">
                            Enterprise Solution
                          </SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-sm font-medium text-gray-300"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you?"
                        rows={5}
                        required
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-purple-500/20 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1 text-white">
                      Email
                    </h3>
                    <p className="text-gray-400">tarinagarwal@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-500/20 p-3 rounded-full mr-4">
                    <MessageSquare className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1 text-white">
                      Live Chat
                    </h3>
                    <p className="text-gray-400">Available on our platform</p>
                    <p className="text-gray-400">
                      Mon-Fri, 24/7 for subscribers
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  >
                    <svg
                      className="h-5 w-5 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  >
                    <svg
                      className="h-5 w-5 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  >
                    <svg
                      className="h-5 w-5 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-300">
              Find quick answers to common questions about contacting us.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="bg-gray-800 hover:bg-gray-800/80 transition-all duration-300 border-none hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] overflow-hidden"
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {faq.question}
                  </h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900/40 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already using Learnify to achieve
            their educational goals.
          </p>
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
