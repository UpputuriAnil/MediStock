import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  FileText,
  UserCheck,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  XCircle,
  PackageCheck
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { PurchaseOrder } from '../types/order';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PurchaseMedicineModal } from '../components/purchase/PurchaseMedicineModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportTableToPDF } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';
import toast from 'react-hot-toast';

export const PurchaseOrders: React.FC = () => {
  const { orders, suppliers, medicines, updateOrderStatus } = useInventory();
  const { user } = useAuth();
  const { isSupplier, isStaff, isAdmin, isPharmacist } = useRole();

  // Modals state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<PurchaseOrder | null>(null);

  // Table Search, Filter, Sort, Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('All');
  const [filterPharmacist, setFilterPharmacist] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'quantity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Pharmacist names for filter dropdown
  const pharmacistOptions = useMemo(() => {
    const names = new Set<string>();
    orders.forEach((o) => {
      if (o.assignedPharmacistName) names.add(o.assignedPharmacistName);
    });
    return Array.from(names);
  }, [orders]);

  // Filtering & Access Rules
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Role access rules
      if (isSupplier) {
        const uName = (user?.name || '').toLowerCase();
        const uEmail = (user?.email || '').toLowerCase();
        const uPrefix = uEmail.split('@')[0] || '';

        const hasSpecificMatch = orders.some((ord) => {
          const s = (ord.supplierName || '').toLowerCase();
          return (
            (uName && uName !== 'user' && uName !== 'supplier' && (s.includes(uName) || uName.includes(s))) ||
            (uPrefix && uPrefix.length > 3 && uPrefix !== 'supplier' && (s.includes(uPrefix) || uPrefix.includes(s)))
          );
        });

        if (hasSpecificMatch) {
          const s = (o.supplierName || '').toLowerCase();
          const isMatch = (
            (uName && uName !== 'user' && uName !== 'supplier' && (s.includes(uName) || uName.includes(s))) ||
            (uPrefix && uPrefix.length > 3 && uPrefix !== 'supplier' && (s.includes(uPrefix) || uPrefix.includes(s)))
          );
          if (!isMatch) return false;
        }
      }

      if (isPharmacist && !isAdmin) {
        const uName = (user?.name || '').toLowerCase();
        const uEmail = (user?.email || '').toLowerCase();
        const uPrefix = uEmail.split('@')[0] || '';

        const hasSpecificMatch = orders.some((ord) => {
          const aName = (ord.assignedPharmacistName || '').toLowerCase();
          const aEmail = (ord.assignedPharmacistEmail || '').toLowerCase();
          return (
            (uName && uName !== 'user' && uName !== 'pharmacist' && (aName.includes(uName) || uName.includes(aName))) ||
            (uEmail && aEmail.includes(uEmail)) ||
            (uPrefix && uPrefix.length > 3 && (aEmail.includes(uPrefix) || aName.includes(uPrefix)))
          );
        });

        if (hasSpecificMatch) {
          const aName = (o.assignedPharmacistName || '').toLowerCase();
          const aEmail = (o.assignedPharmacistEmail || '').toLowerCase();
          const isMatch = (
            (uName && uName !== 'user' && uName !== 'pharmacist' && (aName.includes(uName) || uName.includes(aName))) ||
            (uEmail && aEmail.includes(uEmail)) ||
            (uPrefix && uPrefix.length > 3 && (aEmail.includes(uPrefix) || aName.includes(uPrefix)))
          );
          if (!isMatch) return false;
        }
      }

      // Search query matching
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (o.orderNumber || '').toLowerCase().includes(query) ||
        (o.medicineName || '').toLowerCase().includes(query) ||
        (o.supplierName || '').toLowerCase().includes(query) ||
        (o.assignedPharmacistName || '').toLowerCase().includes(query) ||
        (o.batchNumber || '').toLowerCase().includes(query) ||
        (o.invoiceNumber || '').toLowerCase().includes(query);

      // Filters
      const matchesSup = filterSupplier === 'All' || o.supplierName === filterSupplier;
      const matchesPharm = filterPharmacist === 'All' || o.assignedPharmacistName === filterPharmacist;
      const matchesStat = filterStatus === 'All' || o.status === filterStatus;

      return matchesSearch && matchesSup && matchesPharm && matchesStat;
    });
  }, [orders, isSupplier, isPharmacist, isAdmin, user, searchQuery, filterSupplier, filterPharmacist, filterStatus]);

  // Sorting
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let result = 0;
      if (sortBy === 'date') {
        result = new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime();
      } else if (sortBy === 'total') {
        result = b.totalAmount - a.totalAmount;
      } else if (sortBy === 'quantity') {
        result = (b.quantity || b.itemsCount) - (a.quantity || a.itemsCount);
      }
      return sortOrder === 'asc' ? -result : result;
    });
  }, [filteredOrders, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const handleExportPurchasePDF = () => {
    const headers = [
      'PO ID',
      'MEDICINE NAME',
      'PHARMACIST',
      'SUPPLIER',
      'QTY',
      'PRICE/UNIT',
      'TOTAL ($)',
      'PURCHASE DATE',
      'STATUS',
    ];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.medicineName || 'Multiple Medicines',
      o.assignedPharmacistName || 'Dr. Sarah Jenkins',
      o.supplierName,
      o.quantity || o.itemsCount,
      o.pricePerUnit ? `$${o.pricePerUnit.toFixed(2)}` : 'N/A',
      `$${o.totalAmount.toFixed(2)}`,
      o.orderedDate,
      o.status,
    ]);

    exportTableToPDF('Admin Purchase History Audit Report', headers, rows, 'Purchase_History_Report');
  };

  const getPOStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return <Badge variant="success" dot><CheckCircle2 className="w-3 h-3 mr-0.5 inline" />Completed</Badge>;
      case 'Shipped':
        return <Badge variant="secondary" dot><Truck className="w-3 h-3 mr-0.5 inline" />Shipped</Badge>;
      case 'Approved':
        return <Badge variant="primary" dot><CheckCircle2 className="w-3 h-3 mr-0.5 inline" />Approved</Badge>;
      case 'Pending':
        return <Badge variant="warning" dot><Clock className="w-3 h-3 mr-0.5 inline" />Pending</Badge>;
      default:
        return <Badge variant="danger" dot><AlertCircle className="w-3 h-3 mr-0.5 inline" />Cancelled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isSupplier
              ? 'Supplier Contract Purchases'
              : isPharmacist && !isAdmin
                ? 'Assigned Medicine Inventory Purchases'
                : 'Admin Purchase Management & History'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSupplier
              ? 'View active and completed purchase orders issued to your vendor account'
              : isPharmacist && !isAdmin
                ? 'View inventory purchases and stock allocated directly to your dispensary unit'
                : 'Purchase medicine stock, calculate total costs, assign stock to pharmacists, and manage purchase history'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleExportPurchasePDF}
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Report
          </Button>

          {isAdmin && (
            <Button
              onClick={() => setIsPurchaseModalOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              + Purchase Medicine
            </Button>
          )}
        </div>
      </div>

      {/* Search, Filter, & Sort Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 space-y-3 shadow-soft">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by PO ID, medicine, pharmacist, supplier, or batch..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-primary-600"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end text-xs font-semibold">
            {/* Supplier Filter */}
            <select
              value={filterSupplier}
              onChange={(e) => {
                setFilterSupplier(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="All">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            {/* Pharmacist Filter */}
            <select
              value={filterPharmacist}
              onChange={(e) => {
                setFilterPharmacist(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="All">All Pharmacists</option>
              {pharmacistOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Shipped">Shipped</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Sort Dropdown */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Purchase History Table */}
      <div className="glass-card rounded-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden shadow-soft">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                <th className="px-3 py-3.5">PO ID / Pharmacist</th>
                <th className="px-3 py-3.5">Medicine Name</th>
                <th className="px-3 py-3.5">Supplier</th>
                <th className="px-3 py-3.5">Quantity & Total</th>
                <th className="px-3 py-3.5">Purchase Date</th>
                <th className="px-3 py-3.5">Batch / Expiry</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-200">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-3 py-3 font-medium">
                      <p className="font-mono font-bold text-primary-600 dark:text-primary-400">
                        {po.orderNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3 h-3 text-primary-500 inline" />
                        {po.assignedPharmacistName || 'Dr. Sarah Jenkins'}
                      </p>
                    </td>

                    <td className="px-3 py-3 font-bold text-slate-900 dark:text-white">
                      {po.medicineName || 'Amoxicillin 500mg'}
                    </td>

                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 text-[11px]">
                        {po.supplierName}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <p className="font-mono font-extrabold text-slate-900 dark:text-white text-xs">
                        {formatCurrency(po.totalAmount)}
                      </p>
                      <p className="text-[11px] font-mono font-bold text-emerald-500 mt-0.5">
                        {po.quantity || po.itemsCount} units
                      </p>
                    </td>

                    <td className="px-3 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(po.orderedDate)}
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <p className="text-slate-800 dark:text-slate-200 font-bold">{po.batchNumber || 'BT-9941'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Exp: {po.expiryDate ? formatDate(po.expiryDate) : '2027-08-30'}
                      </p>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      {getPOStatusBadge(po.status)}
                    </td>

                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Supplier Role Actions */}
                        {isSupplier ? (
                          <>
                            {po.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    updateOrderStatus(po.id, 'Approved');
                                    toast.success(`Accepted purchase order ${po.orderNumber}!`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600 hover:text-white transition-colors text-[10px] font-bold flex items-center gap-1"
                                  title="Accept & Confirm Order"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Accept
                                </button>
                                <button
                                  onClick={() => {
                                    updateOrderStatus(po.id, 'Shipped');
                                    toast.success(`Marked purchase order ${po.orderNumber} as Shipped!`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 hover:bg-sky-600 hover:text-white transition-colors text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Truck className="w-3 h-3" /> Ship
                                </button>
                              </>
                            )}
                            {po.status === 'Approved' && (
                              <>
                                <button
                                  onClick={() => {
                                    updateOrderStatus(po.id, 'Shipped');
                                    toast.success(`Dispatched order ${po.orderNumber}!`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 hover:bg-sky-600 hover:text-white transition-colors text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Truck className="w-3 h-3" /> Dispatch
                                </button>
                                <button
                                  onClick={() => {
                                    updateOrderStatus(po.id, 'Delivered');
                                    toast.success(`Delivered purchase order ${po.orderNumber}!`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-[10px] font-extrabold flex items-center gap-1 shadow-sm"
                                >
                                  <PackageCheck className="w-3 h-3" /> Deliver
                                </button>
                              </>
                            )}
                            {po.status === 'Shipped' && (
                              <button
                                onClick={() => {
                                  updateOrderStatus(po.id, 'Delivered');
                                  toast.success(`Fulfilling shipment delivery ${po.orderNumber}!`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-[10px] font-extrabold flex items-center gap-1 shadow-sm"
                              >
                                <PackageCheck className="w-3 h-3" /> Deliver
                              </button>
                            )}
                          </>
                        ) : (
                          /* Admin / Pharmacist View */
                          <>
                            {po.status === 'Pending' && (
                              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                Awaiting Vendor
                              </span>
                            )}
                            {po.status === 'Shipped' && (
                              <button
                                onClick={() => updateOrderStatus(po.id, 'Delivered')}
                                className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
                                title="Click to simulate Supplier Delivery"
                              >
                                In-Transit
                              </button>
                            )}
                            {(po.status === 'Delivered' || po.status === 'Completed') && (
                              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                Restocked
                              </span>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => setSelectedOrderDetails(po)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && po.status !== 'Cancelled' && po.status !== 'Delivered' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(po.id, 'Cancelled');
                              toast.error(`Cancelled purchase transaction ${po.orderNumber}`);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Cancel Purchase Transaction"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No purchase history records found matching search or filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing {paginatedOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} Purchases
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin → Purchase Medicine Modal */}
      <PurchaseMedicineModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />

      {/* Purchase Transaction Detail Modal */}
      {selectedOrderDetails && (
        <Modal
          isOpen={!!selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          title={`Purchase Transaction ${selectedOrderDetails.orderNumber}`}
          subtitle="Audit record of medicine procurement transaction and pharmacist allocation"
        >
          <div className="space-y-4 text-xs font-medium">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{selectedOrderDetails.medicineName || 'Medicine'}</span>
                <Badge variant="success">{selectedOrderDetails.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block">Assigned Pharmacist:</span>
                  <span className="font-bold text-primary-400">{selectedOrderDetails.assignedPharmacistName || 'Dr. Sarah Jenkins'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Supplier Vendor:</span>
                  <span className="font-bold text-white">{selectedOrderDetails.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Quantity Purchased:</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedOrderDetails.quantity || selectedOrderDetails.itemsCount} units</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Price Per Unit:</span>
                  <span className="font-mono font-bold text-white">${(selectedOrderDetails.pricePerUnit || 5.0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Transaction Amount:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{formatCurrency(selectedOrderDetails.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Batch Number:</span>
                  <span className="font-mono text-slate-300">{selectedOrderDetails.batchNumber || 'BAT-9941'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Invoice Number:</span>
                  <span className="font-mono text-slate-300">{selectedOrderDetails.invoiceNumber || 'INV-001'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Expiry Date:</span>
                  <span className="text-slate-300">{selectedOrderDetails.expiryDate ? formatDate(selectedOrderDetails.expiryDate) : '2027-08-30'}</span>
                </div>
              </div>
              {selectedOrderDetails.notes && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block font-bold">Notes / Remarks:</span>
                  <p className="text-slate-300 text-xs italic">{selectedOrderDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedOrderDetails(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
