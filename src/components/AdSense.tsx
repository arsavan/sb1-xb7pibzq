import React, { useEffect, useRef } from 'react';

interface AdSenseProps {
  style?: React.CSSProperties;
  className?: string;
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  fullWidth?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSense({ 
  style, 
  className = '', 
  adSlot,
  adFormat = 'auto',
  fullWidth = true
}: AdSenseProps) {
  const adRef = useRef<HTMLInsElement>(null);
  const initialized = useRef(false);
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    // Ne rien faire si l'élément n'existe pas ou s'il a déjà été initialisé
    if (!adRef.current || initialized.current) return;

    try {
      // Initialiser le tableau adsbygoogle s'il n'existe pas
      if (typeof window.adsbygoogle === 'undefined') {
        window.adsbygoogle = [];
      }

      // Marquer comme initialisé avant de pousser la nouvelle annonce
      initialized.current = true;
      
      // Utiliser un setTimeout pour s'assurer que le DOM est complètement chargé
      setTimeout(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }, 0);

    } catch (e) {
      console.error('AdSense initialization error:', e);
      initialized.current = false;
    }

    // Nettoyage lors du démontage
    return () => {
      initialized.current = false;
    };
  }, [adSlot]);

  // Ne rien rendre si les identifiants ne sont pas configurés
  if (!clientId || !adSlot) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          overflow: 'hidden',
          ...(fullWidth ? { width: '100%' } : {}),
          ...style
        }}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}