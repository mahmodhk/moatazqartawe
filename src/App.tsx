import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Instagram,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Plus,
  Sun,
  X,
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { content } from '@/content';

const whatsappHref = `https://wa.me/${content.phoneIntl}?text=${encodeURIComponent(content.whatsappMessage)}`;
const bidiTerms = new Set(['SEE FAR CBT', 'Gestalt Therapy', 'EMDR', 'CBT', 'ACT']);

function bidiText(text: string): ReactNode {
  return text.split(/(SEE FAR CBT|Gestalt Therapy|EMDR|CBT|ACT)/g).map((part, index) =>
    bidiTerms.has(part) ? (
      <bdi dir="ltr" key={`${part}-${index}`}>
        {part}
      </bdi>
    ) : (
      part
    ),
  );
}

function Icon({ name, size = 20 }: { name: 'whatsapp'; size?: number }) {
  if (name === 'whatsapp') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.56 0 .24 5.31.24 11.85c0 2.09.55 4.14 1.58 5.94L.13 24l6.36-1.67a11.84 11.84 0 0 0 5.6 1.42h.01c6.53 0 11.85-5.32 11.85-11.85 0-3.17-1.23-6.15-3.43-8.42ZM12.1 21.8h-.01a9.82 9.82 0 0 1-5.01-1.37l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.82 9.82 0 0 1-1.5-5.3C2.22 6.41 6.65 1.98 12.1 1.98a9.78 9.78 0 0 1 6.96 2.89 9.8 9.8 0 0 1 2.88 6.98c0 5.48-4.44 9.95-9.84 9.95Zm5.42-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"
        />
      </svg>
    );
  }
  return null;
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    setReady(true);
    if (!node) {
      setVisible(true);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, ready, visible] as const;
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, ready, visible] = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${ready ? 'reveal-ready' : ''} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function WhatsAppButton({
  className = '',
  bookingRef,
  children = content.ui.book,
}: {
  className?: string;
  bookingRef?: (node: HTMLAnchorElement | null) => void;
  children?: ReactNode;
}) {
  return (
    <a
      ref={bookingRef}
      className={`button button-whatsapp ${className}`}
      href={whatsappHref}
      target="_blank"
      rel="noopener"
    >
      <Icon name="whatsapp" size={22} />
      <span>{children}</span>
    </a>
  );
}

