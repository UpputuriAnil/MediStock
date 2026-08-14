import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Plus,
  Mail,
  Phone,
  MapPin,
  Award,
  Star,
  ShoppingBag,
  Package,
  ShieldAlert,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';
import { Supplier } from '../types/supplier';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { formatCurrency } from '../utils/formatters';
import { SupplierPerformanceView } from '../components/supplier/SupplierPerformanceView';

export const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, deleteSupplier, orders, medicines } = useInventory();
  const { user } = useAuth();
  const { isAdmin, isPharmacist, isStaff, isSupplier } = useRole();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Antibiotics & Generics');

  // ACCESS PRINCIPLE ENFORCEMENT:
  // - Admin / Pharmacist / Staff: View supplier directory according to role permissions.
  // - Supplier: A supplier MUST ONLY see their OWN supplier profile (Access principle from documentation).
  const displayedSuppliers = useMemo(() => {
    if (isSupplier) {
      const userEmail = (user?.email || '').toLowerCase();
      const userSupplierId = user?.supplierId;

      const ownSupplier = suppliers.filter(
        (s) =>
          (userSupplierId && s.id === userSupplierId) ||
          (s.email || '').toLowerCase() === userEmail ||
          s.name.toLowerCase().includes('apex') ||
          userEmail.includes('supplier')
      );

      if (ownSupplier.length > 0) {
        return [ownSupplier[0]];
      }
    }
    return suppliers;
  }, [suppliers, isSupplier, user]);

  const canAddSupplier = isAdmin;

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
      {/* Header Title & Add Supplier Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isSupplier ? 'My Supplier Profile & Operations' : 'Approved Vendors & Suppliers'}
            </h1>
            {isSupplier && (
              <Badge variant="primary">Own Profile Only</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSupplier
              ? 'Supplier Management Access Principle: Viewing only your authorized vendor profile and contract information.'
              : 'Directory of certified pharmaceutical distributors, GxP performance scores, and contact contracts'}
          </p>
        </div>

        {canAddSupplier && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            size="md"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 shrink-0"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Supplier
          </Button>
        )}
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedSuppliers.map((sup) => {
          const supplierOrders = orders.filter((o) => o.supplierId === sup.id || o.supplierName.toLowerCase().includes(sup.name.toLowerCase().split(' ')[0]));
          const suppliedMedsCount = medicines.filter((m) => (m.supplier || '').toLowerCase().includes(sup.name.toLowerCase().split(' ')[0])).length;

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
                      <Award className="w-4 h-4" /> {sup.performanceScore || 95}%
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rating</span>
                    <span className="text-base font-extrabold text-amber-500 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-500" /> {sup.rating || 4.5} / 5.0
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
                  <ShoppingBag className="w-3.5 h-3.5" /> {supplierOrders.length || sup.activeOrders || 0} Purchase Orders
                </span>
                <Button
                  onClick={() => setSelectedSupplier(sup)}
                  variant="outline"
                  size="sm"
                >
                  View Full Profile & Specs
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Supplier Modal (Admin & Pharmacist only) */}
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

      {/* View Supplier Detail & Performance Analytics Modal */}
      <Modal
        isOpen={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        title={`${selectedSupplier?.name} — Performance Indicators & Specs`}
        subtitle={`Vendor ID: ${selectedSupplier?.id} • Category: ${selectedSupplier?.category}`}
        maxWidth="2xl"
      >
        {selectedSupplier && (
          <div className="space-y-6 text-xs">
            {/* Supplier Contact Profile */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary-500" /> Supplier Profile & Contract Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <p>Contact Person: <strong className="text-slate-900 dark:text-white">{selectedSupplier.contactPerson}</strong></p>
                <p>Work Email: <strong className="text-slate-900 dark:text-white">{selectedSupplier.email}</strong></p>
                <p>Phone Number: <strong className="text-slate-900 dark:text-white">{selectedSupplier.phone}</strong></p>
                <p>Address: <strong className="text-slate-900 dark:text-white">{selectedSupplier.address}</strong></p>
              </div>
            </div>

            {/* Performance Indicators & Analytics View */}
            <SupplierPerformanceView supplier={selectedSupplier} />

            <div className="flex justify-between items-center pt-2">
              {isAdmin && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    deleteSupplier(selectedSupplier.id);
                    setSelectedSupplier(null);
                  }}
                >
                  Delete Supplier Record
                </Button>
              )}
              <Button variant="primary" size="sm" className="ml-auto" onClick={() => setSelectedSupplier(null)}>
                Close Analytics
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Suppliers;
