"use client";

import { useState, useEffect } from "react";
import {
  Route,
  Plus,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { generateRoadmap } from "../services/groq";
import type { Roadmap } from "../types/roadmap";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchBar } from "@/components/SearchBar";
//import { useNavigate } from "react-router-dom"; currently un used hence commented
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Translate } from "../components/Translate";

export default function Roadmaps() {
  // const navigate = useNavigate(); commented as was not used and causing eslint error 
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "my-roadmaps"

 
  useEffect(() => {
    fetchRoadmaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchRoadmaps = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase.from("roadmaps").select("*");

      // Filter by user_id if on "my-roadmaps" tab
      if (activeTab === "my-roadmaps") {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setRoadmaps(data || []);
    } catch (err) {
      console.error("Error fetching roadmaps:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoadmap = async () => {
    if (!topic.trim()) return;

    try {
      setGenerating(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Generate roadmap via GROQ
      const roadmapContent = await generateRoadmap(topic);

      // Validate roadmap content structure
      if (
        !roadmapContent ||
        !roadmapContent.stages ||
        !Array.isArray(roadmapContent.stages)
      ) {
        throw new Error("Invalid roadmap structure received");
      }

      // Insert roadmap
      const { error: roadmapError } = await supabase.from("roadmaps").insert({
        title: roadmapContent.title || `Roadmap: ${topic}`,
        description:
          roadmapContent.description || `Learning roadmap for ${topic}`,
        content: roadmapContent,
        user_id: user.id,
      });

      if (roadmapError) throw roadmapError;

      setTopic("");
      fetchRoadmaps();
    } catch (error) {
      console.error("Error creating roadmap:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create roadmap"
      );
    } finally {
      setGenerating(false);
    }
  };

  const filteredRoadmaps = roadmaps.filter(
    (roadmap) =>
      roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roadmap.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>
          <p className="mt-6 text-xl text-foreground">Loading Roadmaps...</p>
        </div>
      </div>
    );
  }

  const renderStages = (stages: unknown[] = []) => {
    if (!Array.isArray(stages) || stages.length === 0) {
      return (
        <Card className="text-center p-8 bg-card border-border">
          <CardContent>
            <p className="text-muted-foreground">
              No stages available for this roadmap.
            </p>
          </CardContent>
        </Card>
      );
    }

    return stages.map((stage, index) => (
      <div
        key={index}
        className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border"
      >
        <div className="flex items-center gap-4 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              stage.level === "Beginner"
                ? "bg-green-900/50 text-green-300 border border-green-700"
                : stage.level === "Intermediate"
                ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                : "bg-red-900/50 text-red-300 border border-red-700"
            }`}
          >
            {stage.level}
          </span>
          <h2 className="text-xl font-semibold text-card-foreground">{stage.title}</h2>
        </div>

        <p className="text-muted-foreground mb-6">{stage.description}</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Skills */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(stage.skills) &&
                  stage.skills.map((skill: unknown, i: number) => (
                    <div key={i}>
                      <h4 className="font-medium text-card-foreground">
                        {skill.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {skill.description}
                      </p>
                      <p className="text-sm text-primary mt-1">
                        Why it matters: {skill.importance}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Learning Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(stage.resources) &&
                  stage.resources.map((resource: unknown, i: number) => (
                    <div
                      key={i}
                      className="border-b border-border pb-4 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-card-foreground">
                          {resource.url ? (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {resource.name}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            resource.name
                          )}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            resource.cost === "Free"
                              ? "bg-green-900/50 text-green-300 border border-green-700"
                              : "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                          }`}
                        >
                          {resource.cost}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {resource.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          {resource.format}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          {resource.difficulty}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          {resource.estimated_time}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">
            Practice Projects
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.isArray(stage.projects) &&
              stage.projects.map((project: unknown, i: number) => (
                <Card
                  key={i}
                  className="bg-card border-border"
                >
                  <CardHeader>
                    <CardTitle className="text-card-foreground">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-card-foreground">
                          Learning Objectives
                        </h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {Array.isArray(project.learning_objectives) &&
                            project.learning_objectives.map(
                              (obj: string, j: number) => (
                                <li key={j} className="text-sm text-muted-foreground">
                                  {obj}
                                </li>
                              )
                            )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-card-foreground">
                          Key Features
                        </h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {Array.isArray(project.features) &&
                            project.features.map(
                              (feature: string, j: number) => (
                                <li key={j} className="text-sm text-muted-foreground">
                                  {feature}
                                </li>
                              )
                            )}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(project.skills_practiced) &&
                          project.skills_practiced.map(
                            (skill: string, j: number) => (
                              <span
                                key={j}
                                className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            )
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Best Practices & Pitfalls */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(stage.best_practices) &&
                  stage.best_practices.map((practice: unknown, i: number) => (
                    <div key={i}>
                      <h4 className="font-medium text-card-foreground">
                        {practice.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {practice.description}
                      </p>
                      <div className="mt-2 space-y-1">
                        {Array.isArray(practice.examples) &&
                          practice.examples.map(
                            (example: string, j: number) => (
                              <p
                                key={j}
                                className="text-sm bg-muted p-2 rounded text-muted-foreground"
                              >
                                {example}
                              </p>
                            )
                          )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Common Pitfalls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(stage.common_pitfalls) &&
                  stage.common_pitfalls.map((pitfall: unknown, i: number) => (
                    <div key={i}>
                      <h4 className="font-medium text-red-400">
                        {pitfall.issue}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Solution: {pitfall.solution}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {selectedRoadmap ? (
          <>
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => setSelectedRoadmap(null)}
                className="mb-4 text-muted-foreground hover:text-primary hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Roadmaps
              </Button>

              <div className="bg-card/50 backdrop-blur-sm border-border rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-2 text-card-foreground">
                  {selectedRoadmap.content?.title || "Untitled Roadmap"}
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  {selectedRoadmap.content?.description ||
                    "No description available"}
                </p>

                <Tabs defaultValue="stages" className="w-full">
                  <TabsList className="w-full justify-start bg-muted">
                    <TabsTrigger
                      value="stages"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
                    >
                      Learning Path
                    </TabsTrigger>
                    <TabsTrigger
                      value="tools"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
                    >
                      Tools
                    </TabsTrigger>
                    <TabsTrigger
                      value="certifications"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
                    >
                      Certifications
                    </TabsTrigger>
                    <TabsTrigger
                      value="career"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
                    >
                      Career Path
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="stages" className="mt-6">
                    <div className="space-y-12">
                      {renderStages(selectedRoadmap.content?.stages)}
                    </div>
                  </TabsContent>

                  <TabsContent value="tools" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {Array.isArray(selectedRoadmap.content?.tools) &&
                        selectedRoadmap.content.tools.map(
                          (tool: unknown, index: number) => (
                            <Card
                              key={index}
                              className="bg-card border-border"
                            >
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-card-foreground">
                                    {tool.name}
                                  </CardTitle>
                                  <span className="text-sm bg-muted px-2 py-1 rounded text-muted-foreground">
                                    {tool.category}
                                  </span>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {tool.description}
                                </p>
                                <a
                                  href={tool.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1 mb-4"
                                >
                                  Official Documentation
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2 text-card-foreground">
                                      Setup Guide
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {tool.setup_guide}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2 text-card-foreground">
                                      Pros
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                      {Array.isArray(tool.pros) &&
                                        tool.pros.map(
                                          (pro: string, i: number) => (
                                            <li
                                              key={i}
                                              className="text-sm text-muted-foreground"
                                            >
                                              {pro}
                                            </li>
                                          )
                                        )}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2 text-card-foreground">
                                      Cons
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                      {Array.isArray(tool.cons) &&
                                        tool.cons.map(
                                          (con: string, i: number) => (
                                            <li
                                              key={i}
                                              className="text-sm text-muted-foreground"
                                            >
                                              {con}
                                            </li>
                                          )
                                        )}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2 text-card-foreground">
                                      Alternatives
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {Array.isArray(tool.alternatives) &&
                                        tool.alternatives.map(
                                          (alt: string, i: number) => (
                                            <span
                                              key={i}
                                              className="px-2 py-1 bg-muted rounded text-sm text-muted-foreground"
                                            >
                                              {alt}
                                            </span>
                                          )
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        )}
                    </div>
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {Array.isArray(selectedRoadmap.content?.certifications) &&
                        selectedRoadmap.content.certifications.map(
                          (cert: unknown, index: number) => (
                            <Card
                              key={index}
                              className="bg-card border-border"
                            >
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-card-foreground">
                                    {cert.name}
                                  </CardTitle>
                                  <span
                                    className={`text-sm px-2 py-1 rounded ${
                                      cert.level === "Beginner"
                                        ? "bg-green-900/50 text-green-300 border border-green-700"
                                        : cert.level === "Intermediate"
                                        ? "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                                        : "bg-red-900/50 text-red-300 border border-red-700"
                                    }`}
                                  >
                                    {cert.level}
                                  </span>
                                </div>
                                <CardDescription className="text-muted-foreground">
                                  {cert.provider}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {cert.description}
                                </p>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-card-foreground">
                                      Cost:
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {cert.cost}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-card-foreground">
                                      Validity:
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {cert.validity}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2 text-card-foreground">
                                      Preparation Resources
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                      {Array.isArray(
                                        cert.preparation_resources
                                      ) &&
                                        cert.preparation_resources.map(
                                          (resource: string, i: number) => (
                                            <li
                                              key={i}
                                              className="text-sm text-muted-foreground"
                                            >
                                              {resource}
                                            </li>
                                          )
                                        )}
                                    </ul>
                                  </div>
                                  <a
                                    href={cert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    Learn More
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        )}
                    </div>
                  </TabsContent>

                  <TabsContent value="career" className="mt-6">
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-card-foreground">
                          Career Progression Path
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-card-foreground">
                              Possible Roles
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(
                                selectedRoadmap.content?.career_path?.roles
                              ) &&
                                selectedRoadmap.content.career_path.roles.map(
                                  (role: unknown, i: number) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full"
                                    >
                                      {typeof role === "string"
                                        ? role
                                        : role.name || "Unknown Role"}
                                    </span>
                                  )
                                )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-card-foreground">
                              Required Skills
                            </h3>
                            <div className="grid gap-2 md:grid-cols-2">
                              {Array.isArray(
                                selectedRoadmap.content?.career_path
                                  ?.skills_required
                              ) &&
                                selectedRoadmap.content.career_path.skills_required.map(
                                  (skill: unknown, i: number) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2 bg-muted p-2 rounded"
                                    >
                                      <span className="text-sm text-foreground">
                                        {typeof skill === "string"
                                          ? skill
                                          : skill.name || "Unknown Skill"}
                                      </span>
                                      {typeof skill !== "string" &&
                                        skill.description && (
                                          <span className="text-xs text-muted-foreground">
                                            - {skill.description}
                                          </span>
                                        )}
                                    </div>
                                  )
                                )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-card-foreground">
                              Career Progression
                            </h3>
                            <div className="space-y-4">
                              {Array.isArray(
                                selectedRoadmap.content?.career_path
                                  ?.progression
                              ) &&
                                selectedRoadmap.content.career_path.progression.map(
                                  (step: string, i: number) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-4"
                                    >
                                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                        {i + 1}
                                      </span>
                                      <span className="text-foreground">
                                        {step}
                                      </span>
                                    </div>
                                  )
                                )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-card-foreground">
                              Salary Range
                            </h3>
                            <p className="text-lg font-medium text-primary">
                              {selectedRoadmap.content?.career_path
                                ?.salary_range || "Not available"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Page Header with animated background */}
            <div className="relative py-16 px-4 sm:px-6 lg:px-8 mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-primary/10">
              {/* Animated grid background */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
              </div>
              <div className="relative z-10 text-center">
                <Route className="mx-auto h-16 w-16 text-primary" />
                <h2 className="mt-2 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-foreground to-primary">
                  <Translate>Learning Roadmaps</Translate>
                </h2>
                <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
                  <Translate>Follow structured learning paths with detailed guides for any technology or skill.</Translate>
                </p>
              </div>
            </div>

            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search roadmaps..."
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <TabsList className="bg-muted">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
                    >
                      All Roadmaps
                    </TabsTrigger>
                    <TabsTrigger
                      value="my-roadmaps"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
                    >
                      My Roadmaps
                    </TabsTrigger>
                  </TabsList>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      <Translate>Create New Roadmap</Translate>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border text-card-foreground">
                    <DialogHeader>
                      <DialogTitle className="text-card-foreground">
                        <Translate>New Roadmap</Translate>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="topic" className="text-muted-foreground">
                          <Translate>Title</Translate>
                        </Label>
                        <Input
                          id="topic"
                          placeholder="e.g., React Development, Web Development"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="bg-input border-border text-foreground focus:ring-primary focus:border-primary"
                        />
                        {error && (
                          <p className="text-sm text-red-400 mt-1">{error}</p>
                        )}
                      </div>
                      <Button
                        onClick={handleCreateRoadmap}
                        disabled={generating || !topic.trim()}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Roadmap...
                          </>
                        ) : (
                          <Translate>Create</Translate>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredRoadmaps.length === 0 ? (
                <Card className="text-center p-8 bg-card border-border">
                  <CardContent>
                    <Route className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-xl text-card-foreground">No roadmaps found</p>
                    <p className="mt-2 text-muted-foreground">
                      Try a different search term or create a new roadmap
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRoadmaps.map((roadmap) => (
                    <Card
                      key={roadmap.id}
                      className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:ring-2 hover:ring-primary/20 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedRoadmap(roadmap)}
                    >
                      <CardHeader>
                        <CardTitle className="text-card-foreground">
                          {roadmap.content?.title || "Untitled Roadmap"}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {roadmap.content?.description ||
                            "No description available"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Array.isArray(roadmap.content?.stages) &&
                            roadmap.content.stages.map(
                              (stage: unknown, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      stage.level === "Beginner"
                                        ? "bg-green-500"
                                        : stage.level === "Intermediate"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {stage.title}
                                  </span>
                                </div>
                              )
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </Tabs>
          </>
        )}
      </div>

      {/* Animation keyframes */}
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
