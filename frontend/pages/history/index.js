const user = JSON.parse(localStorage.getItem('user'))
let orderToCancel = null
let globalOrders = []

window.onload = () => {
    injectDetailsModal()
    updateUI()
    loadOrders()

    const loginPassInput = document.getElementById('login-password')
    if (loginPassInput) {
        loginPassInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') modalLogin()
        })
    }

    const regLastnameInput = document.getElementById('reg-lastname')
    if (regLastnameInput) {
        regLastnameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') modalRegister()
        })
    }

    window.onclick = (event) => {
        if (event.target.classList.contains('modal-overlay')) {
            closeModal(event.target.id)
        }
        if (!event.target.closest('.user-menu-container') && !event.target.closest('.modal-overlay')) {
            const dropdowns = document.getElementsByClassName('dropdown-content')
            for (let d of dropdowns) { d.classList.remove('show') }
        }
    }
}

const injectDetailsModal = () => {
    if (!document.getElementById('detailsModal')) {
        const modalHtml = `
        <div id="detailsModal" class="modal-overlay">
            <div class="auth-modal" style="width: 500px; max-width: 90%; padding: 25px; border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 18px; color: #111827;">รายการสินค้าในบิล</h3>
                    <button onclick="closeModal('detailsModal')" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #9ca3af; transition: 0.2s;">✕</button>
                </div>
                <div id="details-modal-content" style="max-height: 50vh; overflow-y: auto; padding-right: 5px;"></div>
                <button onclick="closeModal('detailsModal')" style="width: 100%; padding: 12px; margin-top: 20px; background: #111827; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;">ปิดหน้าต่าง</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

const toggleMenu = () => {
    const dropdown = document.getElementById('myDropdown')
    if (dropdown) dropdown.classList.toggle('show')
}

const logout = () => {
    localStorage.clear()
    location.href = '../../index.html'
}

const updateUI = () => {
    const section = document.getElementById('auth-section')
    if (user) {
        section.innerHTML = `
        <div class="user-menu-container">
            <button onclick="toggleMenu()" class="icon-btn">
                <i class="fa-solid fa-circle-user"></i>
            </button>
            <div id="myDropdown" class="dropdown-content">
                <div style="padding: 10px 20px; font-size: 12px; color: #999; border-bottom: 1px solid #f3f4f6;">
                    ผู้ใช้: ${user.username}
                </div>
                ${user.role === 'admin' ? '<a href="../admin/index.html">หน้าแอดมิน</a>' : ''}
                <a href="index.html">ประวัติการสั่งซื้อ</a>
                <button onclick="logout()" class="logout-btn" style="color: #ef4444;">ออกจากระบบ</button>
            </div>
        </div>`
    } else {
        section.innerHTML = '<button class="icon-btn" onclick="openModal(\'loginModal\')"><i class="fa-regular fa-circle-user"></i></button>'
        openModal('loginModal')
        document.getElementById('order-list').innerHTML = '<p style="text-align:center; color:#888; padding: 20px; width: 100%; max-width: 900px; margin: 0 auto;">กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ</p>'
    }
}

const openModal = (modalId) => {
    document.getElementById(modalId).classList.add('active')
    if(modalId !== 'detailsModal') clearAlerts();
}

const closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('active')
}

const switchModal = (closeId, openId) => {
    closeModal(closeId)
    setTimeout(() => { openModal(openId) }, 200)
}

const clearAlerts = () => {
    const loginAlert = document.getElementById('login-alert');
    const regAlert = document.getElementById('reg-alert');
    if(loginAlert) loginAlert.style.display = 'none';
    if(regAlert) regAlert.style.display = 'none';
}

const togglePassword = (inputId, iconId) => {
    const input = document.getElementById(inputId)
    const icon = document.getElementById(iconId)
    if (input.type === 'password') {
        input.type = 'text'
        icon.classList.remove('fa-eye')
        icon.classList.add('fa-eye-slash')
    } else {
        input.type = 'password'
        icon.classList.remove('fa-eye-slash')
        icon.classList.add('fa-eye')
    }
}

const modalLogin = async () => {
    const username = document.getElementById('login-username').value
    const password = document.getElementById('login-password').value
    const alertBox = document.getElementById('login-alert')
    alertBox.style.display = 'none'

    if (!username || !password) {
        alertBox.innerText = 'กรุณากรอกข้อมูลให้ครบถ้วน'
        alertBox.className = 'alert-box error'
        alertBox.style.display = 'block'
        return
    }

    try {
        const res = await api.auth.login({ username, password })
        if (res.data && res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user))
            location.reload()
        }
    } catch (error) {
        alertBox.innerText = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        alertBox.className = 'alert-box error'
        alertBox.style.display = 'block'
    }
}

const modalRegister = async () => {
    const username = document.getElementById('reg-username').value
    const password = document.getElementById('reg-password').value
    const firstname = document.getElementById('reg-firstname').value
    const lastname = document.getElementById('reg-lastname').value
    const alertBox = document.getElementById('reg-alert')
    alertBox.style.display = 'none'

    if (!username || !password || !firstname || !lastname) {
        alertBox.innerText = 'กรุณากรอกข้อมูลให้ครบถ้วน'
        alertBox.className = 'alert-box error'
        alertBox.style.display = 'block'
        return
    }

    try {
        const res = await api.auth.register({ username, password, firstname, lastname })
        if (res.data.success) {
            alertBox.innerText = 'สมัครสมาชิกสำเร็จ! กำลังสลับไปหน้าเข้าสู่ระบบ...'
            alertBox.className = 'alert-box success'
            alertBox.style.display = 'block'
            setTimeout(() => { switchModal('registerModal', 'loginModal') }, 2000)
        }
    } catch (error) {
        alertBox.innerText = (error.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
        alertBox.className = 'alert-box error'
        alertBox.style.display = 'block'
    }
}

const loadOrders = async () => {
    if (!user) return
    try {
        const res = await api.orders.getByUserId(user.id)
        const orders = res.data
        
        if (orders.length === 0) {
            document.getElementById('order-list').innerHTML = '<p style="text-align:center; color:#888; padding: 40px; background: white; border-radius: 8px; width: 100%; max-width: 900px; margin: 0 auto;">ยังไม่มีประวัติการสั่งซื้อครับ ลองไปดูสินค้าหน้าร้านค้าสิ!</p>'
            return
        }

        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            try {
                let itemsRes;
                if (api.orders.getItems) {
                    itemsRes = await api.orders.getItems(order.id)
                } else {
                    itemsRes = await axios.get(`http://localhost:8000/orders/${order.id}/items`)
                }
                return { ...order, items: itemsRes.data }
            } catch (err) {
                console.error(err)
                return { ...order, items: [] }
            }
        }))

        globalOrders = ordersWithItems;

        document.getElementById('order-list').innerHTML = ordersWithItems.map(order => {
            const date = new Date(order.created_at).toLocaleString('th-TH')
            let statusColor = '#f59e0b'
            let statusText = 'รอดำเนินการ'
            let cancelButton = ''
            
            if (order.status === 'shipped') { 
                statusColor = '#3b82f6'; statusText = 'จัดส่งแล้ว' 
            } else if (order.status === 'completed') { 
                statusColor = '#10b981'; statusText = 'สำเร็จ' 
            } else if (order.status === 'cancelled') { 
                statusColor = '#ef4444'; statusText = 'ยกเลิก' 
            } 
            
            if (order.status === 'pending') {
                cancelButton = `<button onclick="confirmCancelOrder(${order.id})" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.2s;">ยกเลิกคำสั่งซื้อ</button>`
            }

            return `
            <div class="order-card" style="width: 100%; max-width: 900px; margin: 0 auto 24px auto; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; border: 1px solid #f3f4f6;">
                <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; border-left: 5px solid ${statusColor};">
                    <div style="text-align: left;">
                        <div style="font-weight: 700; color: #111827; font-size: 16px; margin-bottom: 6px;">รหัสคำสั่งซื้อ: #ORD-${order.id.toString().padStart(4, '0')}</div>
                        <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">สั่งซื้อเมื่อ: ${date}</div>
                        <div style="font-size: 13px; font-weight: 600;">สถานะ: <span style="color: ${statusColor}; background: ${statusColor}15; padding: 4px 10px; border-radius: 20px;">${statusText}</span></div>
                    </div>
                    
                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between;">
                        <div style="margin-bottom: 15px;">
                            <div style="font-size: 13px; color: #6b7280; margin-bottom: 2px;">ยอดชำระสุทธิ</div>
                            <div style="font-weight: 800; color: #e63946; font-size: 20px;">${Number(order.total_price).toLocaleString()} <span style="font-size: 14px;">THB</span></div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="showOrderDetailsModal(${order.id})" style="padding: 8px 16px; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">ดูรายละเอียด</button>
                            ${cancelButton}
                        </div>
                    </div>
                </div>
            </div>`
        }).join('')
    } catch (error) {
        console.error(error)
        document.getElementById('order-list').innerHTML = '<p style="color:#ef4444; text-align:center; padding: 20px; width: 100%; max-width: 900px; margin: 0 auto;">เกิดข้อผิดพลาดในการดึงข้อมูล</p>'
    }
}

