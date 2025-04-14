import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { apiRequest } from "@/lib/queryClient";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/lib/protected-route";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Check } from "lucide-react";

// Form schema for checkout
const checkoutSchema = z.object({
  // Shipping Information
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  
  // Billing Information (same as shipping or different)
  sameAsShipping: z.boolean().default(true),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZipCode: z.string().optional(),
  billingCountry: z.string().optional(),
  
  // Payment Information
  paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer"]),
  
  // Notes
  orderNotes: z.string().optional(),
}).refine(
  (data) => {
    if (!data.sameAsShipping) {
      return !!data.billingAddress && !!data.billingCity && !!data.billingState && !!data.billingZipCode && !!data.billingCountry;
    }
    return true;
  },
  {
    message: "Please complete all billing information fields",
    path: ["billingAddress"],
  }
);

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function CheckoutPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  
  // Initialize form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      sameAsShipping: true,
      paymentMethod: "credit_card",
      orderNotes: "",
    },
  });
  
  // Watch for sameAsShipping changes to conditionally render billing fields
  const sameAsShipping = form.watch("sameAsShipping");
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      if (!user) throw new Error("You must be logged in to place an order");
      if (cartItems.length === 0) throw new Error("Your cart is empty");
      
      // Format data for the API
      const orderData = {
        userId: user.id,
        total: cartTotal.toString(),
        status: "pending",
        shippingAddress: `${data.fullName}, ${data.address}, ${data.city}, ${data.state}, ${data.zipCode}, ${data.country}`,
        billingAddress: data.sameAsShipping 
          ? `${data.fullName}, ${data.address}, ${data.city}, ${data.state}, ${data.zipCode}, ${data.country}`
          : `${data.fullName}, ${data.billingAddress}, ${data.billingCity}, ${data.billingState}, ${data.billingZipCode}, ${data.billingCountry}`,
        paymentMethod: data.paymentMethod,
      };
      
      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: async () => {
      setIsSuccess(true);
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });
      
      // Clear the cart after successful order
      await clearCart();
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    await createOrderMutation.mutateAsync(data);
  };
  
  // Format currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-12 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h1>
              <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
              <p className="text-sm text-gray-500 mb-8">You will receive an email confirmation shortly.</p>
              <Button onClick={() => setLocation("/")}>Return to Home</Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Complete your purchase by providing the information below</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Shipping Information */}
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="sm:col-span-2">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Anytown" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP/Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-6">
                        <FormField
                          control={form.control}
                          name="sameAsShipping"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                  checked={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium cursor-pointer">Billing address same as shipping</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Billing Information (if different from shipping) */}
                  {!sameAsShipping && (
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <FormField
                              control={form.control}
                              name="billingAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main St" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="billingCity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Anytown" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="billingState"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province</FormLabel>
                                <FormControl>
                                  <Input placeholder="State" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="billingZipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP/Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="12345" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="billingCountry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="Country" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Payment Method */}
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-3"
                              >
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
                                  <RadioGroupItem value="credit_card" id="credit_card" />
                                  <label htmlFor="credit_card" className="flex items-center cursor-pointer">
                                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                                    <span>Credit / Debit Card</span>
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
                                  <RadioGroupItem value="paypal" id="paypal" />
                                  <label htmlFor="paypal" className="cursor-pointer">PayPal</label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
                                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                                  <label htmlFor="bank_transfer" className="cursor-pointer">Bank Transfer</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Credit card form would go here if selected */}
                      {form.watch("paymentMethod") === "credit_card" && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                          <p className="text-sm text-gray-500 mb-2">This is a demo application. No actual payment will be processed.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Card Number</label>
                              <Input placeholder="4242 4242 4242 4242" className="mt-1" disabled />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                              <Input placeholder="MM/YY" className="mt-1" disabled />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">CVC</label>
                              <Input placeholder="123" className="mt-1" disabled />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Order Notes */}
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
                      <FormField
                        control={form.control}
                        name="orderNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Special instructions for delivery or any other notes"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || cartItems.length === 0}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      `Place Order - ${formatter.format(cartTotal)}`
                    )}
                  </Button>
                </form>
              </Form>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                  
                  {cartItems.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex">
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name} 
                                className="w-16 h-16 object-cover rounded-md mr-3" 
                              />
                              <div>
                                <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatter.format(Number(item.product.price) * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-500">Subtotal</p>
                          <p className="text-gray-900 font-medium">{formatter.format(cartTotal)}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-500">Shipping</p>
                          <p className="text-gray-900 font-medium">Free</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-500">Tax</p>
                          <p className="text-gray-900 font-medium">{formatter.format(cartTotal * 0.07)}</p>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="flex justify-between">
                          <p className="text-base font-medium text-gray-900">Total</p>
                          <p className="text-base font-bold text-gray-900">{formatter.format(cartTotal + (cartTotal * 0.07))}</p>
                        </div>
                      </div>
                    </>
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

export default function CheckoutPage() {
  return <ProtectedRoute path="/checkout" component={CheckoutPageContent} />;
}
