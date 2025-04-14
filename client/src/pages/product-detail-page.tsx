import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Product } from "@shared/schema";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGallery from "@/components/product/product-gallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Minus, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { addItem } = useCart();
  const [_, setLocation] = useLocation();
  
  const productId = parseInt(id);
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !isNaN(productId),
  });
  
  if (isNaN(productId)) {
    setLocation("/products");
    return null;
  }
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addItem(product.id, quantity);
    
    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart`,
    });
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Create an array of product images (for now we just duplicate the one we have)
  const productImages = [product.imageUrl];
  if (product.imageUrl.includes('unsplash')) {
    // Add some variant images for demo purposes
    const baseUrl = product.imageUrl.split('?')[0];
    productImages.push(`${baseUrl}?auto=format&fit=crop&w=989&q=80&ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8`);
    productImages.push(`${baseUrl}?auto=format&fit=crop&w=687&q=80&ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8`);
    productImages.push(`${baseUrl}?auto=format&fit=crop&w=764&q=80&ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8`);
  }
  
  const discountPercentage = product.oldPrice
    ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
    : 0;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <ProductGallery images={productImages} name={product.name} />
            
            {/* Product Info */}
            <div>
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-primary px-3 py-1 text-sm font-medium rounded-full">
                  {product.category}
                </span>
                <h1 className="mt-2 text-3xl font-bold font-heading text-gray-900">{product.name}</h1>
                <div className="flex items-center mt-2">
                  <div className="flex text-amber-500">
                    {[...Array(Math.floor(Number(product.rating)))].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                    {Number(product.rating) % 1 >= 0.5 && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    )}
                    {[...Array(5 - Math.ceil(Number(product.rating)))].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-500 ml-2">{product.rating} ({product.numReviews} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900">{formatter.format(Number(product.price))}</span>
                  {product.oldPrice && (
                    <>
                      <span className="ml-3 text-lg text-gray-500 line-through">
                        {formatter.format(Number(product.oldPrice))}
                      </span>
                      <Badge className="ml-3 bg-secondary hover:bg-secondary">
                        Save {discountPercentage}%
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">All prices include VAT.</p>
              </div>
              
              {/* Color options (in a real app, this would be dynamic) */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900">Color</h3>
                <div className="flex space-x-3 mt-2">
                  <button className="h-8 w-8 rounded-full bg-gray-800 ring-2 ring-gray-800 ring-offset-1 focus:outline-none" aria-label="Black"></button>
                  <button className="h-8 w-8 rounded-full bg-blue-600 focus:outline-none hover:ring-2 hover:ring-blue-600 hover:ring-offset-1" aria-label="Blue"></button>
                  <button className="h-8 w-8 rounded-full bg-red-500 focus:outline-none hover:ring-2 hover:ring-red-500 hover:ring-offset-1" aria-label="Red"></button>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center mt-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-r-none"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="h-10 text-center w-16 border-y border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-l-none"
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-4 mb-6">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Product Description</h3>
                <div className="prose prose-sm text-gray-500">
                  <p>{product.description}</p>
                  {product.category === "Electronics" && (
                    <ul className="mt-2">
                      <li>AMOLED touch display</li>
                      <li>Heart rate and SpO2 monitoring</li>
                      <li>Built-in GPS</li>
                      <li>50+ workout modes</li>
                      <li>Smart notifications</li>
                      <li>7-day battery life</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
