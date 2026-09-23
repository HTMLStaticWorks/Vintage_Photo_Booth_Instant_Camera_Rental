document.addEventListener('DOMContentLoaded', () => {
  initDashboardTabs();
  initDashboardState();
  initCountdown();
  initBackdropSelector();
  initTemplateCustomizer();
  initPaymentSimulator();
  initDashboardActionLinks();
});

// Sidebar & Topbar Tab Navigation Handler
function initDashboardTabs() {
  const switchTab = (targetHash) => {
    if (!targetHash || !targetHash.startsWith('#')) return;
    
    // Remove active class from all nav items
    document.querySelectorAll('.dashboard-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Find corresponding sidebar item and activate it
    const matchingSidebarLink = document.querySelector(`.dashboard-nav-item a[href="${targetHash}"], .dashboard-nav-item a[data-tab-target="${targetHash}"]`);
    if (matchingSidebarLink && matchingSidebarLink.parentElement) {
      matchingSidebarLink.parentElement.classList.add('active');
    }

    // Switch tab panes
    const allPanes = document.querySelectorAll('.dashboard-content-body .tab-pane');
    allPanes.forEach(pane => {
      pane.classList.remove('show', 'active');
    });

    const targetPane = document.querySelector(targetHash);
    if (targetPane) {
      targetPane.classList.add('show', 'active');
    }

    if (window.lucide) window.lucide.createIcons();
    if (window.soundEngine) window.soundEngine.playShutter();
  };

  // Attach to all tab links
  const tabLinks = document.querySelectorAll('.dashboard-nav-item a, a[data-bs-toggle="tab"], .dashboard-tab-link');
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetHash = link.getAttribute('href') || link.getAttribute('data-tab-target');
      switchTab(targetHash);
      if (history.pushState) {
        history.pushState(null, null, targetHash);
      }
    });
  });

  // Attach to li container for easy clicking
  document.querySelectorAll('.dashboard-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const link = item.querySelector('a');
      if (link && e.target !== link && !link.contains(e.target)) {
        link.click();
      }
    });
  });

  // Check URL hash on initial load
  if (window.location.hash) {
    switchTab(window.location.hash);
  }
}

function initDashboardActionLinks() {
  // Share Vault Link
  const shareVaultBtn = document.getElementById('shareVaultBtn');
  if (shareVaultBtn) {
    shareVaultBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      showNotification("Guest photo vault link copied to clipboard!");
      if (window.soundEngine) window.soundEngine.playShutter();
    });
  }

  // Copy Booking Ref PIN
  const copyPinBtn = document.getElementById('portalBookingRef');
  if (copyPinBtn) {
    copyPinBtn.style.cursor = 'pointer';
    copyPinBtn.addEventListener('click', () => {
      const bookingId = document.querySelector('.bind-booking-id')?.textContent || 'ANL-894120';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(bookingId);
      }
      showNotification(`Passcode copied: ${bookingId}`);
    });
  }

  // Download All Scans Button
  const downloadAllBtn = document.getElementById('downloadAllScansBtn');
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification("Preparing ZIP archive of 342 high-resolution scans (1.4 GB)...");
      if (window.soundEngine) window.soundEngine.playShutter();
    });
  }

  // Individual photo card download links
  const scanDownloadLinks = document.querySelectorAll('.download-scan-link');
  scanDownloadLinks.forEach((link, idx) => {
    link.addEventListener('click', () => {
      showNotification(`Downloading scan file #${String(idx + 1).padStart(3, '0')}...`);
      if (window.soundEngine) window.soundEngine.playShutter();
    });
  });
}

