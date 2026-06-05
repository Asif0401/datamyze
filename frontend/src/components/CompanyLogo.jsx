import { useState } from 'react';
import { getLogoUrl, COMPANY_EMOJIS } from '../utils/companyLogos';

/**
 * Shows a real company logo via Clearbit API.
 * Falls back to emoji if the logo fails to load.
 *
 * Props:
 *  company    – company name string
 *  size       – pixel size (default 40)
 *  radius     – border radius (default 10)
 *  color      – accent color for the container background (default transparent)
 *  bg         – explicit background override
 */
export default function CompanyLogo({ company, size = 40, radius = 10, color = '#4A90D9', bg }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getLogoUrl(company, size * 2); // 2x for retina
  const emoji   = COMPANY_EMOJIS[company] || '🏢';
  const bgColor = bg || `${color}18`;

  const containerStyle = {
    width: size, height: size,
    borderRadius: radius,
    background: bgColor,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  };

  if (!logoUrl || failed) {
    return (
      <div style={{ ...containerStyle, fontSize: size * 0.5 }}>
        {emoji}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <img
        src={logoUrl}
        alt={company}
        onError={() => setFailed(true)}
        style={{
          width: size - 6,
          height: size - 6,
          objectFit: 'contain',
          borderRadius: radius - 3,
        }}
      />
    </div>
  );
}
