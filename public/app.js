const SUPPORTED_LANGUAGES = ['en', 'de'];

const translations = {
  en: {
    'nav.admin': 'Admin',
    'nav.bookNow': 'Book Now',
    'nav.home': 'Home',
    'nav.rooms': 'Rooms',
    'nav.eatSip': 'Eat & Sip',
    'nav.bomagawani': 'Bomagawani',
    'nav.offersPrices': 'Offers & Prices',
    'nav.contact': 'Contact',
    'home.heroKicker': 'Welcome to Bomagawani – Holiday & Adventure at the Swahili Coast.',
    'home.viewRooms': 'View Rooms',
    'home.exploreHouse': 'Explore the house',
    'home.welcome': 'Welcome',
    'home.welcomeTitle': 'Stay close to the coast with comfort, calm, and local care.',
    'home.welcomeBody': 'Enjoy quiet mornings, fresh ocean air, shaded veranda space, simple meals on request, and friendly help with arrival, directions, and booking details.',
    'booking.planStay': 'Plan your stay',
    'booking.checkAvailability': 'Check availability',
    'booking.search': 'Search',
    'form.stayDates': 'Stay dates',
    'form.adults': 'Adults',
    'form.children': 'Children',
    'date.selectRange': 'Select check-in and check-out',
    'date.selectArrival': 'Select your arrival date.',
    'date.selectDeparture': 'Now select your departure date.',
    'date.roomBooked': 'Already booked',
    'shortcut.stay': 'Stay',
    'shortcut.taste': 'Taste',
    'shortcut.discover': 'Discover',
    'shortcut.roomsText': 'Private rooms with photos, amenities, and direct booking.',
    'shortcut.roomsAction': 'Explore rooms',
    'shortcut.eatText': 'Fresh coastal foods, drinks, and meal preparation for your stay.',
    'shortcut.eatAction': 'View menu story',
    'shortcut.houseText': 'See the house details, location, and guest support.',
    'shortcut.houseAction': 'See details',
    'footer.tagline': 'Coastal stays, fresh flavors, easy booking.',
    'property.ourStory': 'Our Story',
    'property.bookViewing': 'Book Viewing',
    'property.requestPrice': 'Request Price',
    'property.requestVideoTour': 'Request Video Tour',
    'property.zoomHint': 'Tap to enlarge',
    'hero.roomsLabel': 'Ready to book',
    'hero.supportLabel': 'Guest support',
    'hero.locationLabel': 'Prime location',
    'intro.title': 'Stay in style with easy booking',
    'experience.rooms': 'Comfortable rooms',
    'experience.roomsText': 'Clear prices, photos, amenities, and instant booking requests.',
    'experience.food': 'Coastal food',
    'experience.foodText': 'Fresh meals and drinks shaped around guest plans.',
    'experience.place': 'House details',
    'experience.placeText': 'A property experience that feels personal, practical, and easy.',
    'amenities.title': 'Amenities At A Glance',
    'amenities.subtitle': 'Everything you need for a comfortable stay.',
    'booking.title': 'Book Direct on Bomagawani.com',
    'booking.subtitle': 'Select your room, dates, and currency. Your booking reference is prepared right away.',
    'form.room': 'Room',
    'form.checkIn': 'Check-in',
    'form.checkOut': 'Check-out',
    'form.guests': 'Guests',
    'form.currency': 'Currency',
    'form.paymentOption': 'Payment option',
    'form.payOnArrival': 'Pay on arrival',
    'form.bankTransfer': 'Bank transfer (30% deposit)',
    'form.bankTransferNote': 'Pay a 30% deposit of your total stay cost by bank transfer to secure this booking. The remaining balance is paid on arrival.',
    'form.showBankDetails': 'Show bank details',
    'form.iban': 'IBAN',
    'form.bic': 'BIC',
    'form.fullName': 'Full name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.note': 'Note (optional)',
    'form.notePlaceholder': 'Late arrival, special request',
    'form.submit': 'Send Booking Request',
    'offersPage.kicker': 'Offers & Prices',
    'offersPage.title': 'Offers & Prices at Bomagawani',
    'offersPage.subtitle': 'Choose the stay that suits you — a long, immersive Swahili retreat, a simple overnight, or camping right on the Indian Ocean.',
    'offersPage.retreat.title': 'Swahili Retreat — Long-Term Stay',
    'offersPage.retreat.body': 'Three weeks of swimming in the Indian Ocean, excursions and experiences, plus traditional Swahili cuisine and attentive, personal service. Half-board included — you discuss your wishes with us every morning.',
    'offersPage.retreat.price': '21 days — €840 per person',
    'offersPage.shortStay.title': 'Short Stays',
    'offersPage.shortStay.body': 'An overnight stay including breakfast, prepared entirely according to your wishes.',
    'offersPage.shortStay.price': '€39 per person',
    'offersPage.camping.title': 'Camping on the Indian Ocean',
    'offersPage.camping.body': 'Bring your own camping equipment — we provide a pitch directly on the Indian Ocean with showers and toilets. Overlanders are very welcome. Local cuisine (breakfast, dinner, and often BBQ) can be booked separately.',
    'offersPage.camping.price': '€8 per person, per night',
    'offersPage.paymentTitle': 'Payment for long-term stays:',
    'offersPage.paymentBody': '1/3 deposit before arrival, 2/3 upon departure. Bank transfer details are shown in the booking form below.',
    'offersPage.selectOffer': 'Select this offer',
    'offersPage.selectedLabel': 'Selected offer:',
    'tracking.title': 'Check your booking status',
    'tracking.code': 'Booking reference',
    'tracking.button': 'Check booking',
    'location.title': 'Location & direction',
    'location.openMap': 'Open Map',
    'location.route': 'Use my location for route',
    'channels.title': 'Also listed on travel channels',
    'chatbot.answerPlaceholder': 'Tap a question to get a quick answer.',
    'chatbot.toggle': 'Chat',
    'chatbot.whatsapp': 'Chat on WhatsApp',
    'quote.empty': 'Enter dates to see your price estimate.',
    'quote.loading': 'Calculating quote...',
    'quote.conflict': 'Those dates are already confirmed for this room. Please pick another date.',
    'quote.conflictNextAvailable': 'This room is booked for those dates. It is next available from {date}.',
    'quote.unavailable': 'Could not get quote.',
    'quote.serviceDown': 'Quote service unavailable. Try again.',
    'quote.nights': '{nights} night(s) x {price}',
    'quote.total': 'Total: {total}',
    'status.checkQuoteFirst': 'Please check dates and quote first.',
    'status.submittingBooking': 'Submitting booking request...',
    'status.bookingFailed': 'Booking failed.',
    'status.bookingServiceDown': 'Booking service is currently unavailable.',
    'status.phoneInvalid': 'Please enter a valid phone number for selected country code.',
    'status.phoneLengthRange': 'Phone number must be between {min} and {max} digits.',
    'status.bookingSuccessPrefix': 'Booking sent. Your reference is',
    'form.loadingCountryCodes': 'Loading dialing codes...',
    'footer.map': 'Map',
    'footer.email': 'Email',
    'footer.forBooking': 'For Booking',
    'footer.forInquiries': 'For Inquiries',
    'contact.call': 'Call',
    'eatSip.galleryCaption': 'Fresh coastal plates, prepared to order.',
    'status.openReceipt': 'Open receipt',
    'tracking.checking': 'Checking status...',
    'tracking.notFound': 'Booking not found.',
    'tracking.serviceDown': 'Tracking service unavailable.',
    'tracking.status': 'Status',
    'tracking.room': 'Room',
    'tracking.dates': 'Dates',
    'tracking.payment': 'Payment',
    'tracking.paymentOption': 'Payment option',
    'payment.pay_on_arrival': 'Pay on arrival',
    'payment.pay_online': 'Pay online',
    'payment.bank_transfer': 'Bank transfer (30% deposit)',
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
  de: {
    'nav.admin': 'Admin',
    'nav.bookNow': 'Jetzt buchen',
    'nav.home': 'Start',
    'nav.rooms': 'Zimmer',
    'nav.eatSip': 'Essen & Trinken',
    'nav.bomagawani': 'Bomagawani',
    'nav.offersPrices': 'Angebote & Preise',
    'nav.contact': 'Kontakt',
    'home.heroKicker': 'Willkommen bei Bomagawani – Urlaub & Abenteuer an der Swahili-Küste.',
    'home.viewRooms': 'Zimmer ansehen',
    'home.exploreHouse': 'Haus entdecken',
    'home.welcome': 'Willkommen',
    'home.welcomeTitle': 'Nah an der Küste wohnen: ruhig, bequem und persönlich betreut.',
    'home.welcomeBody': 'Genießen Sie ruhige Morgen, frische Meeresluft, schattige Veranda-Bereiche, einfache Mahlzeiten auf Anfrage und freundliche Hilfe bei Ankunft, Wegbeschreibung und Buchungsdetails.',
    'booking.planStay': 'Aufenthalt planen',
    'booking.checkAvailability': 'Verfügbarkeit prüfen',
    'booking.search': 'Suchen',
    'form.room': 'Zimmer',
    'form.checkIn': 'Anreise',
    'form.checkOut': 'Abreise',
    'form.stayDates': 'Reisedaten',
    'form.adults': 'Erwachsene',
    'form.children': 'Kinder',
    'form.guests': 'Gäste',
    'form.currency': 'Währung',
    'form.paymentOption': 'Zahlungsart',
    'form.payOnArrival': 'Bei Ankunft bezahlen',
    'form.bankTransfer': 'Banküberweisung (30% Anzahlung)',
    'form.bankTransferNote': 'Zahlen Sie 30% Anzahlung der Gesamtkosten per Banküberweisung, um diese Buchung zu sichern. Der Restbetrag wird bei Ankunft bezahlt.',
    'form.showBankDetails': 'Bankdaten anzeigen',
    'form.iban': 'IBAN',
    'form.bic': 'BIC',
    'form.fullName': 'Vollständiger Name',
    'form.email': 'E-Mail',
    'form.phone': 'Telefon',
    'form.note': 'Notiz (optional)',
    'form.notePlaceholder': 'Späte Ankunft, besonderer Wunsch',
    'form.submit': 'Buchungsanfrage senden',
    'date.selectRange': 'Anreise und Abreise auswählen',
    'date.selectArrival': 'Wählen Sie Ihr Anreisedatum.',
    'date.selectDeparture': 'Wählen Sie jetzt Ihr Abreisedatum.',
    'date.roomBooked': 'Bereits gebucht',
    'shortcut.stay': 'Wohnen',
    'shortcut.taste': 'Genießen',
    'shortcut.discover': 'Entdecken',
    'shortcut.roomsText': 'Private Zimmer mit Fotos, Ausstattung und direkter Buchung.',
    'shortcut.roomsAction': 'Zimmer entdecken',
    'shortcut.eatText': 'Frische Küstengerichte, Getränke und Mahlzeiten nach Wunsch.',
    'shortcut.eatAction': 'Speisen ansehen',
    'shortcut.houseText': 'Hausdetails, Lage und Gästeservice ansehen.',
    'shortcut.houseAction': 'Details ansehen',
    'footer.tagline': 'Küstenaufenthalt, frische Küche, einfache Buchung.',
    'property.ourStory': 'Unsere Geschichte',
    'property.bookViewing': 'Besichtigung buchen',
    'property.requestPrice': 'Preis anfragen',
    'property.requestVideoTour': 'Videoführung anfragen',
    'property.zoomHint': 'Zum Vergrößern tippen',
    'amenities.title': 'Ausstattung auf einen Blick',
    'amenities.subtitle': 'Alles, was Sie für einen angenehmen Aufenthalt brauchen.',
    'booking.title': 'Direkt auf Bomagawani.com buchen',
    'booking.subtitle': 'Wählen Sie Zimmer, Reisedaten und Währung. Ihre Buchungsreferenz wird sofort vorbereitet.',
    'offersPage.kicker': 'Angebote & Preise',
    'offersPage.title': 'Angebote & Preise bei Bomagawani',
    'offersPage.subtitle': 'Wählen Sie den passenden Aufenthalt — ein langes, intensives Swahili Retreat, einen einfachen Übernachtungsaufenthalt oder Camping direkt am Indischen Ozean.',
    'offersPage.retreat.title': 'Swahili Retreat — Langzeitaufenthalt',
    'offersPage.retreat.body': 'Drei Wochen Baden im Indischen Ozean, Ausflüge und Erlebnisse sowie traditionelle Swahili-Küche und aufmerksamer, persönlicher Service. Halbpension inklusive — Ihre Wünsche besprechen wir jeden Morgen mit Ihnen.',
    'offersPage.retreat.price': '21 Tage — 840 € pro Person',
    'offersPage.shortStay.title': 'Kurzaufenthalte',
    'offersPage.shortStay.body': 'Eine Übernachtung inklusive Frühstück, ganz nach Ihren Wünschen zubereitet.',
    'offersPage.shortStay.price': '39 € pro Person',
    'offersPage.camping.title': 'Camping am Indischen Ozean',
    'offersPage.camping.body': 'Bringen Sie Ihre eigene Campingausrüstung mit — wir stellen Ihnen einen Stellplatz direkt am Indischen Ozean mit Duschen und Toiletten zur Verfügung. Overlander sind ebenfalls sehr willkommen. Lokale Küche (Frühstück, Abendessen, oft auch BBQ) kann separat gebucht werden.',
    'offersPage.camping.price': '8 € pro Person und Nacht',
    'offersPage.paymentTitle': 'Zahlung für Langzeitaufenthalte:',
    'offersPage.paymentBody': '1/3 Anzahlung vor Anreise, 2/3 bei Abreise. Die Bankdaten finden Sie im Buchungsformular unten.',
    'offersPage.selectOffer': 'Dieses Angebot wählen',
    'offersPage.selectedLabel': 'Ausgewähltes Angebot:',
    'tracking.title': 'Buchungsstatus prüfen',
    'tracking.code': 'Buchungsreferenz',
    'tracking.button': 'Buchung prüfen',
    'location.title': 'Lage & Wegbeschreibung',
    'location.openMap': 'Karte öffnen',
    'location.route': 'Meinen Standort für Route nutzen',
    'channels.title': 'Auch auf Reisekanälen gelistet',
    'chatbot.answerPlaceholder': 'Tippen Sie auf eine Frage für eine schnelle Antwort.',
    'chatbot.toggle': 'Chat',
    'chatbot.whatsapp': 'Auf WhatsApp schreiben',
    'quote.empty': 'Reisedaten eingeben, um den Preis zu sehen.',
    'quote.loading': 'Preis wird berechnet...',
    'quote.conflict': 'Diese Daten sind für dieses Zimmer bereits bestätigt. Bitte wählen Sie andere Daten.',
    'quote.conflictNextAvailable': 'Dieses Zimmer ist für diese Daten gebucht. Nächste Verfügbarkeit ab {date}.',
    'quote.unavailable': 'Preis konnte nicht geladen werden.',
    'quote.serviceDown': 'Preisservice nicht erreichbar. Bitte erneut versuchen.',
    'quote.nights': '{nights} Nacht/Nächte x {price}',
    'quote.total': 'Gesamt: {total}',
    'status.checkQuoteFirst': 'Bitte zuerst Daten und Preis prüfen.',
    'status.submittingBooking': 'Buchungsanfrage wird gesendet...',
    'status.bookingFailed': 'Buchung fehlgeschlagen.',
    'status.bookingServiceDown': 'Der Buchungsservice ist derzeit nicht erreichbar.',
    'status.phoneInvalid': 'Bitte eine gültige Telefonnummer für die gewählte Ländervorwahl eingeben.',
    'status.phoneLengthRange': 'Telefonnummer muss zwischen {min} und {max} Ziffern haben.',
    'status.bookingSuccessPrefix': 'Buchung gesendet. Ihre Referenz ist',
    'form.loadingCountryCodes': 'Ländervorwahlen werden geladen...',
    'footer.map': 'Karte',
    'footer.email': 'E-Mail',
    'footer.forBooking': 'Für Buchungen',
    'footer.forInquiries': 'Für Anfragen',
    'contact.call': 'Anrufen',
    'eatSip.galleryCaption': 'Frische Küstengerichte, auf Bestellung zubereitet.',
    'status.openReceipt': 'Beleg öffnen',
    'tracking.checking': 'Status wird geprüft...',
    'tracking.notFound': 'Buchung nicht gefunden.',
    'tracking.serviceDown': 'Statusservice nicht erreichbar.',
    'tracking.status': 'Status',
    'tracking.room': 'Zimmer',
    'tracking.dates': 'Daten',
    'tracking.payment': 'Zahlung',
    'tracking.paymentOption': 'Zahlungsart',
    'payment.pay_on_arrival': 'Bei Ankunft bezahlen',
    'payment.pay_online': 'Online bezahlen',
    'payment.bank_transfer': 'Banküberweisung (30% Anzahlung)',
    'location.noSupport': 'Standortbestimmung wird auf diesem Gerät nicht unterstützt.',
    'location.reading': 'Standort wird gelesen...',
    'location.ready': 'Routenlink ist bereit. Tippen Sie auf Karte öffnen.',
    'location.failed': 'Standort konnte nicht gelesen werden. Bitte Berechtigung erlauben und erneut versuchen.',
    'languagePrompt.title': 'Sprache wechseln?',
    'languagePrompt.body': 'Wir haben Ihre Regionalsprache erkannt ({language}). Möchten Sie wechseln?',
    'languagePrompt.yes': 'Wechseln',
    'languagePrompt.no': 'Englisch behalten',
    'installPrompt.title': 'Bomagawani App installieren?',
    'installPrompt.body': 'Zum Startbildschirm hinzufügen für schnelleres Buchen.',
    'installPrompt.yes': 'Installieren',
    'installPrompt.no': 'Nicht jetzt'
  }
};

const languageConfig = {
  en: { label: 'English', locale: 'en-US', currency: 'USD' },
  de: { label: 'Deutsch', locale: 'de-DE', currency: 'EUR' }
};

const PROPERTY_COORDS = { lat: -5.271996, lng: 39.067501 };

const fallbackExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  TZS: 2600,
  AED: 3.67,
  KES: 129
};

