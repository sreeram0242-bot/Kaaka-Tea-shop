/* ==========================================================================
   KAAKA TEA SHOP - Interactive Web Application Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    cart: [],
    customBrew: {
      base: { name: 'Assam Royal Karak', price: 4.50, color: '#8b4513' },
      milk: { name: 'Full Cream Milk', price: 0.50 },
      spice: { name: 'Cardamom & Saffron', price: 0.75 },
      sweetness: '75% Sweet',
      ice: 'Hot Steamed',
      toppings: []
    },
    timer: {
      interval: null,
      seconds: 180,
      totalSeconds: 180,
      isRunning: false
    },
    audioCtx: null
  };

  // Menu Database
  const menuItems = [
    {
      id: 'm1',
      name: 'Kaaka Signature Karak Chai',
      category: 'chais',
      price: 4.99,
      badge: 'Bestseller',
      image: 'assets/karak.png',
      desc: 'Slow-brewed Assam CTC tea infused with green cardamom, crushed ginger, saffron threads & rich evaporated milk.',
      temp: '95°C',
      time: '5 mins'
    },
    {
      id: 'm2',
      name: 'Royal Saffron Kulhad Chai',
      category: 'chais',
      price: 5.99,
      badge: 'Special',
      image: 'assets/hero.png',
      desc: 'Authentic spiced milk tea served in an earthen clay pot with pure Kashmiri saffron and crushed pistachios.',
      temp: '98°C',
      time: '6 mins'
    },
    {
      id: 'm3',
      name: 'Blooming Jasmine Dragon Pearls',
      category: 'green',
      price: 6.50,
      badge: 'Organic',
      image: 'assets/jasmine.png',
      desc: 'Hand-rolled silver needle green tea scented seven times with fresh jasmine blossoms that unfold elegantly in your glass.',
      temp: '80°C',
      time: '3 mins'
    },
    {
      id: 'm4',
      name: 'Iced Matcha Boba Latte',
      category: 'iced',
      price: 6.25,
      badge: 'Cold Brewed',
      image: 'assets/boba.png',
      desc: 'Ceremonial grade Uji matcha layered over cold oat milk and slow-cooked brown sugar tapioca pearls.',
      temp: 'Cold',
      time: 'Instant'
    },
    {
      id: 'm5',
      name: 'Hibiscus Ruby Berry Infusion',
      category: 'herbal',
      price: 5.49,
      badge: 'Caffeine Free',
      image: 'assets/jasmine.png',
      desc: 'Tangy Egyptian hibiscus petals, wild berries, lemongrass & dried mint leaves served over ice with citrus slices.',
      temp: 'Cold',
      time: '4 mins'
    },
    {
      id: 'm6',
      name: 'Artisanal Samosa & Chutney Platter',
      category: 'snacks',
      price: 7.99,
      badge: 'Chef Special',
      image: 'assets/snacks.png',
      desc: 'Crispy spiced potato & green pea triangles served with homemade mint coriander green chutney & tangy tamarind dip.',
      temp: 'Hot',
      time: 'Fresh'
    },
    {
      id: 'm7',
      name: 'Cardamom Pistachio Shortbread',
      category: 'snacks',
      price: 4.50,
      badge: 'Freshly Baked',
      image: 'assets/snacks.png',
      desc: 'Melt-in-your-mouth butter shortbread cookies infused with freshly ground green cardamom and Iranian pistachios.',
      temp: 'Room',
      time: 'Bakery'
    },
    {
      id: 'm8',
      name: 'High-Mountain Silver Needle White Tea',
      category: 'green',
      price: 7.50,
      badge: 'Rare Harvest',
      image: 'assets/jasmine.png',
      desc: 'Delicate unopened spring tea buds harvested from Fujian. Smooth, naturally sweet, with subtle melon notes.',
      temp: '75°C',
      time: '2 mins'
    }
  ];

  // 1. Navigation & Theme Toggle
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const icon = themeBtn.querySelector('i');
      if (document.body.classList.contains('light-theme')) {
        icon.className = 'fas fa-moon';
        showToast('Switched to Light Theme');
      } else {
        icon.className = 'fas fa-sun';
        showToast('Switched to Dark Tea Lounge Theme');
      }
    });
  }

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'var(--bg-dark)';
        navLinks.style.padding = '1.5rem';
        navLinks.style.boxShadow = 'var(--shadow-md)';
      }
    });
  }

  // 2. Render Menu Items
  const menuGrid = document.getElementById('menu-grid');
  const menuSearch = document.getElementById('menu-search-input');
  const categoryBtns = document.querySelectorAll('.cat-btn');

  function renderMenu(filterCat = 'all', searchQuery = '') {
    if (!menuGrid) return;
    menuGrid.innerHTML = '';

    const filtered = menuItems.filter(item => {
      const matchesCat = filterCat === 'all' || item.category === filterCat;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      menuGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No teas found matching your search.</p>`;
      return;
    }

    filtered.forEach(item => {
      const cartItem = state.cart.find(c => c.id === item.id);
      const inCartQty = cartItem ? cartItem.qty : 0;

      const card = document.createElement('div');
      card.className = 'menu-card';
      card.innerHTML = `
        <div class="menu-card-img">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="menu-card-badge">${item.badge}</span>
          ${inCartQty > 0 ? `<span class="menu-card-qty-tag"><i class="fas fa-shopping-bag"></i> ${inCartQty} in Basket</span>` : ''}
        </div>
        <div class="menu-card-body">
          <div class="menu-card-header">
            <h3 class="menu-card-title">${item.name}</h3>
            <span class="menu-card-price">$${item.price.toFixed(2)}</span>
          </div>
          <p class="menu-card-desc">${item.desc}</p>
          <div class="menu-card-footer">
            <span class="steeping-info"><i class="fas fa-thermometer-half"></i> ${item.temp} | <i class="fas fa-clock"></i> ${item.time}</span>
            ${inCartQty > 0 ? `
              <div class="card-qty-ctrl">
                <button class="card-qty-btn card-minus-btn" data-id="${item.id}" title="Decrease Quantity">-</button>
                <span class="card-qty-val">${inCartQty}</span>
                <button class="card-qty-btn card-plus-btn" data-id="${item.id}" title="Increase Quantity">+</button>
              </div>
            ` : `
              <button class="btn btn-primary btn-sm add-cart-btn" data-id="${item.id}">
                <i class="fas fa-plus"></i> Add
              </button>
            `}
          </div>
        </div>
      `;
      menuGrid.appendChild(card);
    });

    // Attach Add to Cart Listeners
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-id');
        addToCart(itemId);
      });
    });

    // Attach Card Quantity Plus/Minus Listeners
    document.querySelectorAll('.card-plus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-id');
        addToCart(itemId);
      });
    });

    document.querySelectorAll('.card-minus-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-id');
        const cartItem = state.cart.find(c => c.id === itemId);
        if (cartItem) {
          if (cartItem.qty > 1) {
            cartItem.qty -= 1;
          } else {
            state.cart = state.cart.filter(c => c.id !== itemId);
          }
          updateCartUI();
        }
      });
    });
  }

  renderMenu();

  // Search & Filter Event Handlers
  if (menuSearch) {
    menuSearch.addEventListener('input', (e) => {
      const activeCat = document.querySelector('.cat-btn.active')?.getAttribute('data-cat') || 'all';
      renderMenu(activeCat, e.target.value);
    });
  }

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      const query = menuSearch ? menuSearch.value : '';
      renderMenu(cat, query);
    });
  });

  // 3. Cart Drawer Management
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartBtn = document.getElementById('cart-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartBadge = document.getElementById('cart-badge');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const checkoutTriggerBtn = document.getElementById('checkout-trigger-btn');

  function openCart() {
    cartDrawerOverlay.classList.add('active');
  }

  function closeCart() {
    cartDrawerOverlay.classList.remove('active');
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === cartDrawerOverlay) closeCart();
    });
  }

  function addToCart(itemId, customItemData = null) {
    let targetItem = null;
    if (customItemData) {
      targetItem = customItemData;
    } else {
      targetItem = menuItems.find(m => m.id === itemId);
    }

    if (!targetItem) return;

    const existing = state.cart.find(c => c.id === targetItem.id);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        ...targetItem,
        qty: 1
      });
    }

    updateCartUI();
    showToast(`Added ${targetItem.name} to cart!`);
  }

  function updateCartUI() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 3rem;">Your tea basket is empty.</p>`;
    } else {
      state.cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        itemCount += item.qty;

        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
          <img src="${item.image || 'assets/karak.png'}" class="cart-item-img" alt="${item.name}">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-qty-ctrl">
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-right: 0.3rem;">Qty:</span>
              <button class="cart-qty-btn qty-minus" data-id="${item.id}">-</button>
              <span style="font-weight: 800; color: var(--primary); min-width: 18px; text-align: center;">${item.qty}</span>
              <button class="cart-qty-btn qty-plus" data-id="${item.id}">+</button>
            </div>
          </div>
          <button class="btn-icon remove-item-btn" data-id="${item.id}" style="color: var(--accent-amber);" title="Remove Item">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        cartItemsContainer.appendChild(cartItemEl);
      });
    }

    if (cartBadge) cartBadge.textContent = itemCount;
    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${total.toFixed(2)}`;

    // Sync menu cards to reflect current quantity badges & controls
    const activeCat = document.querySelector('.cat-btn.active')?.getAttribute('data-cat') || 'all';
    const query = menuSearch ? menuSearch.value : '';
    renderMenu(activeCat, query);

    // Attach listeners inside cart
    document.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = state.cart.find(c => c.id === id);
        if (item) {
          if (item.qty > 1) {
            item.qty -= 1;
          } else {
            state.cart = state.cart.filter(c => c.id !== id);
          }
          updateCartUI();
        }
      });
    });

    document.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = state.cart.find(c => c.id === id);
        if (item) {
          item.qty += 1;
          updateCartUI();
        }
      });
    });

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        state.cart = state.cart.filter(c => c.id !== id);
        updateCartUI();
      });
    });
  }

  // 4. Custom Tea Builder
  const baseOpts = document.querySelectorAll('.opt-base');
  const milkOpts = document.querySelectorAll('.opt-milk');
  const spiceOpts = document.querySelectorAll('.opt-spice');
  const toppingOpts = document.querySelectorAll('.opt-topping');

  const brewPriceEl = document.getElementById('builder-price-val');
  const brewBaseSummary = document.getElementById('summary-base');
  const brewMilkSummary = document.getElementById('summary-milk');
  const brewSpiceSummary = document.getElementById('summary-spice');
  const brewToppingSummary = document.getElementById('summary-toppings');
  const cupLiquid = document.getElementById('cup-liquid');
  const addCustomBrewBtn = document.getElementById('add-custom-brew-btn');

  function updateBrewSummary() {
    let totalPrice = state.customBrew.base.price + state.customBrew.milk.price + state.customBrew.spice.price;
    let toppingsPrice = 0;
    
    state.customBrew.toppings.forEach(t => toppingsPrice += t.price);
    totalPrice += toppingsPrice;

    if (brewPriceEl) brewPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
    if (brewBaseSummary) brewBaseSummary.textContent = state.customBrew.base.name;
    if (brewMilkSummary) brewMilkSummary.textContent = state.customBrew.milk.name;
    if (brewSpiceSummary) brewSpiceSummary.textContent = state.customBrew.spice.name;
    if (brewToppingSummary) {
      brewToppingSummary.textContent = state.customBrew.toppings.length > 0 
        ? state.customBrew.toppings.map(t => t.name).join(', ')
        : 'None';
    }

    if (cupLiquid) {
      cupLiquid.style.background = `linear-gradient(180deg, ${state.customBrew.base.color} 0%, #3e1f06 100%)`;
    }
  }

  baseOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      baseOpts.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.customBrew.base = {
        name: opt.getAttribute('data-name'),
        price: parseFloat(opt.getAttribute('data-price')),
        color: opt.getAttribute('data-color')
      };
      updateBrewSummary();
    });
  });

  milkOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      milkOpts.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.customBrew.milk = {
        name: opt.getAttribute('data-name'),
        price: parseFloat(opt.getAttribute('data-price'))
      };
      updateBrewSummary();
    });
  });

  spiceOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      spiceOpts.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.customBrew.spice = {
        name: opt.getAttribute('data-name'),
        price: parseFloat(opt.getAttribute('data-price'))
      };
      updateBrewSummary();
    });
  });

  toppingOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      opt.classList.toggle('selected');
      const name = opt.getAttribute('data-name');
      const price = parseFloat(opt.getAttribute('data-price'));

      if (opt.classList.contains('selected')) {
        state.customBrew.toppings.push({ name, price });
      } else {
        state.customBrew.toppings = state.customBrew.toppings.filter(t => t.name !== name);
      }
      updateBrewSummary();
    });
  });

  if (addCustomBrewBtn) {
    addCustomBrewBtn.addEventListener('click', () => {
      let totalPrice = state.customBrew.base.price + state.customBrew.milk.price + state.customBrew.spice.price;
      state.customBrew.toppings.forEach(t => totalPrice += t.price);

      const customItem = {
        id: 'custom-' + Date.now(),
        name: `Custom Brew (${state.customBrew.base.name})`,
        price: totalPrice,
        image: 'assets/hero.png',
        desc: `Base: ${state.customBrew.base.name}, ${state.customBrew.milk.name}, ${state.customBrew.spice.name}`
      };

      addToCart(customItem.id, customItem);
      openCart();
    });
  }

  // 5. Steeping Timer Utility
  const timerDisplay = document.getElementById('timer-digits');
  const timerStartBtn = document.getElementById('timer-start-btn');
  const timerResetBtn = document.getElementById('timer-reset-btn');
  const timerPresetBtns = document.querySelectorAll('.timer-preset-btn');
  const timerRing = document.getElementById('timer-ring');

  function updateTimerDisplay() {
    const mins = Math.floor(state.timer.seconds / 60);
    const secs = state.timer.seconds % 60;
    if (timerDisplay) {
      timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }

  function playChimeSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  function startTimer() {
    if (state.timer.isRunning) {
      clearInterval(state.timer.interval);
      state.timer.isRunning = false;
      timerStartBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
      if (timerRing) timerRing.classList.remove('running');
      return;
    }

    state.timer.isRunning = true;
    timerStartBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    if (timerRing) timerRing.classList.add('running');

    state.timer.interval = setInterval(() => {
      if (state.timer.seconds > 0) {
        state.timer.seconds--;
        updateTimerDisplay();
      } else {
        clearInterval(state.timer.interval);
        state.timer.isRunning = false;
        timerStartBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        if (timerRing) timerRing.classList.remove('running');
        playChimeSound();
        showToast('⏰ Your tea has steeped to perfection!');
      }
    }, 1000);
  }

  function resetTimer() {
    clearInterval(state.timer.interval);
    state.timer.isRunning = false;
    state.timer.seconds = state.timer.totalSeconds;
    if (timerStartBtn) timerStartBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    if (timerRing) timerRing.classList.remove('running');
    updateTimerDisplay();
  }

  timerPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timerPresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const secs = parseInt(btn.getAttribute('data-seconds'));
      state.timer.totalSeconds = secs;
      state.timer.seconds = secs;
      resetTimer();
    });
  });

  if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
  if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);

  // 6. Tea Flavor Matcher Quiz
  let currentQuizStep = 1;
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizProgress = document.querySelectorAll('.progress-bar-step');
  const quizResultBox = document.getElementById('quiz-result-box');

  const quizOptionBtns = document.querySelectorAll('.quiz-option-btn');

  quizOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stepEl = btn.closest('.quiz-step');
      const stepNum = parseInt(stepEl.getAttribute('data-step'));

      if (stepNum < 3) {
        stepEl.classList.remove('active');
        currentQuizStep = stepNum + 1;
        const nextStepEl = document.querySelector(`.quiz-step[data-step="${currentQuizStep}"]`);
        if (nextStepEl) nextStepEl.classList.add('active');

        // Update progress bar
        quizProgress.forEach((p, idx) => {
          if (idx < currentQuizStep) p.classList.add('active');
          else p.classList.remove('active');
        });
      } else {
        // Show Quiz Result
        stepEl.classList.remove('active');
        if (quizResultBox) {
          quizResultBox.classList.add('active');
          showToast('We found your perfect tea match!');
        }
      }
    });
  });

  const retakeQuizBtn = document.getElementById('retake-quiz-btn');
  if (retakeQuizBtn) {
    retakeQuizBtn.addEventListener('click', () => {
      if (quizResultBox) quizResultBox.classList.remove('active');
      currentQuizStep = 1;
      quizSteps.forEach(s => s.classList.remove('active'));
      document.querySelector('.quiz-step[data-step="1"]').classList.add('active');
      quizProgress.forEach((p, idx) => {
        if (idx === 0) p.classList.add('active');
        else p.classList.remove('active');
      });
    });
  }

  // 7. Modals: Reservation & Checkout
  const reserveModal = document.getElementById('reservation-modal');
  const reserveBtn = document.getElementById('reserve-table-btn');
  const reserveCloseBtn = document.getElementById('reserve-close-btn');
  const reserveForm = document.getElementById('reservation-form');

  if (reserveBtn) reserveBtn.addEventListener('click', () => reserveModal.classList.add('active'));
  if (reserveCloseBtn) reserveCloseBtn.addEventListener('click', () => reserveModal.classList.remove('active'));

  if (reserveForm) {
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      reserveModal.classList.remove('active');
      showToast('🎉 Table reservation confirmed! Check your email for details.');
      reserveForm.reset();
    });
  }

  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutCloseBtn = document.getElementById('checkout-close-btn');
  const checkoutForm = document.getElementById('checkout-form');
  const receiptModal = document.getElementById('receipt-modal');
  const receiptCloseBtn = document.getElementById('receipt-close-btn');

  if (checkoutTriggerBtn) {
    checkoutTriggerBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your cart is empty!');
        return;
      }
      closeCart();
      checkoutModal.classList.add('active');
    });
  }

  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', () => checkoutModal.classList.remove('active'));
  if (receiptCloseBtn) receiptCloseBtn.addEventListener('click', () => receiptModal.classList.remove('active'));

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      checkoutModal.classList.remove('active');

      // Populate Digital Receipt
      const receiptId = 'KAAKA-' + Math.floor(100000 + Math.random() * 900000);
      const name = document.getElementById('cust-name').value;
      const orderSummaryEl = document.getElementById('receipt-items');
      const receiptTotalEl = document.getElementById('receipt-total');

      if (document.getElementById('receipt-id')) document.getElementById('receipt-id').textContent = receiptId;
      if (document.getElementById('receipt-name')) document.getElementById('receipt-name').textContent = name;

      let grandTotal = 0;
      if (orderSummaryEl) {
        orderSummaryEl.innerHTML = '';
        state.cart.forEach(item => {
          const itemTotal = item.price * item.qty;
          grandTotal += itemTotal;
          orderSummaryEl.innerHTML += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.9rem;">
              <span>${item.qty}x ${item.name}</span>
              <span>$${itemTotal.toFixed(2)}</span>
            </div>
          `;
        });
      }

      if (receiptTotalEl) receiptTotalEl.textContent = `$${grandTotal.toFixed(2)}`;

      receiptModal.classList.add('active');
      state.cart = [];
      updateCartUI();
      showToast('☕ Order placed successfully!');
    });
  }

  // 8. Toast Helper
  function showToast(message) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-leaf" style="color: var(--primary);"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

});
