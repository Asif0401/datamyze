/* ── Company domain map for Clearbit logo API ─────── */
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
  'HCL':                   'hcltech.com',
  'Accenture':             'accenture.com',
  'Deloitte':              'deloitte.com',
  'HDFC Bank':             'hdfcbank.com',
  'ICICI Bank':            'icicibank.com',
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
  'Google India':          '🔍',
  'Google':                '🔍',
};

export function getLogoUrl(company, size = 64) {
  const domain = COMPANY_DOMAINS[company];
  if (!domain) return null;
  return `https://logo.clearbit.com/${domain}?size=${size}`;
}
