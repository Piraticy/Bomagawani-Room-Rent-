const dom = {
  loginWrap: document.getElementById('login-wrap'),
  dashboard: document.getElementById('dashboard'),
  loginForm: document.getElementById('login-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  loginStatus: document.getElementById('login-status'),
  logoutBtn: document.getElementById('logout-btn'),

  sumPending: document.getElementById('sum-pending'),
  sumConfirmed: document.getElementById('sum-confirmed'),
  sumRevenue: document.getElementById('sum-revenue'),

  settingsForm: document.getElementById('settings-form'),
  settingsStatus: document.getElementById('settings-status'),
  setSiteName: document.getElementById('set-site-name'),
  setDomain: document.getElementById('set-domain'),
  setHeadline: document.getElementById('set-headline'),
  setSubheadline: document.getElementById('set-subheadline'),
  setAddress: document.getElementById('set-address'),
  setMapLink: document.getElementById('set-map-link'),
  setPhone: document.getElementById('set-phone'),
  setEmail: document.getElementById('set-email'),
  setCheckIn: document.getElementById('set-check-in'),
  setCheckOut: document.getElementById('set-check-out'),
  setCurrency: document.getElementById('set-currency'),
  setLogoText: document.getElementById('set-logo-text'),
  setAbout: document.getElementById('set-about'),

  heroUploadForm: document.getElementById('hero-upload-form'),
  heroImage: document.getElementById('hero-image'),
  heroStatus: document.getElementById('hero-status'),

  roomsAdminList: document.getElementById('rooms-admin-list'),
  roomForm: document.getElementById('room-form'),
  roomFormTitle: document.getElementById('room-form-title'),
  roomId: document.getElementById('room-id'),
  roomName: document.getElementById('room-name'),
  roomShort: document.getElementById('room-short'),
  roomLong: document.getElementById('room-long'),
  roomPrice: document.getElementById('room-price'),
  roomMax: document.getElementById('room-max'),
  roomSize: document.getElementById('room-size'),
  roomAmenities: document.getElementById('room-amenities'),
  roomFeatured: document.getElementById('room-featured'),
  roomActive: document.getElementById('room-active'),
  roomStatus: document.getElementById('room-status'),
  roomReset: document.getElementById('room-reset'),

  roomImageForm: document.getElementById('room-image-form'),
  uploadRoomId: document.getElementById('upload-room-id'),
  roomImageFile: document.getElementById('room-image-file'),
  roomImageCaption: document.getElementById('room-image-caption'),
  roomImageStatus: document.getElementById('room-image-status'),

  linksFormWrap: document.getElementById('links-form-wrap'),
  addLinkRow: document.getElementById('add-link-row'),
  saveLinks: document.getElementById('save-links'),
  linksStatus: document.getElementById('links-status'),

  bookingsTableWrap: document.getElementById('bookings-table-wrap')
};

const state = {
  rooms: [],
  links: [],
  bookings: []
};

function setStatus(element, message, ok = true) {
  element.textContent = message;
  element.style.color = ok ? '#245f45' : '#8d1f31';
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload;
}

function parseAmenitiesText(text) {
  return text
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((item) => {
      const [icon, ...labelParts] = item.split(':');
      return {
        icon: (icon || 'sparkles').trim(),
        label: (labelParts.join(':') || icon || 'Amenity').trim()
      };
    });
}

function amenitiesToText(amenities) {
  return (amenities || []).map((a) => `${a.icon}:${a.label}`).join(', ');
}

function populateSettings(settings) {
  dom.setSiteName.value = settings.site_name;
  dom.setDomain.value = settings.domain;
  dom.setHeadline.value = settings.headline;
  dom.setSubheadline.value = settings.subheadline;
  dom.setAddress.value = settings.address;
  dom.setMapLink.value = settings.map_link;
  dom.setPhone.value = settings.contact_phone;
  dom.setEmail.value = settings.contact_email;
  dom.setCheckIn.value = settings.check_in_time;
  dom.setCheckOut.value = settings.check_out_time;
  dom.setCurrency.value = settings.base_currency;
  dom.setLogoText.value = settings.logo_text;
  dom.setAbout.value = settings.about_text;
}

function renderSummary(summary) {
  dom.sumPending.textContent = summary.pending;
  dom.sumConfirmed.textContent = summary.confirmed;
  dom.sumRevenue.textContent = Number(summary.revenueUsd).toFixed(2);
}

function renderRooms() {
  dom.roomsAdminList.innerHTML = '';
  dom.uploadRoomId.innerHTML = '';

  state.rooms.forEach((room) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'room-item';
    wrapper.innerHTML = `
      <div>
        <p><strong>${room.name}</strong> ${room.active ? '' : '(Inactive)'}</p>
        <p>${room.price_per_night_usd} USD/night • Max ${room.max_guests}</p>
      </div>
      <div>
        <button class="small-btn" data-edit-room="${room.id}">Edit</button>
        <button class="small-btn" data-remove-room="${room.id}">Delete</button>
      </div>
    `;
    dom.roomsAdminList.appendChild(wrapper);

    const option = document.createElement('option');
    option.value = String(room.id);
    option.textContent = room.name;
    dom.uploadRoomId.appendChild(option);
  });

  dom.roomsAdminList.querySelectorAll('[data-edit-room]').forEach((button) => {
    button.addEventListener('click', () => startRoomEdit(Number(button.dataset.editRoom)));
  });

  dom.roomsAdminList.querySelectorAll('[data-remove-room]').forEach((button) => {
    button.addEventListener('click', () => removeRoom(Number(button.dataset.removeRoom)));
  });
}

