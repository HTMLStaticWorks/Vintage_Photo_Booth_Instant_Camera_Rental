/**
 * ANALOGUE & CO. — Main JavaScript Architecture
 * Shutter Audio Synthesis, Interactive Booth Switcher, Photo Strip Studio, Booking Modal
 */

// Shutter Sound Synthesizer via Web Audio API (Zero external audio file dependency!)
class VintageSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playShutter() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    
    // Mechanical click 1 (Mirror up)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1400, t);
    osc1.frequency.exponentialRampToValueAtTime(120, t + 0.04);
    gain1.gain.setValueAtTime(0.45, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.04);

    // Mechanical snap & spring (Curtain release)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(320, t + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    gain2.gain.setValueAtTime(0.3, t + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.06);
    osc2.stop(t + 0.15);

    // Motor whirr/eject
    const osc3 = this.ctx.createOscillator();
    const gain3 = this.ctx.createGain();
    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(220, t + 0.16);
    osc3.frequency.linearRampToValueAtTime(180, t + 0.38);
    gain3.gain.setValueAtTime(0.12, t + 0.16);
    gain3.gain.linearRampToValueAtTime(0.001, t + 0.42);
    osc3.connect(gain3);
    gain3.connect(this.ctx.destination);
    osc3.start(t + 0.16);
    osc3.stop(t + 0.42);
  }
}

const soundEngine = new VintageSoundEngine();

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Support (Dark / Warm Vintage Ivory)
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('analogue_theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.innerHTML = '<i data-lucide="sun" style="width: 18px; height: 18px;"></i>';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggle) themeToggle.innerHTML = '<i data-lucide="moon" style="width: 18px; height: 18px;"></i>';
  }

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      if (newTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i data-lucide="sun" style="width: 18px; height: 18px;"></i>';
      } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i data-lucide="moon" style="width: 18px; height: 18px;"></i>';
      }
      localStorage.setItem('analogue_theme', newTheme);
      if (window.lucide) window.lucide.createIcons();
      soundEngine.playShutter();
    });
  }

  // RTL Direction Toggle Support
  const rtlToggle = document.getElementById('rtlToggle');
  const savedDir = localStorage.getItem('analogue_dir') || 'ltr';
  if (savedDir === 'rtl') {
    document.documentElement.setAttribute('dir', 'rtl');
    if (rtlToggle) rtlToggle.classList.add('active');
  }

  if (rtlToggle) {
    rtlToggle.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      document.documentElement.setAttribute('dir', newDir);
      rtlToggle.classList.toggle('active', newDir === 'rtl');
      localStorage.setItem('analogue_dir', newDir);
      soundEngine.playShutter();
    });
  }

  // Audio Toggle Button
  const audioToggle = document.getElementById('audioToggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      soundEngine.enabled = !soundEngine.enabled;
      audioToggle.classList.toggle('active', soundEngine.enabled);
      if (soundEngine.enabled) {
        soundEngine.playShutter();
      }
    });
  }

  // Password / PIN Visibility Eye Toggles
  initPasswordToggles();

  // Attach shutter sound to trigger elements
  document.querySelectorAll('.play-shutter-sound, .btn-vintage-primary, .btn-vintage-brass').forEach(btn => {
    btn.addEventListener('click', () => {
      soundEngine.playShutter();
    });
  });

  // Sticky Header & Mobile Nav Auto-Close
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Mobile/Tablet Navbar Auto-Close on Nav Link Click
  const navLinks = document.querySelectorAll('.navbar-collapse .nav-link-vintage');
  const navbarCollapse = document.getElementById('navbarMain');
  if (navLinks.length && navbarCollapse && window.bootstrap) {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    });
  }

  // Home Page Booth Switcher
  initBoothSwitcher();

  // Home Page Interactive Strip Studio
  initStripStudio();

  // Booking Modal Form Handler
  initBookingModal();
});

