const user = JSON.parse(localStorage.getItem('user'))

window.onload = () => {
  updateUI()

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
      for (let d of dropdowns) {
        d.classList.remove('show')
      }
    }
  }
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
        ${user.role === 'admin' ? '<a href="pages/admin/index.html">หน้าแอดมิน</a>' : ''}
        <a href="pages/history/index.html">ประวัติการสั่งซื้อ</a>
        <button onclick="logout()" class="logout-btn" style="color: #ef4444;">ออกจากระบบ</button>
      </div>
    </div>`
  } else {
    section.innerHTML = `<button class="icon-btn" onclick="openModal('loginModal')"><i class="fa-regular fa-circle-user"></i></button>`
  }
}

const toggleMenu = () => {
  const dropdown = document.getElementById('myDropdown')
  if (dropdown) dropdown.classList.toggle('show')
}

const logout = () => {
  localStorage.clear()
  location.reload()
}

const openModal = (modalId) => {
  document.getElementById(modalId).classList.add('active')
}

const closeModal = (modalId) => {
  document.getElementById(modalId).classList.remove('active')
}

const switchModal = (closeId, openId) => {
  closeModal(closeId)
  setTimeout(() => { openModal(openId) }, 200)
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
      alertBox.innerText = 'สมัครสมาชิกสำเร็จ!'
      alertBox.className = 'alert-box success'
      alertBox.style.display = 'block'
      setTimeout(() => { switchModal('registerModal', 'loginModal') }, 2000)
    }
  } catch (error) {
    alertBox.innerText = 'เกิดข้อผิดพลาดในการสมัคร'
    alertBox.style.display = 'block'
  }
}