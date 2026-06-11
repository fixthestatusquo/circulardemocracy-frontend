import { useState } from "react";
import {
  BarChart3,
  Inbox,
  LogIn,
  LogOut,
  Megaphone,
  Search,
  User,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile"; // Import useProfile hook

function NavbarContent() {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setSearchOpen(false);
      setSearchQuery("");
      navigate(`/search?query=${encodeURIComponent(q)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const displayUserName = profile?.firstname || "Guest";

  return (
    <NavigationMenuList className="flex items-center space-x-2 md:space-x-4">
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link
            to="/campaigns"
            className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
            title="Campaigns"
          >
            <Megaphone className="h-5 w-5" />
            <span className="hidden md:inline">Campaigns</span>
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link
            to="/unclassified"
            className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
            title="Unclassified"
          >
            <Inbox className="h-5 w-5" />
            <span className="hidden md:inline">Unclassified</span>
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setSearchOpen(true); }}
            className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
            title="Search"
          >
            <Search className="h-5 w-5" />
            <span className="hidden md:inline">Search</span>
          </a>
        </NavigationMenuLink>

        <AlertDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Search messages</AlertDialogTitle>
            </AlertDialogHeader>
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Email or sender name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSearchOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!searchQuery.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </NavigationMenuItem>
      {/* Team link hidden for now */}

      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link
            to="/analytics"
            className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
            title="Analytics"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="hidden md:inline">Analytics</span>
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link
            to="/politician"
            className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
            title="Profile"
          >
            <User className="h-5 w-5" />
            <span className="hidden md:inline">Profile</span>
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Button
          variant="ghost"
          onClick={handleLogout}
          title={`Logout (${displayUserName})`}
          className="flex items-center gap-2 px-2 md:px-3"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </NavigationMenuItem>
    </NavigationMenuList>
  );
}

export function Navbar() {
  const { user: authUser } = useAuth();

  return (
    <NavigationMenu className="fixed top-0 left-0 w-full max-w-none flex items-center justify-between p-4 border-b border-gray-200 z-50 bg-white">
      <div className="flex items-center">
        <Link
          to="/"
          className="flex items-center space-x-2 dark:text-white text-2xl md:text-xl ml-2 rtl:ml-0 rtl:mr-2 self-center text-gray-900 whitespace-nowrap"
        >
          <img src={logo} alt="Circular Democracy Logo" className="h-8" />
          <span className="font-bold hidden md:block">Circular Democracy</span>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {authUser ? (
          <NavbarContent />
        ) : (
          <NavigationMenuList className="flex items-center space-x-2 md:space-x-4">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/login"
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                  title="Login"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="hidden md:inline">Login</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/register"
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
                  title="Register"
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="hidden md:inline">Register</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        )}
      </div>
    </NavigationMenu>
  );
}