const PROPERTY_GALLERY_IMAGES = [
  {
    src: '/uploads/property/property-house-front.webp',
    thumb: '/uploads/property/property-house-front-thumb.webp',
    alt: 'Full front view of Bomagawani House'
  },
  {
    src: '/uploads/property/property-entrance.webp',
    thumb: '/uploads/property/property-entrance-thumb.webp',
    alt: 'Front entrance and garden steps'
  },
  {
    src: '/uploads/property/property-veranda-exterior.webp',
    thumb: '/uploads/property/property-veranda-exterior-thumb.webp',
    alt: 'Side veranda and garden flowers'
  },
  {
    src: '/uploads/property/property-veranda-lounge.webp',
    thumb: '/uploads/property/property-veranda-lounge-thumb.webp',
    alt: 'Shaded veranda lounge and dining space'
  },
  {
    src: '/uploads/property/property-veranda-dining.webp',
    thumb: '/uploads/property/property-veranda-dining-thumb.webp',
    alt: 'Veranda dining with green garden view'
  },
  {
    src: '/uploads/property/property-dining-hall.webp',
    thumb: '/uploads/property/property-dining-hall-thumb.webp',
    alt: 'Indoor dining hall and fridge'
  },
  {
    src: '/uploads/property/property-garden-sea-view.webp',
    thumb: '/uploads/property/property-garden-sea-view-thumb.webp',
    alt: 'Garden with trees and coastal view'
  },
  {
    src: '/uploads/property/property-garden-path.webp',
    thumb: '/uploads/property/property-garden-path-thumb.webp',
    alt: 'Green garden path around the property'
  },
  {
    src: '/uploads/property/property-coast-sunset.webp',
    thumb: '/uploads/property/property-coast-sunset-thumb.webp',
    alt: 'Nearby coast sunset view'
  }
];