function addLinkRow(data = { platform_name: '', url: '', icon: 'link', sort_order: 0 }) {
  const row = document.createElement('div');
  row.className = 'link-row';
  row.innerHTML = `
    <input placeholder="Platform name" value="${data.platform_name || ''}" data-link="name" />
    <input placeholder="URL" value="${data.url || ''}" data-link="url" />
    <input placeholder="Icon name" value="${data.icon || 'link'}" data-link="icon" />
    <button type="button" class="small-btn" data-link-remove>Remove</button>
  `;

  row.querySelector('[data-link-remove]').addEventListener('click', () => row.remove());
  dom.linksFormWrap.appendChild(row);
}

function renderLinks() {
  dom.linksFormWrap.innerHTML = '';
  if (!state.links.length) {
    addLinkRow();
    return;
  }

  state.links.forEach((link) => addLinkRow(link));
}

function renderBookings() {
  const rows = state.bookings
    .map(
      (booking) => `
      <tr>
        <td>${booking.booking_code}</td>
        <td>${booking.room_name}</td>
        <td>${booking.guest_name}<br/><small>${booking.guest_email}</small></td>
        <td>${booking.check_in}<br/>to<br/>${booking.check_out}</td>
        <td>${Number(booking.total_in_currency).toFixed(2)} ${booking.currency_code}</td>
        <td>${booking.booking_status}<br/><small>${booking.payment_status}</small></td>
        <td>
          <button class="small-btn" data-status="confirm" data-booking-id="${booking.id}">Confirm</button>
          <button class="small-btn" data-status="cancel" data-booking-id="${booking.id}">Cancel</button>
          <button class="small-btn" data-status="paid" data-booking-id="${booking.id}">Mark Paid</button>
        </td>
      </tr>
    `
    )
    .join('');

  dom.bookingsTableWrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Room</th>
          <th>Guest</th>
          <th>Dates</th>
          <th>Total</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  dom.bookingsTableWrap.querySelectorAll('[data-status]').forEach((button) => {
    button.addEventListener('click', () => updateBookingStatus(Number(button.dataset.bookingId), button.dataset.status));
  });
}

function startRoomEdit(roomId) {
  const room = state.rooms.find((r) => r.id === roomId);
  if (!room) return;

  dom.roomFormTitle.textContent = `Edit Room: ${room.name}`;
  dom.roomId.value = room.id;
  dom.roomName.value = room.name;
  dom.roomShort.value = room.short_description;
  dom.roomLong.value = room.long_description;
  dom.roomPrice.value = room.price_per_night_usd;
  dom.roomMax.value = room.max_guests;
  dom.roomSize.value = room.size_label;
  dom.roomAmenities.value = amenitiesToText(room.amenities || []);
  dom.roomFeatured.checked = Boolean(room.featured);
  dom.roomActive.checked = Boolean(room.active);

  window.scrollTo({ top: dom.roomForm.offsetTop - 90, behavior: 'smooth' });
}

function clearRoomForm() {
  dom.roomForm.reset();
  dom.roomId.value = '';
  dom.roomFormTitle.textContent = 'Add New Room';
  dom.roomActive.checked = true;
}

async function removeRoom(roomId) {
  const yes = window.confirm('Delete this room? If it has bookings, deletion will be blocked.');
  if (!yes) return;

  try {
    await api(`/api/admin/rooms/${roomId}`, { method: 'DELETE' });
    await loadDashboard();
    setStatus(dom.roomStatus, 'Room deleted.');
  } catch (error) {
    setStatus(dom.roomStatus, error.message, false);
  }
}

async function updateBookingStatus(bookingId, action) {
  let payload = {};
  if (action === 'confirm') payload = { bookingStatus: 'confirmed' };
  if (action === 'cancel') payload = { bookingStatus: 'cancelled' };
  if (action === 'paid') payload = { paymentStatus: 'paid' };

  try {
    await api(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    await loadDashboard();
  } catch (error) {
    alert(error.message);
  }
}

async function loadDashboard() {
  const data = await api('/api/admin/dashboard');
  const bookingsPayload = await api('/api/admin/bookings');

  state.rooms = data.rooms;
  state.links = data.links;
  state.bookings = bookingsPayload.bookings;

  renderSummary(data.summary);
  populateSettings(data.settings);
  renderRooms();
  renderLinks();
  renderBookings();
}

async function handleLogin(event) {
  event.preventDefault();

  try {
    await api('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: dom.loginEmail.value.trim(),
        password: dom.loginPassword.value
      })
    });

    dom.loginWrap.hidden = true;
    dom.dashboard.hidden = false;
    dom.logoutBtn.hidden = false;
    setStatus(dom.loginStatus, 'Login successful.');

    await loadDashboard();
  } catch (error) {
    setStatus(dom.loginStatus, error.message, false);
  }
}