// Password & PIN Visibility Toggle Handler
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');
      
      btn.innerHTML = isPassword 
        ? '<i data-lucide="eye-off" style="width: 16px; height: 16px;"></i>' 
        : '<i data-lucide="eye" style="width: 16px; height: 16px;"></i>';
      
      if (window.lucide) window.lucide.createIcons();
      if (window.soundEngine) window.soundEngine.playShutter();
    });
  });
}

// Interactive Booth Switcher Logic
const boothData = {
  classic: {
    title: "The 1968 Oak Cabin Booth",
    badge: "Flagship Vintage",
    desc: "A handcrafted solid dark walnut wooden booth equipped with studio-grade flash strobes, internal velvet bench seating, and an authentic lab dye-sublimation print chute. Prints roll out warm in 7.2 seconds.",
    specs: ["Footprint: 5ft × 4ft", "Capacity: 2–6 Guests", "Unlimited 2×6 or 4×6 Strips", "Studio Flash Strobe", "On-site Butler Attendant"],
    image: "images/vintage_wood_booth_1789972666481.jpg",
    packageLink: "packages.html#icon"
  },
  polaroid: {
    title: "The Polaroid SX-70 Roaming Bar",
    badge: "Handheld Keepsake",
    desc: "A curated roaming or stationary instant photography bar featuring vintage restored Polaroid SX-70 and Instax Wide cameras. Dedicated photo butlers take candid square prints with handwritten guest notes.",
    specs: ["Roaming or Table Bar", "Instant Square Chem Film", "Embossed Leather Guestbook", "Metallic Archival Pens", "Custom Wooden Display Stand"],
    image: "images/vintage_polaroid_camera_1789972621400.jpg",
    packageLink: "instant-camera.html"
  },
  digital: {
    title: "The Brass Aura (Digital + Print)",
    badge: "Modern Luxury Hybrid",
    desc: "Mid-century brass and matte black finish. Combines high-resolution 4K mirrorless camera sensor with retro film color-grading algorithms, instant QR code AirDrop sharing, and instant physical prints.",
    specs: ["Footprint: 3ft × 3ft Open Air", "Instant QR & SMS Cloud Vault", "AI Analog Film Presets", "Custom Animated GIF & Boomerang", "Unlimited Physical Prints"],
    image: "IMAGW/pexels-airamdphoto-26733657.jpg",
    packageLink: "packages.html#aura"
  },
  studio: {
    title: "The 35mm Grain Mini Studio",
    badge: "Editorial High Fashion",
    desc: "A full-scale open-air portrait lounge featuring an oversized linen or velvet backdrop, professional beauty dish lighting, and live artistic black & white portraiture with museum-grade fiber prints.",
    specs: ["Footprint: 8ft × 8ft Lounge", "Heavyweight Velvet / Linen Backdrops", "High-Fashion Beauty Lighting", "Custom Monogram Metal Emboss", "Live Digital Projection Option"],
    image: "IMAGW/pexels-introspectivedsgn-9271239.jpg",
    packageLink: "booths.html#studio"
  }
};

