import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Mail, Phone, MapPin, Award, Star, ShoppingBag } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Supplier } from '../types/supplier';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { formatCurrency } from '../utils/formatters';

export const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, orders } = useInventory();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Antibiotics & Generics');

  const handleRegisterSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    addSupplier({
      name,
      contactPerson,
      email,
      phone,
      address,
      category,
      status: 'Active',
    });
    setName('');
    setEmail('');
    setContactPerson('');
    setPhone('');
    setAddress('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Approved Vendors & Suppliers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Directory of certified pharmaceutical distributors, GxP performance scores, and contact contracts
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Register New Supplier
        </Button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((sup) => {
          const supplierOrders = orders.filter((o) => o.supplierId === sup.id);

          return (
            <motion.div
              key={sup.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Truck className="w-6 h-6" />
                  </div>
                  <Badge variant={sup.status === 'Preferred' ? 'success' : 'primary'} dot>
                    {sup.status}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {sup.name}
                </h3>
                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                  {sup.category}
                </p>

                {/* Score & Rating */}
                <div className="flex items-center gap-4 my-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Performance</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Award className="w-4 h-4" /> {sup.performanceScore}%
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rating</span>
                    <span className="text-base font-extrabold text-amber-500 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-500" /> {sup.rating} / 5.0
                    </span>
                  </div>
                </div>

                {/* Contact info list */}
                <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sup.address}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> {sup.activeOrders} Active POs
                </span>
                <Button
                  onClick={() => setSelectedSupplier(sup)}
                  variant="outline"
                  size="sm"
                >
                  View Details
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Supplier"
        subtitle="Add a certified pharmaceutical distributor to the vendor registry"
      >
        <form onSubmit={handleRegisterSupplier} className="space-y-4">
          <Input
            label="Supplier Company Name"
            placeholder="e.g. Novartis Direct Distribution"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Contact Person Name"
            placeholder="e.g. Dr. Arthur Pendelton"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="orders@vendor.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 (800) 555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Input
            label="Physical Address"
            placeholder="450 Innovation Parkway, Cambridge, MA"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Vendor
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Supplier Detail Modal */}
      <Modal
        isOpen={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        title={selectedSupplier?.name}
        subtitle={`Vendor ID: ${selectedSupplier?.id} • Status: ${selectedSupplier?.status}`}
      >
        <div className="space-y-4 text-xs font-semibold">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
            <p className="text-slate-500">Primary Contact: <strong className="text-slate-900 dark:text-white">{selectedSupplier?.contactPerson}</strong></p>
            <p className="text-slate-500">Email: <strong className="text-slate-900 dark:text-white">{selectedSupplier?.email}</strong></p>
            <p className="text-slate-500">Phone: <strong className="text-slate-900 dark:text-white">{selectedSupplier?.phone}</strong></p>
            <p className="text-slate-500">Total Supplied Volume: <strong className="text-slate-900 dark:text-white">{formatCurrency(selectedSupplier?.totalSupplied || 0)}</strong></p>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setSelectedSupplier(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