// Default Mock Booking if none in localStorage
const defaultBooking = {
  bookingId: "ANL-894120",
  clientName: "Eleanor & Julian Vance",
  eventType: "Autumn Estate Wedding",
  city: "Mumbai / Alibaug",
  venue: "The Vintage Heritage Villa",
  eventDate: "2026-11-28",
  package: "The Icon (Classic Wooden Booth)",
  status: "Preparing Custom Prints",
  statusStep: 3, // 1: Booked, 2: Confirmed, 3: Preparing, 4: Event Day, 5: Completed
  totalAmount: 1850,
  depositPaid: 650,
  balanceDue: 1200,
  selectedBackdrop: "Burgundy French Velvet",
  backdropThumb: "IMAGW/pexels-airamdphoto-26733657.jpg",
  stripMonogram: "E & J",
  stripHeadline: "ELEANOR & JULIAN",
  stripDate: "NOVEMBER 28, 2026",
  stripLocation: "THE HERITAGE VILLA",
  stripFilter: "noir",
  guestPhotosCount: 342,
  guestGifsCount: 86
};

function initDashboardState() {
  const saved = localStorage.getItem('analogue_active_booking');
  const booking = saved ? { ...defaultBooking, ...JSON.parse(saved) } : defaultBooking;

  // Hydrate fields
  const clientNameEls = document.querySelectorAll('.bind-client-name');
  clientNameEls.forEach(el => el.textContent = booking.clientName);

  const bookingIdEls = document.querySelectorAll('.bind-booking-id');
  bookingIdEls.forEach(el => el.textContent = booking.bookingId);

  const eventDateEls = document.querySelectorAll('.bind-event-date');
  eventDateEls.forEach(el => el.textContent = formatDate(booking.eventDate));

  const packageEls = document.querySelectorAll('.bind-package-name');
  packageEls.forEach(el => el.textContent = booking.package);

  const venueEls = document.querySelectorAll('.bind-venue');
  venueEls.forEach(el => el.textContent = booking.venue || booking.city);

  const totalEls = document.querySelectorAll('.bind-total-amount');
  totalEls.forEach(el => el.textContent = typeof booking.totalAmount === 'number' ? `$${booking.totalAmount}` : booking.totalAmount);

  const depositEls = document.querySelectorAll('.bind-deposit-paid');
  depositEls.forEach(el => el.textContent = typeof booking.depositPaid === 'number' ? `$${booking.depositPaid}` : booking.depositPaid);

  const balanceEls = document.querySelectorAll('.bind-balance-due');
  balanceEls.forEach(el => el.textContent = typeof booking.balanceDue === 'number' ? `$${booking.balanceDue}` : booking.balanceDue);

  // Timeline Stepper Progress
  updateTimelineStepper(booking.statusStep || 3);
}

function updateTimelineStepper(stepNumber) {
  const stepItems = document.querySelectorAll('.step-item');
  const progressBar = document.querySelector('.timeline-progress-bar');

  stepItems.forEach((item, index) => {
    const step = index + 1;
    item.classList.remove('completed', 'current');
    if (step < stepNumber) {
      item.classList.add('completed');
    } else if (step === stepNumber) {
      item.classList.add('current');
    }
  });

  if (progressBar) {
    const percentage = ((stepNumber - 1) / (stepItems.length - 1)) * 100;
    progressBar.style.width = `${percentage}%`;
  }
}

