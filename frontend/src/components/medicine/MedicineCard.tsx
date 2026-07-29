import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Eye, Edit3, Trash2, Calendar, MapPin, Layers } from 'lucide-react';
import { Medicine } from '../../types/inventory';
import { Badge } from '../common/Badge';
import { formatCurrency, getExpiryStatus } from '../../utils/formatters';

interface MedicineCardProps {
  medicine: Medicine;
  onView: (med: Medicine) => void;
  onEdit: (med: Medicine) => void;
  onDelete: (id: string) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onView,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const expiryInfo = getExpiryStatus(medicine.expiryDate);

  const getStatusBadge = (status: Medicine['status']) => {
    switch (status) {
      case 'In Stock':
        return <Badge variant="success" dot>In Stock</Badge>;
      case 'Low Stock':
        return <Badge variant="warning" dot>Low Stock</Badge>;
      case 'Out of Stock':
        return <Badge variant="danger" dot>Out of Stock</Badge>;
      case 'Near Expiry':
        return <Badge variant="warning" dot>Near Expiry</Badge>;
      case 'Expired':
        return <Badge variant="danger" dot>Expired</Badge>;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="glass-card rounded-2xl p-5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between relative group"
    >
      {/* Image & Header */}
      <div>
        <div className="relative h-36 w-full rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
          <img
            src={medicine.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'}
            alt={medicine.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 z-10">
            {getStatusBadge(medicine.status)}
          </div>

          {/* Action Menu button */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 glass-dropdown rounded-xl shadow-xl p-1 z-20 border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => { setShowMenu(false); onView(medicine); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
                <button
                  onClick={() => { setShowMenu(false); onEdit(medicine); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Record
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDelete(medicine.id); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Name & Generic Name */}
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
          {medicine.name}
        </h4>
        <p className="text-xs font-medium text-slate-400 line-clamp-1 mt-0.5">
          {medicine.genericName}
        </p>

        {/* Spec details grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary-500" />
            <span className="truncate">{medicine.category}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-secondary-500" />
            <span className="truncate">{medicine.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Exp: {medicine.expiryDate.slice(0, 7)}</span>
          </div>
          <div className="text-right font-bold text-slate-900 dark:text-white">
            {formatCurrency(medicine.price)} / {medicine.unit}
          </div>
        </div>
      </div>

      {/* Footer Stock Count */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Stock</span>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
            {medicine.stock} <span className="text-xs font-medium text-slate-400">{medicine.unit}s</span>
          </p>
        </div>
        <button
          onClick={() => onView(medicine)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
        >
          View Specs
        </button>
      </div>
    </motion.div>
  );
};
