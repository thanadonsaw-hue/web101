const user = JSON.parse(localStorage.getItem('user'))
let cart = JSON.parse(localStorage.getItem('cart')) || []
let allProducts = []
let currentFilteredProducts = []
let currentPage = 1
const itemsPerPage = 12

window.onload = () => {
    updateUI()
    loadProducts()

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
        if (!event.target.closest('.user-menu-container') && !event.target.closest('.icon-btn') && !event.target.closest('.modal-overlay')) {
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

const showToast = (message, isSuccess) => {
    const toast = document.getElementById('toast-msg')
    toast.innerText = message
    toast.className = 'alert-toast ' + (isSuccess ? 'toast-success' : 'toast-error')
    toast.style.display = 'block'
    setTimeout(() => { toast.style.display = 'none' }, 2500)
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
                <a href="../history/index.html">ประวัติการสั่งซื้อ</a>
                <button onclick="logout()" class="logout-btn">ออกจากระบบ</button>
            </div>
        </div>`
    } else {
        section.innerHTML = `
        <button class="icon-btn" onclick="openModal('loginModal')">
            <i class="fa-regular fa-circle-user"></i>
        </button>`
    }
    updateCartUI()
}

const loadProducts = async () => {
    try {
        const res = await api.products.getAll()
        allProducts = res.data
        currentFilteredProducts = [...allProducts]
        renderPage()
    } catch (error) {
        console.error(error)
    }
}

const renderPage = () => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    const productsToShow = currentFilteredProducts.slice(start, end)
    renderProducts(productsToShow)
    renderPagination()
}

const renderPagination = () => {
    const totalPages = Math.ceil(currentFilteredProducts.length / itemsPerPage)
    const paginationContainer = document.getElementById('pagination')
    if (totalPages <= 1) {
        paginationContainer.innerHTML = ''
        return
    }
    let html = ''
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`
    }
    paginationContainer.innerHTML = html
}

const changePage = (page) => {
    currentPage = page
    renderPage()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const renderProducts = (productsToRender) => {
    const productsContainer = document.getElementById('products')
    if (productsToRender.length === 0) {
        productsContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px; color:#888;">ไม่พบสินค้าในหมวดหมู่นี้</p>'
        return
    }
    productsContainer.innerHTML = productsToRender.map(p => {
        const imgSrc = (p.image_url && p.image_url !== 'Logo(2).png') 
            ? `http://localhost:8000/uploads/${p.image_url}` 
            : '../../assets/images/Logo(2).png'
        const safeName = p.name.replace(/'/g, "\\'")
        
        // แก้ไขตรงนี้: บังคับเป็น Number ก่อนทำ Comma
        const priceNum = Number(p.price);
        const formattedPrice = priceNum.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});

        return `
        <div class="card">
            <div class="card-icon"><img src="${imgSrc}"></div>
            <h3>${p.name}</h3>
            <p class="price">${formattedPrice} THB</p>
            <p class="stock">คงเหลือ: ${p.stock}</p>
            <button class="btn-buy" ${p.stock <= 0 ? 'disabled' : ''} onclick="addToCart(${p.id}, '${safeName}', ${p.price}, '${imgSrc}', ${p.stock})">
                ${p.stock > 0 ? 'เพิ่มลงตะกร้า' : 'ของหมด'}
            </button>
        </div>`
    }).join('')
}

const filterProducts = (category, btnElement) => {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'))
    btnElement.classList.add('active')
    if (category === 'all') {
        currentFilteredProducts = [...allProducts]
    } else {
        currentFilteredProducts = allProducts.filter(p => {
            const name = p.name.toLowerCase()
            if (category === 'monitor') return name.includes('samsung odyssey') || name.includes('benq') || name.includes('zowie xl') || name.includes('msi mag') || name.includes('lg ultragear') || name.includes('จอ') || name.includes('monitor')
            if (category === 'mouse') return name.includes('viper') || name.includes('deathadder') || name.includes('logitech') || name.includes('zowie fk') || name.includes('gravastar') || name.includes('ajazz') || name.includes('เมาส์') || name.includes('mouse')
            if (category === 'keyboard') return name.includes('alienware aw') || name.includes('corsair k') || name.includes('aula') || name.includes('cherry') || name.includes('keychron') || name.includes('wooting') || name.includes('huntsman') || name.includes('คีย์บอร์ด') || name.includes('keyboard')
            if (category === 'cpu') return name.includes('amd') || name.includes('ryzen') || name.includes('threadripper') || name.includes('intel') || name.includes('core i')
            if (category === 'vga') return name.includes('rtx') || name.includes('geforce') || name.includes('zotac') || name.includes('การ์ดจอ') || name.includes('vga')
            if (category === 'notebook') return name.includes('titan') || name.includes('asus tuf') || name.includes('hp omen') || name.includes('acer nitro') || name.includes('katana') || name.includes('zenbook') || name.includes('aero') || name.includes('โน้ตบุ๊ก') || name.includes('laptop') || name.includes('notebook')
            if (category === 'headset') return name.includes('blackshark') || name.includes('arctis') || name.includes('hyperx cloud') || name.includes('barracuda') || name.includes('kraken') || name.includes('corsair void') || name.includes('หูฟัง') || name.includes('headset')
            return false
        })
    }
    currentPage = 1
    renderPage()
}

const toggleCart = () => {
    document.getElementById('cartModal').classList.toggle('active')
}

const addToCart = (id, name, price, img, stock) => {
    if (!user) {
        openModal('loginModal')
        return
    }
    const existing = cart.find(item => item.id === id)
    if (existing) {
        if (existing.quantity >= stock) {
            showToast('จำนวนสินค้าในตะกร้าเกินสต็อกที่มี', false)
            return
        }
        existing.quantity += 1
    } else {
        if (stock <= 0) return
        cart.push({ id, name, price, img, quantity: 1, stock: stock })
    }
    saveCart()
    updateCartUI()
    document.getElementById('cartModal').classList.add('active')
}

const removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id)
    saveCart()
    updateCartUI()
}

