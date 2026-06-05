/* ── Company domain map — for Google S2 logo service ─ */
export const COMPANY_DOMAINS = {
  'Flipkart':              'flipkart.com',
  'Amazon India':          'amazon.in',
  'Amazon':                'amazon.com',
  'Swiggy':                'swiggy.com',
  'Zomato':                'zomato.com',
  'PhonePe':               'phonepe.com',
  'Razorpay':              'razorpay.com',
  'Meesho':                'meesho.com',
  'CRED':                  'cred.club',
  'Dream11':               'dream11.com',
  'Walmart Global Tech':   'walmart.com',
  'Google India':          'google.com',
  'Google':                'google.com',
  'Nykaa':                 'nykaa.com',
  'Paytm':                 'paytm.com',
  'MakeMyTrip':            'makemytrip.com',
  'Ola':                   'olacabs.com',
  'Uber':                  'uber.com',
  'Infosys':               'infosys.com',
  'TCS':                   'tcs.com',
  'Wipro':                 'wipro.com',
  'Deloitte':              'deloitte.com',
  'Accenture':             'accenture.com',
  'HDFC Bank':             'hdfcbank.com',
  'ICICI Bank':            'icicibank.com',
};

/* ── Short abbreviations shown when logo can't load ── */
export const COMPANY_ABBR = {
  'Flipkart':              'FK',
  'Amazon India':          'AMZ',
  'Amazon':                'AMZ',
  'Swiggy':                'SW',
  'Zomato':                'ZO',
  'PhonePe':               'PE',
  'Razorpay':              'RP',
  'Meesho':                'ME',
  'CRED':                  'CR',
  'Dream11':               'D11',
  'Walmart Global Tech':   'WMT',
  'Google India':          'G',
  'Google':                'G',
  'Nykaa':                 'NY',
  'Paytm':                 'PT',
  'Infosys':               'INFY',
  'TCS':                   'TCS',
  'Wipro':                 'WIP',
};

export const COMPANY_EMOJIS = {
  'Flipkart':              '🛒',
  'Amazon India':          '📦',
  'Amazon':                '📦',
  'Swiggy':                '🍔',
  'Zomato':                '🍕',
  'PhonePe':               '💸',
  'Razorpay':              '💳',
  'Meesho':                '🛍️',
  'CRED':                  '💎',
  'Dream11':               '🏏',
  'Walmart Global Tech':   '🏪',
};

/* Google S2 favicon — returns high-quality app icons at sz=128 */
export function getLogoUrl(company) {
  const domain = COMPANY_DOMAINS[company];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
