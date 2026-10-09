/* 
 * Heirloom Review - Main Scripts 
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Logic
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu-drawer');
  const overlay = document.querySelector('.mobile-menu-overlay');
  const closeBtn = document.querySelector('.close-menu');
  
  const toggleMenu = () => {
    mobileMenu.classList.toggle('open');
    overlay.classList.toggle('open');
    const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
    hamburger.setAttribute('aria-expanded', !expanded);
  };

  if (hamburger) hamburger.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', toggleMenu);
  if (closeBtn) closeBtn.addEventListener('click', toggleMenu);

  // Mobile Dropdown Accordion
  const mobileToggles = document.querySelectorAll('.mobile-dropdown-toggle');
  mobileToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const targetId = e.currentTarget.getAttribute('aria-controls');
      const targetMenu = document.getElementById(targetId);
      if (targetMenu) {
        targetMenu.classList.toggle('open');
        const expanded = e.currentTarget.getAttribute('aria-expanded') === 'true' || false;
        e.currentTarget.setAttribute('aria-expanded', !expanded);
      }
    });
  });

  // Active state for Nav Links
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
  document.querySelectorAll('.mobile-nav-links > li > a:not(.btn)').forEach(link => {
    if (link.getAttribute('href') === currentPath) link.classList.add('active');
  });
  document.querySelectorAll('.mobile-dropdown-toggle').forEach(toggle => {
    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
    if (menu && [...menu.querySelectorAll('a')].some(a => a.getAttribute('href').split(/[?#]/)[0] === currentPath)) {
      toggle.classList.add('active');
    }
  });

  // Sticky Header on scroll
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in-view'));
  }

  // Affiliate Click Tracking
  document.addEventListener('click', (e) => {
    const affiliateBtn = e.target.closest('[data-affiliate="true"]');
    if (affiliateBtn) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'affiliate_click',
        productId: affiliateBtn.dataset.productId,
        merchant: affiliateBtn.dataset.merchant,
        placement: affiliateBtn.dataset.placement
      });
    }
  });

  // Global Modal Close
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  modalOverlays.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    const closeModalsBtn = modal.querySelectorAll('.modal-close');
    closeModalsBtn.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  });
  
  // Close Modal on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // Back to Top Button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.id = 'back-to-top';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.innerHTML = '<i class="ph ph-caret-up"></i>';
  document.body.appendChild(backToTopBtn);

  const toggleBackToTop = () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
