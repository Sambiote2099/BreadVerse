"use client";

import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Gift,
  Users,
  BarChart3,
  LogOut,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Image,
  Download,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router2 = useRouter();
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
   const [newOrdersCount, setNewOrdersCount] = useState(0); // Add this
  const [lastViewedOrders, setLastViewedOrders] = useState<string | null>(null);
  const [ordersRefreshTrigger, setOrdersRefreshTrigger] = useState(0);

 useEffect(() => {
  if (status === "loading") return;
  
  if (status === "unauthenticated") {
    router2.push("/login");
    return;
  }
  
  // Check if user is admin
  if (session?.user?.role !== "admin") {
    router2.push("/unauthorized");
    return;
  }
  
  setLoading(false);
}, [status, session, router2]);



const checkNewOrders = async () => {
  try {
    const lastViewed = localStorage.getItem('lastViewedOrders');
    const res = await fetch('/api/orders?limit=50');
    const data = await res.json();
    
    if (data.orders && data.orders.length > 0) {
      const sortedOrders = [...data.orders].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const latestOrder = sortedOrders[0];
      const latestOrderTime = new Date(latestOrder.created_at).getTime();
      
      if (lastViewed) {
        const lastViewedTime = parseInt(lastViewed);
        if (latestOrderTime > lastViewedTime) {
          const newOrders = sortedOrders.filter(order => 
            new Date(order.created_at).getTime() > lastViewedTime
          );
          
          setNewOrdersCount(newOrders.length);
          
          // If there are new orders, trigger a refresh in OrdersManagement
          if (newOrders.length > 0) {
            setOrdersRefreshTrigger(prev => prev + 1);
          }
          
          if (newOrders.length > 0 && activeTab !== "orders") {
            toast.info(`You have ${newOrders.length} new order${newOrders.length > 1 ? 's' : ''}!`, {
              onClick: () => setActiveTab("orders"),
              autoClose: false, // This makes it stay until clicked
    closeOnClick: true, // Allow closing by clicking the X
    draggable: true, // Allow dragging to dismiss
            });
          }
        }
      } else {
        localStorage.setItem('lastViewedOrders', Date.now().toString());
      }
    }
  } catch (error) {
    console.error("Error checking new orders:", error);
  }
};

useEffect(() => {
  if (status === "authenticated" && session?.user?.role === "admin") {
    checkNewOrders();
    
    // Set up polling every 30 seconds
    const interval = setInterval(checkNewOrders, 30000);
    return () => clearInterval(interval);
  }
}, [status, session]);

