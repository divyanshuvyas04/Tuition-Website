// Carousel functionality
class Carousel {
    constructor(element) {
        this.carousel = element;
        this.items = this.carousel.querySelectorAll('.carousel-item');
        this.currentIndex = 0;
        this.totalItems = this.items.length;
        
        // Create controls
        this.createControls();
        
        // Start auto-rotation
        this.startAutoRotation();
    }
    
    createControls() {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-control carousel-prev';
        prevBtn.innerHTML = '❮';
        prevBtn.onclick = () => this.prev();
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-control carousel-next';
        nextBtn.innerHTML = '❯';
        nextBtn.onclick = () => this.next();
        
        this.carousel.appendChild(prevBtn);
        this.carousel.appendChild(nextBtn);
    }
    
    startAutoRotation() {
        setInterval(() => this.next(), 5000);
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalItems;
        this.updateCarousel();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
        this.updateCarousel();
    }
    
    updateCarousel() {
        const offset = -this.currentIndex * 100;
        this.carousel.querySelector('.carousel-inner').style.transform = `translateX(${offset}%)`;
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        new Carousel(carousel);
    }
    
    // Initialize registration form
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
    
    // Initialize results form
    const resultsForm = document.getElementById('resultsForm');
    if (resultsForm) {
        resultsForm.addEventListener('submit', handleResults);
    }

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');

    if (hamburger && navLinks && overlay) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        overlay.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
});

// Handle registration form submission
async function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showMessage('Registration successful!', 'success');
            e.target.reset();
            document.getElementById('photoPreview').innerHTML = '';
        } else {
            const data = await response.json();
            showMessage(data.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

// Handle results form submission
async function handleResults(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Results posted successfully!', 'success');
            e.target.reset();
            loadResults(); // Reload results display
        } else {
            showMessage('Failed to post results. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('An error occurred. Please try again.', 'error');
    }
}

// Load and display results
async function loadResults() {
    try {
        const response = await fetch('/api/results');
        const results = await response.json();
        
        const resultsContainer = document.querySelector('.results-grid');
        if (resultsContainer) {
            resultsContainer.innerHTML = results.map(result => `
                <div class="result-card">
                    <img src="${result.imageUrl}" alt="${result.title}">
                    <h3>${result.title}</h3>
                    <p>${result.description}</p>
                    <p class="date">Posted on: ${new Date(result.date).toLocaleDateString()}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
} 