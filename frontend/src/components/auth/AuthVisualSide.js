'use client';
import { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    image: '/images/login-illustration.png',
    title: 'Find your calm.',
    sub: 'Make your emotional well-being easier and more organized with Solace.'
  },
  {
    image: '/images/login-illustration-2.png',
    title: 'Empathetic Peer Listening',
    sub: 'Connect with trained peers who listen to you with empathy and absolute confidentiality.'
  },
  {
    image: '/images/login-illustration-3.png',
    title: 'Your Personal Safe Space',
    sub: 'Navigate your emotional journey with journals, mood tracking, and scheduled bookings.'
  }
];

export default function AuthVisualSide() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index) => {
    if (index === currentSlide || isTransitioning) return;
    setIsTransitioning(true);

    // Wait for fade-out to complete, then swap content and fade-in
    setTimeout(() => {
      setCurrentSlide(index);
      // Small delay so browser paints the new content before fading in
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 400); // matches the CSS fade-out duration
  }, [currentSlide, isTransitioning]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      goToSlide(nextSlide);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, goToSlide]);

  return (
    <section className="login-visual-side">
      <div className="visual-card">
        <div
          className="carousel-slide-content"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'scale(0.97)' : 'scale(1)',
            transition: 'opacity 0.4s ease, transform 0.5s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <img
            src={slides[currentSlide].image}
            alt="Solace Illustration"
            className="visual-illustration"
          />

          <h2 className="visual-title">{slides[currentSlide].title}</h2>
          <p className="visual-sub">
            {slides[currentSlide].sub}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '30px', position: 'relative', zIndex: 10 }}>
          {slides.map((_, index) => {
            const isActive = index === currentSlide && !isTransitioning;
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: isActive ? '20px' : '8px',
                  height: '8px',
                  borderRadius: isActive ? '50px' : '50%',
                  background: isActive ? 'var(--text)' : 'var(--text3)',
                  opacity: isActive ? 1 : 0.3,
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.4s ease'
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
