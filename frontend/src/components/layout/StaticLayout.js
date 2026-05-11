import Navbar from './Navbar';
import Footer from './Footer';

export default function StaticLayout({ title, children }) {
  return (
    <main>
      <Navbar />
      <section style={{ 
        padding: '120px 5% 80px', 
        maxWidth: '800px', 
        margin: '0 auto',
        minHeight: '70vh'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--serif)', 
          fontSize: '48px', 
          marginBottom: '40px',
          color: 'var(--text)'
        }}>
          {title}
        </h1>
        <div style={{ 
          color: 'var(--text2)', 
          fontSize: '18px', 
          lineHeight: '1.8',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {children}
        </div>
      </section>
      <Footer />
    </main>
  );
}