const markOrdersAsViewed = () => {
  setNewOrdersCount(0);
  localStorage.setItem('lastViewedOrders', Date.now().toString());
};

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-[#1c1c1c] mt-16 transition-colors duration-1000">
      {/* Top Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 right-0 left-0 z-40 h-16 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-3 flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">Breadverse Admin</h1>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0" />
      </nav>

      <div className="flex pt-16">
        {/* Sidebar — overlay on mobile, push on desktop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside className={`
          bg-white dark:bg-gray-800 shadow-sm h-[calc(100vh-4rem)]
          transition-all duration-300 overflow-hidden flex-shrink-0
          fixed md:static z-30
          ${sidebarOpen ? 'w-64' : 'w-0'}
        `}>
          <div className="p-6 w-64">
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Main</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => { setActiveTab("products"); setSidebarOpen(window.innerWidth >= 768); }}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors ${activeTab === "products" ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Package className="w-5 h-5 flex-shrink-0" />
                  Products
                </button>
                <button
                  onClick={() => { setActiveTab("gifts"); setSidebarOpen(window.innerWidth >= 768); }}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors ${activeTab === "gifts" ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Gift className="w-5 h-5 flex-shrink-0" />
                  Gift Boxes
                </button>
                <button
                  onClick={() => {
                    setActiveTab("orders");
                    markOrdersAsViewed();
                    setSidebarOpen(window.innerWidth >= 768);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors relative ${activeTab === "orders" ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  Orders
                  {newOrdersCount > 0 && activeTab !== "orders" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      {newOrdersCount > 99 ? '99+' : newOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab("gallery"); setSidebarOpen(window.innerWidth >= 768); }}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors ${activeTab === "gallery" ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <Image className="w-5 h-5 flex-shrink-0" />
                  Home Gallery
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6 overflow-auto min-w-0">
          {activeTab === "products" && <ProductsManagement />}
          {activeTab === "gifts" && <GiftsManagement />}
          {activeTab === "orders" && (
            <OrdersManagement
              onOrdersViewed={markOrdersAsViewed}
              refreshTrigger={ordersRefreshTrigger}
            />
          )}
          {activeTab === "gallery" && <GalleryManagement />}
        </main>
      </div>
    </div>
  );
}

// Products Management Component
function ProductsManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=50');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const filteredProducts = products.filter(product => {
  const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.description.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
  const matchesStock = stockFilter === "all" || 
                      (stockFilter === "in-stock" && product.available) ||
                      (stockFilter === "out-of-stock" && !product.available);
  const matchesFeatured = 
    featuredFilter === "all" ||
    (featuredFilter === "featured" && product.featured) ||
    (featuredFilter === "not-featured" && !product.featured) ||
    (featuredFilter === "popular" && product.popular) ||
    (featuredFilter === "not-popular" && !product.popular);
  
  return matchesSearch && matchesCategory && matchesStock && matchesFeatured;
});

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">Products Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage all your bakery products here</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">All Products ({filteredProducts.length})</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 min-w-[120px] px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="bread">Bread</option>
                  <option value="pastry">Pastry</option>
                  <option value="cake">Cake</option>
                  <option value="cookie">Cookie</option>
                  <option value="dessert">Dessert</option>
                </select>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="flex-1 min-w-[110px] px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="all">All Stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className="flex-1 min-w-[120px] px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="all">All Products</option>
                  <option value="featured">Featured Only</option>
                  <option value="not-featured">Not Featured</option>
                  <option value="popular">Popular Only</option>
                  <option value="not-popular">Not Popular</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Featured</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Popular</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
  </tr>
</thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${product.available ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                        {product.available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.featured ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                        {product.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.popular ? 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
    {product.popular ? 'Yes' : 'No'}
  </span>
</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product._id}`}
                          target="_blank"
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => {
                                handleEdit(product);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                          className="p-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} onSuccess={fetchProducts} />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <EditProductModal 
          product={selectedProduct} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }} 
          onSuccess={fetchProducts} 
        />
      )}
    </div>
  );
}

// Gifts Management Component
function GiftsManagement() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const res = await fetch('/api/gifts?limit=50');
      const data = await res.json();
      setGifts(data.products || data.gifts || []);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this gift box?")) {
      try {
        await fetch(`/api/gifts/${id}`, { method: 'DELETE' });
        setGifts(gifts.filter(g => g._id !== id));
      } catch (error) {
        console.error("Error deleting gift:", error);
      }
    }
  };

  const handleEdit = (gift: any) => {
    setSelectedGift(gift);
    setShowEditModal(true);
  };

  const filteredGifts = gifts.filter(gift =>
    gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gift.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">Gift Boxes Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage all your gift boxes here</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Add Gift Box
        </button>
      </div>

      {/* Gifts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">All Gift Boxes ({filteredGifts.length})</h2>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search gift boxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading gift boxes...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gift Box</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Featured</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Popular</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
  </tr>
</thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredGifts.map((gift) => (
                  <tr key={gift._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={gift.image[0]}
                          alt={gift.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{gift.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{gift.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 capitalize">
                        {gift.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ${gift.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${gift.available ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                        {gift.available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {gift.contains?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${gift.featured ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
    {gift.featured ? 'Yes' : 'No'}
  </span>
</td>
<td className="px-6 py-4">
  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${gift.popular ? 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
    {gift.popular ? 'Yes' : 'No'}
  </span>
</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/gift-box/${gift._id}`}
                          target="_blank"
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => {
                                handleEdit(gift);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                          className="p-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(gift._id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Gift Modal */}
      {showAddModal && (
        <AddGiftModal onClose={() => setShowAddModal(false)} onSuccess={fetchGifts} />
      )}

      {/* Edit Gift Modal */}
      {showEditModal && selectedGift && (
        <EditGiftModal 
          gift={selectedGift} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedGift(null);
          }} 
          onSuccess={fetchGifts} 
        />
      )}
    </div>
  );
}

