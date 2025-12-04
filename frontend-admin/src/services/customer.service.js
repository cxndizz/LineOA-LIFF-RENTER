import api from '../utils/api';

export const customerService = {
  getAll() {
    return api.get('/customers');
  },

  getOne(id) {
    return api.get(`/customers/${id}`);
  },

  getRentalHistory(id) {
    return api.get(`/customers/${id}/rentals`);
  },
};
