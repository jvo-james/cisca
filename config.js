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
export const money = (value) => new Intl.NumberFormat(CISCA_CONFIG.locale, { style:'currency', currency:CISCA_CONFIG.currency, maximumFractionDigits:2 }).format(Number(value||0));
