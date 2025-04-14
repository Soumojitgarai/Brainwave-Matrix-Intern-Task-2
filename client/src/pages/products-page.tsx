import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product/product-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search as SearchIcon, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function ProductsPage() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  
  const categoryParam = searchParams.get("category") || "All Products";
  const searchParam = searchParams.get("search") || "";
  const filterParam = searchParams.get("filter") || "";
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortOption, setSortOption] = useState("featured");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Get categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Get products with optional category filter
  const { data: products, isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: selectedCategory, search: searchQuery }],
  });
  
  useEffect(() => {
    if (products) {
      let filtered = [...products];
      
      // Apply any additional filters
      if (filterParam === "new") {
        filtered = filtered.filter(product => product.isNew);
      } else if (filterParam === "featured") {
        filtered = filtered.filter(product => product.isFeatured);
      } else if (filterParam === "discount") {
        filtered = filtered.filter(product => product.oldPrice);
      }
      
      // Apply sorting
      switch (sortOption) {
        case "price-low":
          filtered.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case "price-high":
          filtered.sort((a, b) => Number(b.price) - Number(a.price));
          break;
        case "rating":
          filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
          break;
        default: // featured or anything else
          // Featured products first, then by id
          filtered.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return a.id - b.id;
          });
      }
      
      setFilteredProducts(filtered);
    }
  }, [products, filterParam, sortOption]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(search);
    
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    
    setLocation(`/products?${params.toString()}`);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    const params = new URLSearchParams(search);
    if (category !== "All Products") {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    
    setLocation(`/products?${params.toString()}`);
  };
  
  const handleSortChange = (value: string) => {
    setSortOption(value);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              {searchQuery ? `Search Results: "${searchQuery}"` : selectedCategory}
            </h1>
            
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-3 py-2 w-48 md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
                    <div className="space-y-2">
                      {isCategoriesLoading ? (
                        <div className="flex justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : (
                        categories?.map(category => (
                          <button
                            key={category.id}
                            className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                              selectedCategory === category.name
                                ? "bg-primary text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => handleCategoryChange(category.name)}
                          >
                            {category.name}
                          </button>
                        ))
                      )}
                    </div>
                    
                    <h3 className="text-sm font-medium text-gray-900 mt-6 mb-2">Sort by</h3>
                    <Select value={sortOption} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Customer Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="hidden md:block">
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {isCategoriesLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    categories?.map(category => (
                      <button
                        key={category.id}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                          selectedCategory === category.name
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => handleCategoryChange(category.name)}
                      >
                        {category.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Products grid */}
            <div className="flex-1">
              {isProductsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
