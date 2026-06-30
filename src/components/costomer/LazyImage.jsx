import React, { useState, useEffect, useRef } from 'react';

export default React.memo(function LazyImage({ src, alt, className, eager, fallbackText, ...props }) {
  const [inView, setInView] = useState(eager ? true : false);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.unobserve(el); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  if (!src) {
    return (
      <div ref={ref} className={`${className || ''} bg-secondary flex items-center justify-center`}>
        <span className="text-muted-foreground font-display text-sm">{fallbackText || 'No Image'}</span>
      </div>
    );
  }

  if (!inView) {
    return (
      <div
        ref={ref}
        className={`${className || ''} animate-pulse bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded`}
      />
    );
  }

  if (errored) {
    const initials = (alt || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
      <div ref={ref} className={`${className || ''} bg-secondary flex items-center justify-center rounded`}>
        <span className="text-muted-foreground font-display text-lg font-bold">{initials}</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className={`${className || ''} animate-pulse bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded`} />
      )}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`${className || ''} transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
        style={{ willChange: 'transform' }}
        {...props}
      />
    </>
  );
});
