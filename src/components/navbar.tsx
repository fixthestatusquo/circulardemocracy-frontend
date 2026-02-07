import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button"; // Re-import Button for logout

export function Navbar() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Optionally redirect or show a message
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <NavigationMenu className="fixed top-0 left-0 w-full max-w-none flex items-center justify-between p-4 border-b border-gray-200 z-50 bg-white">
      <div className="flex items-center">
        <img src={logo} alt="Circular Democracy Logo" className="h-8" />
      </div>
      <NavigationMenuList className="flex items-center space-x-4">
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="font-medium text-gray-700 hover:text-gray-900">
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="font-medium text-gray-700 hover:text-gray-900">
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="font-medium text-gray-700 hover:text-gray-900">
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
        {!user && (
          <NavigationMenuItem>
            <NavigationMenuLink href="/register" className="font-medium text-gray-700 hover:text-gray-900">
              Register
            </NavigationMenuLink>
          </NavigationMenuItem>
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
