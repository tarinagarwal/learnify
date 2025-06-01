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
  // Search,
  // Bell,
  // Settings,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [isExpert, setIsExpert] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
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

  // Our custom link for standard nav items
  const NavLink = ({
    to,
    icon: Icon,
    children,
  }: {
    to: string;
    icon?: React.ElementType;
    children: React.ReactNode;
  }) => {
    const isActive =
      to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

    return (
      <Link
        to={to}
        className={cn(
          "flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors relative group py-2 px-3 rounded-md",
          isActive && "text-purple-400 font-medium"
        )}
        onClick={() => setIsOpen(false)}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{children}</span>
        {isActive && (
          <span className="absolute bottom-0 left-1 w-[75%] h-0.5 bg-purple-400 scale-x-100 transition-transform duration-300 ease-out" />
        )}
      </Link>
    );
  };


  // Mobile nav link with more padding and larger icons
  const MobileNavLink = ({
    to,
    icon: Icon,
    children,
  }: {
    to: string;
    icon?: React.ElementType;
    children: React.ReactNode;
  }) => {
    const isActive =
      to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

    return (
      <Link
        to={to}
        className={cn(
          "flex items-center space-x-3 text-gray-300 hover:text-purple-400 transition-colors relative group py-3 px-4 rounded-md hover:bg-gray-800/50",
          isActive && "text-purple-400 font-medium bg-gray-800/30"
        )}
        onClick={() => setIsOpen(false)}
      >
        {Icon && <Icon className="h-5 w-5" />}
        <span className="text-base">{children}</span>
      </Link>
    );
  };

  // Group our nav links for better organization
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
          ? "bg-gray-900/90 backdrop-blur-lg border-b border-[#777696] shadow-lg"
          : "bg-gray-900 backdrop-blur-lg border-b border-[#777696] shadow-lg"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold text-purple-500">
                Learnify
              </span>
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              {/* DESKTOP NAV LINKS - Now with better organization */}
              <div className="hidden lg:flex lg:items-center lg:space-x-1">
                <NavLink to="/" icon={Home}>
                  Home
                </NavLink>


                {/* Group navigation links into categories with dropdowns */}
                {navGroups.map((group) => {
  // Is any link inside this group active?
  const isGroupActive = group.links.some(link =>
    location.pathname.startsWith(link.to)
  );

  return (
    <DropdownMenu key={group.title}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "flex items-center space-x-1 hover:text-purple-400 transition-colors relative group py-2 px-3 rounded-md cursor-pointer",
            isGroupActive ? "text-purple-400 font-medium" : "text-gray-300"
          )}
        >
          <span>{group.title}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
          {isGroupActive && (
            <span className="absolute bottom-0 left-1 w-[75%] h-0.5 bg-purple-400 scale-x-100 transition-transform duration-300 ease-out" />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          "border border-gray-800 transition-colors",
          isGroupActive ? "bg-gray-800 text-purple-400" : "bg-gray-900 text-gray-300"
        )}
      >
        <DropdownMenuLabel className="text-xs text-gray-500">{group.title}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800" />
        {group.links.map((link) => {
          const isLinkActive = location.pathname.startsWith(link.to);
          return (
            <DropdownMenuItem
              key={link.to}
              asChild
              className={cn(
                "cursor-pointer",
                isLinkActive ? "bg-gray-700 text-purple-400" : "text-gray-300",
                "focus:bg-gray-800 focus:text-purple-400"
              )}
            >
              <Link
                to={link.to}
                className="flex items-center space-x-2 hover:text-purple-400"
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
                {/* Action buttons */}

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full overflow-hidden border border-gray-700 hover:border-purple-400 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${userName}.png`}
                          alt={userName}
                        />
                        <AvatarFallback className="bg-gray-800 text-purple-400">
                          {userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-gray-900 border border-gray-800"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">
                          {userName}
                        </p>
                        <p className="text-xs leading-none text-gray-400">
                          {isExpert ? "Expert" : "Student"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      className="focus:bg-gray-800 focus:text-purple-400 cursor-pointer text-gray-300"
                      onClick={() => navigate("/profile")}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      className="focus:bg-gray-800 focus:text-purple-400 cursor-pointer text-gray-300"
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
                      className="lg:hidden text-gray-400 hover:text-purple-400 rounded-full"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[85%] sm:w-[350px] bg-gray-900 border-l border-gray-800 p-0"
                  >
                    <div className="flex flex-col h-full">
                      {/* Header with user info */}
                      <div className="p-4 border-b border-gray-800 bg-gray-950">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 border-2 border-purple-500">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${userName}.png`}
                              alt={userName}
                            />
                            <AvatarFallback className="bg-gray-800 text-purple-400">
                              {userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-white font-medium">
                              {userName}
                            </h3>
                            <p className="text-xs text-gray-400">
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

                        {/* Group navigation by categories */}
                        {navGroups.map((group) => (
                          <div key={group.title} className="mt-6">
                            <h4 className="text-xs uppercase text-gray-500 font-semibold px-4 mb-2">
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
                      <div className="p-4 border-t border-gray-800 bg-gray-950">
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            /* IF NOT AUTHENTICATED */
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                asChild
                className="text-gray-300 hover:text-purple-400 hover:bg-gray-800/50 rounded-full px-3 sm:px-4"
              >
                <Link to="/login" className="flex items-center">
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
              <Button
                asChild
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-3 sm:px-6"
              >
                <Link to="/signup" className="flex items-center">
                  <UserPlus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
