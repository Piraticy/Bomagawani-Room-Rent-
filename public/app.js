const SUPPORTED_LANGUAGES = ['en', 'sw'];

const translations = {
  en: {
    'nav.admin': 'Admin',
    'nav.bookNow': 'Book Now',
    'hero.roomsLabel': 'Ready to book',
    'hero.supportLabel': 'Guest support',
    'hero.locationLabel': 'Prime location',
    'intro.title': 'Stay in style with easy booking',
    'rooms.title': 'Our Rooms',
    'rooms.subtitle': 'Choose your room and book in minutes.',
    'amenities.title': 'Amenities At A Glance',
    'amenities.subtitle': 'Everything you need for a comfortable stay.',
    'booking.title': 'Book Direct on Bomagawani.com',
    'booking.subtitle': 'Select room, date, and currency. Your booking code is created instantly.',
    'form.room': 'Room',
    'form.checkIn': 'Check-in',
    'form.checkOut': 'Check-out',
    'form.guests': 'Guests',
    'form.currency': 'Currency',
    'form.fullName': 'Full name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.note': 'Note (optional)',
    'form.notePlaceholder': 'Late arrival, special request',
    'form.submit': 'Send Booking Request',
    'tracking.title': 'Check your booking status',
    'tracking.code': 'Booking code',
    'tracking.button': 'Track Booking',
    'location.title': 'Location & direction',
    'location.openMap': 'Open Map',
    'location.route': 'Use my location for route',
    'channels.title': 'Also listed on travel channels',
    'quote.empty': 'Enter dates to see your live quote.',
    'quote.loading': 'Calculating quote...',
    'quote.conflict': 'Those dates are already confirmed for this room. Please pick another date.',
    'quote.unavailable': 'Could not get quote.',
    'quote.serviceDown': 'Quote service unavailable. Try again.',
    'quote.nights': '{nights} night(s) x {price}',
    'quote.total': 'Total: {total}',
    'status.checkQuoteFirst': 'Please check dates and quote first.',
    'status.submittingBooking': 'Submitting booking request...',
    'status.bookingFailed': 'Booking failed.',
    'status.bookingServiceDown': 'Booking service is currently unavailable.',
    'status.bookingSuccessPrefix': 'Booking submitted. Your code is',
    'status.openReceipt': 'Open receipt',
    'tracking.checking': 'Checking status...',
    'tracking.notFound': 'Booking not found.',
    'tracking.serviceDown': 'Tracking service unavailable.',
    'tracking.status': 'Status',
    'tracking.room': 'Room',
    'tracking.dates': 'Dates',
    'tracking.payment': 'Payment',
    'location.noSupport': 'Geolocation is not supported on this device.',
    'location.reading': 'Reading your location...',
    'location.ready': 'Route link is ready. Tap Open Map.',
    'location.failed': 'Could not read your location. Please allow permission and try again.',
    'languagePrompt.title': 'Switch language?',
    'languagePrompt.body': 'We detected your region language ({language}). Want to switch?',
    'languagePrompt.yes': 'Switch',
    'languagePrompt.no': 'Keep English',
    'installPrompt.title': 'Install Bomagawani App?',
    'installPrompt.body': 'Add it to your home screen for faster booking.',
    'installPrompt.yes': 'Install',
    'installPrompt.no': 'Not now'
  },
  sw: {
    'nav.admin': 'Admin',
    'nav.bookNow': 'Weka Nafasi',
    'hero.roomsLabel': 'Tayari kupokelewa',
    'hero.supportLabel': 'Huduma ya wageni',
    'hero.locationLabel': 'Eneo zuri',
    'intro.title': 'Furahia ukaaji kwa kuweka nafasi kwa urahisi',
    'rooms.title': 'Vyumba Vyetu',
    'rooms.subtitle': 'Chagua chumba na weka nafasi kwa dakika chache.',
    'amenities.title': 'Huduma Muhimu',
    'amenities.subtitle': 'Vitu muhimu vyote kwa ukaaji wa starehe.',
    'booking.title': 'Weka Nafasi Moja kwa Moja Bomagawani.com',
    'booking.subtitle': 'Chagua chumba, tarehe na sarafu. Namba ya booking hutolewa papo hapo.',
    'form.room': 'Chumba',
    'form.checkIn': 'Kuingia',
    'form.checkOut': 'Kutoka',
    'form.guests': 'Wageni',
    'form.currency': 'Sarafu',
    'form.fullName': 'Jina kamili',
    'form.email': 'Barua pepe',
    'form.phone': 'Simu',
    'form.note': 'Ujumbe (si lazima)',
    'form.notePlaceholder': 'Kuchelewa kufika, ombi maalum',
    'form.submit': 'Tuma Ombi la Booking',
    'tracking.title': 'Angalia hali ya booking yako',
    'tracking.code': 'Namba ya booking',
    'tracking.button': 'Fuatilia Booking',
    'location.title': 'Eneo na maelekezo',
    'location.openMap': 'Fungua Ramani',
    'location.route': 'Tumia eneo langu kwa njia',
    'channels.title': 'Pia tupo kwenye majukwaa haya',
    'quote.empty': 'Weka tarehe kuona bei ya moja kwa moja.',
    'quote.loading': 'Inahesabu bei...',
    'quote.conflict': 'Tarehe hizi tayari zimechukuliwa. Tafadhali chagua tarehe nyingine.',
    'quote.unavailable': 'Imeshindikana kupata bei.',
    'quote.serviceDown': 'Huduma ya bei haipatikani sasa. Jaribu tena.',
    'quote.nights': 'Usiku {nights} x {price}',
    'quote.total': 'Jumla: {total}',
    'status.checkQuoteFirst': 'Tafadhali hakiki bei kwanza.',
    'status.submittingBooking': 'Inatuma ombi la booking...',
    'status.bookingFailed': 'Booking imekataa.',
    'status.bookingServiceDown': 'Huduma ya booking haipatikani sasa.',
    'status.bookingSuccessPrefix': 'Booking imetumwa. Namba yako ni',
    'status.openReceipt': 'Fungua risiti',
    'tracking.checking': 'Inaangalia hali...',
    'tracking.notFound': 'Booking haijapatikana.',
    'tracking.serviceDown': 'Huduma ya kufuatilia haipatikani.',
    'tracking.status': 'Hali',
    'tracking.room': 'Chumba',
    'tracking.dates': 'Tarehe',
    'tracking.payment': 'Malipo',
    'location.noSupport': 'Kifaa hiki hakiungi mkono geolocation.',
    'location.reading': 'Inasoma eneo lako...',
    'location.ready': 'Njia ipo tayari. Bonyeza Fungua Ramani.',
    'location.failed': 'Imeshindikana kusoma eneo lako. Ruhusu ruhusa na ujaribu tena.',
    'languagePrompt.title': 'Ungependa kubadili lugha?',
    'languagePrompt.body': 'Tumegundua lugha ya eneo lako ({language}). Unataka kubadili?',
    'languagePrompt.yes': 'Badili',
    'languagePrompt.no': 'Baki English',
    'installPrompt.title': 'Sakinisha App ya Bomagawani?',
    'installPrompt.body': 'Ongeza kwenye home screen kwa booking ya haraka.',
    'installPrompt.yes': 'Sakinisha',
    'installPrompt.no': 'Baadaye'
  }
};

