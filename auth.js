// Supabase configuration
const supabaseUrl = 'https://urvfhjjfysercfnjwrsz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydmZoampmeXNlcmNmbmp3cnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MjMzMDUsImV4cCI6MjA2MTI5OTMwNX0.h1L6l6Oc1SQ4dsQRNwCTyUeNa2yhPZDdInWDHq53rD0';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');

// Form validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Form switching
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('d-none');
    signupForm.classList.remove('d-none');
    // Reset forms when switching
    loginForm.reset();
    signupForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    // Reset forms when switching
    signupForm.reset();
    loginForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
});

// Login functionality
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm(loginForm)) return;
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        
        showNotification('Login successful!', 'success');
        // Store user session
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => window.location.href = 'scheme.html', 1500);
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Signup functionality
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm(signupForm)) return;
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;
    const userType = document.getElementById('userType').value;

    try {
        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    user_type: userType
                }
            }
        });

        if (error) throw error;
        
        // Create user profile in the database
        const { error: profileError } = await supabase
            .from('users')
            .insert([
                {
                    id: data.user.id,
                    name,
                    email,
                    user_type: userType,
                    created_at: new Date().toISOString()
                }
            ]);

        if (profileError) throw profileError;
        
        showNotification('Account created successfully! Please check your email for verification.', 'success');
        setTimeout(() => window.location.href = 'scheme.html', 3000);
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Notification functionality
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
        notification.remove();
    }, 3000);
}

// Check if user is already logged in
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        window.location.href = 'scheme.html';
    }
}

// Initialize
checkAuth();

// Set up real-time notifications
async function setupRealtimeNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Subscribe to global notifications
    const notificationsChannel = supabase
        .channel('global_notifications')
        .on('postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications'
            },
            (payload) => {
                showNotification(payload.new.message, 'info');
            }
        )
        .subscribe();

    // Subscribe to health updates
    const healthChannel = supabase
        .channel('health_updates')
        .on('postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'health_updates'
            },
            (payload) => {
                showNotification(`Health Update: ${payload.new.title}`, 'info');
            }
        )
        .subscribe();

    // Subscribe to agriculture updates
    const agricultureChannel = supabase
        .channel('agriculture_updates')
        .on('postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'agriculture_updates'
            },
            (payload) => {
                showNotification(`Agriculture Update: ${payload.new.title}`, 'info');
            }
        )
        .subscribe();
}

// Check auth state
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        setupRealtimeNotifications();
    }
}); 