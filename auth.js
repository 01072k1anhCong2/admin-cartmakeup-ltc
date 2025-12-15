/************* FIREBASE CONFIG *************/
const firebaseConfig = {
  apiKey: "AIzaSyAhHEPz4GpWo_3qxV_OXxIefvmbcPSzDyA",
  authDomain: "cartmakeup-889b7.firebaseapp.com",
  projectId: "cartmakeup-889b7",
};

/************* INIT *************/
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const ADMIN_EMAIL = "cong@gmail.com";

/************* LOGIN *************/
document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(({ user }) => {
      if (user.email !== ADMIN_EMAIL) {
        auth.signOut();
        alert("Bạn không có quyền truy cập");
        return;
      }
      window.location.href = "/admin/admin.html";
    })
    .catch(err => alert(err.message));
});
