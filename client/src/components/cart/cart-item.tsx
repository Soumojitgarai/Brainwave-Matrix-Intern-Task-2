import { useState } from "react";
import { Product, CartItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";

type CartItemProps = {
  item: CartItem & { product: Product };
};

export default function CartItemComponent({ item }: CartItemProps) {
  const { product, quantity } = item;
  const { updateItemQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleIncreaseQuantity = async () => {
    setIsUpdating(true);
    await updateItemQuantity(item.id, quantity + 1);
    setIsUpdating(false);
  };

  const handleDecreaseQuantity = async () => {
    if (quantity > 1) {
      setIsUpdating(true);
      await updateItemQuantity(item.id, quantity - 1);
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    await removeItem(item.id);
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <li className="py-6 flex">
      <Link href={`/products/${product.id}`}>
        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-center object-cover" 
          />
        </div>
      </Link>

      <div className="ml-4 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <Link href={`/products/${product.id}`}>
              <h3>{product.name}</h3>
            </Link>
            <p className="ml-4">{formatter.format(Number(product.price))}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        </div>
        <div className="flex-1 flex items-end justify-between text-sm">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-full" 
              onClick={handleDecreaseQuantity}
              disabled={quantity <= 1 || isUpdating}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <span className="mx-2 text-gray-700 w-6 text-center">{quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-full" 
              onClick={handleIncreaseQuantity}
              disabled={isUpdating}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>

          <div className="flex">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80"
              onClick={handleRemove}
              disabled={isUpdating}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