const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart))
}

const updateCartUI = () => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0)
    document.getElementById('cart-count').innerText = count
    let total = 0
    document.getElementById('cart-items').innerHTML = cart.map(item => {
        total += Number(item.price) * item.quantity
        return `
        <div class="cart-item">
            <img src="${item.img}">
            <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 500; margin-bottom: 2px;">${item.name}</div>
                <div style="color: #6b7280; font-size: 13px;">${Number(item.price).toLocaleString()} THB</div>
                <div style="font-size: 13px; font-weight: 600;">จำนวน: ${item.quantity}</div>
            </div>
            <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #9ca3af; cursor: pointer;"><i class="fa-solid fa-trash-can"></i></button>
        </div>`
    }).join('')
    document.getElementById('cart-total').innerText = total.toLocaleString() + ' THB'
}

const checkout = async () => {
    if (!user) return
    if (cart.length === 0) {
        showToast('ยังไม่มีสินค้าในตะกร้าครับ', false)
        return
    }
    const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
    try {
        await api.orders.create({
            userId: user.id,
            cartItems: cart,
            totalPrice: totalPrice
        })
        showToast('สั่งซื้อสำเร็จ', true)
        cart = []
        saveCart()
        updateCartUI()
        loadProducts()
        setTimeout(() => {
            location.href = '../history/index.html'
        }, 2000)
    } catch (error) {
        console.error(error)
        showToast('เกิดข้อผิดพลาดในการสั่งซื้อ', false)
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
        alertBox.style.display = 'block'
        return
    }
    try {
        const res = await api.auth.register({ username, password, firstname, lastname })
        if (res.data.success) {
            alertBox.innerText = 'สมัครสมาชิกสำเร็จ! กำลังสลับ...'
            alertBox.className = 'alert-box success'
            alertBox.style.display = 'block'
            setTimeout(() => { switchModal('registerModal', 'loginModal') }, 2000)
        }
    } catch (error) {
        alertBox.innerText = (error.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
        alertBox.style.display = 'block'
    }
}