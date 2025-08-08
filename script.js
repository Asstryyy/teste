// JavaScript otimizado para mobile - Checklist ENEM 2025

// Configurações globais
const CONFIG = {
  TIMER_DURATION: 16 * 3600 + 59 * 60 + 59, // 16:59:59
  TESTIMONIAL_INTERVAL: 5000, // 5 segundos
  SCROLL_THRESHOLD: 300,
  PAYMENT_URL: 'https://pay.kirvano.com/0684ceea-f311-42cb-8edf-c3fb72cc6178'};

// Estado da aplicação
const state = {
  currentTestimonial: 0,
  timerSeconds: CONFIG.TIMER_DURATION,
  isScrolled: false
};

// Utilitários
const utils = {
  // Formatar número com zero à esquerda
  padZero: (num) => num.toString().padStart(2, '0'),
  
  // Debounce para otimizar performance
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Verificar se é dispositivo móvel
  isMobile: () => window.innerWidth <= 768,
  
  // Scroll suave
  smoothScrollTo: (element) => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// Timer countdown otimizado
const timer = {
  elements: null,
  interval: null,
  
  init() {
    this.elements = {
      hours: document.getElementById('hours'),
      minutes: document.getElementById('minutes'),
      seconds: document.getElementById('seconds')
    };
    
    // Verificar se os elementos existem
    if (!this.elements.hours || !this.elements.minutes || !this.elements.seconds) {
      console.warn('Timer elements not found');
      return;
    }
    
    this.start();
  },
  
  start() {
    this.update();
    this.interval = setInterval(() => this.update(), 1000);
  },
  
  update() {
    const hours = Math.floor(state.timerSeconds / 3600);
    const minutes = Math.floor((state.timerSeconds % 3600) / 60);
    const seconds = state.timerSeconds % 60;
    
    if (this.elements.hours) this.elements.hours.textContent = utils.padZero(hours);
    if (this.elements.minutes) this.elements.minutes.textContent = utils.padZero(minutes);
    if (this.elements.seconds) this.elements.seconds.textContent = utils.padZero(seconds);
    
    if (state.timerSeconds > 0) {
      state.timerSeconds--;
    } else {
      // Reset timer quando chegar a zero
      state.timerSeconds = CONFIG.TIMER_DURATION;
    }
  },
  
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
};

// Slider de depoimentos
const testimonials = {
  elements: null,
  interval: null,
  
  init() {
    this.elements = {
      testimonials: document.querySelectorAll('.testimonial'),
      dots: document.querySelectorAll('.dot')
    };
    
    if (this.elements.testimonials.length === 0) {
      return;
    }
    
    this.bindEvents();
    this.start();
  },
  
  bindEvents() {
    // Clique nos dots
    this.elements.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Touch/swipe para mobile (simplificado)
    let startX = 0;
    let endX = 0;
    
    const slider = document.querySelector('.testimonial-slider');
    if (slider) {
      slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      }, { passive: true });
      
      slider.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        this.handleSwipe();
      }, { passive: true });
    }
  },
  
  handleSwipe() {
    const threshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  },
  
  goToSlide(index) {
    // Remover classe active de todos
    this.elements.testimonials.forEach(t => t.classList.remove('active'));
    this.elements.dots.forEach(d => d.classList.remove('active'));
    
    // Adicionar classe active ao atual
    if (this.elements.testimonials[index]) {
      this.elements.testimonials[index].classList.add('active');
    }
    if (this.elements.dots[index]) {
      this.elements.dots[index].classList.add('active');
    }
    
    state.currentTestimonial = index;
  },
  
  next() {
    const nextIndex = (state.currentTestimonial + 1) % this.elements.testimonials.length;
    this.goToSlide(nextIndex);
  },
  
  prev() {
    const prevIndex = state.currentTestimonial === 0 
      ? this.elements.testimonials.length - 1 
      : state.currentTestimonial - 1;
    this.goToSlide(prevIndex);
  },
  
  start() {
    this.interval = setInterval(() => this.next(), CONFIG.TESTIMONIAL_INTERVAL);
  },
  
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
};

// FAQ accordion
const faq = {
  init() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
      question.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle(question.parentElement);
      });
    });
  },
  
  toggle(faqItem) {
    const isActive = faqItem.classList.contains('active');
    
    // Fechar todos os outros
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
      const question = item.querySelector('.faq-question');
      if (question) {
        question.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Abrir o clicado se não estava ativo
    if (!isActive) {
      faqItem.classList.add('active');
      const question = faqItem.querySelector('.faq-question');
      if (question) {
        question.setAttribute('aria-expanded', 'true');
      }
    }
  }
};

