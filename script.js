// =========================================================
// 1. BIẾN TOÀN CỤC & KHỞI TẠO
// =========================================================
let db = {};
// Đổi tên biến local cho đồng bộ với MindX
let activeClassCode = localStorage.getItem("mindxClass_Active");
let currentSession = 1;

// =========================================================
// 2. KẾT NỐI FIREBASE
// =========================================================
function loadDataFromFirebase() {
  // Lấy thông tin người dùng đang đăng nhập
  const user = window.auth_firebase.currentUser;

  if (!user) {
    console.warn("Chưa đăng nhập, không thể tải dữ liệu.");
    return;
  }

  // Tạo đường dẫn riêng: users/Mã-ID-Của-Giáo-Viên/mindx_class_data
  const dbPath = `users/${user.uid}/mindx_class_data`;
  const dbRef = window.ref_firebase(window.db_firebase, dbPath);

  // Lắng nghe dữ liệu
  window.onValue_firebase(dbRef, (snapshot) => {
    const data = snapshot.val();
    db = data ? data : {};
    routePage(); // Vẽ lại giao diện
  });
}

async function saveToCloud(silent = false) {
  const user = window.auth_firebase.currentUser;
  if (!user) {
    alert("Lỗi: Bạn chưa đăng nhập!");
    return;
  }

  const btn = document.querySelector(".btn-save");
  if (btn)
    btn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Đang đồng bộ...';

  try {
    // Chỉ định đúng đường dẫn cá nhân để lưu
    const dbPath = `users/${user.uid}/mindx_class_data`;
    await window.set_firebase(
      window.ref_firebase(window.db_firebase, dbPath),
      db,
    );

    if (!silent) alert("Đã đồng bộ lên tài khoản cá nhân thành công!");
  } catch (error) {
    console.error("Lỗi đồng bộ Firebase:", error);
    if (!silent) alert("Lỗi mạng hoặc không có quyền lưu dữ liệu!");
  } finally {
    if (btn)
      btn.innerHTML =
        '<i class="fa-solid fa-floppy-disk"></i> Lưu dữ liệu buổi này';
  }
}

// =========================================================
// 3. TRANG CHỦ (HOME.HTML)
// =========================================================
function renderHome() {
  const classListDiv = document.getElementById("classList");
  if (!classListDiv) return;
  classListDiv.innerHTML = "";
  const classCodes = Object.keys(db);

  if (classCodes.length === 0) {
    classListDiv.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: #888; padding: 40px; background: white; border-radius: 8px;">Chưa có lớp học nào. Hãy nhấn "Tạo lớp mới" để bắt đầu nhé!</p>`;
    return;
  }

  classCodes.forEach((code) => {
    const info = db[code].info;
    const studentCount = db[code].students ? db[code].students.length : 0;

    const card = document.createElement("div");
    card.className = "class-card";
    card.innerHTML = `
            <h3>${info.className}</h3>
            <p><i class="fa-solid fa-hashtag" style="color:var(--accent)"></i> <strong>Mã lớp:</strong> ${info.classCode}</p>
            <p><i class="fa-solid fa-book" style="color:var(--secondary)"></i> <strong>Bộ môn:</strong> ${info.subject}</p>
            <p><i class="fa-solid fa-users" style="color:var(--primary)"></i> <strong>Sĩ số:</strong> ${studentCount} học viên</p>
            <div class="class-card-actions">
                <button class="btn btn-green" style="flex: 2" onclick="openClass('${code}')"><i class="fa-solid fa-folder-open"></i> Quản lý</button>
                <button class="btn btn-red" style="flex: 1" onclick="deleteClass('${code}')"><i class="fa-solid fa-trash-can"></i> Xóa</button>
            </div>
        `;
    classListDiv.appendChild(card);
  });
}

function openClass(code) {
  localStorage.setItem("mindxClass_Active", code);
  window.location.href = "index.html";
}

async function deleteClass(code) {
  if (confirm(`⚠️ Nguy hiểm: Bạn có chắc chắn muốn XÓA lớp ${code}?`)) {
    delete db[code];
    if (activeClassCode === code) localStorage.removeItem("mindxClass_Active");
    await saveToCloud(true);
  }
}

