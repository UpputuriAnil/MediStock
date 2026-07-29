import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Clock, CheckCircle2, Truck, AlertCircle, FileText } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { PurchaseOrder } from '../types/order';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { formatCurrency, formatDate } from '../utils/formatters';

export const PurchaseOrders: React.FC = () => {
  const { orders, addOrder, suppliers } = useInventory();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [totalAmount, setTotalAmount] = useState(5000);
  const [itemsCount, setItemsCount] = useState(3);

  const getPOStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Delivered':
        return <Badge variant="success" dot><CheckCircle2 className="w-3 h-3 mr-0.5 inline" />Delivered</Badge>;
      case 'Shipped':
        return <Badge variant="secondary" dot><Truck className="w-3 h-3 mr-0.5 inline" />Shipped</Badge>;
      case 'Approved':
        return <Badge variant="primary" dot><CheckCircle2 className="w-3 h-3 mr-0.5 inline" />Approved</Badge>;
      case 'Pending':
        return <Badge variant="warning" dot><Clock className="w-3 h-3 mr-0.5 inline" />Pending Approval</Badge>;
      default:
        return <Badge variant="danger" dot><AlertCircle className="w-3 h-3 mr-0.5 inline" />Cancelled</Badge>;
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    addOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      itemsCount,
      totalAmount,
      status: 'Pending',
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      createdByName: 'Dr. Sarah Jenkins',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Purchase Orders & Procurement
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate replenishment requisitions, track shipment statuses, and reconcile supplier invoices
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Purchase Order
        </Button>
      </div>

      {/* Orders Data Table */}
      <div className="glass-card rounded-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">PO Code</th>
                <th className="p-4">Supplier Vendor</th>
                <th className="p-4">Line Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Ordered Date</th>
                <th className="p-4">Est. Delivery</th>
                <th className="p-4">Created By</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-200">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                    {po.orderNumber}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {po.supplierName}
                  </td>
                  <td className="p-4">{po.itemsCount} Products</td>
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(po.totalAmount)}
                  </td>
                  <td className="p-4 text-slate-500">{formatDate(po.orderedDate)}</td>
                  <td className="p-4 text-slate-500">{formatDate(po.expectedDelivery)}</td>
                  <td className="p-4">{po.createdByName}</td>
                  <td className="p-4">{getPOStatusBadge(po.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Generate Purchase Order"
        subtitle="Initiate a new procurement order with certified suppliers"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Select Supplier
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 outline-none text-slate-800 dark:text-slate-100"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Line Items Count"
              type="number"
              value={itemsCount}
              onChange={(e) => setItemsCount(Number(e.target.value))}
              required
            />
            <Input
              label="Estimated Total ($)"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Generate Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