const copyTranslations = {
  de: {
    'Bomagawani House Rent': 'Bomagawani Hausvermietung',
    'A calm Kigombe retreat with private rooms, fresh local meals, shaded veranda living, and simple direct booking.': 'Ein ruhiger Rückzugsort in Kigombe mit privaten Zimmern, frischen lokalen Mahlzeiten, schattiger Veranda und einfacher Direktbuchung.',
    'A calm Kigombe retreat with private rooms, fresh local meals, shaded veranda living, and simple booking.': 'Ein ruhiger Rückzugsort in Kigombe mit privaten Zimmern, frischen lokalen Mahlzeiten, schattiger Veranda und einfacher Buchung.',
    'Experience the unspoiled beauty of the Swahili Coast in northern Tanzania. Located directly on the Indian Ocean, a place of tranquility, warm hospitality, and unique natural beauty awaits you. Whether you\'re looking for a relaxing holiday, camping by the sea, or unforgettable discoveries – Bomagawani is your home away from home on the East African coast.': 'Erleben Sie die unberührte Schönheit der Swahili-Küste im Norden Tansanias. Direkt am Indischen Ozean gelegen, erwartet Sie ein Ort der Ruhe, herzlicher Gastfreundschaft und einzigartiger Naturschönheit. Ob entspannter Urlaub, Camping am Meer oder unvergessliche Entdeckungen – Bomagawani ist Ihr Zuhause fernab der Heimat an der ostafrikanischen Küste.',
    'Our Rooms': 'Unsere Zimmer',
    'Master Bedroom': 'Master-Schlafzimmer',
    'Guest Room': 'Gästezimmer',
    'Premium private suite with balcony and ocean breeze.': 'Premium-Privatzimmer mit Balkon und Meeresbrise.',
    'Comfortable and affordable room for short or long stays.': 'Komfortables und bezahlbares Zimmer für kurze oder längere Aufenthalte.',
    'Private coastal room': 'Privates Küstenzimmer',
    'Featured stay': 'Empfohlener Aufenthalt',
    'Direct booking': 'Direktbuchung',
    'Check dates': 'Daten prüfen',
    'Fast Wi-Fi': 'Schnelles WLAN',
    'Beach View': 'Blick Richtung Küste',
    'Smart TV': 'Smart-TV',
    'Sea Food': 'Meeresfrüchte',
    'Fresh Air': 'Frische Luft',
    'Swimming': 'Schwimmen',
    'Electricity 24hrs': 'Strom rund um die Uhr',
    'Drinks': 'Getränke',
    'Ceiling Fan': 'Deckenventilator',
    'Wardrobe': 'Kleiderschrank',
    'Eat & Sip': 'Essen & Trinken',
    'Bomagawani': 'Bomagawani',
    'Contact': 'Kontakt',
    'Quick Help': 'Schnelle Hilfe',
    'Hi. Ask me anything about rooms, prices, check-in, or booking.': 'Hallo. Fragen Sie mich zu Zimmern, Preisen, Check-in oder Buchung.',
    'Hi. Ask me anything about rooms, prices, arrival, or booking.': 'Hallo. Fragen Sie mich zu Zimmern, Preisen, Anreise oder Buchung.',
    'Call Us': 'Anrufen',
    'Email': 'E-Mail',
    'Map': 'Karte',
    'Open Map': 'Karte öffnen',
    'Full front view of Bomagawani House': 'Vollständige Vorderansicht des Bomagawani-Hauses',
    'Front entrance and garden steps': 'Vordereingang und Gartentreppe',
    'Side veranda and garden flowers': 'Seitliche Veranda und Gartenblumen',
    'Shaded veranda lounge and dining space': 'Schattige Veranda mit Lounge- und Essbereich',
    'Veranda dining with green garden view': 'Essen auf der Veranda mit grünem Gartenblick',
    'Indoor dining hall and fridge': 'Innen-Essbereich und Kühlschrank',
    'Garden with trees and coastal view': 'Garten mit Bäumen und Küstenblick',
    'Green garden path around the property': 'Grüner Gartenweg rund um das Grundstück',
    'Nearby coast sunset view': 'Sonnenuntergang an der nahen Küste',
    'Bomagawani – The Exclusive Villa on the Indian Ocean': 'Bomagawani – Die exklusive Villa am Indischen Ozean',
    'An exceptional villa in a stunning location awaits you directly on the Swahili Coast. Surrounded by tropical nature and the turquoise waters of the Indian Ocean, it combines traditional architecture with modern comfort – a place for peace, relaxation, and unforgettable moments.': 'Eine außergewöhnliche Villa in atemberaubender Lage erwartet Sie direkt an der Swahili-Küste. Umgeben von tropischer Natur und dem türkisfarbenen Wasser des Indischen Ozeans, verbindet sie traditionelle Architektur mit modernem Komfort – ein Ort der Ruhe, Entspannung und unvergesslicher Momente.',
    'Bomagawani was born from a shared dream of Eva and Hermann. With great passion, personal commitment, and genuine hospitality, we have created a place where guests from all over the world feel welcome and at home.': 'Bomagawani entstand aus einem gemeinsamen Traum von Eva und Hermann. Mit großer Leidenschaft, persönlichem Einsatz und echter Gastfreundschaft haben wir einen Ort geschaffen, an dem sich Gäste aus aller Welt willkommen und zu Hause fühlen.',
    'Traditional Afro-Arab architecture with modern comfort': 'Traditionelle afro-arabische Architektur mit modernem Komfort',
    'Private rooms and guest-ready layout': 'Private Zimmer und gastfertiger Grundriss',
    'Near Tanzania’s northern Swahili Coast': 'In der Nähe von Tansanias nördlicher Swahili-Küste',
    "Near Tanzania's northern Swahili Coast": 'In der Nähe von Tansanias nördlicher Swahili-Küste',
    'Viewing, photos, and video tour available on request': 'Besichtigung, Fotos und Videotour auf Anfrage verfügbar',
    'Excursions': 'Ausflüge',
    'Kigombe – Excursions & Experiences': 'Kigombe – Ausflüge & Erlebnisse',
    'Discover the fascinating diversity of the Kigombe region. Dreamlike beaches, mangroves, traditional fishing villages, the Coelacanth Marine Park, and many other destinations will make your stay an unforgettable experience.': 'Entdecken Sie die faszinierende Vielfalt der Region Kigombe. Traumhafte Strände, Mangroven, traditionelle Fischerdörfer, der Coelacanth-Meerespark und viele weitere Ziele machen Ihren Aufenthalt zu einem unvergesslichen Erlebnis.',
    'Comfort & Style': 'Komfort & Stil',
    'Enjoy your stay in our comfortable rooms furnished in a traditional Afro-Arab style. Spacious rooms, shaded verandas, and the peaceful location create the ideal setting for relaxing days on the Indian Ocean.': 'Genießen Sie Ihren Aufenthalt in unseren komfortablen Zimmern im traditionellen afro-arabischen Stil. Geräumige Zimmer, schattige Veranden und die ruhige Lage schaffen den idealen Rahmen für erholsame Tage am Indischen Ozean.',
    'Bomagawani For Sale': 'Bomagawani zu verkaufen',
    "After many years of passionately building and developing Bomagawani, Hermann has decided that it is time to enjoy more personal freedom and pursue new plans for the future. For this reason, this exceptional villa on Tanzania's beautiful Swahili Coast is now offered for sale.": 'Nach vielen Jahren leidenschaftlichen Aufbaus und der Weiterentwicklung von Bomagawani hat Hermann entschieden, dass es Zeit ist, mehr persönliche Freiheit zu genießen und neue Zukunftspläne zu verfolgen. Aus diesem Grund wird diese außergewöhnliche Villa an Tansanias wunderschöner Swahili-Küste nun zum Verkauf angeboten.',
    'Built to a high standard of quality, the villa combines spacious living with the unique atmosphere of the Indian Ocean. It is the perfect home for those seeking peace, nature, and the relaxed lifestyle that makes the Swahili Coast such a special place to live.': 'Mit hohem Qualitätsstandard erbaut, verbindet die Villa großzügiges Wohnen mit der einzigartigen Atmosphäre des Indischen Ozeans. Sie ist das perfekte Zuhause für alle, die Ruhe, Natur und den entspannten Lebensstil suchen, der die Swahili-Küste zu einem so besonderen Ort zum Leben macht.',
    'If you are interested in this unique property, Hermann or Eva will be delighted to provide you with further information and arrange a personal viewing. The asking price is negotiable.': 'Wenn Sie an dieser einzigartigen Immobilie interessiert sind, geben Ihnen Hermann oder Eva gerne weitere Informationen und vereinbaren eine persönliche Besichtigung. Der Verkaufspreis ist verhandelbar.',
    'Key details from the property notes are kept simple here so buyers can understand the house quickly.': 'Die wichtigsten Details aus den Objektnotizen sind hier einfach gehalten, damit Käufer das Haus schnell verstehen.',
    'Property Notes': 'Objektnotizen',
    'A coastal home shaped by nature, shade, and slow living.': 'Ein Küstenhaus geprägt von Natur, Schatten und ruhigem Leben.',
    'Bomagawani sits in a peaceful coastal environment near Tanga, with house details suited to warm weather and relaxed stays.': 'Bomagawani liegt in einer ruhigen Küstenumgebung nahe Tanga, mit Hausdetails für warmes Wetter und entspannte Aufenthalte.',
    'Marine coast setting': 'Lage an der Meeresküste',
    'Located along Tanzania’s northern Swahili Coast near the protected Coelacanth marine park, with mangroves, clear water, and quiet natural surroundings.': 'An Tansanias nördlicher Swahili-Küste nahe dem geschützten Coelacanth-Meerespark gelegen, mit Mangroven, klarem Wasser und ruhiger Natur.',
    'Afro-Arabian character': 'Afro-arabischer Charakter',
    'The house style highlights shaded veranda living, high ceilings, and natural airflow for warm coastal weather.': 'Der Hausstil betont schattige Veranda-Bereiche, hohe Decken und natürliche Luftzirkulation für warmes Küstenklima.',
    'Easy Tanga access': 'Einfacher Zugang nach Tanga',
    'Tanga is about 30 km away, with markets, fresh produce, banks, doctors, shopping, airport, and port access for guests and supplies.': 'Tanga ist etwa 30 km entfernt und bietet Märkte, frische Produkte, Banken, Ärzte, Einkaufsmöglichkeiten, Flughafen und Hafen.',
    'Practical essentials': 'Praktische Grundlagen',
    'Guest essentials include power support, cooking water, bottled drinking water, simple waste handling, and mobile phone connectivity.': 'Zu den Grundlagen gehören Stromunterstützung, Kochwasser, Trinkwasser in Flaschen, einfache Abfallentsorgung und Mobilfunkempfang.',
    'Eat & Sip by the Coast': 'Essen & Trinken an der Küste',
    'Fresh coastal foods, cool drinks, and flavors prepared with local care.': 'Frische Küstengerichte, kühle Getränke und lokale Aromen mit Sorgfalt zubereitet.',
    'Request Food Booking': 'Essensanfrage senden',
    'Ask what is available today': 'Heute verfügbares Essen anfragen',
    'Coastal Kitchen': 'Küstenküche',
    'Come for food, drinks, or both.': 'Kommen Sie zum Essen, Trinken oder beides.',
    'Dine In': 'Vor Ort essen',
    'Come just to eat': 'Einfach zum Essen kommen',
    'Guests can visit for a prepared meal without booking a room, depending on kitchen availability.': 'Gäste können je nach Küchenverfügbarkeit auch ohne Zimmerbuchung für eine vorbereitete Mahlzeit vorbeikommen.',
    'Refreshments': 'Erfrischungen',
    'Drinks & easy bites': 'Getränke & kleine Speisen',
    'Fresh juice, tea, coffee, water, soft drinks, and simple snacks can be arranged for relaxed visits.': 'Frischer Saft, Tee, Kaffee, Wasser, Softdrinks und einfache Snacks können für entspannte Besuche arrangiert werden.',
    'On Request': 'Auf Anfrage',
    'Meal booking': 'Mahlzeit buchen',
    'Request breakfast, lunch, dinner, or a small group meal in advance so ingredients are prepared well.': 'Frühstück, Mittagessen, Abendessen oder eine kleine Gruppenmahlzeit bitte vorab anfragen, damit Zutaten gut vorbereitet werden.',
    'Tanzania Coastal Taste': 'Geschmack der tansanischen Küste',
    'Simple food with Swahili Coast flavor.': 'Einfache Küche mit Geschmack der Swahili-Küste.',
    'Food is prepared around local ingredients, clean kitchen care, and what guests want to enjoy that day.': 'Das Essen richtet sich nach lokalen Zutaten, sauberer Küchenarbeit und den Wünschen der Gäste.',
    'Seafood & grilled plates': 'Meeresfrüchte & Grillgerichte',
    'Fish, prawns when available, grilled bites, sauces, lemon, coconut notes, and coastal-style sides.': 'Fisch, Garnelen nach Verfügbarkeit, Grillgerichte, Saucen, Zitrone, Kokosnoten und Beilagen im Küstenstil.',
    'Rice, pilau & home meals': 'Reis, Pilau & Hausgerichte',
    'Comforting rice dishes, pilau-style flavors, vegetables, beans, soups, and homestyle plates.': 'Wärmende Reisgerichte, Pilau-Aromen, Gemüse, Bohnen, Suppen und hausgemachte Tellergerichte.',
    'Breakfast & tea time': 'Frühstück & Teezeit',
    'Tea, coffee, fruit, bread, eggs on request, fresh juice, and light morning options.': 'Tee, Kaffee, Obst, Brot, Eier auf Anfrage, frischer Saft und leichte Morgenoptionen.',
    'Fresh drinks': 'Frische Getränke',
    'Tropical juices, water, soft drinks, evening refreshments, and simple drinks for guests visiting.': 'Tropische Säfte, Wasser, Softdrinks, Erfrischungen am Abend und einfache Getränke für Besucher.',
    'Food Booking': 'Essen buchen',
    'Tell us what you want to eat or drink.': 'Sagen Sie uns, was Sie essen oder trinken möchten.',
    'Send a request for dine-in food, guest meals, drinks, or a small group plan. We will confirm what is available and the best preparation time.': 'Senden Sie eine Anfrage für Essen vor Ort, Gästemahlzeiten, Getränke oder eine kleine Gruppe. Wir bestätigen Verfügbarkeit und passende Vorbereitungszeit.',
    'Fresh ingredients, regional specialties, and warm hospitality make every meal a special experience. Look forward to freshly caught fish, tropical fruits, and lovingly prepared dishes in a relaxed atmosphere.': 'Frische Zutaten, regionale Spezialitäten und herzliche Gastfreundschaft machen jede Mahlzeit zu einem besonderen Erlebnis. Freuen Sie sich auf frisch gefangenen Fisch, tropische Früchte und liebevoll zubereitete Gerichte in entspannter Atmosphäre.',
    'Eat & Sip is for house guests and visitors who want simple coastal food, fresh drinks, or both together. Come for a meal, arrange breakfast, request lunch or dinner, or ask for a small food plan prepared around available local ingredients.': 'Eat & Sip ist für Hausgäste und Besucher gedacht, die einfache Küstenküche, frische Getränke oder beides zusammen genießen möchten. Kommen Sie zum Essen, vereinbaren Sie Frühstück, fragen Sie Mittag- oder Abendessen an oder bitten Sie um einen kleinen Speiseplan nach verfügbaren lokalen Zutaten.',
    'Visitors can come just to eat, drink, or enjoy both together': 'Besucher können einfach nur zum Essen, Trinken oder für beides zusammen kommen',
    'On-request breakfast, lunch, dinner, and small group meals': 'Frühstück, Mittagessen, Abendessen und kleine Gruppenmahlzeiten auf Anfrage',
    'Tanzania coastal-style seafood, rice dishes, tea, coffee, and fresh juices': 'Meeresfrüchte, Reisgerichte, Tee, Kaffee und frische Säfte im Küstenstil Tansanias',
    'Food preparation is confirmed based on availability and guest plans': 'Die Zubereitung wird je nach Verfügbarkeit und Gästewunsch bestätigt',
    'House For Sale': 'Haus zu verkaufen',
    'Price on request': 'Preis auf Anfrage',
    'Book a Viewing': 'Besichtigung buchen',
    'Request price': 'Preis anfragen',
    'Ask for sale details': 'Verkaufsdetails anfragen',
    'Request the full house details, viewing time, photos, and video tour before visiting.': 'Fordern Sie vor dem Besuch vollständige Hausdetails, Besichtigungstermin, Fotos und Videotour an.',
    'Video Tour': 'Videotour',
    'Walk-through video on request': 'Rundgangsvideo auf Anfrage',
    'Ask for a video tour of the house, rooms, and outdoor spaces before you plan a visit.': 'Fragen Sie vor Ihrem Besuch nach einer Videotour durch das Haus, die Zimmer und die Außenbereiche.',
    'Gallery Ready': 'Galerie bereit',
    'Photos before you visit': 'Fotos vor Ihrem Besuch',
    'See bedrooms, veranda areas, and the surrounding coastal setting through photos shared on request.': 'Sehen Sie Schlafzimmer, Verandabereiche und die Küstenumgebung anhand von Fotos, die auf Anfrage geteilt werden.',
    'A coastal home shaped for shade, airflow, and practical living.': 'Ein Küstenhaus, gestaltet für Schatten, Luftzirkulation und praktisches Wohnen.',
    'Located around Tanzania’s northern Swahili Coast near the protected Coelacanth marine park, with a calm natural setting.': 'Gelegen an Tansanias nördlicher Swahili-Küste nahe dem geschützten Coelacanth-Meerespark, in ruhiger Natur.',
    'Shaded veranda living, high ceilings, and natural airflow support comfortable coastal living.': 'Schattige Veranda-Bereiche, hohe Decken und natürliche Luftzirkulation unterstützen komfortables Küstenwohnen.',
    'Tanga is about 30 km away, with markets, fresh produce, banks, doctors, shopping, airport, and port access.': 'Tanga ist etwa 30 km entfernt und bietet Märkte, frische Produkte, Banken, Ärzte, Einkaufsmöglichkeiten, Flughafen und Hafen.',
    'Property notes mention power support, well water, bottled drinking water, simple waste handling, and mobile connectivity.': 'Die Objektnotizen erwähnen Stromunterstützung, Brunnenwasser, Trinkwasser in Flaschen, einfache Abfallentsorgung und Mobilfunkempfang.',
    'Contact Bomagawani': 'Bomagawani kontaktieren',
    'We look forward to welcoming you to Bomagawani.': 'Wir freuen uns, Sie in Bomagawani willkommen zu heißen.',
    'We are happy to answer your questions and help you plan your stay. Contact us – we will assist you personally and easily with your booking.': 'Wir beantworten gerne Ihre Fragen und helfen Ihnen bei der Planung Ihres Aufenthalts. Kontaktieren Sie uns – wir unterstützen Sie persönlich und unkompliziert bei Ihrer Buchung.',
    'Best for quick inquiry': 'Ideal für schnelle Anfragen',
    'Rooms, food, directions, or house viewing.': 'Zimmer, Essen, Wegbeschreibung oder Hausbesichtigung.',
    'Tell us what you need and when you plan to visit.': 'Sagen Sie uns, was Sie brauchen und wann Sie kommen möchten.',
    'Stay inquiry': 'Anfrage zum Aufenthalt',
    'Ask about rooms, available dates, prices, and arrival time.': 'Fragen Sie nach Zimmern, verfügbaren Daten, Preisen und Ankunftszeit.',
    'Food inquiry': 'Essensanfrage',
    'Request food, drinks, breakfast, dinner, or a small meal plan.': 'Fragen Sie Essen, Getränke, Frühstück, Abendessen oder einen kleinen Essensplan an.',
    'House sale viewing': 'Hausbesichtigung zum Kauf',
    'Ask for sale details, viewing time, photos, video, and buyer information.': 'Fragen Sie nach Verkaufsdetails, Besichtigungszeit, Fotos, Video und Käuferinformationen.',
    'Room booking and arrival questions': 'Fragen zu Zimmerbuchung und Anreise',
    'Food and drink requests': 'Anfragen zu Essen und Getränken',
    'House sale viewing appointments': 'Besichtigungstermine für den Hauskauf',
    'Photos, video, map, and buyer details': 'Fotos, Video, Karte und Käuferdetails',
    'Which rooms are available?': 'Welche Zimmer sind verfügbar?',
    'Master Bedroom and Guest Room are available. More can be added by admin.': 'Derzeit sind das Master Bedroom und das Guest Room verfügbar.',
    'Master Bedroom and Guest Room are currently available.': 'Derzeit sind das Master Bedroom und das Guest Room verfügbar.',
    'What time is check-in and check-out?': 'Wann sind Anreise und Abreise?',
    'Check-in starts at 14:00 and check-out is 11:00.': 'Die Anreise beginnt um 14:00 Uhr und die Abreise ist um 11:00 Uhr.',
    'How can I confirm my booking?': 'Wie bestätige ich meine Buchung?',
    'Submit your booking request and our team will confirm quickly. You get a booking code instantly.': 'Senden Sie Ihre Buchungsanfrage, und unser Team bestätigt schnell. Sie erhalten sofort eine Buchungsreferenz.',
    'Submit your booking request and our team will confirm quickly. You receive a booking reference right away.': 'Senden Sie Ihre Buchungsanfrage, und unser Team bestätigt schnell. Sie erhalten sofort eine Buchungsreferenz.',
    'Hello Bomagawani, I need help with booking.': 'Hallo Bomagawani, ich brauche Hilfe bei einer Buchung.',
    'Enter dates to check availability.': 'Reisedaten eingeben, um die Verfügbarkeit zu prüfen.',
    'Loading country codes...': 'Ländervorwahlen werden geladen...',
    'Book Direct': 'Direkt buchen',
    'Booking.com': 'Booking.com',
    'Tripadvisor': 'Tripadvisor',
    'Google Travel': 'Google Travel',
    'Call': 'Anrufen',
    'Chat': 'Chat'
  }
};

