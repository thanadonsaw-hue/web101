const user = JSON.parse(localStorage.getItem('user'))
let editingId = null
let productToDelete = null

if (!user || user.role !== 'admin') {
    alert('เฉพาะแอดมินเท่านั้น!')
    location.href = '../../index.html'
}

window.onload = () => {
    loadData()
    loadOrders()
}

const showNotification = (message, isSuccess) => {
    const alertBox = document.getElementById('alert-msg')
    alertBox.innerText = message
    alertBox.className = 'alert-box ' + (isSuccess ? 'success' : 'error')
    alertBox.style.display = 'block'
    setTimeout(() => { alertBox.style.display = 'none' }, 3000)
}

const loadData = async () => {
    try {
        const res = await api.products.getAll()
        document.getElementById('product-list').innerHTML = res.data.map(p => {
            const imgSrc = (p.image_url && p.image_url !== 'Logo(2).png') ? `http://localhost:8000/uploads/${p.image_url}` : '../../assets/images/Logo(2).png'
            const safeName = p.name.replace(/'/g, "\\'")
            return `
            <tr>
                <td><img src="${imgSrc}" width="50" height="50" style="border-radius:6px; object-fit:contain; border: 1px solid #f3f4f6;"></td>
                <td style="font-weight: 500;">${p.name}</td>
                <td style="color: #e63946; font-weight: 600;">${p.price.toLocaleString()} THB</td>
                <td style="color: ${p.stock <= 5 ? '#dc2626' : '#111827'}; font-weight: 500;">${p.stock} ชิ้น</td>
                <td>
                    <button onclick="openEdit(${p.id}, '${safeName}', ${p.price}, ${p.stock})" class="btn-action btn-edit">แก้ไข</button>
                    <button onclick="confirmDelete(${p.id})" class="btn-action btn-delete">ลบ</button>
                </td>
            </tr>`
        }).join('')
        document.getElementById('admin-info').innerHTML = `Admin: ${user.username}`
    } catch (error) {
        console.error(error)
    }
}

const openEdit = (id, name, price, stock) => {
    editingId = id
    document.getElementById('p-name').value = name
    document.getElementById('p-price').value = price
    document.getElementById('p-stock').value = stock
    document.getElementById('form-title').innerText = 'แก้ไขข้อมูลสินค้า'
    document.getElementById('submit-btn').innerText = 'บันทึกการแก้ไข'
    document.getElementById('submit-btn').style.background = '#d97706'
    document.getElementById('cancel-btn').style.display = 'inline-block'
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
    editingId = null
    document.getElementById('p-name').value = ''
    document.getElementById('p-price').value = ''
    document.getElementById('p-stock').value = ''
    document.getElementById('p-image').value = ''
    document.getElementById('form-title').innerText = 'เพิ่มสินค้าใหม่'
    document.getElementById('submit-btn').innerText = 'เพิ่มสินค้า'
    document.getElementById('submit-btn').style.background = '#e63946'
    document.getElementById('cancel-btn').style.display = 'none'
}

const submitProduct = async () => {
    const name = document.getElementById('p-name').value
    const price = document.getElementById('p-price').value
    const stock = document.getElementById('p-stock').value
    const image = document.getElementById('p-image').files[0]
    if (!name || !price || !stock) return showNotification('กรุณากรอกข้อมูลให้ครบถ้วน', false)
    const fd = new FormData()
    fd.append('name', name)
    fd.append('price', price)
    fd.append('stock', stock)
    if (image) fd.append('image', image)
    try {
        if (editingId) {
            await api.products.update(editingId, fd)
            showNotification('บันทึกการแก้ไขสำเร็จ!', true)
        } else {
            await api.products.create(fd)
            showNotification('เพิ่มสินค้าสำเร็จ!', true)
        }
        cancelEdit()
        loadData()
    } catch (error) {
        showNotification('ดำเนินการไม่สำเร็จ', false)
    }
}

const confirmDelete = (id) => {
    productToDelete = id
    document.getElementById('deleteModal').style.display = 'flex'
}

const closeDeleteModal = () => {
    productToDelete = null
    document.getElementById('deleteModal').style.display = 'none'
}

const executeDelete = async () => {
    if (!productToDelete) return
    try {
        await api.products.remove(productToDelete)
        showNotification('ลบสินค้าสำเร็จ!', true)
        loadData()
    } catch (error) {
        showNotification('ลบไม่สำเร็จ', false)
    } finally {
        closeDeleteModal()
    }
}

const loadOrders = async () => {
    try {
        const res = await api.orders.adminGetAll()
        document.getElementById('order-list').innerHTML = res.data.map(o => {
            const date = new Date(o.created_at).toLocaleString('th-TH')
            return `
            <tr>
                <td style="color: #6b7280; font-family: monospace;">#ORD-${o.id.toString().padStart(4, '0')}</td>
                <td style="font-weight: 500;">${o.username}</td>
                <td style="color: #6b7280;">${date}</td>
                <td style="color: #e63946; font-weight: 600;">${parseFloat(o.total_price).toLocaleString()} THB</td>
                <td>
                    <select id="status-${o.id}" style="font-size: 13px; padding: 5px;">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>รอดำเนินการ</option>
                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>จัดส่งแล้ว</option>
                        <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>สำเร็จ</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>ยกเลิก</option>
                    </select>
                </td>
                <td>
                    <button onclick="updateOrderStatus(${o.id})" class="btn-action btn-save">เซฟสถานะ</button>
                    <button onclick="viewOrderDetails(${o.id})" class="btn-action btn-view">ดูรายละเอียด</button>
                </td>
            </tr>`
        }).join('')
    } catch (error) {
        console.error(error)
    }
}

const updateOrderStatus = async (id) => {
    const status = document.getElementById(`status-${id}`).value
    try {
        await api.orders.adminUpdateStatus(id, status)
        showNotification('อัปเดตสถานะบิลเรียบร้อย!', true)
    } catch (error) {
        showNotification('อัปเดตสถานะไม่สำเร็จ', false)
    }
}

const viewOrderDetails = async (id) => {
    try {
        const res = await api.orders.adminGetItems(id)
        const html = res.data.map(item => {
            const imgSrc = (item.image_url && item.image_url !== 'Logo(2).png') ? `http://localhost:8000/uploads/${item.image_url}` : '../../assets/images/Logo(2).png'
            return `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f3f4f6; padding: 12px 0;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${imgSrc}" width="45" height="45" style="object-fit: contain; border: 1px solid #f3f4f6; border-radius: 6px;">
                    <div>
                        <div style="color: #111827; font-size: 14px; font-weight: 500;">${item.name || 'สินค้าถูกลบ'}</div>
                        <div style="color: #6b7280; font-size: 12px;">${item.quantity} ชิ้น x ${parseFloat(item.price).toLocaleString()} THB</div>
                    </div>
                </div>
                <div style="color: #e63946; font-weight: 600; font-size: 14px;">${(item.price * item.quantity).toLocaleString()} THB</div>
            </div>`
        }).join('')
        document.getElementById('modal-items').innerHTML = html
        document.getElementById('orderModal').style.display = 'flex'
    } catch (error) {
        console.error(error)
    }
}

const closeOrderModal = () => {
    document.getElementById('orderModal').style.display = 'none'
}