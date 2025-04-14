import { users, type User, type InsertUser, products, type Product, type InsertProduct, cartItems, type CartItem, type InsertCartItem, orders, type Order, type InsertOrder, orderItems, type OrderItem, type InsertOrderItem, categories, type Category, type InsertCategory } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryName: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Cart
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItemWithProductDetails(userId: number): Promise<(CartItem & { product: Product })[]>;
  addItemToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  
  // Order Items
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;

  // Session store for auth
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  sessionStore: session.SessionStore;
  
  userCurrentId: number;
  productCurrentId: number;
  categoryCurrentId: number;
  cartItemCurrentId: number;
  orderCurrentId: number;
  orderItemCurrentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userCurrentId = 1;
    this.productCurrentId = 1;
    this.categoryCurrentId = 1;
    this.cartItemCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add categories
    const categories = [
      { name: "All Products", slug: "all-products", description: "All products in our store" },
      { name: "Clothing", slug: "clothing", description: "Latest fashion collection" },
      { name: "Electronics", slug: "electronics", description: "Cutting-edge tech products" },
      { name: "Home & Kitchen", slug: "home-kitchen", description: "Everything you need for your home" },
      { name: "Sports & Fitness", slug: "sports-fitness", description: "Equipment and apparel for active lifestyles" },
      { name: "Beauty", slug: "beauty", description: "Beauty and personal care products" },
      { name: "Toys & Games", slug: "toys-games", description: "Fun for all ages" },
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
    
    // Add products
    const products = [
      {
        name: "Smart Watch X3",
        description: "The Smart Watch X3 features a stunning AMOLED display, advanced health tracking, and up to 7 days battery life. It's water-resistant up to 50 meters and compatible with both iOS and Android devices.",
        price: "199.99",
        oldPrice: "249.99",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=989&q=80",
        category: "Electronics",
        inStock: true,
        isNew: true,
        isFeatured: true,
        rating: "4.5",
        numReviews: 45
      },
      {
        name: "Leather Backpack",
        description: "Premium leather backpack with multiple compartments, perfect for daily use or weekend trips.",
        price: "89.99",
        imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80",
        category: "Clothing",
        inStock: true,
        isFeatured: true,
        rating: "4.0",
        numReviews: 32
      },
      {
        name: "Running Shoes",
        description: "Lightweight running shoes with advanced cushioning technology for maximum comfort and performance.",
        price: "119.99",
        oldPrice: "149.99",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        category: "Sports & Fitness",
        inStock: true,
        isFeatured: true,
        rating: "3.5",
        numReviews: 87
      },
      {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with 24-hour battery life and waterproof design, perfect for outdoor adventures.",
        price: "79.99",
        imageUrl: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=812&q=80",
        category: "Electronics",
        inStock: true,
        isFeatured: true,
        rating: "5.0",
        numReviews: 124
      },
      {
        name: "Coffee Maker",
        description: "Programmable coffee maker with 12-cup capacity and built-in grinder for the freshest coffee.",
        price: "149.99",
        oldPrice: "199.99",
        imageUrl: "https://images.unsplash.com/photo-1570267028096-aad958f81b09?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=904&q=80",
        category: "Home & Kitchen",
        inStock: true,
        isNew: true,
        rating: "4.2",
        numReviews: 68
      },
      {
        name: "Yoga Mat",
        description: "Eco-friendly yoga mat with excellent grip and cushioning for comfortable practice.",
        price: "39.99",
        imageUrl: "https://images.unsplash.com/photo-1572095628524-7d7b042796d9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
        category: "Sports & Fitness",
        inStock: true,
        rating: "4.7",
        numReviews: 95
      },
      {
        name: "Facial Serum",
        description: "Hydrating facial serum with Vitamin C and hyaluronic acid for glowing skin.",
        price: "59.99",
        oldPrice: "69.99",
        imageUrl: "https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
        category: "Beauty",
        inStock: true,
        isNew: true,
        rating: "4.8",
        numReviews: 53
      },
      {
        name: "Board Game Set",
        description: "Collection of classic board games for family game night including chess, checkers, and backgammon.",
        price: "49.99",
        imageUrl: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        category: "Toys & Games",
        inStock: true,
        rating: "4.5",
        numReviews: 42
      }
    ];
    
    products.forEach(product => {
      this.createProduct(product);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(categoryName: string): Promise<Product[]> {
    if (categoryName === "All Products") {
      return this.getProducts();
    }
    return Array.from(this.products.values()).filter(
      product => product.category === categoryName
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.isFeatured
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      product => 
        product.name.toLowerCase().includes(lowerQuery) || 
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      category => category.slug === slug
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.userId === userId
    );
  }

  async getCartItemWithProductDetails(userId: number): Promise<(CartItem & { product: Product })[]> {
    const cartItems = await this.getCartItems(userId);
    return cartItems.map(item => {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }
      return {
        ...item,
        product
      };
    });
  }

  async addItemToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if this product is already in the cart
    const existingCartItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );

    if (existingCartItem) {
      // Update quantity instead of creating new item
      return this.updateCartItemQuantity(existingCartItem.id, existingCartItem.quantity + insertCartItem.quantity) as Promise<CartItem>;
    }

    const id = this.cartItemCurrentId++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) {
      return undefined;
    }

    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const cartItems = await this.getCartItems(userId);
    cartItems.forEach(item => {
      this.cartItems.delete(item.id);
    });
    return true;
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const now = new Date();
    const order: Order = { ...insertOrder, id, createdAt: now };
    this.orders.set(id, order);
    return order;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.userId === userId
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  // Order Item methods
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      item => item.orderId === orderId
    );
  }
}

export const storage = new MemStorage();
