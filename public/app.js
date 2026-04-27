const state = {
  settings: null,
  rooms: [],
  links: [],
  currencies: ['USD', 'EUR', 'GBP', 'AED', 'TZS', 'KES'],
  currentQuote: null,
  deferredInstallPrompt: null
};

const dom = {
  headline: document.getElementById('headline'),
  subheadline: document.getElementById('subheadline'),
  aboutText: document.getElementById('about-text'),
  checkInTime: document.getElementById('check-in-time'),
  checkOutTime: document.getElementById('check-out-time'),
  addressText: document.getElementById('address-text'),
  phoneText: document.getElementById('phone-text'),
  footerBrand: document.getElementById('footer-brand'),
  footerDomain: document.getElementById('footer-domain'),
  mapLink: document.getElementById('map-link'),
  locationLine: document.getElementById('location-line'),
  locationStatus: document.getElementById('location-status'),
  platformLinks: document.getElementById('platform-links'),
  channelList: document.getElementById('channel-list'),
  roomsGrid: document.getElementById('rooms-grid'),
  amenityWall: document.getElementById('amenity-wall'),
  roomSelect: document.getElementById('room-select'),
  checkIn: document.getElementById('check-in'),
  checkOut: document.getElementById('check-out'),
  guestsCount: document.getElementById('guests-count'),
  currencySelect: document.getElementById('currency-select'),
  quoteBox: document.getElementById('quote-box'),
  bookingForm: document.getElementById('booking-form'),
  bookingStatus: document.getElementById('booking-status'),
  trackingForm: document.getElementById('tracking-form'),
  trackingCode: document.getElementById('tracking-code'),
  trackingResult: document.getElementById('tracking-result'),
  statRooms: document.getElementById('stat-rooms'),
  statLocation: document.getElementById('stat-location'),
  useLocation: document.getElementById('use-location'),
  installApp: document.getElementById('install-app'),
  structuredData: document.getElementById('seo-structured-data')
};

const amenityIconMap = {
  wifi: 'wifi',
  snowflake: 'snowflake',
  bath: 'bath',
  coffee: 'coffee',
  tv: 'tv',
  fan: 'fan',
  shirt: 'shirt',
  car: 'car',
  parking: 'car',
  utensils: 'utensils',
  bed: 'bed',
  pool: 'waves',
  lock: 'shield-check'
};

function normalizeDate(dateString) {
  return dateString ? new Date(`${dateString}T00:00:00`) : null;
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function isDateRangeAvailable(roomId, checkIn, checkOut) {
  const room = state.rooms.find((r) => r.id === Number(roomId));
  if (!room || !checkIn || !checkOut) return true;

  return !(room.unavailable || []).some((range) => !(checkOut <= range.check_in || checkIn >= range.check_out));
}

function formatAmount(value, currency) {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    return `${Number(value).toFixed(2)} ${currency}`;
  }
}

function renderLinks() {
  dom.platformLinks.innerHTML = '';
  dom.channelList.innerHTML = '';

  state.links.forEach((link) => {
    const icon = link.icon || 'external-link';

    const top = document.createElement('a');
    top.href = link.url;
    top.target = '_blank';
    top.rel = 'noreferrer';
    top.innerHTML = `<i data-lucide="${icon}"></i> ${link.platform_name}`;
    dom.platformLinks.appendChild(top);

    const channel = document.createElement('a');
    channel.href = link.url;
    channel.className = 'channel-item';
    channel.target = '_blank';
    channel.rel = 'noreferrer';
    channel.innerHTML = `<span><i data-lucide="${icon}"></i> ${link.platform_name}</span><i data-lucide="external-link"></i>`;
    dom.channelList.appendChild(channel);
  });

  refreshIcons();
}

function renderRooms() {
  dom.roomsGrid.innerHTML = '';
  dom.roomSelect.innerHTML = '';

  state.rooms.forEach((room) => {
    const imageUrl = room.cover_image || room.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
    const card = document.createElement('article');
    card.className = 'room-card';
    card.id = `room-${room.slug}`;

    const badges = [
      `<span class="badge">${room.size_label}</span>`,
      `<span class="badge">Up to ${room.max_guests} guests</span>`
    ];

    if (room.featured) {
      badges.unshift('<span class="badge">Featured</span>');
    }

    const unavailableCount = room.unavailable?.length || 0;
    if (unavailableCount > 0) {
      badges.push(`<span class="badge">${unavailableCount} date range(s) booked</span>`);
    }

    card.innerHTML = `
      <img class="room-image" src="${imageUrl}" alt="${room.name}" loading="lazy" />
      <div class="room-content">
        <div class="room-top">
          <h3>${room.name}</h3>
          <strong>${formatAmount(room.price_per_night_usd, 'USD')}</strong>
        </div>
        <p>${room.short_description}</p>
        <div class="room-badges">${badges.join('')}</div>
        <button class="ghost-btn wide" data-book-room="${room.id}">Book ${room.name}</button>
      </div>
    `;

    dom.roomsGrid.appendChild(card);

    const option = document.createElement('option');
    option.value = String(room.id);
    option.textContent = `${room.name} - ${formatAmount(room.price_per_night_usd, 'USD')}/night`;
    dom.roomSelect.appendChild(option);
  });

  dom.roomsGrid.querySelectorAll('[data-book-room]').forEach((button) => {
    button.addEventListener('click', () => {
      dom.roomSelect.value = button.dataset.bookRoom;
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
      requestQuote();
    });
  });
}

