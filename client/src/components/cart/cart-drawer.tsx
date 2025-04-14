import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import CartItem from "./cart-item";
import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CartDrawer() {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    cartTotal, 
    isLoading
  } = useCart();
  const { user } = useAuth();

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const handleCloseCart = () => {
    closeCart();
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md overflow-auto flex flex-col">
        <SheetHeader className="mb-4">
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="text-gray-500 text-center">Looks like you haven't added any products to your cart yet.</p>
            <SheetClose asChild>
              <Link href="/products">
                <Button>Start shopping</Button>
              </Link>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <ul role="list" className="-my-6 divide-y divide-gray-200">
                {cartItems.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </ul>
            </div>
            
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-1">
                <p>Subtotal</p>
                <p>{formatter.format(cartTotal)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
              <div className="mt-6">
                <SheetClose asChild>
                  <Link href={user ? "/checkout" : "/auth?redirect=checkout"}>
                    <Button className="w-full">
                      Checkout
                    </Button>
                  </Link>
                </SheetClose>
              </div>
              <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                <p>
                  or{" "}
                  <SheetClose asChild>
                    <Button variant="link" className="text-primary">
                      Continue Shopping
                    </Button>
                  </SheetClose>
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