// Countdown Ticker
function initCountdown() {
  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minsEl = document.getElementById('cdMins');
  const secsEl = document.getElementById('cdSecs');

  if (!daysEl) return;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 68); // 68 days in the future
  targetDate.setHours(18, 0, 0, 0);

  function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate.getTime() - now;

    if (diff <= 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Backdrop Swatch Selector
function initBackdropSelector() {
  const swatchCards = document.querySelectorAll('.backdrop-swatch-card');
  const currentBackdropName = document.getElementById('currentBackdropLabel');
  const previewBackdropThumb = document.getElementById('previewBackdropThumb');

  swatchCards.forEach(card => {
    card.addEventListener('click', () => {
      swatchCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const name = card.getAttribute('data-backdrop-name');
      const img = card.querySelector('img');

      if (currentBackdropName) currentBackdropName.textContent = name;
      if (previewBackdropThumb && img) previewBackdropThumb.src = img.src;

      showNotification(`Backdrop selected: ${name}`);
      if (window.soundEngine) window.soundEngine.playShutter();
    });
  });
}

// Interactive Template Customizer
function initTemplateCustomizer() {
  const headlineInput = document.getElementById('dashStripHeadline');
  const dateInput = document.getElementById('dashStripDate');
  const locationInput = document.getElementById('dashStripLocation');
  const filterSelect = document.getElementById('dashStripFilter');

  const previewHeadline = document.getElementById('dashPreviewHeadline');
  const previewDate = document.getElementById('dashPreviewDate');
  const previewLocation = document.getElementById('dashPreviewLocation');
  const previewImages = document.querySelectorAll('.dash-preview-strip-img');

  if (headlineInput && previewHeadline) {
    headlineInput.addEventListener('input', (e) => {
      previewHeadline.textContent = e.target.value || "ELEANOR & JULIAN";
    });
  }

  if (dateInput && previewDate) {
    dateInput.addEventListener('input', (e) => {
      previewDate.textContent = e.target.value || "NOVEMBER 28, 2026";
    });
  }

  if (locationInput && previewLocation) {
    locationInput.addEventListener('input', (e) => {
      previewLocation.textContent = e.target.value || "THE HERITAGE VILLA";
    });
  }

  if (filterSelect && previewImages.length) {
    filterSelect.addEventListener('change', (e) => {
      const filter = e.target.value;
      previewImages.forEach(img => {
        switch (filter) {
          case 'noir':
            img.style.filter = 'grayscale(100%) contrast(125%)';
            break;
          case 'portra':
            img.style.filter = 'sepia(20%) saturate(115%)';
            break;
          case 'amber':
            img.style.filter = 'sepia(50%) saturate(120%) contrast(110%)';
            break;
          default:
            img.style.filter = 'none';
        }
      });
      if (window.soundEngine) window.soundEngine.playShutter();
    });
  }

  // Save Template Button
  const saveBtn = document.getElementById('saveTemplateBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      showNotification("Photo strip template saved & locked for printing!");
      if (window.soundEngine) window.soundEngine.playShutter();
    });
  }
}

// Payment Simulator
function initPaymentSimulator() {
  const payBtn = document.getElementById('submitPaymentBtn');
  const printInvoiceBtn = document.getElementById('printInvoiceBtn');

  if (payBtn) {
    payBtn.addEventListener('click', () => {
      payBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Processing Secure Payment...`;
      payBtn.disabled = true;

      setTimeout(() => {
        payBtn.innerHTML = `<i data-lucide="check" class="me-2"></i> Payment Successful!`;
        if (window.lucide) window.lucide.createIcons();

        // Update balance due to $0
        const balanceEls = document.querySelectorAll('.bind-balance-due');
        balanceEls.forEach(el => el.textContent = "$0.00");
        
        const depositEls = document.querySelectorAll('.bind-deposit-paid');
        depositEls.forEach(el => el.textContent = "$1,850.00 (PAID IN FULL)");

        showNotification("Payment received in full! Receipt generated.");
        if (window.soundEngine) window.soundEngine.playShutter();

        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
          if (modal) modal.hide();
          payBtn.innerHTML = `Pay Outstanding Balance`;
          payBtn.disabled = false;
        }, 1200);
      }, 1500);
    });
  }

  if (printInvoiceBtn) {
    printInvoiceBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// Helper Utilities
function formatDate(dateString) {
  if (!dateString) return "November 28, 2026";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function showNotification(msg) {
  const toast = document.createElement('div');
  toast.className = 'studio-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--midnight-surface);
    color: var(--cream);
    border: 1px solid var(--brass);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    padding: 0.9rem 1.4rem;
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 0.82rem;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    animation: fadeIn 0.3s ease;
  `;
  toast.innerHTML = `<span style="color: var(--brass);">✦</span> ${msg}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