function renderAmenities() {
  const seen = new Map();
  state.rooms.forEach((room) => {
    (room.amenities || []).forEach((am) => {
      const key = `${am.icon}:${am.label}`;
      if (!seen.has(key)) {
        seen.set(key, am);
      }
    });
  });

  dom.amenityWall.innerHTML = '';
  [...seen.values()].forEach((amenity) => {
    const iconName = amenityIconMap[amenity.icon] || 'sparkles';
    const item = document.createElement('article');
    item.innerHTML = `<i data-lucide="${iconName}"></i><span>${amenity.label}</span>`;
    dom.amenityWall.appendChild(item);
  });

  refreshIcons();
}

function renderCurrencies() {
  dom.currencySelect.innerHTML = '';
  state.currencies.forEach((currency) => {
    const option = document.createElement('option');
    option.value = currency;
    option.textContent = currency;
    dom.currencySelect.appendChild(option);
  });

  dom.currencySelect.value = 'USD';
}

function applySettings() {
  const settings = state.settings;
  dom.headline.textContent = settings.headline;
  dom.subheadline.textContent = settings.subheadline;
  dom.aboutText.textContent = settings.about_text;
  dom.checkInTime.textContent = settings.check_in_time;
  dom.checkOutTime.textContent = settings.check_out_time;
  dom.addressText.textContent = settings.address;
  dom.phoneText.textContent = settings.contact_phone;
  dom.footerBrand.textContent = settings.site_name;
  dom.footerDomain.textContent = `Domain: ${settings.domain}`;
  dom.mapLink.href = settings.map_link;
  dom.locationLine.textContent = settings.address;
  dom.statRooms.textContent = `${state.rooms.length} Rooms`;
  dom.statLocation.textContent = settings.address.split(',')[0] || settings.address;
  document.title = `${settings.domain} | Coastal Room Booking`;

  const hero = document.getElementById('hero');
  if (settings.hero_image) {
    hero.style.background = `linear-gradient(120deg, rgba(9, 23, 38, 0.75), rgba(18, 91, 102, 0.62)), url('${settings.hero_image}') center/cover no-repeat`;
  }
}

