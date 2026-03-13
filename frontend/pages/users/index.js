window.onload = async () => {
  await loadData()
}

const loadData = async () => {
  try {
    const response = await api.users.getAll()
    const users = response.data

    let html = '<div class="form-card" style="padding:0;overflow:hidden;"><table><thead><tr><th>ID</th><th>ชื่อ</th><th>อายุ</th><th>เพศ</th><th>จัดการ</th></tr></thead><tbody>'
    for (const user of users) {
      html += `<tr>
        <td>${user.id}</td>
        <td>${user.firstname} ${user.lastname}</td>
        <td>${user.age}</td>
        <td>${user.gender}</td>
        <td>
          <div class="btn-row">
            <a href="../register/?id=${user.id}"><button class="button button-outline-edit">✏️ แก้ไข</button></a>
            <button class="button button-outline-danger delete" data-id="${user.id}">🗑️ ลบ</button>
          </div>
        </td>
      </tr>`
    }
    html += '</tbody></table></div>'

    document.getElementById('user').innerHTML = html

    document.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', async (event) => {
        const id = event.target.dataset.id
        if (!confirm('ยืนยันการลบ?')) return
        try {
          await api.users.remove(id)
          await loadData()
        } catch (error) {
          console.log(error)
        }
      })
    })
  } catch (error) {
    console.log(error)
  }
}
