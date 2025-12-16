/************* FIREBASE CONFIG *************/
const firebaseConfig = {
  apiKey: "AIzaSyAhHEPz4GpWo_3qxV_OXxIefvmbcPSzDyA",
  authDomain: "cartmakeup-889b7.firebaseapp.com",
  projectId: "cartmakeup-889b7",
  storageBucket: "cartmakeup-889b7.firebasestorage.app",
  messagingSenderId: "118169131860",
  appId: "1:118169131860:web:8842836f63a9acfa7d46c1",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

/************* ẨN NỘI DUNG CHO ĐẾN KHI KIỂM TRA AUTH *************/
document.body.style.opacity = '0';
document.body.style.visibility = 'hidden';

/************* CHECK AUTH - QUAN TRỌNG *************/
let isAuthChecked = false;

auth.onAuthStateChanged((user) => {
  if (!user && !isAuthChecked) {
    // Chưa đăng nhập -> chuyển về trang login
    console.log('No user detected, redirecting to login...');
    window.location.href = "login.html";
    return;
  }
  
  if (user) {
    console.log('User logged in:', user.email);
    // Đã đăng nhập -> hiện nội dung
    document.body.style.opacity = '1';
    document.body.style.visibility = 'visible';
    isAuthChecked = true;
    
    // Load data
    loadContacts();
  }
});

// Timeout fallback - nếu sau 3 giây vẫn không có phản hồi từ Firebase
setTimeout(() => {
  if (!isAuthChecked) {
    console.log('Auth check timeout, redirecting to login...');
    window.location.href = "login.html";
  }
}, 3000);

/************* LOGOUT FUNCTION *************/
function logout() {
  if (confirm("うみくん có chắc muốn đăng xuất?")) {
    auth.signOut().then(() => {
      console.log('Logged out successfully');
      window.location.href = "login.html";
    }).catch((error) => {
      console.error('Logout error:', error);
      alert("Lỗi khi đăng xuất: " + error.message);
    });
  }
}

/************* DOM ELEMENTS *************/
const tableBody   = document.getElementById("contactTable");
const statusFilter = document.getElementById("statusFilter");
const yearFilter   = document.getElementById("yearFilter");
const monthFilter  = document.getElementById("monthFilter");
const dayFilter    = document.getElementById("dayFilter");
const todayBtn     = document.getElementById("todayBtn");
const nameSearch   = document.getElementById("nameSearch");

/************* DATA *************/
let contacts = [];

/************* UTIL: NORMALIZE (Bỏ DẤU) *************/
function normalizeText(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/************* LOAD DATA *************/
function loadContacts() {
  db.collection("contacts")
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      contacts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      populateDateFilters();
      renderTable();
    }, (error) => {
      console.error("Error loading contacts:", error);
    });
}

/************* POPULATE FILTERS *************/
function populateDateFilters() {
  const years  = [...new Set(contacts.map(c => c.year))].sort((a, b) => b - a);
  const months = [...new Set(contacts.map(c => c.month))].sort((a, b) => a - b);
  const days   = [...new Set(contacts.map(c => c.day))].sort((a, b) => a - b);

  fillSelect(yearFilter, years, "All Years");
  fillSelect(monthFilter, months, "All Months");
  fillSelect(dayFilter, days, "All Days");
}

function fillSelect(select, values, label) {
  const current = select.value;
  select.innerHTML = `<option value="all">${label}</option>`;

  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });

  select.value = current || "all";
}

/************* RENDER TABLE *************/
function renderTable() {
  tableBody.innerHTML = "";

  const keyword = normalizeText(nameSearch.value);

  const filtered = contacts.filter(c => {
    if (statusFilter.value !== "all" && c.status !== statusFilter.value) return false;
    if (yearFilter.value !== "all" && c.year != yearFilter.value) return false;
    if (monthFilter.value !== "all" && c.month != monthFilter.value) return false;
    if (dayFilter.value !== "all" && c.day != dayFilter.value) return false;
    if (keyword && !normalizeText(c.name).includes(keyword)) return false;
    return true;
  });

  filtered.forEach(c => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${c.name || ""}</td>

      <td>${c.email || ""}</td>

      <td class="message">
        <i class="fa-solid fa-comment"></i> ${c.message || ""}
      </td>

      <td>
        <select class="statusSelect">
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </td>

      <td>
        <i class="fa-solid fa-calendar-day"></i>
        ${c.day}/${c.month}/${c.year}
      </td>

      <td>
        <button class="deleteBtn" title="Xóa contact">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;

    /* ===== STATUS ===== */
    const statusSelect = tr.querySelector(".statusSelect");
    const status = c.status || "new";

    statusSelect.value = status;
    statusSelect.classList.add(`status-${status}`);

    statusSelect.addEventListener("change", (e) => {
      const newStatus = e.target.value;

      // Update UI ngay
      statusSelect.className = "statusSelect";
      statusSelect.classList.add(`status-${newStatus}`);

      // Update Firestore
      db.collection("contacts").doc(c.id).update({
        status: newStatus,
      }).catch(err => {
        console.error("Update status error:", err);
        alert("❌ Cập nhật thất bại: " + err.message);
      });
    });

    /* ===== DELETE ===== */
    tr.querySelector(".deleteBtn").addEventListener("click", () => {
      const ok = confirm(`🗑️ Bạn có chắc muốn xóa contact của "${c.name}" không?`);
      if (!ok) return;

      db.collection("contacts").doc(c.id).delete()
        .then(() => {
          console.log("Contact deleted:", c.id);
        })
        .catch(err => {
          console.error("Delete error:", err);
          alert("❌ Xóa thất bại: " + err.message);
        });
    });

    tableBody.appendChild(tr);
  });
}


/************* EVENTS *************/
statusFilter.addEventListener("change", renderTable);
yearFilter.addEventListener("change", renderTable);
monthFilter.addEventListener("change", renderTable);
dayFilter.addEventListener("change", renderTable);

nameSearch.addEventListener("input", renderTable);

todayBtn.addEventListener("click", () => {
  const today = new Date();
  yearFilter.value = today.getFullYear();
  monthFilter.value = today.getMonth() + 1;
  dayFilter.value = today.getDate();
  renderTable();
});