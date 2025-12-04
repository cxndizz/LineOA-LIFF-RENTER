<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
        <p class="text-slate-600">Manage admin users and their permissions</p>
      </div>

      <!-- Actions Bar -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users..."
              class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <button
            @click="openAddModal"
            class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div v-if="loading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
          <p class="mt-4 text-slate-600">Loading users...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p class="text-slate-600">No users found</p>
        </div>

        <table v-else class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">User</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Role</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Branch</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {{ user.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-medium text-slate-900">{{ user.fullName }}</div>
                    <div class="text-sm text-slate-500">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-700">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span :class="getRoleBadgeClass(user.role)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-700">
                {{ user.branch ? user.branch.name : '-' }}
              </td>
              <td class="px-6 py-4">
                <button
                  @click="toggleUserStatus(user)"
                  :class="user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  class="px-3 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </button>
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                  <button
                    @click="openEditModal(user)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="openPasswordModal(user)"
                    class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Reset Password"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteUser(user)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-slate-900">{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveUser" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
            <input
              v-model="formData.fullName"
              type="text"
              required
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          <div v-if="!editingUser">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
            <input
              v-model="formData.password"
              type="password"
              :required="!editingUser"
              minlength="6"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Role *</label>
            <select
              v-model="formData.role"
              required
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="BRANCH_ADMIN">Branch Admin</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          <div v-if="formData.role !== 'SUPER_ADMIN'">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Branch</label>
            <select
              v-model="formData.branchId"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="null">-- No Branch --</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>

          <div class="flex items-center gap-3">
            <input
              v-model="formData.isActive"
              type="checkbox"
              id="isActive"
              class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label for="isActive" class="text-sm font-medium text-slate-700 cursor-pointer">Active</label>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
            >
              {{ editingUser ? 'Update' : 'Create' }} User
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Password Reset Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closePasswordModal">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div class="px-6 py-4 border-b border-slate-200">
          <h2 class="text-2xl font-bold text-slate-900">Reset Password</h2>
          <p class="text-slate-600 text-sm mt-1">Set new password for {{ selectedUser?.fullName }}</p>
        </div>

        <form @submit.prevent="resetPassword" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">New Password *</label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closePasswordModal"
              class="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from '../../services/user.service';
import { branchService } from '../../services/branch.service';

export default {
  name: 'UserListView',
  data() {
    return {
      users: [],
      branches: [],
      loading: true,
      showModal: false,
      showPasswordModal: false,
      editingUser: null,
      selectedUser: null,
      searchQuery: '',
      newPassword: '',
      formData: {
        fullName: '',
        email: '',
        password: '',
        role: 'BRANCH_ADMIN',
        branchId: null,
        isActive: true,
      },
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchBranches();
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true;
        const response = await userService.getAll();
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to load users');
      } finally {
        this.loading = false;
      }
    },
    async fetchBranches() {
      try {
        const response = await branchService.getAll();
        this.branches = response.data;
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    },
    openAddModal() {
      this.editingUser = null;
      this.formData = {
        fullName: '',
        email: '',
        password: '',
        role: 'BRANCH_ADMIN',
        branchId: null,
        isActive: true,
      };
      this.showModal = true;
    },
    openEditModal(user) {
      this.editingUser = user;
      this.formData = {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        isActive: user.isActive,
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.editingUser = null;
    },
    openPasswordModal(user) {
      this.selectedUser = user;
      this.newPassword = '';
      this.showPasswordModal = true;
    },
    closePasswordModal() {
      this.showPasswordModal = false;
      this.selectedUser = null;
      this.newPassword = '';
    },
    async saveUser() {
      try {
        if (this.editingUser) {
          await userService.update(this.editingUser.id, this.formData);
          alert('User updated successfully');
        } else {
          await userService.create(this.formData);
          alert('User created successfully');
        }
        this.closeModal();
        this.fetchUsers();
      } catch (error) {
        console.error('Error saving user:', error);
        alert(error.response?.data?.message || 'Failed to save user');
      }
    },
    async resetPassword() {
      try {
        await userService.updatePassword(this.selectedUser.id, this.newPassword);
        alert('Password updated successfully');
        this.closePasswordModal();
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Failed to reset password');
      }
    },
    async toggleUserStatus(user) {
      try {
        await userService.toggleStatus(user.id);
        this.fetchUsers();
      } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Failed to update user status');
      }
    },
    async deleteUser(user) {
      if (!confirm(`Are you sure you want to delete ${user.fullName}?`)) return;

      try {
        await userService.delete(user.id);
        alert('User deleted successfully');
        this.fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    },
    getRoleLabel(role) {
      const labels = {
        SUPER_ADMIN: 'Super Admin',
        BRANCH_ADMIN: 'Branch Admin',
        STAFF: 'Staff',
      };
      return labels[role] || role;
    },
    getRoleBadgeClass(role) {
      const classes = {
        SUPER_ADMIN: 'bg-purple-100 text-purple-700',
        BRANCH_ADMIN: 'bg-blue-100 text-blue-700',
        STAFF: 'bg-slate-100 text-slate-700',
      };
      return classes[role] || 'bg-slate-100 text-slate-700';
    },
  },
};
</script>