const state = {
  settings: null,
  rooms: [],
  links: [],
  currencies: ['USD', 'EUR', 'GBP', 'AED', 'TZS', 'KES'],
  currentQuote: null,
  deferredInstallPrompt: null,
  language: localStorage.getItem('preferred_language') || 'en',
  roomSlideIntervals: {}
};

if (!SUPPORTED_LANGUAGES.includes(state.language)) {
  state.language = 'en';
}

const dom = {
  headline: document.getElementById('headline'),
  subheadline: document.getElementById('subheadline'),
  aboutText: document.getElementById('about-text'),
  footerBrand: document.getElementById('footer-brand'),
  footerDomain: document.getElementById('footer-domain'),
  mapLink: document.getElementById('map-link'),
  mapEmbed: document.getElementById('map-embed'),
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
  structuredData: document.getElementById('seo-structured-data'),
  languageSelect: document.getElementById('language-select'),
  languagePrompt: document.getElementById('language-prompt'),
  languagePromptText: document.getElementById('language-prompt-text'),
  languageYes: document.getElementById('language-yes'),
  languageNo: document.getElementById('language-no'),
  installPrompt: document.getElementById('install-prompt'),
  installYes: document.getElementById('install-yes'),
  installNo: document.getElementById('install-no')
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
  beach: 'waves',
  waves: 'waves',
  lock: 'shield-check'
};

