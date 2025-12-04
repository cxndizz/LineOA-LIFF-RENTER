import api from '../utils/api';

export const userService = {
  getAll() {
    return api.get('/users');
  },

  getOne(id) {
    return api.get(`/users/${id}`);
  },

  create(userData) {
    return api.post('/users', userData);
  },

  update(id, userData) {
    return api.patch(`/users/${id}`, userData);
  },

  updatePassword(id, newPassword) {
    return api.patch(`/users/${id}/password`, { newPassword });
  },

  toggleStatus(id) {
    return api.patch(`/users/${id}/toggle-status`);
  },

  delete(id) {
    return api.delete(`/users/${id}`);
  },
};
