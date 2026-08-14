import React, { useState } from 'react';
import { Eye, Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Medicine } from '../../types/inventory';
import { Badge } from '../common/Badge';
import { formatCurrency, getExpiryStatus } from '../../utils/formatters';

import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../hooks/useRole';

interface MedicineTableProps {
  medicines: Medicine[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onView: (med: Medicine) => void;
  onEdit: (med: Medicine) => void;
  onDelete: (id: string) => void;
}

export const MedicineTable: React.FC<MedicineTableProps> = ({
  medicines,
  selectedIds,
  setSelectedIds,
  onView,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const { isSupplier } = useRole();
  const userRoleStr = (user?.role || (user as any)?.roles?.[0] || 'Staff').toLowerCase();
  const isAdmin = userRoleStr.includes('admin');
  const isPharmacist = userRoleStr.includes('pharm');
  const canEdit = isAdmin || isPharmacist;
  const canDelete = isAdmin;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(medicines.length / itemsPerPage) || 1;
  const paginated = medicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((m) => m.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getStatusBadge = (status: Medicine['status']) => {
    if (isSupplier) {
      switch (status) {
        case 'In Stock':
          return <Badge variant="success" dot>Delivered</Badge>;
        case 'Low Stock':
        case 'Out of Stock':
          return <Badge variant="primary" dot>Out for Delivery</Badge>;
        case 'Near Expiry':
          return <Badge variant="warning" dot>Near Expiry</Badge>;
        case 'Expired':
          return <Badge variant="danger" dot>Expired</Badge>;
        default:
          return <Badge variant="success" dot>Delivered</Badge>;
      }
    }

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
    <div className="glass-card rounded-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
              <th className="p-4 w-10">
                {canDelete && (
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.length === paginated.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500"
                  />
                )}
              </th>
              <th className="p-4">Medicine & Code</th>
              <th className="p-4">Category</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Available Stock</th>
              <th className="p-4">Batch / Expiry</th>
              <th className="p-4">Unit Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-200">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  No medicine records matching your query.
                </td>
              </tr>
            ) : (
              paginated.map((med) => {
                const isSelected = selectedIds.includes(med.id);
                const expiryInfo = getExpiryStatus(med.expiryDate);

                return (
                  <tr
                    key={med.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-primary-50/40 dark:bg-primary-950/30' : ''
                      }`}
                  >
                    <td className="p-4">
                      {canDelete && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(med.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500"
                        />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={med.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                          alt={med.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {med.name} {med.brandName ? <span className="text-secondary-500 font-extrabold ml-1">({med.brandName})</span> : null}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {med.id} • Mfr: <span className="text-slate-300 font-semibold">{med.manufacturer || 'Pharma Corp'}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                      {med.category}
                    </td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
                        {med.supplier}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {med.stock}
                      </span>{' '}
                      <span className="text-slate-400">{med.unit}s</span>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-slate-800 dark:text-slate-200">{med.batchNumber}</p>
                      <p className={`text-[11px] font-semibold ${expiryInfo.days <= 30 ? 'text-danger-500' : 'text-slate-400'}`}>
                        {med.expiryDate}
                      </p>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(med.price)}
                    </td>
                    <td className="p-4">{getStatusBadge(med.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(med)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => onEdit(med)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-950/60 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDelete(med.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/60 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Showing <strong className="text-slate-800 dark:text-slate-200">{paginated.length}</strong> of{' '}
          <strong className="text-slate-800 dark:text-slate-200">{medicines.length}</strong> medicines
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
