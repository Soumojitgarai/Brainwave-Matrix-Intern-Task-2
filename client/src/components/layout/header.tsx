import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { 
  ShoppingBag,
  Menu,
  Search,
  ShoppingCart,
  ChevronDown,
  Shirt,
  Laptop,
  Home as HomeIcon,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import CartDrawer from "@/components/cart/cart-drawer";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { cartItemsCount, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Handle scroll event to apply shadow on header when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className={`bg-white sticky top-0 z-50 ${isScrolled ? 'shadow-sm' : ''}`}>
      {/* Top banner */}
      <div className="bg-primary text-white text-center py-2 text-sm">
        <p>Free shipping on orders over $50 | Use code WELCOME10 for 10% off your first order</p>
      </div>
      
      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center">
              <span className="sr-only">ShopEase</span>
              <ShoppingBag className="h-6 w-6 text-primary mr-2" />
              <span className="font-heading font-bold text-xl text-gray-900">ShopEase</span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 -my-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="py-4">
                  <Link href="/">
                    <SheetClose className="flex items-center mb-6">
                      <ShoppingBag className="h-6 w-6 text-primary mr-2" />
                      <span className="font-heading font-bold text-xl text-gray-900">ShopEase</span>
                    </SheetClose>
                  </Link>
                  <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>
                  <nav className="flex flex-col space-y-4">
                    <SheetClose asChild>
                      <Link href="/" className="text-base font-medium text-gray-900 hover:text-primary py-2">
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/products" className="text-base font-medium text-gray-900 hover:text-primary py-2">
                        All Products
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/products?category=Clothing" className="text-base font-medium text-gray-900 hover:text-primary py-2">
                        Clothing
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/products?category=Electronics" className="text-base font-medium text-gray-900 hover:text-primary py-2">
                        Electronics
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/products?category=Home & Kitchen" className="text-base font-medium text-gray-900 hover:text-primary py-2">
                        Home & Kitchen
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/products?category=Sports & Fitness" className="text-base font-medium text-gray-900 hover:text-primary py-2">
                        Sports & Fitness
                      </Link>
                    </SheetClose>
                  </nav>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {user ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-500">Signed in as <span className="font-medium">{user.username}</span></p>
                        <SheetClose asChild>
                          <Button onClick={handleLogout} variant="outline" className="w-full">
                            Sign out
                          </Button>
                        </SheetClose>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <SheetClose asChild>
                          <Link href="/auth">
                            <Button variant="outline" className="w-full">Sign in</Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/auth?register=true">
                            <Button className="w-full">Sign up</Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop main nav */}
          <nav className="hidden md:flex space-x-10">
            <Link href="/" className={`text-base font-medium ${location === '/' ? 'text-primary' : 'text-gray-900 hover:text-primary'}`}>
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-900 group bg-white inline-flex items-center text-base font-medium hover:text-primary focus:outline-none">
                <span>Categories</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <Link href="/products">
                  <DropdownMenuItem className="cursor-pointer">
                    All Products
                  </DropdownMenuItem>
                </Link>
                <Link href="/products?category=Clothing">
                  <DropdownMenuItem className="cursor-pointer">
                    <Shirt className="mr-2 h-4 w-4 text-primary" />
                    <span>Clothing</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/products?category=Electronics">
                  <DropdownMenuItem className="cursor-pointer">
                    <Laptop className="mr-2 h-4 w-4 text-primary" />
                    <span>Electronics</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/products?category=Home & Kitchen">
                  <DropdownMenuItem className="cursor-pointer">
                    <HomeIcon className="mr-2 h-4 w-4 text-primary" />
                    <span>Home & Kitchen</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/products?category=Sports & Fitness">
                  <DropdownMenuItem className="cursor-pointer">
                    <Dumbbell className="mr-2 h-4 w-4 text-primary" />
                    <span>Sports & Fitness</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/products?filter=new" className={`text-base font-medium ${location === '/products?filter=new' ? 'text-primary' : 'text-gray-900 hover:text-primary'}`}>
              New Arrivals
            </Link>
          </nav>
          
          {/* Search, cart, and account */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <form onSubmit={handleSearch} className="relative mr-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 bg-gray-100 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-base font-medium text-gray-900 hover:text-primary mr-6">
                  {user.username}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="text-gray-900 hover:text-primary">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth?register=true">
                  <Button className="ml-4">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
            
            <Button 
              variant="ghost" 
              className="ml-4 relative" 
              onClick={openCart}
            >
              <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-primary" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-accent text-white rounded-full h-5 w-5 flex items-center justify-center p-0">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <CartDrawer />
    </header>
  );
}