async function checkSessionAndInit() {
  try {
    await api('/api/admin/session');
    dom.loginWrap.hidden = true;
    dom.dashboard.hidden = false;
    dom.logoutBtn.hidden = false;
    await loadDashboard();
  } catch (error) {
    dom.loginWrap.hidden = false;
    dom.dashboard.hidden = true;
    dom.logoutBtn.hidden = true;
  }
}

dom.loginForm.addEventListener('submit', handleLogin);

dom.logoutBtn.addEventListener('click', async () => {
  try {
    await api('/api/admin/logout', { method: 'POST' });
  } catch (error) {
    // ignore logout errors
  }

  window.location.reload();
});

dom.settingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await api('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteName: dom.setSiteName.value.trim(),
        domain: dom.setDomain.value.trim(),
        headline: dom.setHeadline.value.trim(),
        subheadline: dom.setSubheadline.value.trim(),
        aboutText: dom.setAbout.value.trim(),
        address: dom.setAddress.value.trim(),
        mapLink: dom.setMapLink.value.trim(),
        contactPhone: dom.setPhone.value.trim(),
        contactEmail: dom.setEmail.value.trim(),
        checkInTime: dom.setCheckIn.value.trim(),
        checkOutTime: dom.setCheckOut.value.trim(),
        baseCurrency: dom.setCurrency.value.trim().toUpperCase(),
        logoText: dom.setLogoText.value.trim()
      })
    });

    setStatus(dom.settingsStatus, 'Site settings saved.');
    await loadDashboard();
  } catch (error) {
    setStatus(dom.settingsStatus, error.message, false);
  }
});

dom.heroUploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!dom.heroImage.files.length) {
    setStatus(dom.heroStatus, 'Select an image first.', false);
    return;
  }

  const formData = new FormData();
  formData.append('image', dom.heroImage.files[0]);

  try {
    await api('/api/admin/settings/hero-image', {
      method: 'POST',
      body: formData
    });

    setStatus(dom.heroStatus, 'Hero image uploaded with logo watermark.');
    dom.heroUploadForm.reset();
  } catch (error) {
    setStatus(dom.heroStatus, error.message, false);
  }
});

dom.roomForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: dom.roomName.value.trim(),
    shortDescription: dom.roomShort.value.trim(),
    longDescription: dom.roomLong.value.trim(),
    pricePerNightUsd: Number(dom.roomPrice.value),
    maxGuests: Number(dom.roomMax.value),
    sizeLabel: dom.roomSize.value.trim(),
    featured: dom.roomFeatured.checked,
    active: dom.roomActive.checked,
    amenities: parseAmenitiesText(dom.roomAmenities.value)
  };

  const roomId = dom.roomId.value.trim();

  try {
    if (roomId) {
      await api(`/api/admin/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setStatus(dom.roomStatus, 'Room updated successfully.');
    } else {
      await api('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setStatus(dom.roomStatus, 'Room added successfully.');
    }

    clearRoomForm();
    await loadDashboard();
  } catch (error) {
    setStatus(dom.roomStatus, error.message, false);
  }
});

dom.roomReset.addEventListener('click', clearRoomForm);

dom.roomImageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!dom.roomImageFile.files.length) {
    setStatus(dom.roomImageStatus, 'Select a room image.', false);
    return;
  }

  const roomId = dom.uploadRoomId.value;
  const formData = new FormData();
  formData.append('image', dom.roomImageFile.files[0]);
  formData.append('caption', dom.roomImageCaption.value.trim());

  try {
    await api(`/api/admin/rooms/${roomId}/images`, {
      method: 'POST',
      body: formData
    });

    setStatus(dom.roomImageStatus, 'Room photo uploaded and watermarked.');
    dom.roomImageForm.reset();
    await loadDashboard();
  } catch (error) {
    setStatus(dom.roomImageStatus, error.message, false);
  }
});

dom.addLinkRow.addEventListener('click', () => addLinkRow());

dom.saveLinks.addEventListener('click', async () => {
  const links = [...dom.linksFormWrap.querySelectorAll('.link-row')]
    .map((row, index) => {
      const inputs = row.querySelectorAll('input');
      return {
        platformName: inputs[0].value.trim(),
        url: inputs[1].value.trim(),
        icon: inputs[2].value.trim() || 'link',
        sortOrder: index + 1
      };
    })
    .filter((item) => item.platformName && item.url);

  try {
    await api('/api/admin/platform-links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links })
    });

    setStatus(dom.linksStatus, 'Platform links saved.');
    await loadDashboard();
  } catch (error) {
    setStatus(dom.linksStatus, error.message, false);
  }
});

checkSessionAndInit();

if (window.lucide) {
  window.lucide.createIcons();
}
