/* ── Direct logo URLs — high-quality brand logos ──── */
export const LOGO_URLS = {
  'Flipkart':             'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Flipkart_logotype.svg/320px-Flipkart_logotype.svg.png',
  'Amazon India':         'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png',
  'Amazon':               'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png',
  'Swiggy':               'https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Swiggy_logo.svg/320px-Swiggy_logo.svg.png',
  'Zomato':               'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Zomato_logo.png/320px-Zomato_logo.png',
  'PhonePe':              'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/320px-PhonePe_Logo.svg.png',
  'Razorpay':             'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Razorpay_logo.svg/320px-Razorpay_logo.svg.png',
  'Meesho':               'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Meesho_logo.svg/320px-Meesho_logo.svg.png',
  'CRED':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/CRED_logo.svg/320px-CRED_logo.svg.png',
  'Dream11':              'https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Dream11_Logo.svg/320px-Dream11_Logo.svg.png',
  'Walmart Global Tech':  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Walmart_Spark.svg/240px-Walmart_Spark.svg.png',
  'Google':               'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/320px-Google_2015_logo.svg.png',
  'Google India':         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/320px-Google_2015_logo.svg.png',
  'Nykaa':                'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Nykaa_logo.svg/320px-Nykaa_logo.svg.png',
  'Paytm':                'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/240px-Paytm_Logo_%28standalone%29.svg.png',
  'Infosys':              'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/320px-Infosys_logo.svg.png',
  'TCS':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/320px-Tata_Consultancy_Services_Logo.svg.png',
  'Wipro':                'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/320px-Wipro_Primary_Logo_Color_RGB.svg.png',
  'Deloitte':             'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Deloitte.svg/320px-Deloitte.svg.png',
  'Accenture':            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/320px-Accenture.svg.png',
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

export function getLogoUrl(company) {
  return LOGO_URLS[company] || null;
}
