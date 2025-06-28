"use client";

import { Link } from "react-router-dom";
import { Users, Target, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Tarin Agarwal",
      role: "Lead Developer",
      bio: "Hi, I'm a developer passionate about exploring and creating in the tech space.",
      image: "/placeholder.svg?height=300&width=300",
    },
    // {
    //   name: "Michael Chen",
    //   role: "CTO",
    //   bio: "Ex-Google engineer specializing in machine learning and educational technology systems.",
    //   image: "/placeholder.svg?height=300&width=300",
    // },
    // {
    //   name: "Priya Sharma",
    //   role: "Head of Content",
    //   bio: "EdTech veteran with 10+ years experience in curriculum development and instructional design.",
    //   image: "/placeholder.svg?height=300&width=300",
    // },
    // {
    //   name: "James Wilson",
    //   role: "Head of Community",
    //   bio: "Community builder focused on creating supportive learning environments for diverse learners.",
    //   image: "/placeholder.svg?height=300&width=300",
    // },
  ];

  const values = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Innovation",
      description:
        "We constantly push the boundaries of what's possible in educational technology.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Inclusivity",
      description:
        "We design our platform to be accessible and valuable for learners of all backgrounds.",
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Impact",
      description:
        "We measure our success by the positive difference we make in our users' learning journeys.",
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Excellence",
      description:
        "We strive for the highest quality in our content, technology, and user experience.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-24 py-20 md:py-32 bg-gradient-to-br from-muted to-primary/10 overflow-hidden">
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary pb-4">
            About Learnify
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            We're on a mission to transform education through AI-powered
            technology, making high-quality learning accessible to everyone,
            everywhere.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  At Learnify, we believe that education is a dynamic
                  journey—one that should evolve with the learner. Born from a
                  vision to redefine how we absorb and apply knowledge in the
                  digital age, Learnify merges innovative technology with an
                  unwavering commitment to community. We know that traditional
                  education often falls short of today's needs, and that's why
                  we're here to transform the learning experience.
                </p>
                <p>
                  Our platform is built on the power of artificial intelligence
                  and interactive design. By integrating tools like interactive
                  quizzes, immersive course modules, and tailored learning
                  roadmaps, we create a personalized educational environment
                  that adapts to your unique needs. Every feature—from advanced
                  PDF analysis to collaborative whiteboards—is designed to
                  engage you, foster deeper understanding, and empower your
                  growth.
                </p>
                <p>
                  Learnify is more than just a learning management system; it's
                  a vibrant community of educators, experts, and learners united
                  by a common passion for discovery. We provide the resources
                  and support necessary to not only master new skills but also
                  to apply them in real-world contexts. Whether you're a
                  student, professional, or lifelong learner, our innovative
                  approach ensures that you stay ahead in an ever-changing
                  world.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/10 blur-xl opacity-50"></div>
              <div className="relative rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border">
                <img
                  src="https://i.ibb.co/kggmmwrf/image.png"
                  width={800}
                  height={600}
                  alt="Learnify team working together"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Our Values</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              These core principles guide everything we do at Learnify, from
              product development to customer support.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="relative group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="bg-primary/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4 shadow-sm group-hover:shadow-lg transition-shadow">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Our Leadership Team
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Meet the passionate experts behind Learnify who are dedicated to
              transforming education.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
              {teamMembers.map((member, index) => (
                <div key={index} className="group flex flex-col items-center text-center justify-center">
                  <a href="https://tarinagarwal.in/home" target="_blank" rel="noopener noreferrer" className="block w-full">
                    <div className="relative mb-4 overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border w-full flex justify-center">
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img
                        src={member.image}
                        width={300}
                        height={300}
                        alt={member.name}
                        className="w-full h-auto aspect-square object-cover max-w-[300px] mx-auto"
                      />
                    </div>
                  </a>
                  <h3 className="text-xl font-semibold text-card-foreground mt-2">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium">{member.role}</p>
                  <p className="mt-2 text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/20 to-muted text-foreground overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
            Join Us on Our Mission
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the education revolution. Start learning with Learnify
            today or explore opportunities to join our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary text-primary hover:bg-primary/10 rounded-full"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
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