// Back to top button
const backToTop = {
  button: null,
  
  init() {
    this.button = document.getElementById('backToTop');
    if (!this.button) return;
    
    this.bindEvents();
    this.handleScroll(); // Check initial state
  },
  
  bindEvents() {
    // Scroll event com debounce
    window.addEventListener('scroll', utils.debounce(() => this.handleScroll(), 100), { passive: true });
    
    // Click event
    this.button.addEventListener('click', () => this.scrollToTop());
  },
  
  handleScroll() {
    const shouldShow = window.pageYOffset > CONFIG.SCROLL_THRESHOLD;
    
    if (shouldShow !== state.isScrolled) {
      state.isScrolled = shouldShow;
      this.button.classList.toggle('visible', shouldShow);
    }
  },
  
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

// Sistema de compra
const purchase = {
  init() {
    // Botões de compra
    const buyButtons = [
      'btnBuyHero',
      'btnBuyMain', 
      'btnSticky'
    ];
    
    buyButtons.forEach(id => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', () => this.handlePurchase());
      }
    });
  },
  
  handlePurchase() {
    // Analytics tracking
    this.trackEvent('purchase_attempt', {
      product: 'checklist_enem_2025',
      value: 29.90,
      currency: 'BRL',
      source: 'landing_page'
    });
    
    // Redirecionar para pagamento
    this.redirectToPayment();
  },
  
  redirectToPayment() {
    window.open(CONFIG.PAYMENT_URL, '_blank');
  },

  trackEvent(eventName, parameters = {}) {
    // Console log para debug
    console.log('Event tracked:', eventName, parameters);
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', eventName, parameters);
    }
    
    // Outras plataformas de analytics podem ser adicionadas aqui
  }
};

// Animações de scroll
const scrollAnimations = {
  observer: null,
  
  init() {
    // Verificar suporte ao Intersection Observer
    if (!('IntersectionObserver' in window)) {
      return;
    }
    
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Parar de observar após animar
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
    
    // Observar elementos
    const elementsToAnimate = document.querySelectorAll(
      '.solution-item, .benefit-card, .bonus-item, .testimonial'
    );
    
    elementsToAnimate.forEach(el => {
      this.observer.observe(el);
    });
  },
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
};

// Notificações de compra (simplificadas)
const notifications = {
  notifications: [
    { name: 'João', location: 'São Paulo', time: '2 min' },
    { name: 'Maria', location: 'Rio de Janeiro', time: '5 min' },
    { name: 'Pedro', location: 'Belo Horizonte', time: '8 min' },
    { name: 'Ana', location: 'Brasília', time: '12 min' },
    { name: 'Carlos', location: 'Salvador', time: '15 min' },
    { name: 'Larissa', location: 'Curitiba', time: '3 min' },
    { name: 'Bruno', location: 'Fortaleza', time: '6 min' },
    { name: 'Fernanda', location: 'Recife', time: '9 min' },
    { name: 'Lucas', location: 'Porto Alegre', time: '11 min' },
    { name: 'Juliana', location: 'Manaus', time: '14 min' },
    { name: 'André', location: 'Belém', time: '17 min' },
    { name: 'Patrícia', location: 'Goiânia', time: '20 min' },
    { name: 'Eduardo', location: 'Vitória', time: '23 min' },
    { name: 'Camila', location: 'Florianópolis', time: '26 min' },
    { name: 'Rafael', location: 'Maceió', time: '30 min' }

  ],
  
  currentIndex: 0,
  interval: null,
  
  init() {
    // Só mostrar em desktop para não atrapalhar mobile
    if (utils.isMobile()) {
      return;
    }
    
    // Primeira notificação após 5 segundos
    setTimeout(() => this.show(), 5000);
    
    // Notificações subsequentes a cada 30 segundos
    this.interval = setInterval(() => this.show(), 30000);
  },
  
  show() {
    const notification = this.notifications[this.currentIndex];
    const element = this.createElement(notification);
    
    document.body.appendChild(element);
    
    // Animar entrada
    setTimeout(() => element.classList.add('show'), 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
      element.classList.remove('show');
      setTimeout(() => {
        if (element.parentNode) {
          document.body.removeChild(element);
        }
      }, 300);
    }, 4000);
    
    this.currentIndex = (this.currentIndex + 1) % this.notifications.length;
  },
  
  createElement(notification) {
    const element = document.createElement('div');
    element.className = 'purchase-notification';
    element.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">🎉</span>
        <div class="notification-text">
          <strong>${notification.name}</strong> de ${notification.location}<br>
          acabou de comprar!
        </div>
        <span class="notification-time">${notification.time}</span>
      </div>
    `;
    
    // Estilos inline para evitar conflitos
    element.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
      z-index: 9999;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      max-width: 280px;
      font-size: 14px;
      font-family: inherit;
      opacity: 0;
    `;
    
    // Adicionar classe para animação
    element.classList.add('purchase-notification');
    
    return element;
  },
  
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
};