// =========================================================
// 4. TRANG KHAI BÁO (SETUP.HTML)
// =========================================================
async function createNewClass(event) {
  event.preventDefault();
  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo lớp...';
  btn.disabled = true;

  const code = document.getElementById("classCode").value.trim().toUpperCase();
  const studentLines = document.getElementById("studentList").value.split("\n");
  const students = studentLines.map((s) => s.trim()).filter((s) => s !== "");

  if (students.length === 0) {
    alert("Vui lòng nhập ít nhất 1 học sinh!");
    btn.innerHTML = originalText;
    btn.disabled = false;
    return;
  }

  db[code] = {
    info: {
      className: document.getElementById("className").value,
      classCode: code,
      subject: document.getElementById("subject").value,
      level: document.getElementById("level").value,
      schedule: document.getElementById("schedule").value,
    },
    students: students,
    sessions: {},
  };

  await saveToCloud(true);
  alert("Tạo lớp thành công!");
  window.location.href = "home.html";
}

// =========================================================
// 5. TRANG QUẢN LÝ ĐIỂM (INDEX.HTML)
// =========================================================
function initManagement() {
  activeClassCode = localStorage.getItem("mindxClass_Active"); // Lấy lại mã lớp mới nhất

  if (!activeClassCode || !db[activeClassCode]) {
    window.location.href = "home.html";
    return;
  }

  const classData = db[activeClassCode];

  if (document.getElementById("info-className")) {
    document.getElementById("info-className").innerText =
      classData.info.className || "...";
    document.getElementById("info-classCode").innerText =
      classData.info.classCode || "...";
    document.getElementById("info-subject").innerText =
      classData.info.subject || "...";
    document.getElementById("info-level").innerText =
      classData.info.level || "...";
    document.getElementById("info-schedule").innerText =
      classData.info.schedule || "...";
  }

  const select = document.getElementById("sessionSelect");
  if (select && select.options.length === 0) {
    for (let i = 1; i <= 9; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = "Buổi học " + i;
      select.appendChild(opt);
    }
  }

  if (document.getElementById("sessionSelect")) {
    currentSession = document.getElementById("sessionSelect").value;
  }
  renderTable();
}

// Hàm này đã được "bọc thép" để không bao giờ bị lỗi rỗng
function getSessionData() {
  const classData = db[activeClassCode];
  if (!classData.sessions) classData.sessions = {};

  if (!classData.sessions[currentSession]) {
    const studentsList = classData.students || [];
    classData.sessions[currentSession] = studentsList.map((name) => ({
      name: name,
      stars: 0,
      badges: 0,
      isAbsent: false,
    }));
  }
  return classData.sessions[currentSession];
}

function changeSession() {
  if (document.getElementById("sessionSelect")) {
    currentSession = document.getElementById("sessionSelect").value;
    renderTable();
  }
}