const originalTextNodes = new WeakMap();

const state = {
  settings: null,
  rooms: [],
  links: [],
  contentPages: [],
  currentPage: 'home',
  heroSlides: [],
  activeHeroImages: [],
  chatbot: null,
  chatbotFaqs: [],
  currencies: ['USD', 'EUR', 'GBP', 'AED', 'TZS', 'KES'],
  exchangeRates: { USD: 1 },
  currentQuote: null,
  deferredInstallPrompt: null,
  language: localStorage.getItem('preferred_language') || 'en',
  roomSlideIntervals: {},
  heroInterval: null,
  heroIndex: 0,
  propertyGalleryIndex: 0,
  propertyLightboxOpen: false,
  currencyManuallySet: false,
  heroRangePickerMonth: null,
  bookingRangePickerMonth: null
};

if (!SUPPORTED_LANGUAGES.includes(state.language)) {
  state.language = 'en';
}

const dom = {
  hero: document.getElementById('hero'),
  heroSlider: document.getElementById('hero-slider'),
  heroPrev: document.getElementById('hero-prev'),
  heroNext: document.getElementById('hero-next'),
  heroDots: document.getElementById('hero-dots'),
  headline: document.getElementById('headline'),
  subheadline: document.getElementById('subheadline'),
  aboutText: document.getElementById('about-text'),
  footerText: document.getElementById('footer-text'),
  footerCopyright: document.getElementById('footer-copyright'),
  mapLink: document.getElementById('map-link'),
  mapEmbed: document.getElementById('map-embed'),
  locationLine: document.getElementById('location-line'),
  locationStatus: document.getElementById('location-status'),
  platformLinks: document.getElementById('platform-links'),
  channelList: document.getElementById('channel-list'),
  roomsGrid: document.getElementById('rooms-grid'),
  amenityWall: document.getElementById('amenity-wall'),
  eatSipSection: document.getElementById('eat-sip-section'),
  eatSipNav: document.getElementById('eat-sip-nav'),
  eatSipTitle: document.getElementById('eat-sip-title'),
  eatSipSubtitle: document.getElementById('eat-sip-subtitle'),
  eatSipBody: document.getElementById('eat-sip-body'),
  eatSipHighlights: document.getElementById('eat-sip-highlights'),
  eatSipImage: document.getElementById('eat-sip-image'),
  eatSipGalleryMain: document.getElementById('eat-sip-gallery-main'),
  eatSipRequestLink: document.getElementById('eat-sip-request-link'),
  propertySection: document.getElementById('property-section'),
  propertyNav: document.getElementById('property-nav'),
  propertyTitle: document.getElementById('property-title'),
  propertySubtitle: document.getElementById('property-subtitle'),
  propertyBody: document.getElementById('property-body'),
  propertyHighlights: document.getElementById('property-highlights'),
  propertyImage: document.getElementById('property-image'),
  propertyImageCaption: document.getElementById('property-image-caption'),
  propertyGalleryCount: document.getElementById('property-gallery-count'),
  propertyGalleryThumbs: document.getElementById('property-gallery-thumbs'),
  propertyGalleryPrev: document.getElementById('property-gallery-prev'),
  propertyGalleryNext: document.getElementById('property-gallery-next'),
  propertyGalleryStage: document.getElementById('property-gallery-stage'),
  propertyLightbox: document.getElementById('property-lightbox'),
  propertyLightboxBackdrop: document.getElementById('property-lightbox-backdrop'),
  propertyLightboxImage: document.getElementById('property-lightbox-image'),
  propertyLightboxCaption: document.getElementById('property-lightbox-caption'),
  propertyLightboxCount: document.getElementById('property-lightbox-count'),
  propertyLightboxClose: document.getElementById('property-lightbox-close'),
  navToggle: document.getElementById('nav-toggle'),
  mainMenu: document.getElementById('main-menu'),
  navBackdrop: document.getElementById('nav-backdrop'),
  propertyLightboxPrev: document.getElementById('property-lightbox-prev'),
  propertyLightboxNext: document.getElementById('property-lightbox-next'),
  propertySalePrice: document.getElementById('property-sale-price'),
  aboutSection: document.getElementById('about-section'),
  aboutNav: document.getElementById('about-nav'),
  aboutTitle: document.getElementById('about-title'),
  aboutSubtitle: document.getElementById('about-subtitle'),
  aboutBody: document.getElementById('about-body'),
  aboutHighlights: document.getElementById('about-highlights'),
  contactPhoneLink: document.getElementById('contact-phone-link'),
  contactEmailLink: document.getElementById('contact-email-link'),
  contactWhatsappLink: document.getElementById('contact-whatsapp-link'),
  contactMapLink: document.getElementById('contact-map-link'),
  footerPhoneLink: document.getElementById('footer-phone-link'),
  footerInquiryPhoneLink: document.getElementById('footer-inquiry-phone-link'),
  footerEmailLink: document.getElementById('footer-email-link'),
  footerMapLink: document.getElementById('footer-map-link'),
  heroBookingForm: document.getElementById('hero-booking-form'),
  heroDateRangeTrigger: document.getElementById('hero-date-range-trigger'),
  heroDateRangeText: document.getElementById('hero-date-range-text'),
  heroDateRangePicker: document.getElementById('hero-date-range-picker'),
  dateRangeMonth: document.getElementById('date-range-month'),
  dateRangePrev: document.getElementById('date-range-prev'),
  dateRangeNext: document.getElementById('date-range-next'),
  dateRangeGrid: document.getElementById('date-range-grid'),
  dateRangeStatus: document.getElementById('date-range-status'),
  dateRangeClear: document.getElementById('date-range-clear'),
  heroCheckIn: document.getElementById('hero-check-in'),
  heroCheckOut: document.getElementById('hero-check-out'),
  heroAdults: document.getElementById('hero-adults'),
  heroChildren: document.getElementById('hero-children'),
  heroRoomCount: document.getElementById('hero-room-count'),
  roomSelect: document.getElementById('room-select'),
  roomSelectDetails: document.getElementById('room-select-details'),
  offerSelectButtons: document.querySelectorAll('[data-offer-select]'),
  offerSelectedChip: document.getElementById('offer-selected-chip'),
  offerSelectedName: document.getElementById('offer-selected-name'),
  bookingDateRangeTrigger: document.getElementById('booking-date-range-trigger'),
  bookingDateRangeText: document.getElementById('booking-date-range-text'),
  bookingDateRangePicker: document.getElementById('booking-date-range-picker'),
  bookingDateRangeMonth: document.getElementById('booking-date-range-month'),
  bookingDateRangePrev: document.getElementById('booking-date-range-prev'),
  bookingDateRangeNext: document.getElementById('booking-date-range-next'),
  bookingDateRangeGrid: document.getElementById('booking-date-range-grid'),
  bookingDateRangeStatus: document.getElementById('booking-date-range-status'),
  bookingDateRangeClear: document.getElementById('booking-date-range-clear'),
  checkIn: document.getElementById('check-in'),
  checkOut: document.getElementById('check-out'),
  guestsCount: document.getElementById('guests-count'),
  currencySelect: document.getElementById('currency-select'),
  paymentOption: document.getElementById('payment-option'),
  paymentOptionGroup: document.getElementById('payment-option-group'),
  bankTransferPanel: document.getElementById('bank-transfer-panel'),
  showBankDetailsBtn: document.getElementById('show-bank-details-btn'),
  bankDetailsBox: document.getElementById('bank-details-box'),
  quoteBox: document.getElementById('quote-box'),
  bookingForm: document.getElementById('booking-form'),
  bookingStatus: document.getElementById('booking-status'),
  phoneCountry: document.getElementById('phone-country'),
  guestPhoneLocal: document.getElementById('guest-phone-local'),
  statRooms: document.getElementById('stat-rooms'),
  statLocation: document.getElementById('stat-location'),
  useLocation: document.getElementById('use-location'),
  structuredData: document.getElementById('seo-structured-data'),
  languageSwitch: document.getElementById('language-switch'),
  languageButtons: document.querySelectorAll('[data-language-option]'),
  languagePrompt: document.getElementById('language-prompt'),
  languagePromptText: document.getElementById('language-prompt-text'),
  languageYes: document.getElementById('language-yes'),
  languageNo: document.getElementById('language-no'),
  installPrompt: document.getElementById('install-prompt'),
  installYes: document.getElementById('install-yes'),
  installNo: document.getElementById('install-no'),
  chatbotWidget: document.getElementById('chatbot-widget'),
  chatbotToggle: document.getElementById('chatbot-toggle'),
  chatbotPanel: document.getElementById('chatbot-panel'),
  chatbotClose: document.getElementById('chatbot-close'),
  chatbotTitle: document.getElementById('chatbot-title'),
  chatbotGreeting: document.getElementById('chatbot-greeting'),
  chatbotFaqList: document.getElementById('chatbot-faq-list'),
  chatbotAnswer: document.getElementById('chatbot-answer'),
  chatbotWhatsapp: document.getElementById('chatbot-whatsapp')
};

const pageRoutes = {
  '/': 'home',
  '/rooms': 'rooms',
  '/eat-sip': 'eat-sip',
  '/bomagawani': 'bomagawani',
  '/offers-prices': 'offers-prices',
  '/contact': 'contact',
  '/about-us': 'contact'
};

const contentPageToRoute = {
  'eat-sip': {
    pageId: 'eat-sip',
    path: '/eat-sip',
    menuSelector: '[data-page-link="eat-sip"]',
    section: () => dom.eatSipSection
  },
  property: {
    pageId: 'bomagawani',
    path: '/bomagawani',
    menuSelector: '[data-page-link="bomagawani"]',
    section: () => dom.propertySection
  },
  about: {
    pageId: 'contact',
    path: '/contact',
    menuSelector: '[data-page-link="contact"]',
    section: () => dom.aboutSection
  }
};

const FALLBACK_PHONE_COUNTRIES = [
  { name: 'Tanzania', iso2: 'TZ', dial: '+255' },
  { name: 'Kenya', iso2: 'KE', dial: '+254' },
  { name: 'Uganda', iso2: 'UG', dial: '+256' },
  { name: 'United States', iso2: 'US', dial: '+1' },
  { name: 'United Kingdom', iso2: 'GB', dial: '+44' },
  { name: 'United Arab Emirates', iso2: 'AE', dial: '+971' }
];

const amenityIconMap = {
  wifi: 'wifi',
  snowflake: 'snowflake',
  ac: 'snowflake',
  bath: 'bath',
  coffee: 'coffee',
  breakfast: 'coffee',
  tv: 'tv',
  fan: 'fan',
  shirt: 'shirt',
  car: 'car',
  parking: 'car',
  utensils: 'utensils',
  kitchen: 'cooking-pot',
  bed: 'bed',
  pool: 'waves',
  beach: 'waves',
  waves: 'waves',
  lock: 'shield-check',
  safe: 'lock-keyhole',
  wind: 'wind',
  zap: 'zap',
  heater: 'flame',
  gym: 'dumbbell',
  balcony: 'door-open',
  workspace: 'briefcase',
  petFriendly: 'dog',
  elevator: 'move-vertical',
  'glass-water': 'glass-water'
};

function t(key, vars = {}) {
  const phrase = translations[state.language]?.[key] || translations.en[key] || key;
  return phrase.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}

function currentLanguageConfig() {
  return languageConfig[state.language] || languageConfig.en;
}

function currentLocale() {
  return currentLanguageConfig().locale;
}

function currentCurrency() {
  return currentLanguageConfig().currency;
}

function selectedCurrency() {
  return dom.currencySelect?.value || currentCurrency();
}

function translateCopy(value) {
  const text = String(value || '');
  return copyTranslations[state.language]?.[text] || text;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function translateList(items = []) {
  return items.map((item) => translateCopy(item));
}

function applyCopyTranslations() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION'].includes(parent.tagName) || parent.closest('[data-i18n]')) {
        return NodeFilter.FILTER_REJECT;
      }

      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!originalTextNodes.has(node)) {
      originalTextNodes.set(node, node.nodeValue);
    }

    const original = originalTextNodes.get(node);
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    const core = original.trim();
    node.nodeValue = `${leading}${translateCopy(core)}${trailing}`;
  }
}

function displayPriceFromUsd(value, currency = currentCurrency()) {
  const rate = state.exchangeRates[currency] || fallbackExchangeRates[currency] || 1;
  return Number(value || 0) * rate;
}

