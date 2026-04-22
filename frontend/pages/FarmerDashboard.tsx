import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Product, Order, Category } from '../types';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  MessageSquare,
  Upload,
  Truck,
  PieChart as PieChartIcon,
  Calendar,
  MapPin
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import MessagingSystem from '../components/MessagingSystem';
import ConfirmationModal from '../components/ConfirmationModal';
import { Image as ImageIcon } from 'lucide-react';
import { EGG_PLACEHOLDER } from '../constants';

const EGG_GALLERY = [
  { url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=800', label: 'White Eggs' },
  { url: 'https://images.unsplash.com/photo-1569254994521-ddbb54af5ae8?auto=format&fit=crop&q=80&w=800', label: 'Brown Eggs' },
  { url: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&q=80&w=800', label: 'Organic Eggs' },
  { url: 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&q=80&w=800', label: 'Quail Eggs' },
  { url: 'https://images.unsplash.com/photo-1522435230575-2355ef7171e1?auto=format&fit=crop&q=80&w=800', label: 'Duck Eggs' },
  { url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800', label: 'Basket of Eggs' },
  { url: 'https://images.unsplash.com/photo-1606055470705-32517776eeaf?auto=format&fit=crop&q=80&w=800', label: 'Farm Fresh' },
  { url: 'https://images.unsplash.com/photo-1530513435-580a199ed9d5?auto=format&fit=crop&q=80&w=800', label: 'Chicken Farm' }
];

/**
 * FarmerDashboard Component
 * The specialized workstation for suppliers (farmers).
 * Provides tools for inventory control, order fulfillment, sales tracking, and direct customer communication.
 */
export default function FarmerDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  
  // Dashboard state management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]); // Farmer's own catalog
  const [orders, setOrders] = useState<Order[]>([]); // Orders specifically for this farmer's products
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI Control states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false); // Internal asset selector
  
  // Drill-down states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    site_name: '',
    site_description: ''
  });

  // Product CRUD form state
  const [formData, setFormData] = useState({
    name: '',
    egg_type: '',
    description: '',
    price: 0,
    price_per_tray: 0,
    price_per_dozen: 0,
    stock: 0,
    stock_tray: 0,
    stock_dozen: 0,
    category_id: 1,
    image_url: ''
  });

  useEffect(() => {
    if (activeTab === 'add-product') {
      setEditingProduct(null);
      setFormData({ 
        name: '', 
        egg_type: '',
        description: '', 
        price: 0, 
        price_per_tray: 0,
        price_per_dozen: 0,
        stock: 0, 
        stock_tray: 0,
        stock_dozen: 0,
        category_id: categories[0]?.id || 1, 
        image_url: '' 
      });
      setShowAddModal(true);
      setActiveTab('manage-products');
    }
  }, [activeTab]);

  const showNotify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    showToast(message, type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotify('File size too large (max 5MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const [salesStats, setSalesStats] = useState<any[]>([]);
  const [dailySales, setDailySales] = useState<any[]>([]);

  /**
   * Main data coordination effect
   * Fetches the specific scope of data relevant to this individual farmer.
   * Includes recursive polling every 30 seconds for new orders.
   */
  useEffect(() => {
    if (user) {
      fetchData();
      fetchSalesStats();
      if (activeTab === 'site-settings') {
        fetchSiteSettings();
      }
      const interval = setInterval(() => {
        fetchData();
        fetchSalesStats();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, activeTab]);

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        setSiteSettings(await res.json());
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      if (res.ok) {
        showNotify('Site settings updated successfully!', 'success');
      } else {
        showNotify('Failed to update site settings', 'error');
      }
    } catch (err) {
      showNotify('An error occurred', 'error');
    }
  };

  const fetchSalesStats = async () => {
    try {
      const [statsRes, dailyRes] = await Promise.all([
        fetch(`/api/farmer/${user?.id}/sales-stats`),
        fetch(`/api/farmer/${user?.id}/reports/daily`)
      ]);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setSalesStats(Array.isArray(data) ? data : []);
      }
      if (dailyRes.ok) {
        const data = await dailyRes.json();
        setDailySales(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching sales stats:', err);
    }
  };

  const fetchData = async () => {
    try {
      const [prodRes, orderRes, catRes] = await Promise.all([
        fetch(`/api/products/farmer/${user?.id}`),
        fetch(`/api/orders/farmer/${user?.id}`),
        fetch('/api/categories')
      ]);
      
      const prodData = prodRes.ok ? await prodRes.json() : [];
      const orderData = orderRes.ok ? await orderRes.json() : [];
      const catData = catRes.ok ? await catRes.json() : [];
      
      setProducts(Array.isArray(prodData) ? prodData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      
      if (Array.isArray(catData) && catData.length > 0 && !editingProduct) {
        setFormData(prev => ({ ...prev, category_id: catData[0].id }));
      }
    } catch (err) {
      console.error('Error fetching farmer data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Product Management Logic
   * Handles multi-unit pricing and stock persistence.
   */
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      showNotify('Please select or upload a product image', 'error');
      return;
    }
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, farmer_id: user?.id })
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingProduct(null);
        setFormData({ 
          name: '', 
          egg_type: '',
          description: '', 
          price: 0, 
          price_per_tray: 0,
          price_per_dozen: 0,
          stock: 0, 
          stock_tray: 0,
          stock_dozen: 0,
          category_id: 1, 
          image_url: '' 
        });
        fetchData();
        showNotify(`Product ${editingProduct ? 'updated' : 'created'} successfully!`, 'success');
      } else {
        const data = await response.json();
        showNotify(data.error || 'Failed to save product', 'error');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      showNotify('An error occurred while saving the product', 'error');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(`/api/products/${productToDelete}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) {
        fetchData();
        showNotify('Product deleted successfully!', 'success');
      } else {
        showNotify(data.error || 'Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotify('An error occurred while deleting the product', 'error');
    }
  };

  const fetchOrderItems = async (orderId: number) => {
    setOrderItems([]);
    try {
      const res = await fetch(`/api/orders/${orderId}/items`);
      if (res.ok) {
        const data = await res.json();
        setOrderItems(data);
      }
    } catch (err) {
      console.error('Error fetching order items:', err);
    }
  };

  /**
   * Order Fulfillment Workflow
   * Transitions orders through: Pending -> Processing -> On the Way -> Delivered
   */
  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const stats = {
    totalSales: orders.reduce((sum, o) => sum + (o.status === 'delivered' ? Number(o.total_amount) : 0), 0),
    activeOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
    lowStock: products.filter(p => p.stock < 10).length,
    totalProducts: products.length
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sales', value: `₱${stats.totalSales.toFixed(2)}`, icon: TrendingUp, color: 'emerald' },
          { label: 'Active Orders', value: stats.activeOrders, icon: ClipboardList, color: 'blue' },
          { label: 'Low Stock Items', value: stats.lowStock, icon: AlertCircle, color: 'orange' },
          { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'purple' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-emerald-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-emerald-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-800 rounded-3xl flex items-center justify-center text-emerald-400">
            <MessageSquare size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Need assistance?</h3>
            <p className="text-emerald-300 text-sm">Contact our support team for any platform-related issues.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/messages?role=admin')}
          className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-lg active:scale-95 whitespace-nowrap"
        >
          Contact Admin Support
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
            <h3 className="font-bold text-emerald-900">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-emerald-50">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {order.customer_name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">{order.customer_name}</p>
                    <p className="text-xs text-emerald-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-900 text-sm">₱{Number(order.total_amount).toFixed(2)}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'on the way' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-12 text-center text-emerald-400 italic text-sm">No orders yet.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-emerald-50">
            <h3 className="font-bold text-emerald-900 text-sm md:text-base">Inventory Alerts</h3>
          </div>
          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            {products.filter(p => p.stock < 10).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 md:p-4 bg-orange-50 rounded-xl md:rounded-2xl border border-orange-100">
                <div className="flex items-center gap-2 md:gap-3">
                  <img src={product.image_url || EGG_PLACEHOLDER} className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-bold text-emerald-900 text-xs md:text-sm">{product.name}</p>
                    <p className="text-[10px] md:text-xs text-orange-600 font-medium">{product.stock} units remaining</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setEditingProduct(product);
                    setFormData({
                      name: product.name,
                      egg_type: product.egg_type || '',
                      description: product.description,
                      price: product.price,
                      price_per_tray: product.price_per_tray || 0,
                      price_per_dozen: product.price_per_dozen || 0,
                      stock: product.stock,
                      stock_tray: product.stock_tray || 0,
                      stock_dozen: product.stock_dozen || 0,
                      category_id: product.category_id,
                      image_url: product.image_url
                    });
                    setShowAddModal(true);
                  }}
                  className="bg-white text-orange-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold shadow-sm hover:shadow-md transition-all"
                >
                  Restock
                </button>
              </div>
            ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={32} />
                <p className="text-emerald-500 text-sm">All inventory levels are healthy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-emerald-900">Manage Products</h2>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ 
              name: '', 
              egg_type: '',
              description: '', 
              price: 0, 
              price_per_tray: 0,
              price_per_dozen: 0,
              stock: 0, 
              stock_tray: 0,
              stock_dozen: 0,
              category_id: 1, 
              image_url: '' 
            });
            setShowAddModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold flex items-center gap-1.5 md:gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95 text-xs md:text-base"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-emerald-100 shadow-sm group">
            <div className="relative h-32 md:h-40">
              <img src={product.image_url || EGG_PLACEHOLDER} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-2 right-2 md:top-3 md:right-3 flex gap-1.5 md:gap-2">
                <button 
                  onClick={() => {
                    setEditingProduct(product);
                    setFormData({
                      name: product.name,
                      egg_type: product.egg_type || '',
                      description: product.description,
                      price: product.price,
                      price_per_tray: product.price_per_tray || 0,
                      price_per_dozen: product.price_per_dozen || 0,
                      stock: product.stock,
                      stock_tray: product.stock_tray || 0,
                      stock_dozen: product.stock_dozen || 0,
                      category_id: product.category_id,
                      image_url: product.image_url
                    });
                    setShowAddModal(true);
                  }}
                  className="p-1.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-1.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-3 md:p-5">
              <div className="flex justify-between items-start mb-1 md:mb-2">
                <h3 className="font-bold text-emerald-900 text-sm md:text-base">{product.name}</h3>
                <span className="text-emerald-600 font-bold text-xs md:text-sm">₱{Number(product.price).toFixed(2)}</span>
              </div>
              
              {product.egg_type && (
                <p className="text-[8px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 md:mb-2">
                  Type: <span className="text-emerald-600">{product.egg_type}</span>
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                {product.price_per_dozen && Number(product.price_per_dozen) > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg border border-emerald-100">
                    ₱{Number(product.price_per_dozen).toFixed(2)} / doz
                  </span>
                )}
                {product.price_per_tray && Number(product.price_per_tray) > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg border border-emerald-100">
                    ₱{Number(product.price_per_tray).toFixed(2)} / tray
                  </span>
                )}
              </div>

              <p className="text-emerald-500 text-xs mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-emerald-50">
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">{product.category_name}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold ${product.stock < 10 ? 'text-orange-500' : 'text-emerald-700'}`}>
                    Stock: {product.stock} units
                  </span>
                  {product.stock_dozen !== undefined && product.stock_dozen > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      {product.stock_dozen} dozens
                    </span>
                  )}
                  {product.stock_tray !== undefined && product.stock_tray > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      {product.stock_tray} trays
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-emerald-900">Customer Orders</h2>
      
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-emerald-50/50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-emerald-50/20 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-emerald-900">#{order.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                      {order.customer_name?.[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-emerald-800">{order.customer_name}</span>
                      <button 
                        onClick={() => navigate(`/messages?farmerId=${order.customer_id}&farmerName=${encodeURIComponent(order.customer_name || '')}`)}
                        className="text-[10px] text-emerald-500 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <MessageSquare size={10} /> Message Customer
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-900">₱{Number(order.total_amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-emerald-500">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'on the way' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        fetchOrderItems(order.id);
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="View Details"
                    >
                      <ClipboardList size={18} />
                    </button>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Process Order"
                      >
                        <Clock size={18} />
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'on the way')}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        title="Mark On The Way"
                      >
                        <Truck size={18} />
                      </button>
                    )}
                    {order.status === 'on the way' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Mark Delivered"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Cancel Order"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-12 text-center text-emerald-400 italic">No orders found.</div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  {order.customer_name?.[0]}
                </div>
                <div>
                  <p className="font-bold text-emerald-900">#{order.id}</p>
                  <p className="text-xs text-emerald-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                order.status === 'on the way' ? 'bg-purple-100 text-purple-700' :
                'bg-red-100 text-red-700'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="flex justify-between items-end pt-4 border-t border-emerald-50">
              <div>
                <p className="text-xs text-emerald-500 mb-1">Customer</p>
                <p className="font-bold text-emerald-900">{order.customer_name}</p>
                <button 
                  onClick={() => navigate(`/messages?farmerId=${order.customer_id}&farmerName=${encodeURIComponent(order.customer_name || '')}`)}
                  className="text-[10px] text-emerald-500 hover:text-emerald-700 flex items-center gap-1 mt-1"
                >
                  <MessageSquare size={10} /> Message Customer
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-500 mb-1">Total Amount</p>
                <p className="text-xl font-display font-bold text-emerald-900">₱{order.total_amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => {
                  setSelectedOrder(order);
                  fetchOrderItems(order.id);
                }}
                className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <ClipboardList size={16} /> Details
              </button>
              {order.status === 'pending' && (
                <button 
                  onClick={() => updateOrderStatus(order.id, 'processing')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Clock size={16} /> Process
                </button>
              )}
              {order.status === 'processing' && (
                <button 
                  onClick={() => updateOrderStatus(order.id, 'on the way')}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Truck size={16} /> Ship
                </button>
              )}
              {order.status === 'on the way' && (
                <button 
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Delivered
                </button>
              )}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button 
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="py-12 text-center text-emerald-400 italic text-sm">No orders found.</div>
        )}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-emerald-900">Inventory Status</h2>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-orange-500 rounded-full" /> Low Stock
          </span>
          <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Healthy
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-emerald-50/50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Prices</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Current Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-emerald-50/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={product.image_url || EGG_PLACEHOLDER} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-900 text-sm">{product.name}</span>
                      {product.egg_type && (
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">{product.egg_type}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-emerald-600 font-bold">₱{product.price.toFixed(2)}/unit</span>
                    {product.price_per_dozen && product.price_per_dozen > 0 && (
                      <span className="text-[10px] text-emerald-400">₱{product.price_per_dozen.toFixed(2)}/doz</span>
                    )}
                    {product.price_per_tray && product.price_per_tray > 0 && (
                      <span className="text-[10px] text-emerald-400">₱{product.price_per_tray.toFixed(2)}/tray</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-emerald-500">{product.category_name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`font-bold text-sm ${product.stock < 10 ? 'text-orange-600' : 'text-emerald-900'}`}>
                      {product.stock} units
                    </span>
                    {product.stock_dozen !== undefined && product.stock_dozen > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600">
                        {product.stock_dozen} dozens
                      </span>
                    )}
                    {product.stock_tray !== undefined && product.stock_tray > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600">
                        {product.stock_tray} trays
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    product.stock < 10 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {product.stock < 10 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                  onClick={() => {
                      setEditingProduct(product);
                      setFormData({
                        name: product.name,
                        egg_type: product.egg_type || '',
                        description: product.description,
                        price: product.price,
                        price_per_tray: product.price_per_tray || 0,
                        price_per_dozen: product.price_per_dozen || 0,
                        stock: product.stock,
                        stock_tray: product.stock_tray || 0,
                        stock_dozen: product.stock_dozen || 0,
                        category_id: product.category_id,
                        image_url: product.image_url
                      });
                      setShowAddModal(true);
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-xs hover:underline"
                  >
                    Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {products.map(product => (
          <div key={product.id} className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <img src={product.image_url || EGG_PLACEHOLDER} className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-emerald-900">{product.name}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    product.stock < 10 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {product.stock < 10 ? 'Low' : 'OK'}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">{product.category_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-emerald-50">
              <div>
                <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Stock Levels</p>
                <div className="space-y-1">
                  <p className={`text-sm font-bold ${product.stock < 10 ? 'text-orange-600' : 'text-emerald-900'}`}>{product.stock} Units</p>
                  {product.stock_dozen !== undefined && product.stock_dozen > 0 && (
                    <p className="text-xs text-emerald-600">{product.stock_dozen} Dozens</p>
                  )}
                  {product.stock_tray !== undefined && product.stock_tray > 0 && (
                    <p className="text-xs text-emerald-600">{product.stock_tray} Trays</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Pricing</p>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-emerald-900">₱{product.price.toFixed(2)}/u</p>
                  {product.price_per_dozen && product.price_per_dozen > 0 && (
                    <p className="text-xs text-emerald-600">₱{product.price_per_dozen.toFixed(2)}/d</p>
                  )}
                  {product.price_per_tray && product.price_per_tray > 0 && (
                    <p className="text-xs text-emerald-600">₱{product.price_per_tray.toFixed(2)}/t</p>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setEditingProduct(product);
                setFormData({
                  name: product.name,
                  egg_type: product.egg_type || '',
                  description: product.description,
                  price: product.price,
                  price_per_tray: product.price_per_tray || 0,
                  price_per_dozen: product.price_per_dozen || 0,
                  stock: product.stock,
                  stock_tray: product.stock_tray || 0,
                  stock_dozen: product.stock_dozen || 0,
                  category_id: product.category_id,
                  image_url: product.image_url
                });
                setShowAddModal(true);
              }}
              className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all"
            >
              Update Stock & Pricing
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSales = () => {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);
    
    return (
      <div className="space-y-8 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-emerald-900">Sales Reports & Analytics</h2>
          <div className="flex gap-2">
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold">
              Lifetime Revenue: ₱{totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-emerald-100 shadow-sm p-8">
            <h3 className="font-bold text-emerald-900 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Revenue Trends (Last 30 Days)
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={dailySales}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#10b981'}}
                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#10b981'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            {/* Top Products */}
            <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100">
              <BarChart3 size={32} className="text-emerald-400 mb-4" />
              <h4 className="text-lg font-bold mb-1 text-white">Top Selling Products</h4>
              <p className="text-emerald-300 text-xs mb-6">Performance by units sold</p>
              <div className="space-y-4">
                {salesStats.map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-100 truncate pr-2">{stat.name}</span>
                      <span className="font-bold">{stat.total_sold} sold</span>
                    </div>
                    <div className="w-full bg-emerald-800 h-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.total_sold / Math.max(...salesStats.map(s => s.total_sold))) * 100}%` }}
                        className="bg-emerald-400 h-full" 
                      />
                    </div>
                  </div>
                ))}
                {salesStats.length === 0 && (
                  <div className="text-center py-8 text-emerald-400 text-xs italic">No sales data yet.</div>
                )}
              </div>
            </div>

            {/* Order Status Pie */}
            <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm">
              <h4 className="font-bold text-emerald-900 mb-4 text-sm flex items-center gap-2">
                <ClipboardList size={16} className="text-emerald-500" />
                Order Distribution
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
                        { name: 'Processing', value: orders.filter(o => o.status === 'processing').length },
                        { name: 'Pending', value: orders.filter(o => o.status === 'pending').length },
                        { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        <Cell key="0" fill="#10b981" />,
                        <Cell key="1" fill="#3b82f6" />,
                        <Cell key="2" fill="#f59e0b" />,
                        <Cell key="3" fill="#ef4444" />,
                      ]}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { label: 'Delivered', color: 'bg-emerald-500' },
                  { label: 'Processing', color: 'bg-blue-500' },
                  { label: 'Pending', color: 'bg-orange-500' },
                  { label: 'Cancelled', color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5 text-[10px]">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-emerald-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-emerald-50 flex justify-between items-center">
            <h3 className="font-bold text-emerald-900">Recent Transactions</h3>
            <button className="text-xs font-bold text-emerald-600 hover:underline">Download Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-emerald-50/50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {orders.slice(0, 10).map(order => (
                  <tr key={order.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-emerald-900">#{order.id}</td>
                    <td className="px-6 py-4 text-xs text-emerald-800">{order.customer_name}</td>
                    <td className="px-6 py-4 text-xs text-emerald-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-900">₱{order.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'on the way' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'manage-products' && renderProducts()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'inventory' && renderInventory()}
      {activeTab === 'sales' && renderSales()}
      {activeTab === 'site-settings' && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-6 md:p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">Manage Contact Us & Site Info</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Site Name</label>
              <input 
                type="text" 
                value={siteSettings.site_name} 
                onChange={e => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Site Description</label>
              <textarea 
                rows={3}
                value={siteSettings.site_description} 
                onChange={e => setSiteSettings({ ...siteSettings, site_description: e.target.value })}
                className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Contact Phone</label>
                <input 
                  type="text" 
                  value={siteSettings.contact_phone} 
                  onChange={e => setSiteSettings({ ...siteSettings, contact_phone: e.target.value })}
                  className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Contact Email</label>
                <input 
                  type="email" 
                  value={siteSettings.contact_email} 
                  onChange={e => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                  className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Contact Address</label>
              <input 
                type="text" 
                value={siteSettings.contact_address} 
                onChange={e => setSiteSettings({ ...siteSettings, contact_address: e.target.value })}
                className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>
            <button 
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
            >
              Save Site Settings
            </button>
          </form>
        </div>
      )}
      {activeTab === 'messages' && (
        <div className="h-[calc(100vh-12rem)]">
          <MessagingSystem />
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-xl">Order Details</h3>
                  <p className="text-emerald-100 text-xs">Order #{selectedOrder.id} • {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-6">
                  <div className="flex justify-between items-start border-b border-emerald-50 pb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-emerald-900">Customer</h4>
                      <p className="text-sm text-emerald-600">{selectedOrder.customer_name}</p>
                      {(selectedOrder.customer_address || selectedOrder.customer_purok) && (
                        <div className="mt-2">
                          <p className="text-xs text-emerald-500 flex items-center gap-1">
                            <MapPin size={12} />
                            {selectedOrder.customer_purok && `Purok ${selectedOrder.customer_purok}, `}
                            {selectedOrder.customer_address}
                          </p>
                          <a 
                            href={selectedOrder.customer_latitude && selectedOrder.customer_longitude 
                              ? `https://www.google.com/maps/search/?api=1&query=${selectedOrder.customer_latitude},${selectedOrder.customer_longitude}`
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedOrder.customer_purok ? `Purok ${selectedOrder.customer_purok}, ` : ''}${selectedOrder.customer_address}`)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:underline font-bold mt-1 inline-block"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-emerald-900">Status</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        selectedOrder.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        selectedOrder.status === 'on the way' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="py-4">
                    <div className="flex justify-between mb-8 relative px-4">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-emerald-100 -translate-y-1/2 z-0" />
                      {[
                        { id: 'pending', icon: Clock, label: 'Pending' },
                        { id: 'processing', icon: Package, label: 'Processing' },
                        { id: 'on the way', icon: Truck, label: 'On the Way' },
                        { id: 'delivered', icon: CheckCircle2, label: 'Delivered' }
                      ].map((step, i) => {
                        const isCompleted = selectedOrder.status === step.id || 
                                          (step.id === 'pending' && selectedOrder.status !== 'cancelled') ||
                                          (step.id === 'processing' && (selectedOrder.status === 'on the way' || selectedOrder.status === 'delivered')) ||
                                          (step.id === 'on the way' && selectedOrder.status === 'delivered');
                        return (
                          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                              isCompleted ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-300'
                            }`}>
                              <step.icon size={18} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted ? 'text-emerald-700' : 'text-emerald-300'
                            }`}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <h4 className="font-bold text-emerald-900">Items Ordered</h4>
                  <div className="space-y-4">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={item.image_url || EGG_PLACEHOLDER} className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold text-emerald-900">{item.name}</p>
                            <div className="flex flex-col">
                              {item.egg_type && (
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Type: {item.egg_type}</p>
                              )}
                              <p className="text-sm text-emerald-500">{item.quantity} {item.unit || 'unit'}(s) x ₱{item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        <p className="font-bold text-emerald-900">₱{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-emerald-50 flex justify-between items-center">
                    <span className="text-emerald-600 font-bold">Total Amount</span>
                    <span className="text-3xl font-bold text-emerald-900">₱{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-emerald-50 flex gap-3 shrink-0">
                {selectedOrder.status === 'pending' && (
                  <button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'processing');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Clock size={20} /> Process Order
                  </button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'on the way');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Truck size={20} /> Mark On The Way
                  </button>
                )}
                {selectedOrder.status === 'on the way' && (
                  <button 
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'delivered');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} /> Mark Delivered
                  </button>
                )}
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-3 bg-white text-emerald-600 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-50 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteProduct}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
      />

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <ImageIcon size={24} />
                  Image Gallery
                </h3>
                <button onClick={() => setShowGallery(false)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {EGG_GALLERY.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image_url: img.url });
                        setShowGallery(false);
                      }}
                      className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all"
                    >
                      <img src={img.url || EGG_PLACEHOLDER} alt={img.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{img.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setShowGallery(false)}
                    className="px-6 py-2 text-emerald-600 font-bold hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-xl">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Product Name</label>
                  <input 
                    type="text" required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Fresh Chicken Eggs"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Egg Type</label>
                  <input 
                    type="text"
                    value={formData.egg_type}
                    onChange={e => setFormData({ ...formData, egg_type: e.target.value })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Brown, White, Organic"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Price per Unit (₱)</label>
                  <input 
                    type="number" step="0.01" required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Stock (Units)</label>
                  <input 
                    type="number" required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Price per Tray (₱)</label>
                  <input 
                    type="number" step="0.01"
                    value={formData.price_per_tray}
                    onChange={e => setFormData({ ...formData, price_per_tray: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Stock (Trays)</label>
                  <input 
                    type="number"
                    value={formData.stock_tray}
                    onChange={e => setFormData({ ...formData, stock_tray: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Price per Dozen (₱)</label>
                  <input 
                    type="number" step="0.01"
                    value={formData.price_per_dozen}
                    onChange={e => setFormData({ ...formData, price_per_dozen: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Stock (Dozens)</label>
                  <input 
                    type="number"
                    value={formData.stock_dozen}
                    onChange={e => setFormData({ ...formData, stock_dozen: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Category</label>
                  <select 
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Product Image</label>
                    <button 
                      type="button"
                      onClick={() => setShowGallery(true)}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 uppercase tracking-wider"
                    >
                      <ImageIcon size={12} />
                      Choose from Gallery
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="flex items-center justify-center w-full px-4 py-2 bg-emerald-50 border border-emerald-100 border-dashed rounded-xl cursor-pointer hover:bg-emerald-100/50 transition-all group">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Upload size={18} className="group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Upload Image File</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      <div className="mt-2">
                        <input 
                          type="text"
                          value={formData.image_url.startsWith('data:') ? 'File selected' : formData.image_url}
                          readOnly
                          className="w-full px-4 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-[10px] text-emerald-500 outline-none"
                          placeholder="No image selected"
                        />
                      </div>
                    </div>
                    {formData.image_url && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-100 shrink-0 shadow-sm">
                        <img src={formData.image_url || EGG_PLACEHOLDER} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    placeholder="Tell customers about your eggs..."
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95 mt-4"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