function App() {
  const [dark, setDark] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number[]>([]);
  const [bookingVisible, setBookingVisible] = useState(false);
  const bookingButtons = useRef<HTMLElement[]>([]);
  const [timelineRef, timelineReady, timelineVisible] = useReveal<HTMLDivElement>();

  useEffect(() => {
    const root = document.documentElement;
    const initial = root.dataset.theme === 'dark';
    setDark(initial);
    const frame = requestAnimationFrame(() => setMotionReady(true));
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const nodes = bookingButtons.current.filter(Boolean);
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => setBookingVisible(entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6)),
      { threshold: [0.6] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const setTheme = (next: boolean) => {
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? '#0F1712' : '#F5F1E6');
    try {
      localStorage.setItem('moataz-theme', next ? 'dark' : 'light');
    } catch {
      // Theme persistence is a convenience and can be unavailable in private browsing.
    }
  };

  const registerBooking = (node: HTMLAnchorElement | null) => {
    if (node && !bookingButtons.current.includes(node)) bookingButtons.current.push(node);
  };

  const toggleFaq = (index: number) => {
    setFaqOpen((open) => (open.includes(index) ? open.filter((item) => item !== index) : [...open, index]));
  };

  const verifiedMedia = useMemo(() => content.media.filter((item) => item.verified), []);

  const navItems = [
    { label: content.ui.nav[0], href: '#areas' },
    { label: content.ui.nav[1], href: '#booking' },
    { label: content.ui.nav[2], href: '#about' },
    { label: content.ui.nav[3], href: '#faq' },
  ];

  return (
    <div className={`site-shell ${motionReady ? 'motion-ready' : ''}`}>
      <div className="topbar">
        <div className="page-width topbar-inner">
          <span className="topbar-name">
            {content.name}، {content.title}
          </span>
          <div className="topbar-contact">
            <span>{content.town}</span>
            <span className="topbar-divider" aria-hidden="true" />
            <a href={`tel:+${content.phoneIntl}`}>
              <Phone size={15} aria-hidden="true" />
              <bdi dir="ltr">{content.phoneDisplay}</bdi>
            </a>
          </div>
        </div>
      </div>

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="page-width header-inner">
          <a className="brand" href="#top" aria-label={content.name}>
            <img className="brand-dark" src="/logo.png" alt={content.name} width="132" height="97" />
            <img className="brand-light" src="/logo-light.png" alt={content.name} width="132" height="97" />
          </a>
          <nav className="desktop-nav" aria-label={content.ui.menu}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="theme-toggle"
              type="button"
              aria-label={content.ui.themeToggle}
              onClick={() => setTheme(!dark)}
            >
              <Sun className={`theme-sun ${dark ? 'is-hidden' : ''}`} size={18} aria-hidden="true" />
              <Moon className={`theme-moon ${dark ? '' : 'is-hidden'}`} size={18} aria-hidden="true" />
            </button>
            <button
              className="menu-toggle"
              type="button"
              aria-label={content.ui.menu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}>
          <nav aria-label={content.ui.menu}>
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                style={{ '--menu-delay': `${index * 40}ms` } as CSSProperties}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="top">
        <h1 className="sr-only">{content.name}، {content.title}</h1>
        <section className="hero section-pad" aria-labelledby="hero-title">
          <img className="hero-mark" src="/mark.png" alt="" width="700" height="440" aria-hidden="true" />
          <div className="page-width hero-grid">
            <div className="hero-copy">
              <blockquote className="hero-quote" id="hero-title">
                <span className="sr-only">{content.heroQuote}</span>
                <span className="quote-visible" aria-hidden="true">
                  {content.heroQuoteLines.map((line, index) => (
                      <span key={line} className="quote-line" style={{ '--line-delay': `${index * 110}ms` } as CSSProperties}>
                      {line}
                    </span>
                  ))}
                </span>
                <span className="quote-attribution">
                  {content.name}، {content.title}
                </span>
              </blockquote>
              <p className="hero-intro hero-stagger">{bidiText(content.heroIntro)}</p>
              <div className="hero-actions hero-stagger">
                <WhatsAppButton bookingRef={registerBooking} />
                <a className="button button-ghost" href="#areas">
                  {content.ui.ghost}
                </a>
              </div>
              <div className="availability hero-stagger">
                <span className="availability-dot" aria-hidden="true" />
                <span>{content.availabilityNote}</span>
                {content.moveNote ? <span>{content.moveNote}</span> : null}
              </div>
            </div>

            <div className="portrait-column">
              <div className="portrait-card">
                <picture>
                  <source srcSet="/portrait.webp" type="image/webp" />
                  <img src="/portrait.jpg" alt={content.fullName} width="820" height="1024" />
                </picture>
                <div className="portrait-name">
                  <strong>{content.name}</strong>
                  <span>{content.title}</span>
                </div>
              </div>
              <ul className="portrait-checklist">
                {content.portraitChecklist.map((item) => (
                  <li key={item}>
                    <Check size={18} aria-hidden="true" />
                    <span>{bidiText(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-pad areas-section" id="areas" aria-labelledby="areas-heading">
          <div className="page-width">
            <Reveal>
              <div className="section-heading">
                <h2 id="areas-heading">{content.ui.areasHeading}</h2>
              </div>
            </Reveal>
            <div className="areas-list">
              {content.areas.map((area, index) => (
                <Reveal key={area.title} delay={index * 100}>
                  <article className="area-item">
                    <div>
                      <h3>{area.title}</h3>
                      <p>{bidiText(area.text)}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            <p className="other-areas">{bidiText(content.otherAreas)}</p>
            <div className="adults-pill">
              <Check size={17} aria-hidden="true" />
              <span>{content.ui.adults}</span>
            </div>
          </div>
        </section>

        <section className="section-pad booking-section" id="booking" aria-labelledby="booking-heading">
          <div className="page-width">
            <Reveal>
              <div className="section-heading">
                <h2 id="booking-heading">{content.ui.bookingHeading}</h2>
                <p>{content.ui.bookingSubline}</p>
              </div>
            </Reveal>
            <div
              ref={timelineRef}
              className={`timeline ${timelineReady ? 'timeline-ready' : ''} ${timelineVisible ? 'timeline-visible' : ''}`}
            >
              {content.steps.map((step, index) => (
                <Reveal key={step.title} delay={index * 80}>
                  <article className="timeline-step">
                    <span className="step-number">{index + 1}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{bidiText(step.text)}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            <div className="booking-cta">
              <WhatsAppButton bookingRef={registerBooking} />
              <p className="cancel-note">{content.cancelNote}</p>
              <a className="phone-line" href={`tel:+${content.phoneIntl}`}>
                <Phone size={17} aria-hidden="true" />
                <span>{content.ui.call} <bdi dir="ltr">{content.phoneDisplay}</bdi></span>
              </a>
            </div>
          </div>
        </section>

        <section className="section-pad about-section" id="about" aria-labelledby="about-heading">
          <div className="page-width">
            <Reveal>
              <div className="section-heading">
                <h2 id="about-heading">{content.ui.aboutHeading.replace('{name}', content.name)}</h2>
              </div>
            </Reveal>
            <p className="about-intro">{bidiText(content.aboutIntro)}</p>
            <div className="about-columns">
              <div className="ruled-list">
                <h3>{content.ui.approaches}</h3>
                {content.approaches.map((approach, index) => (
                  <Reveal key={approach.title} delay={index * 60}>
                    <div className="approach-row">
                      <h4>{bidiText(approach.title)}</h4>
                      <p>{bidiText(approach.text)}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="about-side">
                <div className="ruled-list credentials-list">
                  <h3>{content.ui.credentials}</h3>
                  {content.credentials.map((credential, index) => (
                    <Reveal key={credential} delay={index * 60}>
                      <div className="credential-row">
                        <Check size={18} aria-hidden="true" />
                        <span>{bidiText(credential)}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <div className="ruled-list experience-list">
                  <h3>{content.ui.experience}</h3>
                  {content.experience.map((item, index) => (
                    <Reveal key={`${item.when}-${item.text}`} delay={index * 60}>
                      <div className="experience-row">
                        <span className="experience-when">{item.when}</span>
                        <span>{bidiText(item.text)}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {verifiedMedia.length > 0 ? (
          <section className="section-pad media-section" aria-labelledby="media-heading">
            <div className="page-width">
              <Reveal>
                <div className="section-heading">
                  <h2 id="media-heading">{content.ui.mediaHeading}</h2>
                </div>
              </Reveal>
              <div className="media-list">
                {verifiedMedia.map((item) => (
                  <a className="media-item" href={item.url} target="_blank" rel="noopener" key={item.url}>
                    <div>
                      <strong>{item.outlet}</strong>
                      {item.program ? <span>{bidiText(item.program)}</span> : null}
                    </div>
                    <div className="media-meta">
                      {item.date ? <span>{item.date}</span> : null}
                      {item.topic ? <span>{bidiText(item.topic)}</span> : null}
                    </div>
                    <span className="media-link">{content.ui.mediaLink}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="section-pad faq-section" id="faq" aria-labelledby="faq-heading">
          <div className="page-width narrow-width">
            <Reveal>
              <div className="section-heading">
                <h2 id="faq-heading">{content.ui.faqHeading}</h2>
              </div>
            </Reveal>
            <div className="faq-list">
              {content.faq.map((item, index) => {
                const open = faqOpen.includes(index);
                const panelId = `faq-panel-${index}`;
                return (
                  <div className={`faq-item ${open ? 'is-open' : ''}`} key={item.q}>
                    <button
                      className="faq-trigger"
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{bidiText(item.q)}</span>
                      <Plus size={21} aria-hidden="true" />
                    </button>
                    <div className="faq-panel" id={panelId} role="region">
                      <div>
                        <p>{bidiText(item.a)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-pad emergency-section" aria-labelledby="emergency-heading">
          <div className="page-width">
            <div className="emergency-box">
              <div className="emergency-copy">
                <div className="emergency-title">
                  <AlertTriangle size={22} aria-hidden="true" />
                  <h2 id="emergency-heading">{content.ui.emergencyHeading}</h2>
                </div>
                <p>{bidiText(content.emergencyText)}</p>
              </div>
              <div className="emergency-numbers">
                {content.emergencyNumbers.map((item) => (
                  <a href={`tel:${item.number}`} className="emergency-number" key={item.number}>
                    <bdi dir="ltr">{item.number}</bdi>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-inner">
          <img src="/logo-light.png" alt={content.name} width="132" height="97" />
          <div className="footer-links">
            <a href={whatsappHref} target="_blank" rel="noopener">
              <Icon name="whatsapp" size={18} />
              {content.ui.footerWhatsapp}
            </a>
            <a href={`tel:+${content.phoneIntl}`}>
              <Phone size={17} aria-hidden="true" />
              <bdi dir="ltr">{content.phoneDisplay}</bdi>
            </a>
            <a href={`mailto:${content.email}`}>
              <Mail size={17} aria-hidden="true" />
              <bdi dir="ltr">{content.email}</bdi>
            </a>
            <a href={`https://www.instagram.com/${content.instagramHandle}/`} target="_blank" rel="noopener">
              <Instagram size={17} aria-hidden="true" />
              <bdi dir="ltr">@{content.instagramHandle}</bdi>
            </a>
          </div>
          <p>{bidiText(content.ui.footerSentence)}</p>
        </div>
      </footer>

      <a
        className={`floating-whatsapp ${bookingVisible ? 'is-hidden' : ''}`}
        href={whatsappHref}
        target="_blank"
        rel="noopener"
        aria-label={content.ui.floating}
      >
        <Icon name="whatsapp" size={22} />
        <span>{content.ui.floating}</span>
      </a>
    </div>
  );
}

export default App;