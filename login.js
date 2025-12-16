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
const auth = firebase.auth();

/************* CHECK IF ALREADY LOGGED IN *************/
auth.onAuthStateChanged((user) => {
  if (user) {
    // Đã đăng nhập -> chuyển sang trang admin
    window.location.href = "index.html";
  }
});

/************* DOM ELEMENTS *************/
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("errorMessage");

/************* LOGIN HANDLER *************/
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Reset error
  errorMessage.classList.remove("show");
  errorMessage.textContent = "";
  
  // Disable button
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...';
  
  try {
    // Đăng nhập với Firebase Authentication
    await auth.signInWithEmailAndPassword(email, password);
    
    // Success -> Firebase sẽ tự chuyển hướng qua onAuthStateChanged
    
  } catch (error) {
    // Show error
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Đăng nhập';
    
    let errorText = "Đăng nhập thất bại!";
    
    switch (error.code) {
      case "auth/user-not-found":
        errorText = "Email không tồn tại rồi kkk !";
        break;
      case "auth/wrong-password":
        errorText = "Mật khẩu không đúng　rùi kk!";
        break;
      case "auth/invalid-email":
        errorText = "Email không hợp lệ kkk!";
        break;
      case "auth/too-many-requests":
        errorText = "Quá nhiều lần thử. Vui lòng thử lại sau!";
        break;
      default:
        errorText = error.message;
    }
    
    errorMessage.textContent = errorText;
    errorMessage.classList.add("show");
  }
});