async function loadExchangeRate(currency = currentCurrency()) {
  if (!currency || currency === 'USD' || state.exchangeRates[currency]) return;

  try {
    const response = await fetch(`/api/public/exchange?currency=${encodeURIComponent(currency)}`);
    if (!response.ok) throw new Error('Exchange rate unavailable');
    const payload = await response.json();
    const rate = Number(payload.usdRate || payload.rate || payload.exchangeRate || payload.usdToCurrency);
    if (Number.isFinite(rate) && rate > 0) {
      state.exchangeRates[currency] = rate;
    }
  } catch (error) {
    state.exchangeRates[currency] = fallbackExchangeRates[currency] || 1;
  }
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function languageLabel(code) {
  return languageConfig[code]?.label || 'English';
}

function countryFlagFromIso2(iso2) {
  return String(iso2 || '')
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function populatePhoneCountries(countries) {
  const currentIso = String(dom.phoneCountry.value || '').toUpperCase();
  const currentDial = dom.phoneCountry.selectedOptions[0]?.dataset.dial || '+255';
  const fragment = document.createDocumentFragment();

  countries.forEach((country) => {
    const option = document.createElement('option');
    option.value = country.iso2;
    option.dataset.iso2 = country.iso2;
    option.dataset.dial = country.dial;
    option.title = `${country.name} (${country.dial})`;
    option.textContent = `${countryFlagFromIso2(country.iso2)} ${country.dial} ${country.iso2}`;
    fragment.appendChild(option);
  });

  dom.phoneCountry.innerHTML = '';
  dom.phoneCountry.appendChild(fragment);
  if (countries.some((country) => country.iso2 === currentIso)) {
    dom.phoneCountry.value = currentIso;
    return;
  }

  const preferredIso = countries.find((country) => country.dial === currentDial)?.iso2;
  dom.phoneCountry.value = preferredIso || (countries.some((country) => country.iso2 === 'TZ') ? 'TZ' : countries[0]?.iso2 || '');
}

async function loadPhoneCountries() {
  try {
    const response = await fetch('/country-codes.json', { cache: 'force-cache' });
    if (!response.ok) throw new Error('Country list unavailable');
    const countries = await response.json();

    const normalized = Array.isArray(countries)
      ? countries
          .map((country) => ({
            name: String(country.name || '').trim(),
            iso2: String(country.iso2 || '').trim().toUpperCase(),
            dial: String(country.dial || '').trim()
          }))
          .filter((country) => /^[A-Z]{2}$/.test(country.iso2) && /^\+\d+$/.test(country.dial) && country.name)
      : [];

    if (!normalized.length) throw new Error('No country data');
    populatePhoneCountries(normalized);
  } catch (error) {
    populatePhoneCountries(FALLBACK_PHONE_COUNTRIES);
  }

  updatePhoneInputRules();
}

function setFooterYear() {
  const year = new Date().getFullYear();
  dom.footerText.textContent = `Bomagawani ${year}`;
  if (dom.footerCopyright) dom.footerCopyright.textContent = `© ${year} Bomagawani.com. All rights reserved.`;
}

function applyTranslations() {
  document.documentElement.lang = state.language;
  dom.languageButtons.forEach((button) => {
    const isActive = button.dataset.languageOption === state.language;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
  });

  applyCopyTranslations();

  if (!state.currentQuote) {
    dom.quoteBox.textContent = t('quote.empty');
  }
}

function setLanguage(languageCode) {
  const nextLanguage = SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : 'en';
  state.language = nextLanguage;
  localStorage.setItem('preferred_language', nextLanguage);
  if (dom.currencySelect && !state.currencyManuallySet) {
    dom.currencySelect.value = currentCurrency();
  }
  loadExchangeRate(currentCurrency()).then(() => {
    renderRooms();
    renderAmenities();
    renderPageContent();
    renderPropertyGallery();
    applySettings();
    requestQuote();
    updateStructuredData();
    applyTranslations();
    refreshIcons();
  });
  applyTranslations();
  renderChatbot();

  if (state.currentQuote) {
    renderQuote(state.currentQuote);
  }
}

function normalizeDate(dateString) {
  return dateString ? new Date(`${dateString}T00:00:00`) : null;
}

function formatDateIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(firstDate, secondDate) {
  return Boolean(
    firstDate &&
      secondDate &&
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
  );
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function formatShortDate(dateString) {
  const date = parseIsoDate(dateString);
  if (!date) return '';
  return date.toLocaleDateString(currentLocale(), {
    month: 'short',
    day: 'numeric'
  });
}

function updateHeroDateRangeText() {
  if (!dom.heroDateRangeText) return;
  const checkIn = dom.heroCheckIn.value;
  const checkOut = dom.heroCheckOut.value;

  if (checkIn && checkOut) {
    dom.heroDateRangeText.textContent = `${formatShortDate(checkIn)} — ${formatShortDate(checkOut)}`;
    return;
  }

  if (checkIn) {
    dom.heroDateRangeText.textContent = `${formatShortDate(checkIn)} — Select check-out`;
    return;
  }

  dom.heroDateRangeText.textContent = t('date.selectRange');
}

function setHeroDateRange(checkIn = '', checkOut = '') {
  dom.heroCheckIn.value = checkIn;
  dom.heroCheckOut.value = checkOut;
  dom.heroCheckOut.min = checkIn || dom.heroCheckIn.min;
  updateHeroDateRangeText();
  renderHeroDateRangePicker();
}

function showHeroDateRangePicker() {
  if (!state.heroRangePickerMonth) {
    const selectedDate = parseIsoDate(dom.heroCheckIn.value) || new Date();
    state.heroRangePickerMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  }

  dom.heroDateRangePicker.hidden = false;
  dom.heroDateRangeTrigger.setAttribute('aria-expanded', 'true');
  renderHeroDateRangePicker();
}

function hideHeroDateRangePicker() {
  dom.heroDateRangePicker.hidden = true;
  dom.heroDateRangeTrigger.setAttribute('aria-expanded', 'false');
}

function renderHeroDateRangePicker() {
  if (!dom.dateRangeGrid || dom.heroDateRangePicker.hidden) return;

  const today = startOfLocalDay(new Date());
  const monthDate = state.heroRangePickerMonth || new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const calendarStart = new Date(monthStart);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  calendarStart.setDate(monthStart.getDate() - mondayOffset);

  const checkIn = parseIsoDate(dom.heroCheckIn.value);
  const checkOut = parseIsoDate(dom.heroCheckOut.value);

  dom.dateRangeMonth.textContent = monthStart.toLocaleDateString(currentLocale(), {
    month: 'long',
    year: 'numeric'
  });

  dom.dateRangeGrid.innerHTML = '';
  for (let dayIndex = 0; dayIndex < 42; dayIndex += 1) {
    const currentDate = new Date(calendarStart);
    currentDate.setDate(calendarStart.getDate() + dayIndex);

    const currentIso = formatDateIso(currentDate);
    const isOutsideMonth = currentDate.getMonth() !== monthStart.getMonth();
    const isPast = startOfLocalDay(currentDate) < today;
    const isStart = isSameDay(currentDate, checkIn);
    const isEnd = isSameDay(currentDate, checkOut);
    const isInRange = checkIn && checkOut && currentDate > checkIn && currentDate < checkOut;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'date-day';
    button.dataset.date = currentIso;
    button.textContent = String(currentDate.getDate());
    button.disabled = isPast;
    button.classList.toggle('is-muted', isOutsideMonth);
    button.classList.toggle('is-start', isStart);
    button.classList.toggle('is-end', isEnd);
    button.classList.toggle('is-in-range', isInRange);
    button.classList.toggle('is-today', isSameDay(currentDate, today));

    button.addEventListener('click', () => selectHeroRangeDate(currentIso));
    dom.dateRangeGrid.appendChild(button);
  }

  if (!dom.heroCheckIn.value) {
    dom.dateRangeStatus.textContent = t('date.selectArrival');
  } else if (!dom.heroCheckOut.value) {
    dom.dateRangeStatus.textContent = t('date.selectDeparture');
  } else {
    dom.dateRangeStatus.textContent = `${formatShortDate(dom.heroCheckIn.value)} to ${formatShortDate(dom.heroCheckOut.value)}`;
  }
}

function selectHeroRangeDate(dateString) {
  const selectedDate = parseIsoDate(dateString);
  const checkIn = parseIsoDate(dom.heroCheckIn.value);
  const checkOut = parseIsoDate(dom.heroCheckOut.value);

  if (!checkIn || checkOut || selectedDate <= checkIn) {
    setHeroDateRange(dateString, '');
    return;
  }

  setHeroDateRange(dom.heroCheckIn.value, dateString);
  setTimeout(hideHeroDateRangePicker, 120);
}

function updateBookingDateRangeText() {
  if (!dom.bookingDateRangeText) return;
  const checkIn = dom.checkIn.value;
  const checkOut = dom.checkOut.value;

  if (checkIn && checkOut) {
    dom.bookingDateRangeText.textContent = `${formatShortDate(checkIn)} — ${formatShortDate(checkOut)}`;
    return;
  }

  if (checkIn) {
    dom.bookingDateRangeText.textContent = `${formatShortDate(checkIn)} — Select check-out`;
    return;
  }

  dom.bookingDateRangeText.textContent = t('date.selectRange');
}

function setBookingDateRange(checkIn = '', checkOut = '') {
  dom.checkIn.value = checkIn;
  dom.checkOut.value = checkOut;
  dom.checkOut.min = checkIn || dom.checkIn.min;
  updateBookingDateRangeText();
  renderBookingDateRangePicker();
}

function showBookingDateRangePicker() {
  if (!state.bookingRangePickerMonth) {
    const selectedDate = parseIsoDate(dom.checkIn.value) || new Date();
    state.bookingRangePickerMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  }

  dom.bookingDateRangePicker.hidden = false;
  dom.bookingDateRangeTrigger.setAttribute('aria-expanded', 'true');
  renderBookingDateRangePicker();
}

function hideBookingDateRangePicker() {
  dom.bookingDateRangePicker.hidden = true;
  dom.bookingDateRangeTrigger.setAttribute('aria-expanded', 'false');
}

function getSelectedRoomUnavailableRanges() {
  const room = state.rooms.find((item) => String(item.id) === String(dom.roomSelect.value));
  return room?.unavailable || [];
}

function isDateUnavailable(dateIso, ranges) {
  return ranges.some((range) => dateIso >= range.check_in && dateIso < range.check_out);
}

function findNextAvailableDate(roomId, fromDateIso) {
  const room = state.rooms.find((item) => String(item.id) === String(roomId));
  const ranges = room?.unavailable || [];
  let candidate = fromDateIso;
  let changed = true;

  while (changed) {
    changed = false;
    ranges.forEach((range) => {
      if (candidate >= range.check_in && candidate < range.check_out) {
        candidate = range.check_out;
        changed = true;
      }
    });
  }

  return candidate;
}

function renderBookingDateRangePicker() {
  if (!dom.bookingDateRangeGrid || dom.bookingDateRangePicker.hidden) return;

  const today = startOfLocalDay(new Date());
  const monthDate = state.bookingRangePickerMonth || new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const calendarStart = new Date(monthStart);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  calendarStart.setDate(monthStart.getDate() - mondayOffset);

  const checkIn = parseIsoDate(dom.checkIn.value);
  const checkOut = parseIsoDate(dom.checkOut.value);
  const unavailableRanges = getSelectedRoomUnavailableRanges();

  dom.bookingDateRangeMonth.textContent = monthStart.toLocaleDateString(currentLocale(), {
    month: 'long',
    year: 'numeric'
  });

  dom.bookingDateRangeGrid.innerHTML = '';
  for (let dayIndex = 0; dayIndex < 42; dayIndex += 1) {
    const currentDate = new Date(calendarStart);
    currentDate.setDate(calendarStart.getDate() + dayIndex);

    const currentIso = formatDateIso(currentDate);
    const isOutsideMonth = currentDate.getMonth() !== monthStart.getMonth();
    const isPast = startOfLocalDay(currentDate) < today;
    const isStart = isSameDay(currentDate, checkIn);
    const isEnd = isSameDay(currentDate, checkOut);
    const isInRange = checkIn && checkOut && currentDate > checkIn && currentDate < checkOut;
    const isUnavailable = !isStart && isDateUnavailable(currentIso, unavailableRanges);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'date-day';
    button.dataset.date = currentIso;
    button.textContent = String(currentDate.getDate());
    button.disabled = isPast || isUnavailable;
    button.classList.toggle('is-muted', isOutsideMonth);
    button.classList.toggle('is-start', isStart);
    button.classList.toggle('is-end', isEnd);
    button.classList.toggle('is-in-range', isInRange);
    button.classList.toggle('is-today', isSameDay(currentDate, today));
    button.classList.toggle('is-unavailable', isUnavailable);
    if (isUnavailable) button.title = t('date.roomBooked');

    button.addEventListener('click', () => selectBookingRangeDate(currentIso));
    dom.bookingDateRangeGrid.appendChild(button);
  }

  if (!dom.checkIn.value) {
    dom.bookingDateRangeStatus.textContent = t('date.selectArrival');
  } else if (!dom.checkOut.value) {
    dom.bookingDateRangeStatus.textContent = t('date.selectDeparture');
  } else {
    dom.bookingDateRangeStatus.textContent = `${formatShortDate(dom.checkIn.value)} to ${formatShortDate(dom.checkOut.value)}`;
  }
}

function selectBookingRangeDate(dateString) {
  const selectedDate = parseIsoDate(dateString);
  const checkIn = parseIsoDate(dom.checkIn.value);
  const checkOut = parseIsoDate(dom.checkOut.value);

  if (!checkIn || checkOut || selectedDate <= checkIn) {
    setBookingDateRange(dateString, '');
    requestQuote();
    return;
  }

  setBookingDateRange(dom.checkIn.value, dateString);
  requestQuote();
  setTimeout(hideBookingDateRangePicker, 120);
}

function formatAmount(value, currency) {
  try {
    return new Intl.NumberFormat(currentLocale(), {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    return `${Number(value).toFixed(2)} ${currency}`;
  }
}

function isDateRangeAvailable(roomId, checkIn, checkOut) {
  const room = state.rooms.find((item) => item.id === Number(roomId));
  if (!room || !checkIn || !checkOut) return true;
  return !(room.unavailable || []).some((range) => !(checkOut <= range.check_in || checkIn >= range.check_out));
}

function setupHeroSlider(images) {
  const fallback = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80';
  const unique = [...new Set((images || []).filter(Boolean))];
  state.activeHeroImages = unique.length ? unique : [fallback];
  state.heroIndex = 0;

  dom.heroSlider.innerHTML = state.activeHeroImages
    .map(
      (src, index) => `
      <div class="hero-slide ${index === 0 ? 'is-active' : ''}">
        <img src="${escapeHtml(src)}" alt="Bomagawani hero slide" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" />
      </div>
    `
    )
    .join('');

  dom.heroDots.innerHTML = state.activeHeroImages
    .map(
      (_, index) => `<button type="button" class="hero-dot ${index === 0 ? 'is-active' : ''}" data-hero-dot="${index}" aria-label="Hero image ${index + 1}"></button>`
    )
    .join('');

  dom.heroDots.querySelectorAll('[data-hero-dot]').forEach((button) => {
    button.addEventListener('click', () => {
      showHeroSlide(Number(button.dataset.heroDot));
      restartHeroAutoSlide();
    });
  });

  showHeroSlide(0);
  restartHeroAutoSlide();
}

function showHeroSlide(index) {
  if (!state.activeHeroImages.length) return;

  state.heroIndex = (index + state.activeHeroImages.length) % state.activeHeroImages.length;

  dom.heroSlider.querySelectorAll('.hero-slide').forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === state.heroIndex);
  });

  dom.heroDots.querySelectorAll('.hero-dot').forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === state.heroIndex);
  });
}

