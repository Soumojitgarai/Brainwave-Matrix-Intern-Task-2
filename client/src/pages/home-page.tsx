import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState } from "react";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl font-heading">
                    <span className="block xl:inline">Summer Collection</span>{" "}
                    <span className="block text-primary xl:inline">2023</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Discover our new summer styles and refresh your wardrobe with the latest trends. Limited time offers on selected items.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <Link href="/products">
                      <Button size="lg" className="px-8">
                        Shop Now
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button size="lg" variant="outline" className="mt-3 sm:mt-0 sm:ml-3 px-8">
                        View Categories
                      </Button>
                    </Link>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Summer Collection Featured Image" />
          </div>
        </section>
        
        {/* Category Navigation */}
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-heading font-bold text-gray-900 text-center mb-6">Shop by Category</h2>
            <div className="flex overflow-x-auto pb-4 hide-scrollbar space-x-4 justify-center">
              {isCategoriesLoading ? (
                <div className="flex justify-center w-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                categories?.map(category => (
                  <button
                    key={category.id}
                    className={`category-pill flex-shrink-0 px-5 py-2 border rounded-full font-medium transition-colors ${
                      selectedCategory === category.name
                        ? "bg-primary text-white border-primary" 
                        : "border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </section>
        
        {/* Featured Products */}
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Featured Products</h2>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-sm text-gray-600">Sort by:</label>
                <select id="sort" className="text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>
            
            {isFeaturedLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts?.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Link href="/products">
                <Button className="px-6 py-3 inline-flex items-center">
                  View All Products
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
