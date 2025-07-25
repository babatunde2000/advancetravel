// AdvanceTravels - Main JavaScript File

class AdvanceTravels {
  constructor() {
    this.heroSlideIndex = 0;
    this.heroSlides = [
      'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
    ];
    this.countryPricing = {
      'Canada': { registration: 800, afterVisa: 3500 },
      'Australia': { registration: 950, afterVisa: 4500 },
      'Germany': { registration: 600, afterVisa: 3500 },
      'United Kingdom': { registration: 500, afterVisa: 3200 },
      'New Zealand': { registration: 950, afterVisa: 4500 },
      'United States': { registration: 1200, afterVisa: 5000 },
      'Denmark': { registration: 700, afterVisa: 3800 },
      'Sweden': { registration: 700, afterVisa: 3800 }
    };
    this.init();
  }

  init() {
    this.setupPreloader();
    this.setupHeroSlideshow();
    this.setupScrollEffects();
    this.setupNavigation();
    this.setupForms();
    this.setupTestimonials();
    this.setupModals();
    this.setupAnimations();
    this.setupNotifications();
    this.setupCounters();
    this.setupCountryCards();
    this.setupUpdatesCarousel();
    this.setupLogoutConfirmation();
  }

  // Preloader
  setupPreloader() {
    window.addEventListener('load', () => {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        setTimeout(() => {
          preloader.style.opacity = '0';
          setTimeout(() => {
            preloader.style.display = 'none';
          }, 500);
        }, 1000);
      }
    });
  }

  // Hero Slideshow
  setupHeroSlideshow() {
    const heroBackground = document.querySelector('.hero-slideshow');
    if (!heroBackground) return;

    // Create slides
    this.heroSlides.forEach((image, index) => {
      const slide = document.createElement('div');
      slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
      slide.style.backgroundImage = `url(${image})`;
      heroBackground.appendChild(slide);
    });

    // Auto-advance slides
    setInterval(() => {
      this.nextHeroSlide();
    }, 5000);
  }

  nextHeroSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    slides[this.heroSlideIndex].classList.remove('active');
    this.heroSlideIndex = (this.heroSlideIndex + 1) % slides.length;
    slides[this.heroSlideIndex].classList.add('active');
  }

  // Scroll Effects
  setupScrollEffects() {
    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });

    // Scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallax = document.querySelector('.hero-particles');
      if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    });
  }

  // Navigation
  setupNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navToggle?.addEventListener('click', () => {
      navMenu?.classList.toggle('active');
      navToggle.classList.toggle('active');
    });

    // Close menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu?.classList.remove('active');
        navToggle?.classList.remove('active');
      });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Forms
  setupForms() {
    // Main application form
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
      applicationForm.addEventListener('submit', this.handleApplicationSubmit.bind(this));
    }

    // Extended registration form
    const extendedForm = document.getElementById('extendedRegistrationForm');
    if (extendedForm) {
      extendedForm.addEventListener('submit', this.handleExtendedFormSubmit.bind(this));
    }

    // Login modal form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
    }

    // File upload handling
    document.querySelectorAll('input[type="file"]').forEach(input => {
      input.addEventListener('change', this.handleFileUpload.bind(this));
    });

    // Profile picture upload
    const profilePictureInput = document.getElementById('profilePicture');
    if (profilePictureInput) {
      profilePictureInput.addEventListener('change', this.handleProfilePictureUpload.bind(this));
    }

    // Form validation
    document.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', this.validateField.bind(this));
    });
  }

  async handleApplicationSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    this.setLoadingState(submitBtn, true);
    
    try {
      const response = await fetch('/apply', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showNotification(result.message, 'success');
        // Store selected country for pricing
        const selectedCountry = formData.get('preferredCountry');
        if (selectedCountry) {
          localStorage.setItem('selectedCountry', selectedCountry);
        }
        
        setTimeout(() => {
          window.location.href = '/extended-registration';
        }, 1500);
      } else {
        this.showNotification(result.message || 'Something went wrong', 'error');
        if (result.errors) {
          this.displayFormErrors(form, result.errors);
        }
      }
    } catch (error) {
      console.error('Application submission error:', error);
      this.showNotification('Network error. Please try again.', 'error');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  async handleExtendedFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    this.setLoadingState(submitBtn, true);
    
    try {
      const response = await fetch('/complete-registration', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showNotification('Registration completed successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        this.showNotification(result.message || 'Something went wrong', 'error');
        if (result.errors) {
          this.displayFormErrors(form, result.errors);
        }
      }
    } catch (error) {
      console.error('Extended form submission error:', error);
      this.showNotification('Network error. Please try again.', 'error');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    this.setLoadingState(submitBtn, true);
    
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showNotification('Login successful!', 'success');
        this.closeModal('loginModal');
        if (result.redirect) {
          setTimeout(() => {
            window.location.href = result.redirect;
          }, 1000);
        }
      } else {
        this.showNotification(result.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showNotification('Network error. Please try again.', 'error');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  handleFileUpload(e) {
    const file = e.target.files[0];
    const label = e.target.closest('.file-upload')?.querySelector('.file-text');
    
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (file.size > maxSize) {
        this.showNotification('File size must be less than 5MB', 'error');
        e.target.value = '';
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        this.showNotification('Please upload PDF or DOC files only', 'error');
        e.target.value = '';
        return;
      }
      
      if (label) {
        label.textContent = file.name;
      }
    }
  }

  handleProfilePictureUpload(e) {
    const file = e.target.files[0];
    const preview = document.querySelector('.profile-preview');
    
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      
      if (file.size > maxSize) {
        this.showNotification('Image size must be less than 2MB', 'error');
        e.target.value = '';
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        this.showNotification('Please upload JPG or PNG images only', 'error');
        e.target.value = '';
        return;
      }
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
      };
      reader.readAsDataURL(file);
    }
  }

  validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    // Remove existing error styling
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Validation rules
    if (field.required && !value) {
      isValid = false;
      message = 'This field is required';
    } else if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
    } else if (field.type === 'tel' && value) {
      const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        message = 'Please enter a valid phone number';
      }
    } else if (field.type === 'password' && value) {
      if (value.length < 6) {
        isValid = false;
        message = 'Password must be at least 6 characters';
      }
    }

    if (!isValid) {
      field.classList.add('error');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      errorDiv.style.color = 'var(--error-color)';
      errorDiv.style.fontSize = '0.9rem';
      errorDiv.style.marginTop = '0.5rem';
      field.parentNode.appendChild(errorDiv);
    }

    return isValid;
  }

  displayFormErrors(form, errors) {
    errors.forEach(error => {
      const field = form.querySelector(`[name="${error.param}"]`);
      if (field) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = error.msg;
        errorDiv.style.color = 'var(--error-color)';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '0.5rem';
        field.parentNode.appendChild(errorDiv);
      }
    });
  }

  setLoadingState(button, loading) {
    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      button.innerHTML = '<div class="spinner"></div> Loading...';
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      // Restore original button text - you might want to store this
      if (button.id === 'applicationForm') {
        button.innerHTML = '<span>Get Started Now</span><span class="btn-arrow">→</span>';
      } else {
        button.innerHTML = button.getAttribute('data-original-text') || 'Submit';
      }
    }
  }

  // Country Cards
  setupCountryCards() {
    const countryCards = document.querySelectorAll('.country-card');
    
    countryCards.forEach(card => {
      // Auto-flip after 3 seconds
      setTimeout(() => {
        card.classList.add('auto-flip');
      }, 3000);
      
      // Reset on mouse leave
      card.addEventListener('mouseleave', () => {
        setTimeout(() => {
          card.classList.remove('auto-flip');
        }, 1000);
      });
    });
  }

  // Updates Carousel
  setupUpdatesCarousel() {
    const track = document.getElementById('updatesTrack');
    const prevBtn = document.getElementById('prevUpdate');
    const nextBtn = document.getElementById('nextUpdate');
    
    if (!track) return;
    
    const cards = track.querySelectorAll('.update-card');
    let currentIndex = 0;
    
    const updateCarousel = () => {
      const cardWidth = cards[0]?.offsetWidth + 32 || 350; // card width + margin
      const translateX = -currentIndex * cardWidth;
      track.style.transform = `translateX(${translateX}px)`;
    };
    
    nextBtn?.addEventListener('click', () => {
      if (currentIndex < cards.length - 1) {
        currentIndex++;
        updateCarousel();
      }
    });
    
    prevBtn?.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });
    
    // Auto-advance
    setInterval(() => {
      currentIndex = (currentIndex + 1) % cards.length;
      updateCarousel();
    }, 6000);
  }

  // Logout Confirmation
  setupLogoutConfirmation() {
    window.logout = () => {
      this.openModal('logoutModal');
    };
    
    const confirmBtn = document.getElementById('confirmLogout');
    const cancelBtn = document.getElementById('cancelLogout');
    
    confirmBtn?.addEventListener('click', async () => {
      try {
        const response = await fetch('/auth/logout', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
          this.showNotification('Logged out successfully', 'success');
          this.closeModal('logoutModal');
          setTimeout(() => {
            window.location.href = result.redirect;
          }, 1000);
        }
      } catch (error) {
        console.error('Logout error:', error);
        this.showNotification('Logout failed', 'error');
      }
    });
    
    cancelBtn?.addEventListener('click', () => {
      this.closeModal('logoutModal');
    });
  }

  // Testimonials
  setupTestimonials() {
    const track = document.getElementById('testimonialTrack');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    
    if (!track) return;
    
    const cards = track.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    
    const updateSlider = () => {
      const translateX = -currentIndex * 100;
      track.style.transform = `translateX(${translateX}%)`;
    };
    
    nextBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % cards.length;
      updateSlider();
    });
    
    prevBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      updateSlider();
    });
    
    // Auto-play testimonials
    setInterval(() => {
      currentIndex = (currentIndex + 1) % cards.length;
      updateSlider();
    }, 5000);
  }

  // Modals
  setupModals() {
    // Open modal function
    window.openLoginModal = () => {
      this.openModal('loginModal');
    };

    // Payment modal
    window.openPaymentModal = () => {
      this.openModal('paymentModal');
    };

    // Close modal when clicking close button or outside
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        this.closeModal(modal.id);
      });
    });

    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
          if (modal.style.display === 'flex') {
            this.closeModal(modal.id);
          }
        });
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      modal.querySelector('.modal-content')?.classList.add('modal-enter');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      const content = modal.querySelector('.modal-content');
      content?.classList.add('modal-exit');
      setTimeout(() => {
        modal.style.display = 'none';
        content?.classList.remove('modal-enter', 'modal-exit');
        document.body.style.overflow = '';
      }, 300);
    }
  }

  // Animations
  setupAnimations() {
    // Add animation classes to elements
    document.querySelectorAll('.country-card').forEach((card, index) => {
      card.classList.add('animate-on-scroll', `delay-${(index % 4) + 1}`);
    });

    document.querySelectorAll('.feature-card').forEach((card, index) => {
      card.classList.add('animate-on-scroll', `delay-${(index % 3) + 1}`);
    });

    document.querySelectorAll('.process-step').forEach((step, index) => {
      step.classList.add('animate-on-scroll', `delay-${index + 1}`);
    });

    // Hover effects
    document.querySelectorAll('.hover-lift').forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.transform = 'translateY(-8px)';
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0)';
      });
    });

    // Button ripple effect
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // Notifications
  setupNotifications() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      `;
      document.body.appendChild(container);
    }
  }

  showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      padding: 1rem 2rem;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    `;
    
    // Set background color based on type
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4'
    };
    notification.style.background = colors[type] || colors.info;
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    });
  }

  // Counters
  setupCounters() {
    const counters = document.querySelectorAll('.stat-item h3, .stat-info h3');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });

    counters.forEach(counter => {
      observer.observe(counter);
    });
  }

  animateCounter(element) {
    const text = element.textContent;
    const numbers = text.match(/\d+/g);
    
    if (numbers) {
      const finalNumber = parseInt(numbers[0]);
      const duration = 2000;
      const steps = 60;
      const increment = finalNumber / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= finalNumber) {
          current = finalNumber;
          clearInterval(timer);
        }
        
        element.textContent = text.replace(/\d+/, Math.floor(current).toLocaleString());
      }, duration / steps);
    }
  }

  // Dashboard Pricing
  setupDashboardPricing() {
    const selectedCountry = localStorage.getItem('selectedCountry');
    if (!selectedCountry || !this.countryPricing[selectedCountry]) return;

    const pricing = this.countryPricing[selectedCountry];
    const pricingCard = document.querySelector('.pricing-card');
    
    if (pricingCard) {
      const countryName = pricingCard.querySelector('.pricing-country');
      const registrationFee = pricingCard.querySelector('.registration-fee');
      const afterVisaFee = pricingCard.querySelector('.after-visa-fee');
      
      if (countryName) countryName.textContent = selectedCountry;
      if (registrationFee) registrationFee.textContent = `$${pricing.registration}`;
      if (afterVisaFee) afterVisaFee.textContent = `$${pricing.afterVisa}`;
    }
  }

  // Utility functions
  static formatNumber(num) {
    return num.toLocaleString();
  }

  static formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }
}

// Global utility functions
window.showNotification = (message, type, duration) => {
  if (window.advanceTravels) {
    window.advanceTravels.showNotification(message, type, duration);
  }
};

// Payment notification function
window.notifyPayment = () => {
  window.showNotification('Payment notification sent successfully!', 'success');
  document.getElementById('paymentModal').style.display = 'none';
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.advanceTravels = new AdvanceTravels();
  
  // Setup dashboard pricing if on dashboard page
  if (window.location.pathname.includes('/dashboard')) {
    window.advanceTravels.setupDashboardPricing();
  }
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .error {
    border-color: var(--error-color) !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }
`;
document.head.appendChild(style);