// Orders Management Component
// Orders Management Component
function OrdersManagement({ 
  onOrdersViewed, 
  refreshTrigger // Add this prop
}: { 
  onOrdersViewed?: () => void;
  refreshTrigger?: number; // Add this type
}) {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const ordersPerPage = 10;

   useEffect(() => {
    fetchOrders();
    fetchProductsAndGifts();
  }, [currentPage, statusFilter, refreshTrigger]); // Add statusFilter to dependencies

  useEffect(() => {
    if (onOrdersViewed) {
      onOrdersViewed();
    }
  }, [onOrdersViewed]);

  // In OrdersManagement component, update the fetchOrders function:
const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ordersPerPage.toString()
      });
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      
      if (data.error) {
        console.error("API Error:", data.error);
        setOrders([]);
        setTotalOrders(0);
        return;
      }
      
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setTotalOrders(data.pagination?.totalItems || 0);
        
        // Call onOrdersViewed when orders are successfully loaded
        if (onOrdersViewed) {
          onOrdersViewed();
        }
      } else if (Array.isArray(data)) {
        setOrders(data);
        setTotalOrders(data.length);
        if (onOrdersViewed) {
          onOrdersViewed();
        }
      } else {
        console.error("Unexpected API response format:", data);
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsAndGifts = async () => {
    try {
      // Fetch products
      const [productsRes, giftsRes] = await Promise.all([
        fetch('/api/products?limit=100'),
        fetch('/api/gifts?limit=100')
      ]);
      
      const productsData = await productsRes.json();
      const giftsData = await giftsRes.json();
      
      setProducts(productsData.products || []);
      setGifts(giftsData.products || giftsData.gifts || []);
    } catch (error) {
      console.error("Error fetching products and gifts:", error);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p._id === productId);
    const gift = gifts.find(g => g._id === productId);
    return product?.name || gift?.name || 'Unknown Item';
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: newStatus,
        changed_by: "admin"
      })
    });
    
    const data = await res.json();
    console.log("Update response:", data); // Add this for debugging
    
    if (res.ok) {
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Order status updated successfully!');
    } else {
      toast.error(data.error || 'Failed to update order');
    }
  } catch (error) {
    console.error("Error updating order:", error);
    toast.error('Failed to update order');
  }
};


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'shipped':
        return <ShoppingBag className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderNumber = order.order_number || order.orderNumber || '';
    const customerEmail = order.customer?.email || '';
    const customerName = order.customer?.name || '';
    
    const matchesSearch = 
      orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

const toggleOrderExpansion = (orderId: string) => {
  setExpandedOrders(prev => {
    const newSet = new Set(prev);
    if (newSet.has(orderId)) {
      newSet.delete(orderId);
    } else {
      newSet.add(orderId);
    }
    return newSet;
  });
};

