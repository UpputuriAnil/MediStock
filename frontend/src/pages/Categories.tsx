import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tags, Plus, Pill, Layers, ChevronRight } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useNavigate } from 'react-router-dom';

export const Categories: React.FC = () => {
  const { categories, addCategory, medicines } = useInventory();
  const navigate = useNavigate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    addCategory({
      name: catName,
      description: catDesc || 'General pharmaceutical category',
      iconName: 'Pill',
    });
    setCatName('');
    setCatDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Therapeutic Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize pharmaceuticals by clinical indication, storage class, and pharmacological group
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Category
        </Button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const matchingMeds = medicines.filter((m) => m.category === cat.name);
          const itemCount = matchingMeds.length || cat.itemCount;

          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                    <Tags className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {itemCount} Items
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5" /> Stocked in Pharmacy
                </span>
                <button
                  onClick={() => navigate('/medicines')}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View Items <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Therapeutic Category"
        subtitle="Create a new grouping category for pharmacy stock"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Dermatological Agents"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="e.g. Topical ointments, creams, and skin barrier solutions"
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