function t(key, vars = {}) {
  const phrase = translations[state.language]?.[key] || translations.en[key] || key;
  return phrase.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}

function languageLabel(code) {
  if (code === 'sw') return 'Kiswahili';
  return 'English';
}

function applyTranslations() {
  document.documentElement.lang = state.language;
  dom.languageSelect.value = state.language;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
  });

  if (!state.currentQuote) {
    dom.quoteBox.textContent = t('quote.empty');
  }
}

function setLanguage(languageCode) {
  const next = SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : 'en';
  state.language = next;
  localStorage.setItem('preferred_language', next);
  applyTranslations();

  if (state.currentQuote) {
    renderQuote(state.currentQuote);
  }
}

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
    return new Intl.NumberFormat(state.language === 'sw' ? 'sw-TZ' : 'en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    return `${Number(value).toFixed(2)} ${currency}`;
  }
}

function clearRoomSlideIntervals() {
  Object.values(state.roomSlideIntervals).forEach((timerId) => clearInterval(timerId));
  state.roomSlideIntervals = {};
}

function initRoomSlides() {
  clearRoomSlideIntervals();

  dom.roomsGrid.querySelectorAll('.room-slider').forEach((slider) => {
    const slides = [...slider.querySelectorAll('.room-image')];
    if (slides.length <= 1) return;

    const sliderKey = slider.dataset.sliderKey;
    let current = 0;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle('is-active', idx === current);
      });
    };

    const nextButton = slider.querySelector('[data-slide="next"]');
    const prevButton = slider.querySelector('[data-slide="prev"]');

    const stopTimer = () => {
      if (state.roomSlideIntervals[sliderKey]) {
        clearInterval(state.roomSlideIntervals[sliderKey]);
      }
    };

    const startTimer = () => {
      stopTimer();
      state.roomSlideIntervals[sliderKey] = setInterval(() => show(current + 1), 4500);
    };

    nextButton?.addEventListener('click', () => {
      show(current + 1);
      startTimer();
    });

    prevButton?.addEventListener('click', () => {
      show(current - 1);
      startTimer();
    });

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);

    startTimer();
  });
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
}