const renderOrderItems = (order: any) => {
  if (!order.items || order.items.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No items
      </div>
    );
  }

  const isExpanded = expandedOrders.has(order._id);

  return (
    <div>
      <button
        onClick={() => toggleOrderExpansion(order._id)}
        className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-2 mb-2"
      >
        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-3 pl-4 border-l-2 border-amber-200 dark:border-amber-800">
          {order.items.map((item: any, index: number) => {
            const itemName = item.name || getProductName(item.product_id || item.productId) || 'Unknown Item';
            const itemImage = item.image || '';
            const itemPrice = item.price || 0;
            const itemQuantity = item.quantity || 1;
            
            return (
              <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {itemImage && (
                  <img
                    src={itemImage}
                    alt={itemName}
                    className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {itemName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <div>Quantity: {itemQuantity}</div>
                    <div>Price: ${itemPrice.toFixed(2)} each</div>
                    <div>Subtotal: ${(itemPrice * itemQuantity).toFixed(2)}</div>
                    {item.category && (
                      <div className="mt-1">
                        <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Order Summary */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Order Summary
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Items ({order.items.length}):</span>
                <span>${order.payment?.amount?.toFixed(2) || '0.00'}</span>
              </div>
              {order.payment?.shipping_cost > 0 && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${order.payment.shipping_cost.toFixed(2)}</span>
                </div>
              )}
              {order.payment?.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${order.payment.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
                <span>Total:</span>
                <span>${order.payment?.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">Orders Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">View and manage customer orders</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">All Orders ({filteredOrders.length})</h2>
              <button
                onClick={() => {
                  fetchOrders();
                  checkNewOrders();
                }}
                className="p-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                title="Refresh orders"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading orders...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                
<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
  {filteredOrders.length === 0 ? (
    <tr>
      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
        No orders found
      </td>
    </tr>
  ) : (
    filteredOrders.map((order) => {
      const orderNumber = order.order_number || order.orderNumber || `#${order._id?.slice(-8) || 'N/A'}`;
      const orderDate = order.created_at || order.createdAt || order.date || new Date();
      const displayDate = new Date(orderDate);
      const isValidDate = !isNaN(displayDate.getTime());
      const totalAmount = order.payment?.total || order.totalAmount || order.total || 0;
      const isExpanded = expandedOrders.has(order._id);

      return (
        <>
          {/* Main Order Row */}
          <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {orderNumber}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900 dark:text-white">
                {order.customer?.name || 'N/A'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {order.customer?.email || 'No email'}
              </div>
              {order.customer?.phone && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {order.customer.phone}
                </div>
              )}
            </td>
            <td className="px-6 py-4">
              {isValidDate ? (
                <>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {displayDate.toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {displayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">Date not available</div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {renderOrderItems(order)}
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                ${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {order.payment?.method === 'cashOnDelivery' ? 'Cash on Delivery' : 'Paid'}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${getStatusColor(order.status || 'pending')}`}>
                  {getStatusIcon(order.status || 'pending')}
                  {order.status || 'pending'}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <select
                  value={order.status || 'pending'}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="text-xs px-2 py-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </td>
          </tr>
          
          {/* Expanded Details Row (when clicked) */}
          {isExpanded && order.shipping_address && (
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <td colSpan={7} className="px-6 py-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-medium mb-2">Shipping Address:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Street:</div>
                      <div>{order.shipping_address.street || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">City/State/Zip:</div>
                      <div>
                        {[order.shipping_address.city, order.shipping_address.state, order.shipping_address.zip_code]
                          .filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Country:</div>
                      <div>{order.shipping_address.country || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method:</div>
                      <div className="capitalize">{order.payment?.method?.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}</div>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes:</div>
                      <div className="italic">{order.notes}</div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          )}
        </>
      );
    })
  )}
</tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Summary Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{totalOrders}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                  {orders.filter(o => o.status === 'processing').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Gallery Management Component
function GalleryManagement() {
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const res = await fetch('/api/recommendations?limit=50', {
        credentials: 'include' // Add for auth
      });
      const data = await res.json();
      setGalleryItems(data.data || []);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      try {
        await fetch(`/api/recommendations?id=${id}`, { 
          method: 'DELETE',
          credentials: 'include' // Add for auth
        });
        setGalleryItems(galleryItems.filter(item => item._id !== id));
      } catch (error) {
        console.error("Error deleting gallery item:", error);
      }
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const filteredItems = galleryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">Home Gallery Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage home page gallery recommendations</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Add Gallery Item
        </button>
      </div>

      {/* Gallery Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">All Gallery Items ({filteredItems.length})</h2>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search gallery items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading gallery items...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Images Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
  <div className="relative group w-52 h-20 overflow-hidden rounded-lg">
    {/* Main Image */}
    <img
      src={item.url?.[0] || '/placeholder-image.jpg'}
      alt={item.name}
      className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:opacity-0"
    />
    
    {/* Hover Image (2nd image) */}
    {item.url?.[1] && (
      <img
        src={item.url[1]}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100"
      />
    )}
    
    {/* Fallback if no 2nd image */}
    {!item.url?.[1] && (
      <div className="absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">No 2nd image</span>
      </div>
    )}
  </div>
</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {item.Description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {item.url?.length || 0} images
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                              onClick={() => {
                                handleEdit(item);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                          className="p-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Gallery Modal */}
      {showAddModal && (
        <AddGalleryModal onClose={() => setShowAddModal(false)} onSuccess={fetchGalleryItems} />
      )}

      {/* Edit Gallery Modal */}
      {showEditModal && selectedItem && (
        <EditGalleryModal 
          item={selectedItem} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }} 
          onSuccess={fetchGalleryItems} 
        />
      )}
    </div>
  );
}
// Add Product Modal Component
function AddProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'bread',
    image: [''],
    ingredients: [''],
    process: [''],
    available: true,
    featured: false,
    popular: false
  });
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          image: formData.image.filter(img => img.trim() !== ''),
          ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
          process: formData.process.filter(step => step.trim() !== '')
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
        toast.success('Successfully added a product');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to add product');
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Product</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Fill in the details to add a new product</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., Artisan Sourdough"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="bread">Bread</option>
                <option value="pastry">Pastry</option>
                <option value="cake">Cake</option>
                <option value="cookie">Cookie</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Describe your product..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({...formData, available: e.target.checked})}
                  className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Available in stock</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured product</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                  className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Popular product</label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URLs (one per line)</label>
            <textarea
              value={formData.image.join('\n')}
              onChange={(e) => setFormData({...formData, image: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="https://example.com/image1.jpg"
            />
          </div>
          {formData.image.filter(url => url.trim() !== '').length > 0 && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Image Preview ({formData.image.filter(url => url.trim() !== '').length} images)
    </label>
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
        {formData.image.filter(url => url.trim() !== '').map((url, index) => (
          <div key={index} className="flex-shrink-0 w-32 h-32 snap-start">
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium px-2 py-1 bg-black/70 rounded-full">
                  {index + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Scroll hint */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white dark:from-gray-800 to-transparent w-8 h-full pointer-events-none"></div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
      ← Scroll horizontally to see all images →
    </p>
  </div>
)}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ingredients (one per line)</label>
            <textarea
              value={formData.ingredients.join('\n')}
              onChange={(e) => setFormData({...formData, ingredients: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Flour\nWater\nSalt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Process Steps (one per line)</label>
            <textarea
              value={formData.process.join('\n')}
              onChange={(e) => setFormData({...formData, process: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Mix ingredients\nKnead dough\nBake for 30min"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Product Modal Component
function EditProductModal({ product, onClose, onSuccess }: { product: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    category: product.category || 'bread',
    image: product.image || [''],
    ingredients: product.ingredients || [''],
    process: product.process || [''],
    available: product.available || true,
    featured: product.featured || false,
    popular: product.popular || false
  });
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          image: formData.image.filter(img => img.trim() !== ''),
          ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
          process: formData.process.filter(step => step.trim() !== '')
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
        toast.success('Product Updated');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update product');
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Product</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Update product details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., Artisan Sourdough"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="bread">Bread</option>
                <option value="pastry">Pastry</option>
                <option value="cake">Cake</option>
                <option value="cookie">Cookie</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Describe your product..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({...formData, available: e.target.checked})}
                  className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Available in stock</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured product</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                  className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Popular product</label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URLs (one per line)</label>
            <textarea
              value={formData.image.join('\n')}
              onChange={(e) => setFormData({...formData, image: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="https://example.com/image1.jpg"
            />
          </div>
{formData.image.filter(url => url.trim() !== '').length > 0 && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Image Preview ({formData.image.filter(url => url.trim() !== '').length} images)
    </label>
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
        {formData.image.filter(url => url.trim() !== '').map((url, index) => (
          <div key={index} className="flex-shrink-0 w-32 h-32 snap-start">
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium px-2 py-1 bg-black/70 rounded-full">
                  {index + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Scroll hint */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white dark:from-gray-800 to-transparent w-8 h-full pointer-events-none"></div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
      ← Scroll horizontally to see all images →
    </p>
  </div>
)}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ingredients (one per line)</label>
            <textarea
              value={formData.ingredients.join('\n')}
              onChange={(e) => setFormData({...formData, ingredients: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Flour\nWater\nSalt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Process Steps (one per line)</label>
            <textarea
              value={formData.process.join('\n')}
              onChange={(e) => setFormData({...formData, process: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Mix ingredients\nKnead dough\nBake for 30min"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Gift Modal Component (similar to AddProductModal)
// Add Gift Modal Component
function AddGiftModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'gift-box',
    image: [''],
    contains: [''],
    available: true,
    featured: false,
    popular: false
  });
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          image: formData.image.filter(img => img.trim() !== ''),
          contains: formData.contains.filter(item => item.trim() !== '')
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
        toast.success('Successfully added a Gift Box');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to add gift box');
      }
    } catch (error) {
      console.error("Error adding gift box:", error);
      toast.error('Failed to add gift box');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Gift Box</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Fill in the details to add a new gift box</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gift Box Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., Premium Bakery Gift Set"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Describe your gift box..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URLs (one per line)</label>
            <textarea
              value={formData.image.join('\n')}
              onChange={(e) => setFormData({...formData, image: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="https://example.com/image1.jpg"
            />
          </div>
{formData.image.filter(url => url.trim() !== '').length > 0 && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Image Preview ({formData.image.filter(url => url.trim() !== '').length} images)
    </label>
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
        {formData.image.filter(url => url.trim() !== '').map((url, index) => (
          <div key={index} className="flex-shrink-0 w-32 h-32 snap-start">
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium px-2 py-1 bg-black/70 rounded-full">
                  {index + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Scroll hint */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white dark:from-gray-800 to-transparent w-8 h-full pointer-events-none"></div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
      ← Scroll horizontally to see all images →
    </p>
  </div>
)}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contains Items (one per line)</label>
            <textarea
              value={formData.contains.join('\n')}
              onChange={(e) => setFormData({...formData, contains: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Sourdough Bread\nChocolate Croissant\nMacarons"
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({...formData, available: e.target.checked})}
                className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Available</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.popular}
                onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Popular</label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Gift Box'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Gift Modal Component
function EditGiftModal({ gift, onClose, onSuccess }: { gift: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: gift.name || '',
    description: gift.description || '',
    price: gift.price?.toString() || '',
    category: gift.category || 'gift-box',
    image: gift.image || [''],
    contains: gift.contains || [''],
    available: gift.available || true,
    featured: gift.featured || false,
    popular: gift.popular || false
  });
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/gifts/${gift._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          image: formData.image.filter(img => img.trim() !== ''),
          contains: formData.contains.filter(item => item.trim() !== '')
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
        toast.success('Updated Gift Box');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update gift');
      }
    } catch (error) {
      console.error("Error updating gift:", error);
      toast.error('Failed to update gift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Gift Box</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Update gift box details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gift Box Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., Premium Bakery Gift Set"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Describe your gift box..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URLs (one per line)</label>
            <textarea
              value={formData.image.join('\n')}
              onChange={(e) => setFormData({...formData, image: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="https://example.com/image1.jpg"
            />
          </div>
{formData.image.filter(url => url.trim() !== '').length > 0 && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Image Preview ({formData.image.filter(url => url.trim() !== '').length} images)
    </label>
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
        {formData.image.filter(url => url.trim() !== '').map((url, index) => (
          <div key={index} className="flex-shrink-0 w-32 h-32 snap-start">
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium px-2 py-1 bg-black/70 rounded-full">
                  {index + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Scroll hint */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white dark:from-gray-800 to-transparent w-8 h-full pointer-events-none"></div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
      ← Scroll horizontally to see all images →
    </p>
  </div>
)}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contains Items (one per line)</label>
            <textarea
              value={formData.contains.join('\n')}
              onChange={(e) => setFormData({...formData, contains: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Sourdough Bread\nChocolate Croissant\nMacarons"
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({...formData, available: e.target.checked})}
                className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Available</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.popular}
                onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                className="h-4 w-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Popular</label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Gift Box'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Gallery Modal Component
function AddGalleryModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    Description: '',
    url: ['']
  });
  const [loading, setLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          url: formData.url.filter(img => img.trim() !== '')
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        onSuccess();
        onClose();
        toast.success('Successfully added a Gallery Item');
      } else {
        toast.error(data.error || 'Failed to add gallery item');
      }
    } catch (error) {
      console.error("Error adding gallery item:", error);
      toast.error('Failed to add gallery item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Gallery Item</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Fill in the details for home page gallery</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="e.g., Special Offer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
            <textarea
              value={formData.Description}
              onChange={(e) => setFormData({...formData, Description: e.target.value})}
              rows={3}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Describe this gallery item..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URLs (one per line)</label>
            <textarea
              value={formData.url.join('\n')}
              onChange={(e) => setFormData({...formData, url: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="https://example.com/image1.jpg"
            />
          </div>
{formData.image.filter(url => url.trim() !== '').length > 0 && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Image Preview ({formData.image.filter(url => url.trim() !== '').length} images)
    </label>
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
        {formData.image.filter(url => url.trim() !== '').map((url, index) => (
          <div key={index} className="flex-shrink-0 w-32 h-32 snap-start">
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium px-2 py-1 bg-black/70 rounded-full">
                  {index + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Scroll hint */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white dark:from-gray-800 to-transparent w-8 h-full pointer-events-none"></div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
      ← Scroll horizontally to see all images →
    </p>
  </div>
)}
          <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Gallery Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Gallery Modal Component
function EditGalleryModal({ item, onClose, onSuccess }: { item: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: item.name || '',
    Description: item.Description || '',
    url: item.url || ['']
  });
  const [loading, setLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/recommendations?id=${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          url: formData.url.filter(img => img.trim() !== '')
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        onSuccess();
        onClose();
        toast.success('Successfully updated gallery item')
      } else {
        toast.error(data.error || 'Failed to update gallery item');
      }
    } catch (error) {
      console.error("Error updating gallery item:", error);
      toast.error('Failed to update gallery item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Gallery Item</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Update gallery item details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="e.g., Special Offer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
            <textarea
              value={formData.Description}
              onChange={(e) => setFormData({...formData, Description: e.target.value})}
              rows={3}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Describe this gallery item..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URLs (one per line)</label>
            <textarea
              value={formData.url.join('\n')}
              onChange={(e) => setFormData({...formData, url: e.target.value.split('\n')})}
              rows={3}
              className="w-full px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="https://example.com/image1.jpg"
            />
          </div>
{formData.image.filter(url => url.trim() !== '').length > 0 && (
  <div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Image Preview ({formData.image.filter(url => url.trim() !== '').length} images)
    </label>
    <div className="relative">
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
        {formData.image.filter(url => url.trim() !== '').map((url, index) => (
          <div key={index} className="flex-shrink-0 w-32 h-32 snap-start">
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium px-2 py-1 bg-black/70 rounded-full">
                  {index + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Scroll hint */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white dark:from-gray-800 to-transparent w-8 h-full pointer-events-none"></div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
      ← Scroll horizontally to see all images →
    </p>
  </div>
)}
          <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Gallery Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}