function restartHeroAutoSlide() {
  if (state.heroInterval) {
    clearInterval(state.heroInterval);
  }

  if (state.activeHeroImages.length > 1) {
    state.heroInterval = setInterval(() => {
      showHeroSlide(state.heroIndex + 1);
    }, 5500);
  }
}

function configureHeroControls() {
  dom.heroPrev.addEventListener('click', () => {
    showHeroSlide(state.heroIndex - 1);
    restartHeroAutoSlide();
  });

  dom.heroNext.addEventListener('click', () => {
    showHeroSlide(state.heroIndex + 1);
    restartHeroAutoSlide();
  });

  dom.hero.addEventListener('mouseenter', () => {
    if (state.heroInterval) clearInterval(state.heroInterval);
  });

  dom.hero.addEventListener('mouseleave', restartHeroAutoSlide);
}

function clearRoomSlideIntervals() {
  Object.values(state.roomSlideIntervals).forEach((timerId) => clearInterval(timerId));
  state.roomSlideIntervals = {};
}

function initRoomSlides() {
  clearRoomSlideIntervals();

  dom.roomsGrid.querySelectorAll('.room-slider').forEach((slider) => {
    const slides = [...slider.querySelectorAll('.room-image')];
    const dots = [...slider.querySelectorAll('[data-slide-dot]')];
    if (slides.length <= 1) return;

    const sliderKey = slider.dataset.sliderKey;
    let current = 0;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const stopTimer = () => {
      if (state.roomSlideIntervals[sliderKey]) {
        clearInterval(state.roomSlideIntervals[sliderKey]);
      }
    };

    const startTimer = () => {
      stopTimer();
      state.roomSlideIntervals[sliderKey] = setInterval(() => show(current + 1), 5000);
    };

    slider.querySelector('[data-slide="next"]')?.addEventListener('click', () => {
      show(current + 1);
      startTimer();
    });

    slider.querySelector('[data-slide="prev"]')?.addEventListener('click', () => {
      show(current - 1);
      startTimer();
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.slideDot || 0));
        startTimer();
      });
    });

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);

    show(0);
    startTimer();
  });
}

function renderLinks() {
  if (dom.platformLinks) {
    dom.platformLinks.innerHTML = '';
  }
  dom.channelList.innerHTML = '';

  state.links.forEach((link) => {
    const icon = link.icon || 'external-link';

    if (dom.platformLinks) {
      const top = document.createElement('a');
      top.href = link.url;
      top.target = '_blank';
      top.rel = 'noreferrer';
      top.innerHTML = `<i data-lucide="${escapeHtml(icon)}"></i> ${escapeHtml(link.platform_name)}`;
      dom.platformLinks.appendChild(top);
    }

    const channel = document.createElement('a');
    channel.href = link.url;
    channel.className = 'channel-item';
    channel.target = '_blank';
    channel.rel = 'noreferrer';
    channel.innerHTML = `<span><i data-lucide="${escapeHtml(icon)}"></i> ${escapeHtml(link.platform_name)}</span><i data-lucide="external-link"></i>`;
    dom.channelList.appendChild(channel);
  });
}

function navigateToPath(pathWithHash) {
  const target = new URL(pathWithHash, window.location.origin);
  if (target.pathname === window.location.pathname && target.hash === window.location.hash) return;

  window.history.pushState({ path: target.pathname }, '', target.pathname + target.hash);
  applyPageVisibility();
  if (!target.hash) {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}

function configureClientRouting() {
  document.body.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    let url;
    try {
      url = new URL(link.href, window.location.origin);
    } catch (error) {
      return;
    }

    if (url.origin !== window.location.origin) return;
    if (!Object.prototype.hasOwnProperty.call(pageRoutes, url.pathname)) return;

    event.preventDefault();
    navigateToPath(url.pathname + url.hash);
  });

  window.addEventListener('popstate', () => {
    applyPageVisibility();
  });
}

function getCurrentPage() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  return pageRoutes[pathname] || 'home';
}

function pageTitleForCurrentPage() {
  if (state.currentPage === 'rooms') return t('nav.rooms');
  if (state.currentPage === 'eat-sip') return translateCopy(pageBySlug('eat-sip')?.nav_label || 'Eat & Sip');
  if (state.currentPage === 'bomagawani') return translateCopy(pageBySlug('property')?.nav_label || 'Bomagawani');
  if (state.currentPage === 'offers-prices') return t('nav.offersPrices');
  if (state.currentPage === 'contact') return t('nav.contact');
  return state.language === 'de' ? 'Küstenzimmer buchen' : 'Coastal Room Booking';
}

function applyPageVisibility() {
  state.currentPage = getCurrentPage();

  document.querySelectorAll('[data-page]').forEach((section) => {
    section.hidden = section.dataset.page !== state.currentPage;
  });

  document.querySelectorAll('[data-page-link]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.pageLink === state.currentPage);
  });

  const title = pageTitleForCurrentPage();
  if (state.settings?.domain) {
    document.title = `${state.settings.domain} | ${title}`;
  }

  if (window.location.hash) {
    setTimeout(() => {
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }
}

function renderRooms() {
  const previouslySelectedRoomId = dom.roomSelect.value;
  dom.roomsGrid.innerHTML = '';
  dom.roomSelect.innerHTML = '';
  const preferredCurrency = selectedCurrency();

  state.rooms.forEach((room) => {
    const gallery = [room.cover_image, ...(room.images || []).map((image) => image.image_url)].filter(Boolean);
    const uniqueGallery = [...new Set(gallery)];
    const fallback = room.cover_image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
    const imageSources = uniqueGallery.length ? uniqueGallery : [fallback];

    const badges = [`<span class="badge"><i data-lucide="users"></i> ${state.language === 'de' ? 'Bis zu' : 'Up to'} ${room.max_guests} ${state.language === 'de' ? 'Gäste' : 'guests'}</span>`];

    if (room.bed_size) {
      badges.push(`<span class="badge"><i data-lucide="bed-double"></i> ${escapeHtml(translateCopy(room.bed_size))}</span>`);
    }

    if (room.featured) {
      badges.unshift(`<span class="badge badge-featured"><i data-lucide="sparkles"></i> ${translateCopy('Featured stay')}</span>`);
    }

    const unavailableCount = room.unavailable?.length || 0;
    if (unavailableCount > 0) {
      badges.push(`<span class="badge"><i data-lucide="calendar-check"></i> ${unavailableCount} ${state.language === 'de' ? 'gebuchte Zeiträume' : 'booked range(s)'}</span>`);
    }

    badges.push(`<span class="badge"><i data-lucide="badge-check"></i> ${translateCopy('Direct booking')}</span>`);

    const slidesHtml = imageSources
      .map(
        (src, index) => `<img class="room-image ${index === 0 ? 'is-active' : ''}" src="${escapeHtml(src)}" alt="${escapeHtml(room.name)}" loading="lazy" decoding="async" />`
      )
      .join('');

    const thumbsHtml = imageSources
      .slice(0, 5)
      .map(
        (src, index) => `
          <button class="room-thumb ${index === 0 ? 'is-active' : ''}" type="button" data-slide-dot="${index}" aria-label="${escapeHtml(room.name)} photo ${index + 1}">
            <img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" />
          </button>
        `
      )
      .join('');

    const controlsHtml = imageSources.length > 1
      ? `
        <button class="slide-control prev" type="button" data-slide="prev" aria-label="Previous image">‹</button>
        <button class="slide-control next" type="button" data-slide="next" aria-label="Next image">›</button>
      `
      : '';

    const amenityHighlights = (room.amenities || [])
      .slice(0, 4)
      .map((amenity) => `<span><i data-lucide="${amenityIconMap[amenity.icon] || 'check'}"></i>${escapeHtml(translateCopy(amenity.label))}</span>`)
      .join('');

    const card = document.createElement('article');
    card.className = 'room-card';
    card.id = `room-${room.slug}`;
    card.innerHTML = `
      <div class="room-slider" data-slider-key="room-${room.id}">
        ${slidesHtml}
        ${controlsHtml}
        <div class="room-photo-count"><i data-lucide="images"></i> ${imageSources.length} photo${imageSources.length === 1 ? '' : 's'}</div>
        <div class="room-thumbs">${thumbsHtml}</div>
      </div>
      <div class="room-content">
        <p class="room-kicker">${translateCopy('Private coastal room')}</p>
        <div class="room-top">
          <h3>${escapeHtml(translateCopy(room.name))}</h3>
        </div>
        <p>${escapeHtml(translateCopy(room.short_description))}</p>
        <div class="room-badges">${badges.join('')}</div>
        <div class="room-amenity-strip">${amenityHighlights}</div>
        <div class="room-actions">
          <button class="primary-btn" data-book-room="${room.id}">${t('nav.bookNow')}</button>
          <a class="hero-text-link" href="/offers-prices#booking" data-book-room="${room.id}">${translateCopy('Check dates')}</a>
        </div>
      </div>
    `;

    dom.roomsGrid.appendChild(card);

    const option = document.createElement('option');
    option.value = String(room.id);
    option.textContent = translateCopy(room.name);
    dom.roomSelect.appendChild(option);
  });

  if (previouslySelectedRoomId && state.rooms.some((room) => String(room.id) === previouslySelectedRoomId)) {
    dom.roomSelect.value = previouslySelectedRoomId;
  }

  updateRoomSelectDetails();

  dom.roomsGrid.querySelectorAll('[data-book-room]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      dom.roomSelect.value = button.dataset.bookRoom;
      navigateToPath('/offers-prices#booking');
      requestQuote();
      requestAnimationFrame(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }));
    });
  });

  initRoomSlides();
}

function updateRoomSelectDetails() {
  if (!dom.roomSelectDetails) return;
  const room = state.rooms.find((item) => String(item.id) === String(dom.roomSelect.value));
  if (!room) {
    dom.roomSelectDetails.textContent = '';
    return;
  }

  const facts = [`${state.language === 'de' ? 'Bis zu' : 'Up to'} ${room.max_guests} ${state.language === 'de' ? 'Gäste' : 'guests'}`];
  if (room.bed_size) facts.push(translateCopy(room.bed_size));

  dom.roomSelectDetails.textContent = `${translateCopy(room.short_description)} (${facts.join(' · ')})`;
}

function configureOfferSelectButtons() {
  const notePrefixPattern = /^(Interested in|Interesse an): .*?\.\s*/;

  dom.offerSelectButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const offerName = button.dataset.offerName || button.dataset.offerSelect;

      if (dom.offerSelectedChip && dom.offerSelectedName) {
        dom.offerSelectedName.textContent = offerName;
        dom.offerSelectedChip.hidden = false;
      }

      const guestNote = document.getElementById('guest-note');
      if (guestNote) {
        const notePrefix = state.language === 'de' ? `Interesse an: ${offerName}. ` : `Interested in: ${offerName}. `;
        guestNote.value = `${notePrefix}${guestNote.value.replace(notePrefixPattern, '')}`;
      }

      navigateToPath('/offers-prices#booking');
      requestAnimationFrame(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }));
    });
  });
}

function renderAmenities() {
  const seenAmenities = new Map();
  state.rooms.forEach((room) => {
    (room.amenities || []).forEach((amenity) => {
      const key = `${amenity.icon}:${amenity.label}`;
      if (!seenAmenities.has(key)) {
        seenAmenities.set(key, amenity);
      }
    });
  });

  dom.amenityWall.innerHTML = '';
  [...seenAmenities.values()].forEach((amenity) => {
    const iconName = amenityIconMap[amenity.icon] || 'sparkles';
    const item = document.createElement('article');
    item.innerHTML = `<i data-lucide="${iconName}"></i><span>${escapeHtml(translateCopy(amenity.label))}</span>`;
    dom.amenityWall.appendChild(item);
  });
}

function pageBySlug(slug) {
  return state.contentPages.find((page) => page.slug === slug) || null;
}

function setText(element, value) {
  if (element) {
    element.textContent = value || '';
  }
}

function updateMenuLabel(anchor, label) {
  const link = anchor.startsWith('[')
    ? document.querySelector(`.main-menu ${anchor}`)
    : document.querySelector(`.main-menu a[href="${anchor}"]`);
  if (link && label) {
    link.textContent = label;
  }
}

function updateMenuVisibility(selector, visible) {
  const link = selector.startsWith('[')
    ? document.querySelector(`.main-menu ${selector}`)
    : document.querySelector(`.main-menu a[href="${selector}"]`);
  if (link) {
    link.hidden = !visible;
  }
}

function renderSimpleHighlights(container, highlights = []) {
  container.innerHTML = '';
  highlights.forEach((highlight) => {
    const item = document.createElement('span');
    item.textContent = highlight;
    container.appendChild(item);
  });
}

function renderIconHighlights(container, highlights = [], icon = 'sparkles') {
  container.innerHTML = '';
  highlights.forEach((highlight) => {
    const item = document.createElement('article');
    item.innerHTML = `<i data-lucide="${escapeHtml(amenityIconMap[icon] || icon || 'sparkles')}"></i><span></span>`;
    item.querySelector('span').textContent = highlight;
    container.appendChild(item);
  });
}