function renderTable() {
  try {
    const tbody = document.getElementById("studentTableBody");
    if (!tbody) return;

    const sessionData = getSessionData();
    tbody.innerHTML = "";

    // CẢNH BÁO NẾU LỚP BỊ RỖNG HỌC SINH
    if (!sessionData || sessionData.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align:center; padding: 25px; color: var(--danger); font-weight: bold;">Chưa có học viên nào! Vui lòng về Trang chủ, XÓA lớp này và Tạo lại lớp mới có đầy đủ danh sách học viên nhé.</td></tr>';
      return;
    }

    sessionData.forEach((student, index) => {
      let starsHtml = "";
      for (let i = 0; i < student.stars; i++)
        starsHtml += '<i class="fa-solid fa-star"></i>';

      const disabledStyle = student.isAbsent
        ? "opacity: 0.4; cursor: not-allowed; filter: grayscale(100%);"
        : "";

      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td><span class="${student.isAbsent ? "absent" : ""}">${student.name}</span></td>
                <td><div class="stars-container">${starsHtml}</div></td>
                <td style="display: flex; gap: 8px;">
                    <button class="btn btn-green" style="padding: 8px 12px; ${disabledStyle}" onclick="updatePoint(${index}, 1)">+</button>
                    <button class="btn btn-red" style="padding: 8px 12px; ${disabledStyle}" onclick="updatePoint(${index}, -1)">-</button>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-yellow" style="${disabledStyle}" onclick="awardBadge(${index})">
                            <i class="fa-solid fa-ribbon"></i> (${student.badges})
                        </button>
                        <button class="btn btn-orange" onclick="toggleAbsent(${index})">
                            ${student.isAbsent ? "Có mặt" : "Vắng"}
                        </button>
                    </div>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Lỗi vẽ bảng: ", err);
  }
}

function updatePoint(idx, val) {
  const sessionData = getSessionData();
  if (sessionData[idx].isAbsent) {
    alert("Học viên này đang vắng mặt, không thể thao tác điểm!");
    return;
  }
  if (sessionData[idx].stars + val >= 0) {
    sessionData[idx].stars += val;
    saveToCloud(true);
  }
}

function awardBadge(idx) {
  const sessionData = getSessionData();
  if (sessionData[idx].isAbsent) {
    alert("Học viên này đang vắng mặt, không thể trao huy hiệu!");
    return;
  }
  sessionData[idx].badges += 1;
  saveToCloud(true);
}

function toggleAbsent(idx) {
  const sessionData = getSessionData();
  sessionData[idx].isAbsent = !sessionData[idx].isAbsent;
  saveToCloud(true);
}

function saveCurrentSession() {
  saveToCloud();
}

async function resetAllData() {
  if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ lớp học và dữ liệu không?")) {
    return;
  }

  db = {};
  localStorage.removeItem("mindxClass_Active");
  await saveToCloud(true);
  alert("Đã xóa toàn bộ dữ liệu.");
  window.location.href = "home.html";
}

// =========================================================
// 6. TRANG TỔNG KẾT (SUMMARY.HTML)
// =========================================================
function renderSummary() {
  if (!activeClassCode || !db[activeClassCode]) return;

  const classData = db[activeClassCode];
  const tbody = document.getElementById("summaryTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const studentsList = classData.students || [];
  if (studentsList.length === 0) return;

  let totals = studentsList.map((name) => ({
    name: name,
    totalStars: 0,
    totalBadges: 0,
  }));

  for (let i = 1; i <= 9; i++) {
    if (classData.sessions && classData.sessions[i]) {
      classData.sessions[i].forEach((s, idx) => {
        if (totals[idx]) {
          totals[idx].totalStars += s.stars;
          totals[idx].totalBadges += s.badges;
        }
      });
    }
  }

  totals.forEach((student) => {
    let rank =
      student.totalStars >= 15
        ? "Xuất sắc 🌟"
        : student.totalStars >= 7
          ? "Khá"
          : "Cần cố gắng";
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><strong>${student.name}</strong></td>
            <td><span class="stars-container">★ ${student.totalStars}</span></td>
            <td><span class="badge-count"><i class="fa-solid fa-ribbon"></i> ${student.totalBadges}</span></td>
            <td>${rank}</td>
        `;
    tbody.appendChild(tr);
  });
}

// =========================================================
// 7. ROUTER
// =========================================================
function routePage() {
  if (document.getElementById("classList")) {
    renderHome();
  } else if (document.getElementById("studentTableBody")) {
    initManagement();
  } else if (document.getElementById("summaryTableBody")) {
    renderSummary();
  }
}

// =========================================================
// 8. KIỂM TRA ĐĂNG NHẬP VÀ KHỞI CHẠY (BẢO MẬT)
// =========================================================

function logout() {
  if (confirm("Thầy/Cô có chắc chắn muốn đăng xuất khỏi hệ thống không?")) {
    window
      .signOut_firebase(window.auth_firebase)
      .then(() => {
        // Đăng xuất thành công, chuyển hướng về trang đăng nhập
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert("Lỗi đăng xuất: " + error.message);
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Chờ Firebase nạp các thư viện Auth xong
  let checkFirebaseInterval = setInterval(() => {
    if (window.auth_firebase && window.onAuthStateChanged_firebase) {
      clearInterval(checkFirebaseInterval);

      // Theo dõi trạng thái đăng nhập liên tục
      window.onAuthStateChanged_firebase(window.auth_firebase, (user) => {
        if (user) {
          // KỊCH BẢN 1: ĐÃ ĐĂNG NHẬP THÀNH CÔNG
          console.log("Đã đăng nhập thành công với ID:", user.uid);

          // Bắt đầu tải dữ liệu cá nhân của người này
          loadDataFromFirebase();
        } else {
          // KỊCH BẢN 2: CHƯA ĐĂNG NHẬP HOẶC BỊ VĂNG
          // Nếu không phải đang ở trang login thì lập tức đuổi về trang login
          if (!window.location.pathname.includes("login.html")) {
            window.location.href = "login.html";
          }
        }
      });
    }
  }, 100); // Kiểm tra mỗi 0.1 giây cho đến khi Firebase sẵn sàng
});