const showOrderDetailsModal = (id) => {
    const order = globalOrders.find(o => o.id === id);
    if (!order) return;

    const contentHtml = order.items.map(item => {
        const imgSrc = (item.image_url && item.image_url !== 'Logo(2).png') 
            ? `http://localhost:8000/uploads/${item.image_url}` 
            : '../../assets/images/Logo(2).png'
        
        return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e5e7eb;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${imgSrc}" style="width: 50px; height: 50px; object-fit: contain; background: white; border-radius: 6px; border: 1px solid #f3f4f6; padding: 2px;">
                <div style="text-align: left;">
                    <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 4px;">${item.name}</div>
                    <div style="font-size: 12px; color: #6b7280;">
                        ${item.quantity} x <span style="color: #9ca3af;">${Number(item.price).toLocaleString()} THB</span>
                    </div>
                </div>
            </div>
            <div style="font-weight: 700; color: #ef4444; font-size: 13px; white-space: nowrap;">
                ${(Number(item.price) * item.quantity).toLocaleString()} THB
            </div>
        </div>`
    }).join('');

    document.getElementById('details-modal-content').innerHTML = contentHtml;
    openModal('detailsModal');
}

const confirmCancelOrder = (id) => {
    orderToCancel = id
    document.getElementById('cancelModal').style.display = 'flex'
}

const closeCancelModal = () => {
    orderToCancel = null
    document.getElementById('cancelModal').style.display = 'none'
}

const executeCancelOrder = async () => {
    if (!orderToCancel) return
    try {
        await axios.put(`http://localhost:8000/orders/${orderToCancel}/status`, { status: 'cancelled' })
        closeCancelModal()
        loadOrders()
    } catch (error) {
        console.error(error)
        alert('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ')
        closeCancelModal()
    }
}