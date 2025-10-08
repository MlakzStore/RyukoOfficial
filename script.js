document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuItems = document.querySelectorAll('.menu li');
  const contentContainer = document.getElementById('content-container');
  const userIdInput = document.getElementById("userId");
  const zoneIdInput = document.getElementById("zoneId");
  const buyBtn = document.getElementById("buyBtn");
  const selectedPackageText = document.getElementById("selectedPackage");
  const selectedAmountText = document.getElementById("selectedAmount");
  const radios = document.querySelectorAll('input[name="category"]');

  let selectedPackage = null;
  let selectedAmount = null;
  let selectedPayment = null;
  const ALWAYS_CLICKABLE = true;

  // ------------------- SIDEBAR -------------------
  window.toggleMenu = () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('show');
  };

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(li => li.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // ------------------- SWIPER -------------------
  if (typeof Swiper !== 'undefined' && document.querySelector(".mySwiper")) {
    new Swiper(".mySwiper", {
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      effect: "slide",
      speed: 700,
      spaceBetween: 15,
    });
  }

  // ------------------- VALIDATE FORM -------------------
  function validateForm() {
    const isValid = !!(
      userIdInput.value.trim() &&
      zoneIdInput.value.trim() &&
      selectedPackage &&
      selectedPayment
    );

    buyBtn.disabled = ALWAYS_CLICKABLE ? false : !isValid;
    buyBtn.classList.toggle('enabled', isValid);

    selectedPackageText.textContent = selectedPackage || "None";
    selectedAmountText.textContent = selectedAmount || 0;
  }

  // ------------------- BIND PACKAGE LISTENERS -------------------
  function bindPackageListeners() {
    const packages = document.querySelectorAll('input[name="package"]');

    packages.forEach(pkg => {
      pkg.addEventListener('change', () => {
        selectedPackage = pkg.dataset.diamonds || pkg.value;
        selectedAmount = pkg.value;
        validateForm();
      });
    });

    // Auto-select checked package (in case default is already checked)
    const defaultSelected = document.querySelector('input[name="package"]:checked');
    if (defaultSelected) {
      selectedPackage = defaultSelected.dataset.diamonds || defaultSelected.value;
      selectedAmount = defaultSelected.value;
      validateForm();
    }
  }

  // ------------------- LOAD CATEGORY -------------------
  function loadCategory(file) {
    fetch(file)
      .then(res => res.text())
      .then(html => {
        contentContainer.innerHTML = html;
        bindPackageListeners(); // Important: attach after HTML insertion
      })
      .catch(() => {
        contentContainer.innerHTML = "<p style='color:#fff;'>Error loading packages.</p>";
      });
  }

  // Load default category
  loadCategory("large.html");

  // Switch categories
  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      selectedPackage = null;
      selectedAmount = null;
      validateForm();
      loadCategory(`${radio.value}.html`);
    });
  });

  // ------------------- PAYMENT -------------------
  function bindPaymentListeners() {
    document.querySelectorAll('input[name="payment"]').forEach(pay => {
      pay.addEventListener('change', () => {
        selectedPayment = pay.value;
        validateForm();
      });
    });
  }
  bindPaymentListeners();

  // ------------------- USER INPUT -------------------
  [userIdInput, zoneIdInput].forEach(input => input.addEventListener('input', validateForm));

  // ------------------- BUY BUTTON -------------------
  buyBtn.addEventListener('click', () => {
    const userId = userIdInput.value.trim();
    const zoneId = zoneIdInput.value.trim();
    const missingFields = [];

    if (!userId) missingFields.push("User ID");
    if (!zoneId) missingFields.push("Zone ID");
    if (!selectedPackage) missingFields.push("Diamond Packs");

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Details',
        html: missingFields.map(f => `<p style="margin:5px 0; font-weight:600; font-size:18px;">${f}</p>`).join(''),
        confirmButtonColor: '#FF5700',
        width: '400px',
        background: '#2B2B2B',
        color: '#fff',
        iconColor: '#FF5700',
        customClass: { confirmButton: 'custom-ok-btn' }
      });
      return;
    }

    if (!selectedPayment) {
      Swal.fire({
        icon: 'info',
        title: 'Select Payment',
        text: 'Please select a payment method.',
        confirmButtonColor: '#FF5700',
        background: '#2B2B2B',
        color: '#fff',
        iconColor: '#FF5700',
        customClass: { confirmButton: 'custom-ok-btn' }
      });
      return;
    }

    const orderId = `RYO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const message = `Hello, I have placed an order!:\n\n🆔 Order ID: ${orderId}\n🎮 Game: Mobile Legends\n🆔 User ID: ${userId}\n🌍 Zone ID: ${zoneId}\n💎 Package: ${selectedPackage}\n💰 Amount: ₹${selectedAmount}\n💳 Payment: ${selectedPayment}`;
    window.location.href = `https://wa.me/917005121396?text=${encodeURIComponent(message)}`;
  });
});