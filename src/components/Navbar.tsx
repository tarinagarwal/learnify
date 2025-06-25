import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  UserCircle,
  LogOut,
  Menu,
  MessageSquare,
  Brain,
  GraduationCap,
  Home,
  History,
  FileText,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LucideMessageCircleQuestion,
  Route,
  ChevronDown,
  Users,
  Languages,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeButton from "@/components/ui/ThemeButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "../store/languageStore";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "pa", label: "Punjabi" },
  { code: "or", label: "Odia" },
  { code: "as", label: "Assamese" },
  { code: "ur", label: "Urdu" },
  // Add more as needed
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [isExpert, setIsExpert] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        const { data: expertData } = await supabase
          .from("experts")
          .select("name")
          .eq("email", user.email)
          .maybeSingle();

        if (expertData) {
          setIsExpert(true);
          setUserName(expertData.name);
        } else {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single();

          if (profileData) {
            setUserName(profileData.name);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUserName("");
        setIsExpert(false);
      }
    };

    fetchUserProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        fetchUserProfile();
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUserName("");
        setIsExpert(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Desktop NavLink
  const NavLink = ({
    to,
    icon: Icon,
    children,
  }) => {
    const isActive =
      to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

    return (
      <Link
        to={to}
        className={cn(
          "flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors relative group py-2 px-3 rounded-md",
          isActive && "text-primary font-medium"
        )}
        onClick={() => setIsOpen(false)}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{children}</span>
        {isActive && (
          <span className="absolute bottom-0 left-1 w-[75%] h-0.5 bg-primary scale-x-100 transition-transform duration-300 ease-out" />
        )}
      </Link>
    );
  };

  // Mobile NavLink
  const MobileNavLink = ({
    to,
    icon: Icon,
    children,
  }) => {
    const isActive =
      to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

    return (
      <Link
        to={to}
        className={cn(
          "flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors relative group py-3 px-4 rounded-md hover:bg-muted/50",
          isActive && "text-primary font-medium bg-muted/30"
        )}
        onClick={() => setIsOpen(false)}
      >
        {Icon && <Icon className="h-5 w-5" />}
        <span className="text-base">{children}</span>
      </Link>
    );
  };

  const navGroups = [
    {
      title: "Learn",
      links: [
        { to: "/courses", icon: GraduationCap, label: "Courses" },
        { to: "/roadmaps", icon: Route, label: "Roadmaps" },
        { to: "/resources", icon: FileText, label: "Resources" },
      ],
    },
    {
      title: "Tools",
      links: [
        { to: "/dashboard", icon: LayoutDashboard, label: "Notebooks" },
        { to: "/pdf-chat", icon: MessageSquare, label: "PDF Chat" },
        { to: "/quiz", icon: LucideMessageCircleQuestion, label: "Quiz" },
        { to: "/history", icon: History, label: "Quiz History" },
        { to: "/language-tutor", icon: Languages, label: "Language Tutor" },
      ],
    },
    {
      title: "Connect",
      links: [{ to: "/community", icon: Users, label: "Community" }],
    },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-lg border-b border-border shadow-lg"
          : "bg-background backdrop-blur-lg border-b border-border shadow-lg"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">
                Learnify
              </span>
            </Link>
          </div>

          {/* LANGUAGE DROPDOWN - Always visible */}
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Languages className="h-4 w-4" />
                  <span>{LANGUAGES.find(l => l.code === language)?.label || "Language"}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "cursor-pointer",
                      language === lang.code && "bg-muted text-primary"
                    )}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isAuthenticated ? (
            <>
              {/* DESKTOP NAV LINKS */}
              <div className="hidden lg:flex lg:items-center lg:space-x-1">
                <NavLink to="/" icon={Home}>
                  Home
                </NavLink>
                {navGroups.map((group) => {
                  const isGroupActive = group.links.some(link =>
                    location.pathname.startsWith(link.to)
                  );
                  return (
                    <DropdownMenu key={group.title}>
                      <DropdownMenuTrigger asChild>
                        <div
                          className={cn(
                            "flex items-center space-x-1 hover:text-primary transition-colors relative group py-2 px-3 rounded-md cursor-pointer",
                            isGroupActive ? "text-primary font-medium" : "text-muted-foreground"
                          )}
                        >
                          <span>{group.title}</span>
                          <ChevronDown className="h-4 w-4 opacity-70" />
                          {isGroupActive && (
                            <span className="absolute bottom-0 left-1 w-[75%] h-0.5 bg-primary scale-x-100 transition-transform duration-300 ease-out" />
                          )}
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className={cn(
                          "border border-border bg-card/90 backdrop-blur-sm transition-colors",
                          isGroupActive ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">{group.title}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border" />
                        {group.links.map((link) => {
                          const isLinkActive = location.pathname.startsWith(link.to);
                          return (
                            <DropdownMenuItem
                              key={link.to}
                              asChild
                              className={cn(
                                "cursor-pointer",
                                isLinkActive ? "bg-muted text-primary" : "text-card-foreground",
                                "focus:bg-muted focus:text-primary"
                              )}
                            >
                              <Link
                                to={link.to}
                                className="flex items-center space-x-2 hover:text-primary"
                                onClick={() => setIsOpen(false)}
                              >
                                {link.icon && <link.icon className="h-4 w-4" />}
                                <span>{link.label}</span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
              </div>

              {/* USER ACTIONS & MOBILE MENU TOGGLE */}
              <div className="flex items-center space-x-1">
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${userName}.png`}
                          alt={userName}
                        />
                        <AvatarFallback className="bg-muted text-primary">
                          {userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-card/90 backdrop-blur-sm border border-border"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-card-foreground">
                          {userName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {isExpert ? "Expert" : "Student"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      className="focus:bg-muted focus:text-primary cursor-pointer text-card-foreground"
                      onClick={() => navigate("/profile")}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      className="focus:bg-muted focus:text-destructive cursor-pointer text-card-foreground"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* MOBILE MENU BUTTON */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="default"
                      size="icon"
                      className="lg:hidden text-muted-foreground hover:text-primary rounded-full"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[85%] sm:w-[350px] bg-card/90 backdrop-blur-sm border-l border-border p-0"
                  >
                    <div className="flex flex-col h-full">
                      {/* Header with user info */}
                      <div className="p-4 border-b border-border bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 border-2 border-primary">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${userName}.png`}
                              alt={userName}
                            />
                            <AvatarFallback className="bg-muted text-primary">
                              {userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-card-foreground font-medium">
                              {userName}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {isExpert ? "Expert" : "Student"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Navigation links */}
                      <div className="flex-1 overflow-auto py-4 px-2">
                        <MobileNavLink to="/" icon={Home}>
                          Home
                        </MobileNavLink>
                        {navGroups.map((group) => (
                          <div key={group.title} className="mt-6">
                            <h4 className="text-xs uppercase text-muted-foreground font-semibold px-4 mb-2">
                              {group.title}
                            </h4>
                            <div className="space-y-1">
                              {group.links.map((link) => (
                                <MobileNavLink
                                  key={link.to}
                                  to={link.to}
                                  icon={link.icon}
                                >
                                  {link.label}
                                </MobileNavLink>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Footer with actions */}
                      <div className="p-4 border-t border-border bg-muted/30">
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full bg-card hover:bg-muted text-card-foreground border-border hover:text-destructive"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <ThemeButton />
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                asChild
                className="text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full px-3 sm:px-4"
              >
                <Link to="/login" className="flex items-center">
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-3 sm:px-6"
              >
                <Link to="/signup" className="flex items-center">
                  <UserPlus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </Button>
              <ThemeButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