function showPropertyGalleryImage(index) {
  if (!PROPERTY_GALLERY_IMAGES.length || !dom.propertyImage) return;

  state.propertyGalleryIndex = (index + PROPERTY_GALLERY_IMAGES.length) % PROPERTY_GALLERY_IMAGES.length;
  const image = PROPERTY_GALLERY_IMAGES[state.propertyGalleryIndex];
  dom.propertyImage.src = image.src;
  dom.propertyImage.alt = translateCopy(image.alt);

  if (dom.propertyImageCaption) {
    dom.propertyImageCaption.textContent = translateCopy(image.alt);
  }

  if (dom.propertyGalleryCount) {
    dom.propertyGalleryCount.textContent = `${state.propertyGalleryIndex + 1} / ${PROPERTY_GALLERY_IMAGES.length}`;
  }

  dom.propertyGalleryThumbs?.querySelectorAll('[data-property-thumb]').forEach((button) => {
    button.classList.toggle('is-active', Number(button.dataset.propertyThumb) === state.propertyGalleryIndex);
  });

  if (state.propertyLightboxOpen) {
    syncPropertyLightbox();
  }
}

function syncPropertyLightbox() {
  if (!dom.propertyLightboxImage || !PROPERTY_GALLERY_IMAGES.length) return;

  const image = PROPERTY_GALLERY_IMAGES[state.propertyGalleryIndex];
  const caption = translateCopy(image.alt);
  dom.propertyLightboxImage.src = image.src;
  dom.propertyLightboxImage.alt = caption;
  dom.propertyLightboxCaption.textContent = caption;
  dom.propertyLightboxCount.textContent = `${state.propertyGalleryIndex + 1} / ${PROPERTY_GALLERY_IMAGES.length}`;
}

function openPropertyLightbox(index = state.propertyGalleryIndex) {
  if (!dom.propertyLightbox || !PROPERTY_GALLERY_IMAGES.length) return;

  showPropertyGalleryImage(index);
  state.propertyLightboxOpen = true;
  dom.propertyLightbox.hidden = false;
  dom.propertyLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  syncPropertyLightbox();
  dom.propertyLightboxClose?.focus();
}

function closePropertyLightbox() {
  if (!dom.propertyLightbox) return;

  state.propertyLightboxOpen = false;
  dom.propertyLightbox.hidden = true;
  dom.propertyLightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  dom.propertyGalleryStage?.focus();
}

function renderPropertyGallery() {
  if (!dom.propertyGalleryThumbs) return;

  dom.propertyGalleryThumbs.innerHTML = PROPERTY_GALLERY_IMAGES.map(
    (image, index) => `
      <button type="button" class="property-gallery-thumb ${index === state.propertyGalleryIndex ? 'is-active' : ''}" data-property-thumb="${index}" aria-label="${translateCopy(image.alt)}">
        <img src="${image.thumb}" alt="" loading="lazy" decoding="async" />
      </button>
    `
  ).join('');

  dom.propertyGalleryThumbs.querySelectorAll('[data-property-thumb]').forEach((button) => {
    button.addEventListener('click', () => showPropertyGalleryImage(Number(button.dataset.propertyThumb)));
    button.addEventListener('dblclick', () => openPropertyLightbox(Number(button.dataset.propertyThumb)));
  });

  showPropertyGalleryImage(state.propertyGalleryIndex);
}

function renderPageContent() {
  const eatSip = pageBySlug('eat-sip');
  const property = pageBySlug('property');
  const about = pageBySlug('about');

  [eatSip, property, about].forEach((page) => {
    const route = contentPageToRoute[page?.slug];
    if (!route) return;
    const active = page.active !== 0 && page.active !== false;
    route.section().dataset.page = active ? route.pageId : 'inactive';
    updateMenuVisibility(route.menuSelector, active);
  });

  if (eatSip) {
    setText(dom.eatSipNav, translateCopy(eatSip.nav_label));
    setText(dom.eatSipTitle, translateCopy(eatSip.title));
    setText(dom.eatSipSubtitle, translateCopy(eatSip.subtitle));
    setText(dom.eatSipBody, translateCopy(eatSip.body));
    renderSimpleHighlights(dom.eatSipHighlights, translateList(eatSip.highlights || []));
    const eatSipImage = eatSip.imageUrl || eatSip.image_url;
    if (eatSipImage) {
      dom.eatSipImage.src = eatSipImage;
      dom.eatSipGalleryMain.src = eatSipImage;
    }
    updateMenuLabel('[data-page-link="eat-sip"]', translateCopy(eatSip.nav_label));
  }

  if (property) {
    setText(dom.propertyNav, translateCopy(property.nav_label));
    setText(dom.propertyTitle, translateCopy(property.title));
    setText(dom.propertySubtitle, translateCopy(property.subtitle));
    setText(dom.propertyBody, translateCopy(property.body));
    renderIconHighlights(dom.propertyHighlights, translateList(property.highlights || []), property.icon);
    const priceHighlight = (property.highlights || []).find((item) => /price|usd|tzs|\$|sale/i.test(item));
    if (priceHighlight && dom.propertySalePrice) {
      dom.propertySalePrice.textContent = translateCopy(priceHighlight);
    }
    updateMenuLabel('[data-page-link="bomagawani"]', translateCopy(property.nav_label));
  }

  if (about) {
    setText(dom.aboutNav, t('nav.contact'));
    setText(dom.aboutTitle, translateCopy(about.title || 'Contact Bomagawani'));
    setText(dom.aboutSubtitle, translateCopy(about.subtitle || 'Reach us for room bookings, food requests, directions, and guest support.'));
    setText(dom.aboutBody, translateCopy(about.body || 'Send us a message before you arrive, ask about room availability, or request food and drinks for your stay.'));
    renderSimpleHighlights(dom.aboutHighlights, translateList(about.highlights || []));
    updateMenuLabel('[data-page-link="contact"]', t('nav.contact'));
  }
}

function buildWhatsAppLink(number, message) {
  const digits = String(number || '').replace(/[^\d]/g, '');
  if (!digits) return '#';
  return `https://wa.me/${digits}?text=${encodeURIComponent(String(message || '').trim())}`;
}

function renderChatbotAnswer(answerText = '') {
  dom.chatbotAnswer.textContent = answerText || t('chatbot.answerPlaceholder');
}

function renderChatbot() {
  const chatbot = state.chatbot || {};
  const enabled = chatbot.enabled !== 0 && chatbot.enabled !== false;

  if (!enabled) {
    dom.chatbotWidget.hidden = true;
    return;
  }

  dom.chatbotWidget.hidden = false;
  dom.chatbotTitle.textContent = translateCopy(chatbot.title || 'Quick Help');
  dom.chatbotGreeting.textContent = translateCopy(chatbot.greeting || 'Hi. Ask me anything about rooms, prices, check-in, or booking.');
  dom.chatbotWhatsapp.textContent = t('chatbot.whatsapp');
  dom.chatbotWhatsapp.href = buildWhatsAppLink(chatbot.whatsapp_number, translateCopy(chatbot.whatsapp_message));

  dom.chatbotFaqList.innerHTML = '';
  const faqs = Array.isArray(state.chatbotFaqs) ? state.chatbotFaqs : [];
  faqs.forEach((faq) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chatbot-faq-btn';
    button.textContent = translateCopy(faq.question);
    button.addEventListener('click', () => renderChatbotAnswer(translateCopy(faq.answer)));
    dom.chatbotFaqList.appendChild(button);
  });

  renderChatbotAnswer('');
}

function renderCurrencies() {
  dom.currencySelect.innerHTML = '';
  const requiredCurrencies = [...new Set([...state.currencies, 'USD', 'EUR'])];
  requiredCurrencies.forEach((currency) => {
    const option = document.createElement('option');
    option.value = currency;
    option.textContent = currency;
    dom.currencySelect.appendChild(option);
  });

  dom.currencySelect.value = currentCurrency();
}

function applySettings() {
  if (dom.headline) dom.headline.textContent = translateCopy(state.settings.headline);
  if (dom.subheadline) dom.subheadline.textContent = translateCopy(state.settings.subheadline);
  dom.aboutText.textContent = translateCopy(state.settings.about_text);
  setFooterYear();
  if (dom.locationLine) dom.locationLine.textContent = state.settings.address;
  if (dom.mapLink) dom.mapLink.href = state.settings.map_link;
  dom.contactPhoneLink.href = `tel:${String(state.settings.contact_phone || '').replace(/[^\d+]/g, '')}`;
  dom.contactEmailLink.href = `mailto:${state.settings.contact_email || ''}`;
  dom.contactWhatsappLink.href = buildWhatsAppLink(
    state.chatbot?.whatsapp_number,
    'Hello Bomagawani, I would like to ask about rooms, food, or directions.'
  );
  dom.contactMapLink.href = state.settings.map_link;
  dom.eatSipRequestLink.href = '/contact';
  dom.footerPhoneLink.href = dom.contactPhoneLink.href;
  dom.footerPhoneLink.textContent = state.settings.contact_phone || 'Call';
  dom.footerEmailLink.href = 'mailto:hermann.h.chausiku@gmail.com';
  dom.footerEmailLink.textContent = 'hermann.h.chausiku@gmail.com';
  if (dom.footerInquiryPhoneLink) {
    dom.footerInquiryPhoneLink.href = 'tel:+4366499425267';
    dom.footerInquiryPhoneLink.textContent = '+43 664 994 252 67';
  }
  dom.footerMapLink.href = state.settings.map_link;

  if (dom.mapEmbed) dom.mapEmbed.src = `https://www.google.com/maps?q=${PROPERTY_COORDS.lat},${PROPERTY_COORDS.lng}&z=16&t=h&output=embed`;

  if (dom.statRooms) {
    dom.statRooms.textContent = `${state.rooms.length} ${t('nav.rooms')}`;
  }
  if (dom.statLocation) {
    dom.statLocation.textContent = state.settings.address.split(',')[0] || state.settings.address;
  }
  document.title = `${state.settings.domain} | ${pageTitleForCurrentPage()}`;

  if (dom.heroRoomCount) {
    const maxRooms = Math.max(1, state.rooms.length);
    dom.heroRoomCount.max = String(maxRooms);
    if (Number(dom.heroRoomCount.value || 1) > maxRooms) {
      dom.heroRoomCount.value = String(maxRooms);
    }
  }

  const heroImages = [
    ...(state.heroSlides || []).map((slide) => slide.image_url),
    state.settings.hero_image
  ];

  setupHeroSlider(heroImages.filter(Boolean));
}

function updatePhoneInputRules() {
  const selected = dom.phoneCountry.selectedOptions[0];
  const dialDigits = String(selected?.dataset.dial || '').replace(/\D/g, '');
  const maxLocalLength = Math.max(6, 15 - dialDigits.length);
  const minLocalLength = Math.min(6, maxLocalLength);

  dom.guestPhoneLocal.minLength = minLocalLength;
  dom.guestPhoneLocal.maxLength = maxLocalLength;
  dom.guestPhoneLocal.placeholder = '00 000 0000';
  dom.guestPhoneLocal.title = t('status.phoneLengthRange', { min: minLocalLength, max: maxLocalLength });
  dom.guestPhoneLocal.setCustomValidity('');
}

function normalizeLocalPhoneInput() {
  const selected = dom.phoneCountry.selectedOptions[0];
  const dialDigits = String(selected?.dataset.dial || '').replace(/\D/g, '');
  const maxLocalLength = Math.max(6, 15 - dialDigits.length);
  const digitsOnly = dom.guestPhoneLocal.value.replace(/\D/g, '');
  dom.guestPhoneLocal.value = digitsOnly.slice(0, maxLocalLength);
  dom.guestPhoneLocal.setCustomValidity('');
}

