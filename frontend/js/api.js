const BASE_URL = 'http://localhost:8000'

const api = {
  auth: {
    login: (data) => axios.post(`${BASE_URL}/login`, data),
    register: (data) => axios.post(`${BASE_URL}/register`, data)
  },
  products: {
    getAll: () => axios.get(`${BASE_URL}/products`),
    getById: (id) => axios.get(`${BASE_URL}/products/${id}`),
    create: (formData) => axios.post(`${BASE_URL}/products`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, formData) => axios.put(`${BASE_URL}/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    remove: (id) => axios.delete(`${BASE_URL}/products/${id}`)
  },
  orders: {
    create: (data) => axios.post(`${BASE_URL}/orders`, data),
    getByUserId: (userId) => axios.get(`${BASE_URL}/orders/${userId}`),
    adminGetAll: () => axios.get(`${BASE_URL}/orders/admin/all`),
    adminUpdateStatus: (id, status) => axios.put(`${BASE_URL}/orders/${id}/status`, { status }),
    adminGetItems: (id) => axios.get(`${BASE_URL}/orders/${id}/items`)
  }
}