function updateStructuredData() {
  const domain = state.settings.domain.startsWith('http') ? state.settings.domain : `https://${state.settings.domain}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: state.settings.site_name,
    url: domain,
    telephone: state.settings.contact_phone,
    email: state.settings.contact_email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: state.settings.address
    },
    amenityFeature: [...new Set(state.rooms.flatMap((room) => (room.amenities || []).map((item) => item.label)))].map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true
    })),
    sameAs: state.links.map((link) => link.url),
    makesOffer: state.rooms.map((room) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Room',
        name: room.name,
        description: room.short_description
      },
      priceCurrency: 'USD',
      price: room.price_per_night_usd
    }))
  };

  dom.structuredData.textContent = JSON.stringify(schema);
}

async function requestQuote() {
  const roomId = dom.roomSelect.value;
  const checkIn = dom.checkIn.value;
  const checkOut = dom.checkOut.value;
  const currency = dom.currencySelect.value;

  if (!roomId || !checkIn || !checkOut) {
    dom.quoteBox.textContent = 'Enter dates to see your live quote.';
    return;
  }

  if (!isDateRangeAvailable(roomId, checkIn, checkOut)) {
    dom.quoteBox.textContent = 'Those dates are already confirmed for this room. Please pick another date.';
    state.currentQuote = null;
    return;
  }

  try {
    dom.quoteBox.textContent = 'Calculating quote...';
    const response = await fetch(`/api/public/quote?roomId=${encodeURIComponent(roomId)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&currency=${encodeURIComponent(currency)}`);

    if (!response.ok) {
      const payload = await response.json();
      dom.quoteBox.textContent = payload.error || 'Could not get quote.';
      state.currentQuote = null;
      return;
    }

    const quote = await response.json();
    state.currentQuote = quote;
    dom.quoteBox.innerHTML = `
      <strong>${quote.roomName}</strong><br/>
      ${quote.nights} night(s) x ${formatAmount(quote.pricePerNightUsd, 'USD')}<br/>
      Total: <strong>${formatAmount(quote.totalInCurrency, quote.currency)}</strong>
    `;
  } catch (error) {
    dom.quoteBox.textContent = 'Quote service unavailable. Try again.';
    state.currentQuote = null;
  }
}

async function submitBooking(event) {
  event.preventDefault();
  dom.bookingStatus.textContent = '';

  await requestQuote();
  if (!state.currentQuote) {
    dom.bookingStatus.textContent = 'Please check dates and quote first.';
    return;
  }

  const payload = {
    roomId: Number(dom.roomSelect.value),
    guestName: document.getElementById('guest-name').value.trim(),
    guestEmail: document.getElementById('guest-email').value.trim(),
    guestPhone: document.getElementById('guest-phone').value.trim(),
    checkIn: dom.checkIn.value,
    checkOut: dom.checkOut.value,
    guestsCount: Number(dom.guestsCount.value),
    note: document.getElementById('guest-note').value.trim(),
    currencyCode: dom.currencySelect.value
  };

  try {
    dom.bookingStatus.textContent = 'Submitting booking request...';

    const response = await fetch('/api/public/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      dom.bookingStatus.textContent = result.error || 'Booking failed.';
      return;
    }

    dom.bookingStatus.innerHTML = `Booking submitted. Your code is <strong>${result.bookingCode}</strong>. <a href="${result.receiptUrl}" target="_blank" rel="noreferrer">Open receipt</a>.`;
    dom.bookingForm.reset();
    state.currentQuote = null;
    dom.quoteBox.textContent = 'Enter dates to see your live quote.';

    await boot();
  } catch (error) {
    dom.bookingStatus.textContent = 'Booking service is currently unavailable.';
  }
}

async function trackBooking(event) {
  event.preventDefault();
  const code = dom.trackingCode.value.trim().toUpperCase();
  if (!code) return;

  dom.trackingResult.textContent = 'Checking status...';

  try {
    const response = await fetch(`/api/public/bookings/${encodeURIComponent(code)}`);
    const result = await response.json();

    if (!response.ok) {
      dom.trackingResult.textContent = result.error || 'Booking not found.';
      return;
    }

    dom.trackingResult.innerHTML = `
      <strong>Status:</strong> ${result.booking_status}<br/>
      <strong>Room:</strong> ${result.room_name}<br/>
      <strong>Dates:</strong> ${result.check_in} to ${result.check_out}<br/>
      <strong>Payment:</strong> ${result.payment_status}<br/>
      <a href="/receipt/${result.booking_code}" target="_blank" rel="noreferrer">Open receipt</a>
    `;
  } catch (error) {
    dom.trackingResult.textContent = 'Tracking service unavailable.';
  }
}

function configureDateInputs() {
  const today = new Date().toISOString().slice(0, 10);
  dom.checkIn.min = today;
  dom.checkOut.min = today;

  dom.checkIn.addEventListener('change', () => {
    if (dom.checkOut.value && dom.checkOut.value <= dom.checkIn.value) {
      const nextDay = normalizeDate(dom.checkIn.value);
      nextDay.setDate(nextDay.getDate() + 1);
      dom.checkOut.value = nextDay.toISOString().slice(0, 10);
    }

    dom.checkOut.min = dom.checkIn.value || today;
    requestQuote();
  });

  dom.checkOut.addEventListener('change', requestQuote);
  dom.roomSelect.addEventListener('change', requestQuote);
  dom.currencySelect.addEventListener('change', requestQuote);
}

function configureLocationRoute() {
  dom.useLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
      dom.locationStatus.textContent = 'Geolocation is not supported on this device.';
      return;
    }

    dom.locationStatus.textContent = 'Reading your location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const destination = encodeURIComponent(state.settings.address);
        const routeUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${destination}`;
        dom.mapLink.href = routeUrl;
        dom.locationStatus.textContent = 'Route link is ready. Tap Open Map.';
      },
      () => {
        dom.locationStatus.textContent = 'Could not read your location. Please allow permission and try again.';
      }
    );
  });
}

function configureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    dom.installApp.hidden = false;
  });

  dom.installApp.addEventListener('click', async () => {
    if (!state.deferredInstallPrompt) return;

    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    dom.installApp.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    dom.installApp.hidden = true;
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ignore service worker registration errors
    });
  }
}

async function boot() {
  try {
    const response = await fetch('/api/public/bootstrap');
    const data = await response.json();

    state.settings = data.settings;
    state.rooms = data.rooms;
    state.links = data.links;
    state.currencies = data.currencies?.length ? data.currencies : state.currencies;

    applySettings();
    renderLinks();
    renderRooms();
    renderAmenities();
    renderCurrencies();
    updateStructuredData();

    refreshIcons();
  } catch (error) {
    dom.quoteBox.textContent = 'Failed to load booking data. Refresh this page.';
  }
}

configureDateInputs();
configureLocationRoute();
configureInstallPrompt();
registerServiceWorker();

dom.bookingForm.addEventListener('submit', submitBooking);
dom.trackingForm.addEventListener('submit', trackBooking);

boot();
