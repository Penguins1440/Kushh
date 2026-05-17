// Authentication utility functions
const AUTH_KEY = 'loggedInUser';

// Valid users database
const validUsers = [
  {
    email: 'yugantaghimire81@uniglobecollege.edu.np',
    password: 'password123',
    name: 'Yuganta Ghimire',
    symbolNo: '27518112118',
    program: 'Science',
    batch: '2081/82',
    board: 'National Examinations Board',
    seeGpa: '3.78'
  },
  {
    email: 'sukrinthapa81@uniglobecollege.edu.np',
    password: 'halaagula',
    name: 'Sukrin Thapa',
    symbolNo: '27518112119',
    program: 'Science',
    batch: '2081/82',
    board: 'National Examinations Board',
    seeGpa: '3.85'
  }
];

// Check if user is logged in
function isLoggedIn() {
  const user = sessionStorage.getItem(AUTH_KEY);
  return user !== null;
}

// Get current logged in user
function getCurrentUser() {
  const user = sessionStorage.getItem(AUTH_KEY);
  return user ? JSON.parse(user) : null;
}

// Login function
function login(email, password) {
  const user = validUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    const sessionData = {
      email: user.email,
      name: user.name,
      symbolNo: user.symbolNo,
      program: user.program,
      batch: user.batch,
      board: user.board,
      seeGpa: user.seeGpa,
      loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
    return { success: true, user: sessionData };
  }
  
  return { success: false, message: 'Invalid email or password' };
}

// Logout function
function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = 'login_mis.html';
}

// Require authentication - redirect to login if not authenticated
function requireAuth() {
  if (!isLoggedIn()) {
    alert('Please login to access this page');
    window.location.href = 'login_mis.html';
    return false;
  }
  return true;
}

// Update user info on pages
function updateUserInfo() {
  const user = getCurrentUser();
  if (!user) return;
  
  // Update welcome messages
  const welcomeElements = document.querySelectorAll('[data-user-name]');
  welcomeElements.forEach(element => {
    element.textContent = user.name;
  });
  
  // Update student info
  const studentNameElements = document.querySelectorAll('[data-student-name]');
  studentNameElements.forEach(element => {
    element.textContent = user.name;
  });
  
  // Update symbol number
  const symbolElements = document.querySelectorAll('[data-symbol-no]');
  symbolElements.forEach(element => {
    element.textContent = user.symbolNo;
  });
  
  // Update program
  const programElements = document.querySelectorAll('[data-program]');
  programElements.forEach(element => {
    element.textContent = user.program;
  });
  
  // Update batch
  const batchElements = document.querySelectorAll('[data-batch]');
  batchElements.forEach(element => {
    element.textContent = user.batch;
  });
  
  // Update board
  const boardElements = document.querySelectorAll('[data-board]');
  boardElements.forEach(element => {
    element.textContent = user.board;
  });
  
  // Update SEE GPA
  const gpaElements = document.querySelectorAll('[data-see-gpa]');
  gpaElements.forEach(element => {
    element.textContent = user.seeGpa;
  });
  
  // Update email
  const emailElements = document.querySelectorAll('[data-email]');
  emailElements.forEach(element => {
    element.value = user.email;
  });
}

// Initialize authentication on page load
function initAuth() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    // Allow access to login and reset pages
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login_mis.html' && currentPage !== 'reset_mis.html' && currentPage !== 'index.html') {
      requireAuth();
      return;
    }
  } else {
    // User is logged in, update page content
    updateUserInfo();
  }
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  
  // Hide previous messages
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
  
  // Validate input
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  // Attempt login
  const result = login(email, password);
  
  if (result.success) {
    showSuccess('Login successful! Redirecting to dashboard...');
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.location.href = 'dashboard_mis.html';
    }, 1500);
  } else {
    showError(result.message);
  }
}

// Show error message
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  } else {
    alert(message);
  }
}

// Show success message
function showSuccess(message) {
  const successMessage = document.getElementById('successMessage');
  if (successMessage) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
  } else {
    alert(message);
  }
}

// Handle password reset
function handlePasswordReset(event) {
  event.preventDefault();
  
  const email = document.querySelector('input[name="email"]').value;
  
  if (!email) {
    alert('Please enter your email address');
    return;
  }
  
  // Check if email exists in our system
  const user = validUsers.find(u => u.email === email);
  
  if (user) {
    alert('Password reset link has been sent to your email address.');
    window.location.href = 'login_mis.html';
  } else {
    alert('Email address not found in our system.');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initAuth();
  
  // Set up login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Set up password reset form handler
  const resetForm = document.querySelector('form[action="#"]');
  if (resetForm) {
    resetForm.addEventListener('submit', handlePasswordReset);
  }
  
  // Set up logout button
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}); 