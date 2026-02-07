import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom"; // Import Link

export function Navbar() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Optionally redirect or show a message, Navigate will handle it via AuthProvider
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <NavigationMenu className="fixed top-0 left-0 w-full max-w-none flex items-center justify-between p-4 border-b border-gray-200 z-50 bg-white">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2 dark:text-white text-2xl md:text-xl ml-2 rtl:ml-0 rtl:mr-2 self-center text-gray-900 whitespace-nowrap">
          <img src={logo} alt="Circular Democracy Logo" className="h-8" />
          <span className="font-bold hidden md:block">Circular Democracy</span>
        </Link>
      </div>
      <NavigationMenuList className="flex items-center space-x-4">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/" className="font-medium text-gray-700 hover:text-gray-900">
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/about" className="font-medium text-gray-700 hover:text-gray-900">
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/contact" className="font-medium text-gray-700 hover:text-gray-900">
              Contact
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {!user && (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/login" className="font-medium text-gray-700 hover:text-gray-900">
                  Login
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/register" className="font-medium text-gray-700 hover:text-gray-900">
                  Register
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
        {user && (
          <NavigationMenuItem>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
