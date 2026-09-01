import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Pill, Users, Truck, ShoppingBag, FileText, ArrowRight, X, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { medicines, suppliers } = useInventory();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const handleSelect = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-xl glass-card rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicines, suppliers, orders, or pages... (Type '/')"
              className="w-full text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 bg-transparent outline-none"
              autoFocus
            />
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions & Search Results */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-4">
            {/* Pages Shortcuts */}
            {!query && (
              <div>
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Navigation
                </p>
                <div className="space-y-1">
                  {[
                    { label: 'Medicine Inventory', icon: Pill, path: '/medicines' },
                    { label: 'Expiry Tracking', icon: FileText, path: '/expiry-tracking' },
                    { label: 'Suppliers Directory', icon: Truck, path: '/suppliers' },
                    { label: 'Purchase Orders', icon: ShoppingBag, path: '/purchase-orders' },
                    { label: 'System Users', icon: Users, path: '/users' },
                    { label: 'Swagger API Explorer', icon: Code2, path: 'http://localhost:8080/api/swagger-ui/index.html', external: true },
                  ].map((nav) => (
                    <button
                      key={nav.path}
                      onClick={() => handleSelect(nav.path)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-800/80 hover:text-primary-600 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <nav.icon className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
                        <span>{nav.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Medicines */}
            {filteredMedicines.length > 0 && (
              <div>
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Medicines ({filteredMedicines.length})
                </p>
                <div className="space-y-1">
                  {filteredMedicines.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => handleSelect('/medicines')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{med.name}</p>
                        <p className="text-[11px] text-slate-400">{med.category} • Batch {med.batchNumber}</p>
                      </div>
                      <span className="text-xs font-bold text-primary-600">{med.stock} {med.unit}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Suppliers */}
            {filteredSuppliers.length > 0 && (
              <div>
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Suppliers ({filteredSuppliers.length})
                </p>
                <div className="space-y-1">
                  {filteredSuppliers.map((sup) => (
                    <button
                      key={sup.id}
                      onClick={() => handleSelect('/suppliers')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{sup.name}</p>
                        <p className="text-[11px] text-slate-400">{sup.contactPerson} • {sup.category}</p>
                      </div>
                      <span className="text-xs text-slate-400">{sup.performanceScore}% Score</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">ESC</kbd> to close</span>
            <span>MediStock Enterprise Engine</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