function getValidatedGuestPhone() {
  const selected = dom.phoneCountry.selectedOptions[0];
  const dialDigits = String(selected?.dataset.dial || '').replace(/\D/g, '');
  const maxLocalLength = Math.max(6, 15 - dialDigits.length);
  const minLocalLength = Math.min(6, maxLocalLength);
  const countryCode = String(selected?.dataset.dial || '').trim();
  const localDigits = dom.guestPhoneLocal.value.replace(/\D/g, '');

  if (localDigits.length < minLocalLength || localDigits.length > maxLocalLength) {
    dom.guestPhoneLocal.setCustomValidity(t('status.phoneLengthRange', { min: minLocalLength, max: maxLocalLength }));
    dom.guestPhoneLocal.reportValidity();
    return null;
  }

  dom.guestPhoneLocal.setCustomValidity('');
  return `${countryCode}${localDigits}`;
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
    <strong>${escapeHtml(quote.roomName)}</strong><br/>
    ${t('quote.nights', { nights: quote.nights, price: formatAmount(quote.pricePerNightUsd, 'USD') })}<br/>
    <strong>${t('quote.total', { total: formatAmount(quote.totalInCurrency, quote.currency) })}</strong>
  `;
}

function applyBookingQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const checkIn = params.get('checkIn') || '';
  const checkOut = params.get('checkOut') || '';
  const guests = Number(params.get('guests') || params.get('adults') || 0);

  if (checkIn) {
    dom.checkIn.value = checkIn;
    dom.checkOut.min = checkIn;
  }

  if (checkOut) {
    dom.checkOut.value = checkOut;
  }

  if (checkIn || checkOut) {
    updateBookingDateRangeText();
  }

  if (guests > 0) {
    dom.guestsCount.value = String(guests);
  }

  if (checkIn && checkOut) {
    requestQuote();
  }
}

let latestQuoteRequestId = 0;

async function requestQuote() {
  const requestId = ++latestQuoteRequestId;
  const roomId = dom.roomSelect.value;
  const checkIn = dom.checkIn.value;
  const checkOut = dom.checkOut.value;
  const currency = dom.currencySelect.value;

  if (!roomId || !checkIn || !checkOut) {
    if (requestId === latestQuoteRequestId) renderQuote(null);
    return;
  }

  if (!isDateRangeAvailable(roomId, checkIn, checkOut)) {
    if (requestId === latestQuoteRequestId) {
      const nextAvailable = findNextAvailableDate(roomId, checkIn);
      dom.quoteBox.textContent = nextAvailable !== checkIn
        ? t('quote.conflictNextAvailable', { date: formatShortDate(nextAvailable) })
        : t('quote.conflict');
      state.currentQuote = null;
    }
    return;
  }

  try {
    if (requestId === latestQuoteRequestId) dom.quoteBox.textContent = t('quote.loading');
    const response = await fetch(
      `/api/public/quote?roomId=${encodeURIComponent(roomId)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&currency=${encodeURIComponent(currency)}`
    );

    if (requestId !== latestQuoteRequestId) return;

    if (!response.ok) {
      const payload = await response.json();
      dom.quoteBox.textContent = payload.error || t('quote.unavailable');
      state.currentQuote = null;
      return;
    }

    const quote = await response.json();
    if (requestId !== latestQuoteRequestId) return;
    state.currentQuote = quote;
    renderQuote(quote);
  } catch (error) {
    if (requestId === latestQuoteRequestId) {
      dom.quoteBox.textContent = t('quote.serviceDown');
      state.currentQuote = null;
    }
  }
}

let bookingSubmitInFlight = false;

async function submitBooking(event) {
  event.preventDefault();
  if (bookingSubmitInFlight) return;

  bookingSubmitInFlight = true;
  const submitButton = event.submitter || dom.bookingForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  try {
    dom.bookingStatus.textContent = '';

    await requestQuote();
    if (!state.currentQuote) {
      dom.bookingStatus.textContent = t('status.checkQuoteFirst');
      return;
    }

    const fullGuestPhone = getValidatedGuestPhone();
    if (!fullGuestPhone) {
      dom.bookingStatus.textContent = t('status.phoneInvalid');
      return;
    }

    const payload = {
      roomId: Number(dom.roomSelect.value),
      guestName: document.getElementById('guest-name').value.trim(),
      guestEmail: document.getElementById('guest-email').value.trim(),
      guestPhone: fullGuestPhone,
      checkIn: dom.checkIn.value,
      checkOut: dom.checkOut.value,
      guestsCount: Number(dom.guestsCount.value),
      note: document.getElementById('guest-note').value.trim(),
      currencyCode: dom.currencySelect.value,
      paymentOption: dom.paymentOption.value
    };

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
    setBookingDateRange('', '');
    setPaymentOption('pay_on_arrival');
    updatePhoneInputRules();
    state.currentQuote = null;
    renderQuote(null);

    await boot();
  } catch (error) {
    dom.bookingStatus.textContent = t('status.bookingServiceDown');
  } finally {
    bookingSubmitInFlight = false;
    if (submitButton) submitButton.disabled = false;
  }
}

function configureDateInputs() {
  const today = new Date().toISOString().slice(0, 10);
  dom.checkIn.min = today;
  dom.checkOut.min = today;
  dom.heroCheckIn.min = today;
  dom.heroCheckOut.min = today;

  updateBookingDateRangeText();

  dom.bookingDateRangeTrigger.addEventListener('click', () => {
    if (dom.bookingDateRangePicker.hidden) {
      showBookingDateRangePicker();
    } else {
      hideBookingDateRangePicker();
    }
  });

  dom.bookingDateRangePrev.addEventListener('click', () => {
    state.bookingRangePickerMonth = addMonths(state.bookingRangePickerMonth || new Date(), -1);
    renderBookingDateRangePicker();
  });

  dom.bookingDateRangeNext.addEventListener('click', () => {
    state.bookingRangePickerMonth = addMonths(state.bookingRangePickerMonth || new Date(), 1);
    renderBookingDateRangePicker();
  });

  dom.bookingDateRangeClear.addEventListener('click', () => {
    setBookingDateRange('', '');
    dom.bookingDateRangeStatus.textContent = t('date.selectArrival');
    requestQuote();
  });

  document.addEventListener('click', (event) => {
    const path = event.composedPath();
    const clickedInsidePicker = path.includes(dom.bookingDateRangePicker);
    const clickedTrigger = path.includes(dom.bookingDateRangeTrigger);
    if (!clickedInsidePicker && !clickedTrigger) hideBookingDateRangePicker();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideBookingDateRangePicker();
  });

  dom.roomSelect.addEventListener('change', () => {
    renderBookingDateRangePicker();
    requestQuote();
    updateRoomSelectDetails();
  });
  dom.currencySelect.addEventListener('change', async () => {
    state.currencyManuallySet = true;
    await loadExchangeRate(dom.currencySelect.value);
    renderRooms();
    refreshIcons();
    requestQuote();
  });
}

function configureMobileNav() {
  if (!dom.navToggle || !dom.mainMenu || !dom.navBackdrop) return;

  const closeNav = () => {
    dom.mainMenu.classList.remove('is-open');
    dom.navToggle.setAttribute('aria-expanded', 'false');
    dom.navBackdrop.hidden = true;
  };

  const openNav = () => {
    dom.mainMenu.classList.add('is-open');
    dom.navToggle.setAttribute('aria-expanded', 'true');
    dom.navBackdrop.hidden = false;
  };

  dom.navToggle.addEventListener('click', () => {
    if (dom.mainMenu.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  dom.navBackdrop.addEventListener('click', closeNav);
  dom.mainMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) closeNav();
  });
}

function configureHeroBookingShortcut() {
  let bookingType = 'rooms';

  dom.heroBookingForm.querySelectorAll('[data-booking-type]').forEach((button) => {
    button.addEventListener('click', () => {
      bookingType = button.dataset.bookingType;
      dom.heroBookingForm.querySelectorAll('[data-booking-type]').forEach((item) => {
        item.classList.toggle('is-selected', item === button);
      });
    });
  });

  updateHeroDateRangeText();

  dom.heroDateRangeTrigger.addEventListener('click', () => {
    if (dom.heroDateRangePicker.hidden) {
      showHeroDateRangePicker();
    } else {
      hideHeroDateRangePicker();
    }
  });

  dom.dateRangePrev.addEventListener('click', () => {
    state.heroRangePickerMonth = addMonths(state.heroRangePickerMonth || new Date(), -1);
    renderHeroDateRangePicker();
  });

  dom.dateRangeNext.addEventListener('click', () => {
    state.heroRangePickerMonth = addMonths(state.heroRangePickerMonth || new Date(), 1);
    renderHeroDateRangePicker();
  });

  dom.dateRangeClear.addEventListener('click', () => {
    setHeroDateRange('', '');
    dom.dateRangeStatus.textContent = t('date.selectArrival');
  });

  document.addEventListener('click', (event) => {
    const path = event.composedPath();
    const clickedInsidePicker = path.includes(dom.heroDateRangePicker);
    const clickedTrigger = path.includes(dom.heroDateRangeTrigger);
    if (!clickedInsidePicker && !clickedTrigger) hideHeroDateRangePicker();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideHeroDateRangePicker();
  });

  dom.heroBookingForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (bookingType === 'food') {
      window.location.href = '/eat-sip';
      return;
    }

    const adults = Math.max(1, Number(dom.heroAdults.value || 1));
    const children = Math.max(0, Number(dom.heroChildren.value || 0));
    const maxRooms = Math.max(1, state.rooms.length);
    const roomCount = Math.min(maxRooms, Math.max(1, Number(dom.heroRoomCount.value || 1)));
    const params = new URLSearchParams();

    if (dom.heroCheckIn.value) params.set('checkIn', dom.heroCheckIn.value);
    if (dom.heroCheckOut.value) params.set('checkOut', dom.heroCheckOut.value);
    params.set('adults', String(adults));
    params.set('children', String(children));
    params.set('rooms', String(roomCount));
    params.set('guests', String(adults + children));

    window.location.href = `/offers-prices?${params.toString()}#booking`;
  });
}

function setPaymentOption(value) {
  dom.paymentOption.value = value;
  dom.paymentOptionGroup?.querySelectorAll('[data-payment-option]').forEach((item) => {
    item.classList.toggle('is-selected', item.dataset.paymentOption === value);
  });

  if (dom.bankTransferPanel) {
    dom.bankTransferPanel.hidden = value !== 'bank_transfer';
  }
  if (dom.bankDetailsBox) {
    dom.bankDetailsBox.hidden = true;
  }
}

function configurePaymentOptionButtons() {
  if (!dom.paymentOptionGroup) return;

  dom.paymentOptionGroup.querySelectorAll('[data-payment-option]').forEach((button) => {
    button.addEventListener('click', () => setPaymentOption(button.dataset.paymentOption));
  });

  dom.showBankDetailsBtn?.addEventListener('click', () => {
    if (dom.bankDetailsBox) dom.bankDetailsBox.hidden = !dom.bankDetailsBox.hidden;
  });
}

function configurePhoneInput() {
  dom.phoneCountry.addEventListener('change', () => {
    updatePhoneInputRules();
    normalizeLocalPhoneInput();
  });

  dom.guestPhoneLocal.addEventListener('input', normalizeLocalPhoneInput);
  dom.guestPhoneLocal.addEventListener('blur', () => {
    const selected = dom.phoneCountry.selectedOptions[0];
    const dialDigits = String(selected?.dataset.dial || '').replace(/\D/g, '');
    const maxLocalLength = Math.max(6, 15 - dialDigits.length);
    const minLocalLength = Math.min(6, maxLocalLength);
    const localDigits = dom.guestPhoneLocal.value.replace(/\D/g, '');
    if (localDigits.length && (localDigits.length < minLocalLength || localDigits.length > maxLocalLength)) {
      dom.guestPhoneLocal.setCustomValidity(t('status.phoneLengthRange', { min: minLocalLength, max: maxLocalLength }));
      dom.guestPhoneLocal.reportValidity();
      return;
    }

    dom.guestPhoneLocal.setCustomValidity('');
  });

  updatePhoneInputRules();
  loadPhoneCountries();
}

function configureLocationRoute() {
  if (!dom.useLocation) return;
  dom.useLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
      dom.locationStatus.textContent = t('location.noSupport');
      return;
    }

    dom.locationStatus.textContent = t('location.reading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const routeUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${PROPERTY_COORDS.lat},${PROPERTY_COORDS.lng}`;
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
  const browserLanguage = (navigator.language || 'en').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(browserLanguage) && browserLanguage !== state.language) {
    return browserLanguage;
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if ((timezone.includes('Berlin') || timezone.includes('Vienna') || timezone.includes('Zurich')) && state.language !== 'de') {
    return 'de';
  }

  return null;
}

function configureLanguagePreference() {
  dom.languageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setLanguage(button.dataset.languageOption);
    });
  });
  applyTranslations();

  const promptAlreadyShown = localStorage.getItem('language_prompt_seen') === '1';
  const suggestedLanguage = getSuggestedLanguage();

  if (!promptAlreadyShown && suggestedLanguage) {
    dom.languagePromptText.textContent = t('languagePrompt.body', { language: languageLabel(suggestedLanguage) });
    dom.languagePrompt.hidden = false;

    dom.languageYes.onclick = () => {
      setLanguage(suggestedLanguage);
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

function configureChatbot() {
  dom.chatbotToggle.addEventListener('click', () => {
    dom.chatbotPanel.hidden = !dom.chatbotPanel.hidden;
  });

  dom.chatbotClose.addEventListener('click', () => {
    dom.chatbotPanel.hidden = true;
  });
}

function configurePropertyGallery() {
  dom.propertyGalleryPrev?.addEventListener('click', () => {
    showPropertyGalleryImage(state.propertyGalleryIndex - 1);
  });

  dom.propertyGalleryNext?.addEventListener('click', () => {
    showPropertyGalleryImage(state.propertyGalleryIndex + 1);
  });

  dom.propertyGalleryStage?.addEventListener('click', (event) => {
    if (event.target.closest('.property-gallery-control')) return;
    openPropertyLightbox(state.propertyGalleryIndex);
  });

  dom.propertyGalleryStage?.addEventListener('keydown', (event) => {
    if (event.target.closest('.property-gallery-control')) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPropertyLightbox(state.propertyGalleryIndex);
    }
  });

  dom.propertyLightboxClose?.addEventListener('click', closePropertyLightbox);
  dom.propertyLightboxBackdrop?.addEventListener('click', closePropertyLightbox);
  dom.propertyLightboxPrev?.addEventListener('click', () => {
    showPropertyGalleryImage(state.propertyGalleryIndex - 1);
  });
  dom.propertyLightboxNext?.addEventListener('click', () => {
    showPropertyGalleryImage(state.propertyGalleryIndex + 1);
  });

  window.addEventListener('keydown', (event) => {
    if (!state.propertyLightboxOpen) return;

    if (event.key === 'Escape') {
      closePropertyLightbox();
      return;
    }

    if (event.key === 'ArrowLeft') {
      showPropertyGalleryImage(state.propertyGalleryIndex - 1);
      return;
    }

    if (event.key === 'ArrowRight') {
      showPropertyGalleryImage(state.propertyGalleryIndex + 1);
      return;
    }

    if (event.key === 'Tab') {
      const focusable = [dom.propertyLightboxClose, dom.propertyLightboxPrev, dom.propertyLightboxNext].filter(Boolean);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
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
    state.contentPages = data.contentPages || [];
    state.heroSlides = data.heroSlides || [];
    state.chatbot = data.chatbot || null;
    state.chatbotFaqs = data.chatbotFaqs || [];
    state.currencies = data.currencies?.length ? data.currencies : state.currencies;

    await loadExchangeRate(currentCurrency());
    applySettings();
    renderLinks();
    renderCurrencies();
    renderRooms();
    renderAmenities();
    renderPageContent();
    renderPropertyGallery();
    applyPageVisibility();
    renderChatbot();
    applyBookingQueryParams();
    updateStructuredData();
    applyTranslations();
    refreshIcons();
  } catch (error) {
    dom.quoteBox.textContent = t('status.bookingServiceDown');
  }
}

applyTranslations();
setFooterYear();
configureHeroControls();
configureLanguagePreference();
configureDateInputs();
configureHeroBookingShortcut();
configureMobileNav();
configurePhoneInput();
configurePaymentOptionButtons();
configureLocationRoute();
configureInstallPrompt();
registerServiceWorker();
configureChatbot();
configurePropertyGallery();
configureClientRouting();
configureOfferSelectButtons();

dom.bookingForm.addEventListener('submit', submitBooking);

window.addEventListener('load', refreshIcons);

boot();