// Gerenciador principal da aplicação
const app = {
  init() {
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  },
  
  start() {
    try {
      // Inicializar módulos
      timer.init();
      testimonials.init();
      faq.init();
      backToTop.init();
      purchase.init();
      scrollAnimations.init();
      notifications.init();
      
      // Eventos globais
      this.bindGlobalEvents();
      
      // Analytics
      this.trackPageView();
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  },
  
  bindGlobalEvents() {
    // Fechar modais com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Fechar qualquer modal aberto
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => modal.classList.remove('show'));
      }
    });
    
    // Tracking de scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', utils.debounce(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll && scrollPercent <= 100) {
        maxScroll = scrollPercent;
        
        // Track a cada 25%
        if (maxScroll % 25 === 0) {
          purchase.trackEvent('scroll_depth', { 
            depth: maxScroll,
            page: 'landing_page'
          });
        }
      }
    }, 500), { passive: true });
    
    // Tracking de tempo na página
    let timeOnPage = 0;
    const timeInterval = setInterval(() => {
      timeOnPage += 10;
      
      // Track a cada 30 segundos
      if (timeOnPage % 30 === 0) {
        purchase.trackEvent('time_on_page', {
          seconds: timeOnPage,
          page: 'landing_page'
        });
      }
    }, 10000);
    
    // Cleanup ao sair da página
    window.addEventListener('beforeunload', () => {
      clearInterval(timeInterval);
      this.destroy();
    });
  },
  
  trackPageView() {
    purchase.trackEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`
    });
  },
  
  destroy() {
    // Cleanup de todos os módulos
    timer.destroy();
    testimonials.destroy();
    scrollAnimations.destroy();
    notifications.destroy();
  }
};

// CSS adicional para notificações (injetado via JS)
const notificationStyles = `
  .purchase-notification.show {
    transform: translateX(0) !important;
    opacity: 1 !important;
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
  
  .notification-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .notification-text {
    flex: 1;
    line-height: 1.3;
  }
  
  .notification-time {
    font-size: 12px;
    opacity: 0.8;
    flex-shrink: 0;
  }
`;

// Injetar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Inicializar aplicação
app.init();

// Expor API global para debug (apenas em desenvolvimento)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.checklistApp = {
    state,
    timer,
    testimonials,
    faq,
    backToTop,
    purchase,
    notifications,
    utils
  };
}



// Hero Image Slider
const heroImageSlider = {
  elements: null,
  interval: null,
  currentSlide: 0,

  init() {
    this.elements = {
      slides: document.querySelectorAll('.hero-image-item'),
      dots: document.querySelectorAll('.hero-image-dots .dot')
    };

    if (this.elements.slides.length === 0) {
      return;
    }

    this.bindEvents();
    this.start();
  },

  bindEvents() {
    this.elements.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
  },

  goToSlide(index) {
    this.elements.slides.forEach(slide => slide.classList.remove('active'));
    this.elements.dots.forEach(dot => dot.classList.remove('active'));

    this.elements.slides[index].classList.add('active');
    this.elements.dots[index].classList.add('active');

    this.currentSlide = index;
  },

  next() {
    const nextIndex = (this.currentSlide + 1) % this.elements.slides.length;
    this.goToSlide(nextIndex);
  },

  start() {
    this.interval = setInterval(() => this.next(), 5000); // 5 segundos, igual aos depoimentos
  },

  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
};

// Adicionar a inicialização do novo slider no objeto app
const originalAppStart = app.start;
app.start = function() {
  originalAppStart.apply(this, arguments);
  heroImageSlider.init();
};