function renderRooms() {
  dom.roomsGrid.innerHTML = '';
  dom.roomSelect.innerHTML = '';

  state.rooms.forEach((room) => {
    const roomImages = (room.images || []).map((item) => item.image_url).filter(Boolean);
    const fallback = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
    const imageSources = roomImages.length ? roomImages : [room.cover_image || fallback];

    const card = document.createElement('article');
    card.className = 'room-card';
    card.id = `room-${room.slug}`;

    const badges = [`<span class="badge">${room.size_label}</span>`, `<span class="badge">Up to ${room.max_guests} guests</span>`];

    if (room.featured) {
      badges.unshift('<span class="badge">Featured</span>');
    }

    const unavailableCount = room.unavailable?.length || 0;
    if (unavailableCount > 0) {
      badges.push(`<span class="badge">${unavailableCount} booked range(s)</span>`);
    }

    const slides = imageSources
      .map(
        (src, index) =>
          `<img class="room-image ${index === 0 ? 'is-active' : ''}" src="${src}" alt="${room.name}" loading="lazy" />`
      )
      .join('');

    const controls =
      imageSources.length > 1
        ? `
      <button class="slide-control prev" type="button" data-slide="prev" aria-label="Previous image">‹</button>
      <button class="slide-control next" type="button" data-slide="next" aria-label="Next image">›</button>
    `
        : '';

    card.innerHTML = `
      <div class="room-slider" data-slider-key="room-${room.id}">
        ${slides}
        ${controls}
      </div>
      <div class="room-content">
        <div class="room-top">
          <h3>${room.name}</h3>
          <strong>${formatAmount(room.price_per_night_usd, 'USD')}</strong>
        </div>
        <p>${room.short_description}</p>
        <div class="room-badges">${badges.join('')}</div>
        <button class="ghost-btn wide" data-book-room="${room.id}">${t('nav.bookNow')} ${room.name}</button>
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

  initRoomSlides();
}

function renderAmenities() {
  const seen = new Map();
  state.rooms.forEach((room) => {
    (room.amenities || []).forEach((amenity) => {
      const key = `${amenity.icon}:${amenity.label}`;
      if (!seen.has(key)) {
        seen.set(key, amenity);
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
  dom.footerBrand.textContent = settings.site_name;
  dom.footerDomain.textContent = `Domain: ${settings.domain}`;
  dom.locationLine.textContent = settings.address;
  dom.mapLink.href = settings.map_link;

  const mapQuery = encodeURIComponent(settings.address || 'Kigombe, Tanga, Tanzania');
  dom.mapEmbed.src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

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

function renderQuote(quote) {
  if (!quote) {
    dom.quoteBox.textContent = t('quote.empty');
    return;
  }

  dom.quoteBox.innerHTML = `
    <strong>${quote.roomName}</strong><br/>
    ${t('quote.nights', { nights: quote.nights, price: formatAmount(quote.pricePerNightUsd, 'USD') })}<br/>
    <strong>${t('quote.total', { total: formatAmount(quote.totalInCurrency, quote.currency) })}</strong>
  `;
}

async function requestQuote() {
  const roomId = dom.roomSelect.value;
  const checkIn = dom.checkIn.value;
  const checkOut = dom.checkOut.value;
  const currency = dom.currencySelect.value;

  if (!roomId || !checkIn || !checkOut) {
    renderQuote(null);
    return;
  }

  if (!isDateRangeAvailable(roomId, checkIn, checkOut)) {
    dom.quoteBox.textContent = t('quote.conflict');
    state.currentQuote = null;
    return;
  }

  try {
    dom.quoteBox.textContent = t('quote.loading');
    const response = await fetch(
      `/api/public/quote?roomId=${encodeURIComponent(roomId)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&currency=${encodeURIComponent(currency)}`
    );

    if (!response.ok) {
      const payload = await response.json();
      dom.quoteBox.textContent = payload.error || t('quote.unavailable');
      state.currentQuote = null;
      return;
    }

    const quote = await response.json();
    state.currentQuote = quote;
    renderQuote(quote);
  } catch (error) {
    dom.quoteBox.textContent = t('quote.serviceDown');
    state.currentQuote = null;
  }
}

async function submitBooking(event) {
  event.preventDefault();
  dom.bookingStatus.textContent = '';

  await requestQuote();
  if (!state.currentQuote) {
    dom.bookingStatus.textContent = t('status.checkQuoteFirst');
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
    dom.bookingStatus.textContent = t('status.submittingBooking');

    const response = await fetch('/api/public/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      dom.bookingStatus.textContent = result.error || t('status.bookingFailed');
      return;
    }

    dom.bookingStatus.innerHTML = `${t('status.bookingSuccessPrefix')} <strong>${result.bookingCode}</strong>. <a href="${result.receiptUrl}" target="_blank" rel="noreferrer">${t('status.openReceipt')}</a>.`;
    dom.bookingForm.reset();
    state.currentQuote = null;
    renderQuote(null);

    await boot();
  } catch (error) {
    dom.bookingStatus.textContent = t('status.bookingServiceDown');
  }
}

async function trackBooking(event) {
  event.preventDefault();
  const code = dom.trackingCode.value.trim().toUpperCase();
  if (!code) return;

  dom.trackingResult.textContent = t('tracking.checking');

  try {
    const response = await fetch(`/api/public/bookings/${encodeURIComponent(code)}`);
    const result = await response.json();

    if (!response.ok) {
      dom.trackingResult.textContent = result.error || t('tracking.notFound');
      return;
    }

    dom.trackingResult.innerHTML = `
      <strong>${t('tracking.status')}:</strong> ${result.booking_status}<br/>
      <strong>${t('tracking.room')}:</strong> ${result.room_name}<br/>
      <strong>${t('tracking.dates')}:</strong> ${result.check_in} to ${result.check_out}<br/>
      <strong>${t('tracking.payment')}:</strong> ${result.payment_status}<br/>
      <a href="/receipt/${result.booking_code}" target="_blank" rel="noreferrer">${t('status.openReceipt')}</a>
    `;
  } catch (error) {
    dom.trackingResult.textContent = t('tracking.serviceDown');
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
      dom.locationStatus.textContent = t('location.noSupport');
      return;
    }

    dom.locationStatus.textContent = t('location.reading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const destination = encodeURIComponent(state.settings.address);
        const routeUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${destination}`;
        dom.mapLink.href = routeUrl;
        dom.locationStatus.textContent = t('location.ready');
      },
      () => {
        dom.locationStatus.textContent = t('location.failed');
      }
    );
  });
}

