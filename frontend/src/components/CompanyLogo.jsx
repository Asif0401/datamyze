import { useState } from 'react';
import { getLogoUrl, COMPANY_ABBR } from '../utils/companyLogos';

/**
 * Shows a real company logo via Google's favicon service (sz=128).
 * Falls back to a styled abbreviation with brand colour if logo fails.
 */
export default function CompanyLogo({ company, size = 40, radius = 10, color = '#4A90D9', bg }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getLogoUrl(company);
  const abbr    = COMPANY_ABBR[company] || company.slice(0, 2).toUpperCase();

  /* Styled abbreviation fallback */
  const Fallback = () => (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * (abbr.length > 2 ? 0.28 : 0.36),
      fontWeight: 900, color: '#fff',
      letterSpacing: '-0.5px',
      flexShrink: 0,
    }}>
      {abbr}
    </div>
  );

  if (!logoUrl || failed) return <Fallback />;

  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
      padding: Math.max(2, size * 0.06),
      boxSizing: 'border-box',
    }}>
      <img
        src={logoUrl}
        alt={company}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
