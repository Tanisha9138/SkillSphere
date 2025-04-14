// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', function() {
        mainNav.style.display = mainNav.style.display === 'block' ? 'none' : 'block';
      });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && mainNav) {
        mainNav.style.display = '';
      }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href !== '#') {
          e.preventDefault();
          
          document.querySelector(href).scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  });
  