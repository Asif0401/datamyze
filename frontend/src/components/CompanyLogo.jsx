import { useState } from 'react';
import { getLogoUrl, COMPANY_EMOJIS } from '../utils/companyLogos';

/**
 * Shows a real brand logo.
 * Falls back to styled initial on white circle if logo fails.
 */
export default function CompanyLogo({ company, size = 40, radius = 10, color = '#4A90D9', bg }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getLogoUrl(company);
  const emoji   = COMPANY_EMOJIS[company] || '🏢';
  const bgColor = bg || `${color}18`;

  /* Fallback: emoji in coloured box */
  if (!logoUrl || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius,
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.48, flexShrink: 0,
      }}>
        {emoji}
      </div>
    );
  }

  /* Real logo — white background so dark text logos are visible */
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: '#ffffff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
      padding: Math.max(3, size * 0.08),
      boxSizing: 'border-box',
    }}>
      <img
        src={logoUrl}
        alt={company}
        onError={() => setFailed(true)}
        style={{
          width: '100%', height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
