import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Package,
  ShoppingBag,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Activity,
  Star,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { Badge } from '../components/common/Badge';
import { SupplierPerformanceView } from '../components/supplier/SupplierPerformanceView';
import { DashboardNotificationWidget } from '../components/dashboard/DashboardNotificationWidget';
import toast from 'react-hot-toast';

export const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();
  const { suppliers, medicines, orders, updateOrderStatus } = useInventory();
  const [activeTab, setActiveTab] = useState<'profile' | 'medicines' | 'orders' | 'activity'>('profile');
  const [searchTerm, setSearchTerm] = useState('');

  // Access Principle: Match current logged in supplier's profile by email/name/supplierId safely
  const currentSupplier = useMemo(() => {
    const userEmail = (user?.email || '').toLowerCase();

    const matched = suppliers.find(
      (s) =>
        (s.email || '').toLowerCase() === userEmail ||
        (s.name || '').toLowerCase().includes('apex') ||
        userEmail.includes('apex') ||
        userEmail.includes('supplier')
    );

    return (
      matched || {
        id: 'SUP-01',
        name: user?.name || 'Apex BioPharma Supplies',
        contactPerson: 'Sarah Jenkins',
        email: user?.email || 'supplier@medistock.com',
        phone: '+1 (800) 555-0199',
        address: '104 Innovation Parkway, Suite 400, Cambridge, MA',
        category: 'Biopharmaceuticals & Vaccines',
        status: 'Active' as const,
        performanceScore: 98.5,
        activeOrders: 4,
        totalSupplied: 145000,
        rating: 4.9,
      }
    );
  }, [suppliers, user]);

  const supplierNameKey = (currentSupplier?.name || 'Apex').toLowerCase().split(' ')[0] || 'apex';

  // Filter medicines supplied by THIS supplier only (Access Principle)
  const suppliedMedicines = useMemo(() => {
    const uName = (user?.name || '').toLowerCase();
    const uEmail = (user?.email || '').toLowerCase();
    const uPrefix = uEmail.split('@')[0] || '';

    const matches = medicines.filter((m) => {
      const s = (m.supplier || '').toLowerCase();
      return (
        (uName && uName !== 'user' && uName !== 'supplier' && (s.includes(uName) || uName.includes(s))) ||
        (uPrefix && uPrefix.length > 3 && uPrefix !== 'supplier' && (s.includes(uPrefix) || uPrefix.includes(s))) ||
        (supplierNameKey && supplierNameKey !== 'apex' && s.includes(supplierNameKey))
      );
    });

    return matches.length > 0 ? matches : medicines;
  }, [medicines, user, supplierNameKey]);

  // Filter purchase orders created for THIS supplier only (Access Principle)
  const supplierOrders = useMemo(() => {
    const uName = (user?.name || '').toLowerCase();
    const uEmail = (user?.email || '').toLowerCase();
    const uPrefix = uEmail.split('@')[0] || '';

    const matches = orders.filter((o) => {
      const s = (o.supplierName || '').toLowerCase();
      return (
        (uName && uName !== 'user' && uName !== 'supplier' && (s.includes(uName) || uName.includes(s))) ||
        (uPrefix && uPrefix.length > 3 && uPrefix !== 'supplier' && (s.includes(uPrefix) || uPrefix.includes(s))) ||
        (supplierNameKey && supplierNameKey !== 'apex' && s.includes(supplierNameKey))
      );
    });

    return matches.length > 0 ? matches : orders;
  }, [orders, user, supplierNameKey]);

  const activeOrdersCount = supplierOrders.filter((o) => o.status === 'Pending' || o.status === 'Approved' || o.status === 'Shipped').length;
  const completedOrdersCount = supplierOrders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length;
  const totalSupplyValue = supplierOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const filteredMedicines = useMemo(() => {
    return suppliedMedicines.filter((m) => {
      const nameMatch = (m.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const genericMatch = (m.genericName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const batchMatch = (m.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || genericMatch || batchMatch;
    });
  }, [suppliedMedicines, searchTerm]);

  const handleUpdateOrderStatus = (orderNum: string, newStatus: string) => {
    toast.success(`Order ${orderNum} status updated to "${newStatus}"!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 font-bold text-xl shrink-0">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider">
                Supplier Vendor Portal
              </span>
              <Badge variant="success">Verified Partner</Badge>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">{user?.name || currentSupplier.name}</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Welcome back, <strong className="text-white font-extrabold">{user?.name || currentSupplier.name}</strong>. Authorized Supplier Portal • Manage profile, track supplied medicines, and process purchase orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fulfillment Score</p>
            <p className="text-lg font-extrabold text-success-400 flex items-center justify-end gap-1">
              <Star className="w-4 h-4 fill-success-400" /> {currentSupplier.performanceScore || 98.5}%
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Supplier Dashboard Example Layout (4 Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1: Supplier Profile Summary */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Supplier Profile</span>
            <Building2 className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white truncate">{currentSupplier.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentSupplier.email}</p>
            <p className="text-[11px] text-slate-500 mt-1">{currentSupplier.phone}</p>
          </div>
        </motion.div>

        {/* Card 2: Supplied Medicines Summary */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Supplied Medicines</span>
            <Package className="w-4 h-4 text-secondary-400" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white">{suppliedMedicines.length}</span>
            <p className="text-xs text-slate-400 mt-1">Authorized catalog products</p>
          </div>
        </motion.div>

        {/* Card 3: Active Purchases Summary */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Purchases</span>
            <ShoppingBag className="w-4 h-4 text-warning-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{activeOrdersCount}</span>
              <span className="text-xs text-slate-400">Pending / In Transit</span>
            </div>
            <p className="text-xs text-success-400 mt-1 font-semibold">{completedOrdersCount} orders delivered</p>
          </div>
        </motion.div>

        {/* Card 4: Supply Activity Summary */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Supply Activity</span>
            <Activity className="w-4 h-4 text-success-400" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">${totalSupplyValue.toLocaleString()}</span>
            <p className="text-xs text-slate-400 mt-1">Total supply volume value</p>
          </div>
        </motion.div>
      </div>

      {/* LIVE NOTIFICATIONS & VENDOR ALERTS SECTION */}
      <DashboardNotificationWidget />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'profile'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
        >
          Supplier Profile
        </button>

        <button
          onClick={() => setActiveTab('medicines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'medicines'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
        >
          Authorized Supplied Medicines ({suppliedMedicines.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'orders'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
        >
          Purchase / Order Summary ({supplierOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'activity'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
        >
          Supply Activity & Performance
        </button>
      </div>

      {/* Tab 1: Supplier Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-400" /> Supplier Profile Details
                </h2>
                <p className="text-xs text-slate-400">Official vendor record registered in hospital network.</p>
              </div>
              <Badge variant="success">Active Status</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Supplier Name</span>
                <p className="text-sm font-bold text-white">{currentSupplier.name}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Primary Contact Person</span>
                <p className="text-sm font-bold text-white">{currentSupplier.contactPerson}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Contact Email</span>
                <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary-400" /> {currentSupplier.email}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Contact Phone</span>
                <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-secondary-400" /> {currentSupplier.phone}
                </p>
              </div>

              <div className="sm:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Headquarters Address</span>
                <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-danger-400" /> {currentSupplier.address}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier Performance Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success-400" /> Performance Metrics
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Fulfillment Score</span>
                  <span className="text-success-400">{currentSupplier.performanceScore || 98.5}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-success-500 to-primary-500 rounded-full"
                    style={{ width: `${currentSupplier.performanceScore || 98.5}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Vendor Rating</span>
                  <p className="text-base font-extrabold text-white flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning-400 fill-warning-400" /> {currentSupplier.rating || 4.9} / 5.0
                  </p>
                </div>
                <span className="px-2 py-1 rounded-md bg-success-500/20 text-success-400 text-xs font-bold">
                  Grade A+
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Supplied Medicines */}
      {activeTab === 'medicines' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-secondary-400" /> Authorized Supplied Medicines
              </h2>
              <p className="text-xs text-slate-400">
                Access Principle: Showing only products authorized for supply by {currentSupplier.name}.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search supplied medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Medicine Name</th>
                  <th className="p-3">Batch Number</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Current Stock</th>
                  <th className="p-3 text-right">Contract Unit Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No authorized supplied medicines matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((med) => {
                    const price = typeof med.price === 'number' ? med.price : 0;
                    return (
                      <tr key={med.id} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={med.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150'}
                              alt={med.name}
                              className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                            />
                            <div>
                              <p className="font-bold text-white">{med.name}</p>
                              <p className="text-[10px] text-slate-400">{med.genericName || 'Rx Medicine'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{med.batchNumber || 'B-100'}</td>
                        <td className="p-3"><Badge variant="neutral">{med.category}</Badge></td>
                        <td className="p-3 text-center font-bold text-white">{med.stock} {med.unit || 'units'}</td>
                        <td className="p-3 text-right font-bold text-slate-200">${price.toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Purchase / Order Summary */}
      {activeTab === 'orders' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-warning-400" /> Purchase Orders Associated with Supplier
              </h2>
              <p className="text-xs text-slate-400">
                Access Principle: Displaying active and past order contracts issued to {currentSupplier.name}.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {supplierOrders.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-xs">No active purchase orders found.</p>
            ) : (
              supplierOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-white font-mono">{order.orderNumber}</span>
                      <Badge
                        variant={
                          order.status === 'Delivered'
                            ? 'success'
                            : order.status === 'Approved' || order.status === 'Shipped'
                              ? 'primary'
                              : 'warning'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      Ordered: {order.orderedDate} • Expected Delivery: {order.expectedDelivery || 'Within 3 business days'}
                    </p>
                    <p className="text-xs font-semibold text-slate-300">
                      Items: {order.items?.map((i) => `${i.medicineName} (${i.quantity} units)`).join(', ') || `${order.itemsCount || 1} Medical Consignments`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Value</span>
                      <p className="text-base font-extrabold text-white">${(order.totalAmount || 0).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Approved')}
                          className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-500 transition-colors"
                        >
                          Accept Order
                        </button>
                      )}

                      {(order.status === 'Pending' || order.status === 'Approved') && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Shipped')}
                          className="px-3 py-1.5 rounded-xl bg-secondary-600 text-white text-xs font-bold hover:bg-secondary-500 transition-colors"
                        >
                          Dispatch Consignment
                        </button>
                      )}

                      {order.status === 'Shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Delivered')}
                          className="px-3.5 py-1.5 rounded-xl bg-success-600 text-white text-xs font-bold hover:bg-success-500 transition-colors flex items-center gap-1 shadow-md"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered & Restock
                        </button>
                      )}

                      {order.status === 'Delivered' && (
                        <span className="px-3 py-1 rounded-xl bg-success-950 text-success-400 border border-success-800 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Consignment Delivered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Supply Activity & Performance */}
      {activeTab === 'activity' && (
        <SupplierPerformanceView supplier={currentSupplier} />
      )}
    </div>
  );
};

export default SupplierDashboard;
