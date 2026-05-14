export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-disclaimer">
          <strong>Important:</strong> Solace is a peer support community, not a mental health service. Our listeners are trained student volunteers — not licensed therapists, psychologists, or medical professionals.
        </div>
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo" style={{ color: '#fff', marginBottom: '12px', fontSize: '20px' }}>
              Sol<span style={{ color: 'var(--accent2)' }}>ace</span>
            </div>
            <p>A peer support space for students navigating stress, burnout, and overwhelm.</p>
          </div>
          <div className="footer-col">
            <h5>Platform</h5>
            <a href="/booking">Book a Session</a>
            <a href="/listeners">Our Listeners</a>
            <a href="#">Become a Listener</a>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/refund-policy">Refund Policy</a>
            <a href="/contact">Contact Us</a>
          </div>
          <div className="footer-col">
            <h5>Crisis Resources</h5>
            <a href="tel:9152987821">iCall: 9152987821</a>
            <a href="tel:18602662345">Vandrevala: 1860-2662-345</a>
            <a href="tel:112">Emergency: 112</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Solace Peer Support. Not a medical service.</span>
          <span>Made with care in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}
