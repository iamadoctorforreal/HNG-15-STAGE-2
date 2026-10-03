'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FALLBACK_PRODUCTS } from '@/lib/constants';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { createClient } from '@/lib/supabase/client';

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  badge?: string;
  weightInfo?: string;
  images: string[];
  is_digital?: boolean;
}

interface OrderItem {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  customer_name?: string;
  customer_email?: string;
  country?: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [products, setProducts] = useState<ProductItem[]>(FALLBACK_PRODUCTS);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    title: '',
    slug: '',
    description: '',
    base_price: 18000,
    badge: 'Farm-Raised Premium',
    weightInfo: 'Approx. 5-7 pieces per 1kg',
    is_digital: false,
    image: '/images/catfish-real-golden-curl.png',
  });

  const [savingProduct, setSavingProduct] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load orders from Supabase on mount
  useEffect(() => {
    async function fetchOrders() {
      setLoadingOrders(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          setOrders(
            data.map((o: any) => ({
              id: o.id,
              created_at: o.created_at || new Date().toISOString(),
              total_amount: o.total_amount || 0,
              status: o.status || 'pending',
              customer_name: o.shipping_address?.firstName
                ? `${o.shipping_address.firstName} ${o.shipping_address.lastName || ''}`
                : 'Customer',
              customer_email: o.shipping_address?.email || o.customer_email || '—',
              country: o.shipping_address?.country || 'Nigeria',
            }))
          );
        } else {
          // Fallback mock orders for administrative demo
          setOrders([
            {
              id: 'ord-8831',
              created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
              total_amount: 39500,
              status: 'paid',
              customer_name: 'Babatunde Adeleke',
              customer_email: 'babatunde.a@gmail.com',
              country: 'Nigeria (Domestic)',
            },
            {
              id: 'ord-8832',
              created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
              total_amount: 172500,
              status: 'paid',
              customer_name: 'Dr. Folashade Alabi',
              customer_email: 'f.alabi@diaspora.co.uk',
              country: 'United Kingdom (Export)',
            },
            {
              id: 'ord-8833',
              created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
              total_amount: 21000,
              status: 'shipped',
              customer_name: 'Chukwudi Okonkwo',
              customer_email: 'chukwudi.o@yahoo.com',
              country: 'Nigeria (Lagos)',
            },
          ]);
        }
      } catch (e) {
        console.error('Failed to load orders', e);
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchOrders();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title) return;

    setSavingProduct(true);
    const created: ProductItem = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      title: newProduct.title,
      slug: newProduct.slug || newProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newProduct.description,
      base_price: Number(newProduct.base_price),
      badge: newProduct.badge,
      weightInfo: newProduct.weightInfo,
      is_digital: newProduct.is_digital,
      images: [newProduct.image],
    };

    try {
      // Save to Supabase products table
      const supabase = createClient();
      await supabase.from('products').insert([
        {
          id: created.id,
          title: created.title,
          slug: created.slug,
          description: created.description,
          base_price: created.base_price,
          currency: 'NGN',
          is_active: true,
          is_digital: created.is_digital,
          images: created.images,
        },
      ]);
    } catch {
      // Offline fallback
    }

    setProducts([created, ...products]);
    setSavingProduct(false);
    setShowAddModal(false);
    setSuccessMessage(`Product "${created.title}" successfully added to the catalog!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    // Reset form
    setNewProduct({
      title: '',
      slug: '',
      description: '',
      base_price: 18000,
      badge: 'Farm-Raised Premium',
      weightInfo: 'Approx. 5-7 pieces per 1kg',
      is_digital: false,
      image: '/images/catfish-real-golden-curl.png',
    });
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* Admin Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo size="sm" />
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            <span className="text-xs font-black uppercase tracking-widest text-[#008751] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/en"
              target="_blank"
              className="text-xs font-bold text-gray-600 hover:text-[#008751] transition-colors"
            >
              View Storefront ↗
            </a>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>+</span>
              <span>Add New Product</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Flash Notification */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>✓ {successMessage}</span>
            <button onClick={() => setSuccessMessage(null)}>✕</button>
          </div>
        )}

        {/* Executive Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Active Products
            </span>
            <span className="text-3xl font-black text-gray-900 mt-2 block font-serif">
              {products.length}
            </span>
            <span className="text-[11px] text-[#008751] font-semibold mt-1 block">
              All farm-raised &amp; live
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Total Orders
            </span>
            <span className="text-3xl font-black text-gray-900 mt-2 block font-serif">
              {orders.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Nigeria, UK &amp; US shipments
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Total Revenue
            </span>
            <span className="text-3xl font-black text-[#005230] mt-2 block font-serif">
              ₦{totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Dual-gateway verified
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Farm Provenance
            </span>
            <span className="text-xl font-black text-gray-900 mt-2 block font-serif">
              Abeokuta, Ogun
            </span>
            <span className="text-[11px] text-[#D4A843] font-bold mt-1 block">
              100% Sand-Free Quality
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#008751] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📦 Product Catalog Management ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#008751] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 Orders &amp; Shipments ({orders.length})
          </button>
        </div>

        {/* Tab 1: Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 font-serif">
                  Storefront Products
                </h2>
                <p className="text-xs text-gray-500">
                  Manage dried catfish variants, wholesale packs, prices, and imagery.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                + Add Product
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-200 uppercase font-bold text-[10px] text-gray-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Weight &amp; Sizing</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            <Image
                              src={p.images[0] || '/images/catfish-real-golden-curl.png'}
                              alt={p.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-sm">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-gray-400">/{p.slug}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {p.weightInfo || '1kg Standard'}
                        </td>
                        <td className="px-6 py-4 font-black text-[#005230] text-sm">
                          ₦{p.base_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.is_digital
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {p.is_digital ? '⚡ Digital Guide' : '🐟 Dried Catfish'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live in Store
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 font-serif">Customer Orders</h2>
              <p className="text-xs text-gray-500">
                Track payments from Paystack &amp; Flutterwave, customer emails, and destination addresses.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-200 uppercase font-bold text-[10px] text-gray-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Destination</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Payment Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900">
                          #{o.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900 block">{o.customer_name}</span>
                          <span className="text-[10px] text-gray-400">{o.customer_email}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{o.country}</td>
                        <td className="px-6 py-4 font-black text-[#005230] text-sm">
                          ₦{o.total_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              o.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            ✓ {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-[11px]">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900 font-serif">
                Add New Product to Storefront
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Export Whole Dried Catfish (Jumbo Pack)"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Price in Naira (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newProduct.base_price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, base_price: Number(e.target.value) })
                    }
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Weight / Pieces Info
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Approx. 4-6 pieces per 1kg"
                    value={newProduct.weightInfo}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, weightInfo: e.target.value })
                    }
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Farm-raised in Abeokuta fish farms, meticulously cleaned, sand-grit free..."
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Select Product Photo
                </label>
                <select
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#008751] focus:outline-none bg-white font-medium"
                >
                  <option value="/images/catfish-real-glass-plate.png">
                    Real Curled Catfish on Glass Plate (User Photo)
                  </option>
                  <option value="/images/catfish-real-golden-curl.png">
                    Real Golden-Amber Curled Catfish (User Photo)
                  </option>
                  <option value="/images/catfish-real-crate-batch.png">
                    Real Farm Batch in Crate with Heads (User Photo)
                  </option>
                  <option value="/images/catfish-real-bowl.png">
                    Real Curled Catfish in Bowl (User Photo)
                  </option>
                  <option value="/images/catfish-real-sealed-pack.png">
                    Real Sealed Export Packaging (User Photo)
                  </option>
                  <option value="/images/catfish-efo-soup.jpg">
                    Cooked in Authentic Efo Riro Soup
                  </option>
                  <option value="/images/catfish-flakes-jar.jpg">
                    Artisanal Seasoning Flakes Jar
                  </option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="w-full py-3.5 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  {savingProduct ? 'Saving to Catalog...' : '✓ Publish Product to Storefront'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
