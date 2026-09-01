import api from './api';

const inventoryService = {
  // Medicine APIs
  getAllMedicines: () => api.get('/medicines'),
  getMedicineById: (id) => api.get(`/medicines/${id}`),
  createMedicine: (data) => api.post('/medicines', data),
  updateMedicine: (id, data) => api.put(`/medicines/${id}`, data),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),
  searchMedicines: (keyword) => api.get('/medicines/search', { params: { keyword } }),
  getLowStockMedicines: () => api.get('/medicines/low-stock'),
  toggleMedicineActive: (id) => api.put(`/medicines/${id}/toggle-active`),

  // Supplier APIs
  getAllSuppliers: () => api.get('/suppliers'),
  getSupplierById: (id) => api.get(`/suppliers/${id}`),
  createSupplier: (data) => api.post('/suppliers', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),
  searchSuppliers: (keyword) => api.get('/suppliers/search', { params: { keyword } }),
  toggleSupplierActive: (id) => api.put(`/suppliers/${id}/toggle-active`),

  // Inventory APIs
  getAllInventory: () => api.get('/inventory'),
  getInventoryById: (id) => api.get(`/inventory/${id}`),
  createInventory: (data) => api.post('/inventory', data),
  updateInventory: (id, data) => api.put(`/inventory/${id}`, data),
  deleteInventory: (id) => api.delete(`/inventory/${id}`),
  getInventoryByMedicine: (medicineId) => api.get(`/inventory/medicine/${medicineId}`),
  getInventoryBySupplier: (supplierId) => api.get(`/inventory/supplier/${supplierId}`),
  getExpiringStock: (date) => api.get('/inventory/expiring', { params: { date } }),
  getTotalStockByMedicine: (medicineId) => api.get(`/inventory/medicine/${medicineId}/total`),
  addStock: (id, quantity, performedBy, reason) => api.post(`/inventory/${id}/add-stock`, null, {
    params: { quantity, performedBy, reason }
  }),
  removeStock: (id, quantity, performedBy, reason) => api.post(`/inventory/${id}/remove-stock`, null, {
    params: { quantity, performedBy, reason }
  }),

  // Stock Log APIs
  getAllStockLogs: () => api.get('/stock-logs'),
  getStockLogsByMedicine: (medicineId) => api.get(`/stock-logs/medicine/${medicineId}`),
  getStockLogsByInventory: (inventoryId) => api.get(`/stock-logs/inventory/${inventoryId}`),
  getStockLogsByDateRange: (startDate, endDate) => api.get('/stock-logs/date-range', {
    params: { startDate, endDate }
  }),
};

export default inventoryService;
