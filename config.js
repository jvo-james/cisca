export const CISCA_CONFIG = {
  brand: 'Cisca Makeovers',
  shortBrand: 'Cisca',
  currency: 'GHS',
  locale: 'en-GH',
  apiBase: '/api',
  whatsapp: '233594186445',
  phoneDisplay: '059 418 6445',
  instagram: 'https://instagram.com/cisca.makeovers',
  youtube: 'https://youtube.com/@Cisca.makeovers',
  pinterest: 'https://pinterest.com/CiscaMakeovers',
  tutorialUrl: 'https://youtu.be/DeEDTwUDMW8?si=VB6Ypl2O5I3PlY0T',
  firebase: {
    apiKey: 'AIzaSyB8CYqFZTBA6rU7woBQNk2rn_yOkPsk-q8',
    authDomain: 'cisca-makeovers-e7c3c.firebaseapp.com',
    projectId: 'cisca-makeovers-e7c3c',
    storageBucket: 'cisca-makeovers-e7c3c.firebasestorage.app',
    messagingSenderId: '660012189991',
    appId: '1:660012189991:web:01876947ee756491c30102'
  }
};

export const DEFAULT_SITE = Object.freeze({
  brand: CISCA_CONFIG.brand,
  tagline: 'Beauty Studio · Academy · Shop',
  heroKicker: 'Cisca Beauty',
  heroTitle: 'Your beauty.<br>Your moment.',
  heroText: 'Looks worth remembering, skills worth keeping and beauty essentials chosen with care.',
  locationLabel: '',
  phoneDisplay: CISCA_CONFIG.phoneDisplay,
  whatsapp: CISCA_CONFIG.whatsapp,
  instagram: CISCA_CONFIG.instagram,
  youtube: CISCA_CONFIG.youtube,
  pinterest: CISCA_CONFIG.pinterest,
  footerText: 'Beauty services, practical classes and beauty essentials in one place.'
});

export const money = value => new Intl.NumberFormat(CISCA_CONFIG.locale, {
  style: 'currency',
  currency: CISCA_CONFIG.currency,
  maximumFractionDigits: 2
}).format(Number(value || 0));