function getSuggestedLanguage() {
  const browserLang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(browserLang) && browserLang !== state.language) {
    return browserLang;
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (timezone.includes('Dar_es_Salaam') && state.language !== 'sw') {
    return 'sw';
  }

  return null;
}

function configureLanguagePreference() {
  dom.languageSelect.value = state.language;
  dom.languageSelect.addEventListener('change', (event) => {
    setLanguage(event.target.value);
  });

  const promptAlreadyShown = localStorage.getItem('language_prompt_seen') === '1';
  const suggested = getSuggestedLanguage();

  if (!promptAlreadyShown && suggested) {
    dom.languagePromptText.textContent = t('languagePrompt.body', { language: languageLabel(suggested) });
    dom.languagePrompt.hidden = false;

    dom.languageYes.onclick = () => {
      setLanguage(suggested);
      dom.languagePrompt.hidden = true;
      localStorage.setItem('language_prompt_seen', '1');
    };

    dom.languageNo.onclick = () => {
      dom.languagePrompt.hidden = true;
      localStorage.setItem('language_prompt_seen', '1');
    };
  }
}

function configureInstallPrompt() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isStandalone) {
    localStorage.setItem('install_prompt_seen', '1');
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;

    const promptAlreadyShown = localStorage.getItem('install_prompt_seen') === '1';
    if (!promptAlreadyShown && !isStandalone) {
      dom.installPrompt.hidden = false;
    }
  });

  dom.installYes.addEventListener('click', async () => {
    if (!state.deferredInstallPrompt) {
      dom.installPrompt.hidden = true;
      localStorage.setItem('install_prompt_seen', '1');
      return;
    }

    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    dom.installPrompt.hidden = true;
    localStorage.setItem('install_prompt_seen', '1');
  });

  dom.installNo.addEventListener('click', () => {
    dom.installPrompt.hidden = true;
    localStorage.setItem('install_prompt_seen', '1');
  });

  window.addEventListener('appinstalled', () => {
    dom.installPrompt.hidden = true;
    localStorage.setItem('install_prompt_seen', '1');
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
    applyTranslations();
    refreshIcons();
  } catch (error) {
    dom.quoteBox.textContent = t('status.bookingServiceDown');
  }
}

applyTranslations();
configureLanguagePreference();
configureDateInputs();
configureLocationRoute();
configureInstallPrompt();
registerServiceWorker();

dom.bookingForm.addEventListener('submit', submitBooking);
dom.trackingForm.addEventListener('submit', trackBooking);

boot();