function initBoothSwitcher() {
  const tabBtns = document.querySelectorAll('.booth-tab-btn');
  const titleEl = document.getElementById('boothTitle');
  const badgeEl = document.getElementById('boothBadge');
  const descEl = document.getElementById('boothDesc');
  const specsContainer = document.getElementById('boothSpecs');
  const imageEl = document.getElementById('boothImage');
  const linkEl = document.getElementById('boothLink');

  if (!tabBtns.length || !titleEl) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-booth');
      if (!boothData[type]) return;

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const data = boothData[type];
      
      // Animate transition
      titleEl.textContent = data.title;
      badgeEl.textContent = data.badge;
      descEl.textContent = data.desc;
      imageEl.src = data.image;
      if (linkEl) linkEl.href = data.packageLink;

      // Render specs
      specsContainer.innerHTML = data.specs.map(s => `
        <div class="spec-pill">
          <i data-lucide="check" style="width:14px; height:14px; color: var(--brass);"></i>
          <span>${s}</span>
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();
      soundEngine.playShutter();
    });
  });
}

// Live Photo Strip Studio Customizer
function initStripStudio() {
  const filterBtns = document.querySelectorAll('.strip-filter-btn');
  const stripImages = document.querySelectorAll('.interactive-strip-img');
  const textInput = document.getElementById('stripCustomText');
  const textDisplay = document.getElementById('stripTextDisplay');
  const dateDisplay = document.getElementById('stripDateDisplay');
  const dateInput = document.getElementById('stripCustomDate');

  if (filterBtns.length && stripImages.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        stripImages.forEach(img => {
          img.style.filter = getFilterStyle(filter);
        });
        soundEngine.playShutter();
      });
    });
  }

  if (textInput && textDisplay) {
    textInput.addEventListener('input', (e) => {
      textDisplay.textContent = e.target.value || "ANCO";
    });
  }

  if (dateInput && dateDisplay) {
    dateInput.addEventListener('input', (e) => {
      dateDisplay.textContent = e.target.value ? new Date(e.target.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "OCTOBER 24, 2026";
    });
  }
}

function getFilterStyle(filterName) {
  switch (filterName) {
    case 'noir':
      return 'grayscale(100%) contrast(125%) brightness(95%)';
    case 'portra':
      return 'sepia(20%) saturate(115%) contrast(105%) hue-rotate(-5deg)';
    case 'kodachrome':
      return 'contrast(130%) saturate(135%) brightness(102%)';
    case 'amber':
      return 'sepia(45%) saturate(120%) brightness(95%) contrast(110%)';
    default:
      return 'grayscale(100%) contrast(115%)';
  }
}

// Booking Modal Functionality
function initBookingModal() {
  const bookingForm = document.getElementById('quickBookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      soundEngine.playShutter();
      
      const city = document.getElementById('bookCity')?.value || "Mumbai";
      const date = document.getElementById('bookDate')?.value || "2026-11-14";
      const packageType = document.getElementById('bookPackage')?.value || "The Icon (Signature Booth)";
      const name = document.getElementById('bookName')?.value || "Valued Client";
      const email = document.getElementById('bookEmail')?.value || "client@example.com";
      const phone = document.getElementById('bookPhone')?.value || "+91 98765 43210";

      // Save to localStorage for instant dashboard hydration
      const reservation = {
        bookingId: "ANL-" + Math.floor(100000 + Math.random() * 900000),
        clientName: name,
        email: email,
        phone: phone,
        city: city,
        eventDate: date,
        package: packageType,
        status: "Confirmed",
        statusStep: 2, // 1: Booked, 2: Confirmed, 3: Preparing, 4: Event Day, 5: Completed
        totalAmount: "$1,850",
        depositPaid: "$500",
        balanceDue: "$1,350",
        backdrop: "Burgundy French Velvet",
        stripTitle: name.toUpperCase() + " CELEBRATION"
      };

      localStorage.setItem('analogue_active_booking', JSON.stringify(reservation));

      // Show success state
      const modalBody = document.getElementById('bookingModalBody');
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="text-center py-4">
            <div class="mb-3">
              <span class="rubber-stamp" style="font-size: 1.2rem; transform: rotate(-4deg);">RESERVATION CONFIRMED</span>
            </div>
            <h3 class="font-display mb-2 text-cream">Welcome to the Private Studio!</h3>
            <p class="text-cream-muted mb-4">Your booking reference is <strong class="text-brass">${reservation.bookingId}</strong>. We've set up your personalized event portal.</p>
            <div class="d-flex justify-content-center gap-3">
              <a href="dashboard.html" class="btn btn-vintage-brass">Open Customer Studio</a>
              <button type="button" class="btn btn-vintage-outline" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        `;
      }
    });
  }
}
