const user = JSON.parse(localStorage.getItem('user'))
let orderToCancel = null

window.onload = () => {
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
        document.getElementById('order-list').innerHTML = '<p style="text-align:center; color:#888; padding: 20px;">กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ</p>'
    }
}

const openModal = (modalId) => {
    document.getElementById(modalId).classList.add('active')
    clearAlerts()
}

const closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('active')
}

const switchModal = (closeId, openId) => {
    closeModal(closeId)
    setTimeout(() => { openModal(openId) }, 200)
}

const clearAlerts = () => {
    document.getElementById('login-alert').style.display = 'none'
    document.getElementById('reg-alert').style.display = 'none'
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
            document.getElementById('order-list').innerHTML = '<p style="text-align:center; color:#888; padding: 20px;">ยังไม่มีประวัติการสั่งซื้อครับ ลองไปดูสินค้าหน้าร้านค้าสิ!</p>'
            return
        }

        document.getElementById('order-list').innerHTML = orders.map(order => {
            const date = new Date(order.created_at).toLocaleString('th-TH')
            let statusColor = '#f59e0b'
            let statusText = 'รอดำเนินการ'
            let actionButton = ''
            
            if (order.status === 'shipped') { 
                statusColor = '#3b82f6'; statusText = 'จัดส่งแล้ว' 
            } else if (order.status === 'completed') { 
                statusColor = '#10b981'; statusText = 'สำเร็จ' 
            } else if (order.status === 'cancelled') { 
                statusColor = '#ef4444'; statusText = 'ยกเลิก' 
            } else if (order.status === 'pending') {
                // แสดงปุ่มเฉพาะตอนที่สถานะยังเป็น pending
                actionButton = `<button onclick="confirmCancelOrder(${order.id})" style="margin-top: 10px; padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; width: 100%;">ยกเลิกคำสั่งซื้อ</button>`
            }

            return `
            <div class="order-card" style="align-items: flex-start;">
                <div class="order-info">
                    <div class="order-id">รหัสคำสั่งซื้อ: #ORD-${order.id.toString().padStart(4, '0')}</div>
                    <div class="order-status">สถานะ: <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span></div>
                    <div class="order-date">สั่งซื้อเมื่อ: ${date}</div>
                </div>
                <div style="text-align: right; min-width: 120px;">
                    <div class="order-total" style="font-weight: bold; color: #111827;">${parseFloat(order.total_price).toLocaleString()} THB</div>
                    ${actionButton}
                </div>
            </div>`
        }).join('')
    } catch (error) {
        console.error(error)
        document.getElementById('order-list').innerHTML = '<p style="color:#ef4444; text-align:center; padding: 20px;">เกิดข้อผิดพลาดในการดึงข้อมูล</p>'
    }
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
        // ใช้ API endpoint เดิมของแอดมินในการเปลี่ยนสถานะเป็น cancelled ได้เลย (เพราะ Backend ไม่ได้ล็อกสิทธิ์ไว้)
        await api.orders.adminUpdateStatus(orderToCancel, 'cancelled')
        closeCancelModal()
        loadOrders()
    } catch (error) {
        console.error(error)
        alert('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ')
        closeCancelModal()
    }
}