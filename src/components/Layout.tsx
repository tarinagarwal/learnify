import React, { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import AIKnowledgeBot from "./AIKnowledgeBot";
import ScrollToTopButton from "./ScrollToTop";

// ScrollToTop component for route changes
function ScrollToTopOnRoute() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <ScrollToTopOnRoute />

      <main className="flex-grow pt-16 bg-background">
        <Outlet />
      </main>
      
      {/* Floating scroll to top button */}
      <ScrollToTopButton scrollDistance={300} position="bottom-right" size="md" />

      {/* AI Knowledge Bot - Replaces the Zapier chatbot */}
      <AIKnowledgeBot />

      <footer className="bg-card border-t border-border text-muted-foreground py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-foreground text-lg font-semibold mb-4">Learnify</h3>
            <p className="mb-4 text-muted-foreground">
              Transforming education through AI and interactive learning
              experiences.
            </p>
            <div className="flex space-x-4">
              {/* Social icons would go here */}
            </div>
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/quiz"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Interactive Quizzes
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  PDF Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/roadmaps"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Learning Roadmaps
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://tarinagarwal.in/"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Developer
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} Learnify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
