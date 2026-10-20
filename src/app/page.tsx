"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState('Clinic Visit');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSelectVisitOption = (serviceName: string) => {
    setSelectedService(serviceName);
    const target = document.getElementById('appointment');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, servicesRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/services'),
        ]);
        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (servicesRes.ok) {
          const sData = await servicesRes.json();
          if (Array.isArray(sData) && sData.length > 0) {
            setServices(sData.filter((s: any) => s.isActive !== false));
          }
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg(null);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const address = (fd.get('address') as string) || '';
    const rawNotes = (fd.get('notes') as string) || '';
    const finalNotes = address 
      ? `Visit Address: ${address}\n\nNotes: ${rawNotes}`.trim()
      : rawNotes;

    const data = {
      patientName: fd.get('name') as string,
      email:       fd.get('email') as string,
      phone:       fd.get('phone') as string,
      service:     (fd.get('service') as string) || selectedService,
      date:        fd.get('date') as string,
      time:        fd.get('time') as string,
      notes:       finalNotes,
    };
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: 'Appointment request submitted! A confirmation email has been sent to your inbox.' });
        form.reset();
      } else {
        const err = await res.json();
        setFeedbackMsg({ type: 'error', text: err.message || 'Failed to submit. Please try again.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const clinicName = loading ? 'Physio Care' : (settings?.clinicName || 'Physio Care');
  const navClose = () => setIsMenuOpen(false);

  return (
    <>
      {/* ═══════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════ */}
      <nav className="site-nav">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          {/* Brand */}
          <Link className="brand" href="/" onClick={navClose}>
            <i className="fas fa-hand-holding-medical"></i>
            <span>{clinicName}</span>
          </Link>

          {/* Desktop nav links — hidden on mobile via CSS */}
          <div className="nav-desktop-links">
            <a className="nav-link" href="#home"       onClick={navClose}>Home</a>
            <a className="nav-link" href="#services"   onClick={navClose}>Services</a>
            <a className="nav-link" href="#about"      onClick={navClose}>About</a>
            <a className="nav-link" href="#contact"    onClick={navClose}>Contact</a>
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              <a href="#appointment" className="btn btn-primary btn-sm" onClick={navClose}>
                <i className="fas fa-calendar-check"></i> Book Session
              </a>
              <Link href="/admin/login" className="btn btn-sm" style={{ background: '#f1f5f9', color: '#334155', border: '1.5px solid #e2e8f0', fontWeight: 600 }}>
                <i className="fas fa-lock" style={{ fontSize: '0.72rem' }}></i> Staff Portal
              </Link>
            </div>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="nav-hamburger"
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>

        {/* Mobile dropdown panel */}
        {isMenuOpen && (
          <div className="nav-mobile-panel">
            <a className="nav-mobile-link" href="#home"       onClick={navClose}>Home</a>
            <a className="nav-mobile-link" href="#services"   onClick={navClose}>Services</a>
            <a className="nav-mobile-link" href="#about"      onClick={navClose}>About</a>
            <a className="nav-mobile-link" href="#contact"    onClick={navClose}>Contact</a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', marginTop: '4px' }}>
              <a href="#appointment" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }} onClick={navClose}>
                <i className="fas fa-calendar-check"></i> Book Session
              </a>
              <Link href="/admin/login" className="btn btn-sm" style={{ background: '#f1f5f9', color: '#334155', border: '1.5px solid #e2e8f0', fontWeight: 600, justifyContent: 'center' }} onClick={navClose}>
                <i className="fas fa-lock" style={{ fontSize: '0.72rem' }}></i> Staff Portal
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section id="home" className="hero-medical">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div className="row g-5 align-items-center">
            {/* Left — Copy */}
            <div className="col-lg-6">
              <div className="hero-trust-badge">
                <i className="fas fa-heartbeat" style={{ color: '#5eead4' }}></i>
                Professional &amp; Compassionate Physiotherapy
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.18, marginBottom: '18px', color: '#fff' }}>
                Restoring Mobility, Strength &amp; Quality of Life
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: '8px' }}>
                Welcome to <strong style={{ color: '#fff' }}>{clinicName}</strong>. Our licensed physiotherapists deliver specialized clinic and bedside rehabilitation tailored to your recovery journey.
              </p>
              <div className="hero-cta-group">
                <a href="#appointment" className="btn btn-light btn-lg">
                  <i className="fas fa-calendar-check"></i> Book Appointment
                </a>
                <a href="#services" className="btn btn-outline-light btn-lg">
                  Explore Services
                </a>
              </div>
              <div className="hero-trust-list">
                <div className="hero-trust-item"><i className="fas fa-check-circle"></i> Certified Specialists</div>
                <div className="hero-trust-item"><i className="fas fa-check-circle"></i> Bedside &amp; In-Clinic</div>
                <div className="hero-trust-item"><i className="fas fa-check-circle"></i> Personalized Plans</div>
              </div>
            </div>

            {/* Right — Image */}
            <div className="col-lg-6 text-center">
              <div className="clinical-image-container">
                {/* Badge top */}
                <div className="clinical-badge clinical-badge-top">
                  <div className="badge-icon"><i className="fas fa-user-nurse"></i></div>
                  <div className="badge-text">
                    <strong>Certified Physiotherapist</strong>
                    <span>Hands-On Patient Support</span>
                  </div>
                </div>

                <div className="clinical-image-frame">
                  <Image
                    src="/images/clinical-care.jpg"
                    alt="Dedicated Clinical Physiotherapy Care at Physio Care"
                    width={480}
                    height={520}
                    priority
                    className="clinical-photo"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>

                {/* Badge bottom */}
                <div className="clinical-badge clinical-badge-bottom">
                  <div className="badge-icon" style={{ background: '#fff0f0', color: '#dc2626' }}>
                    <i className="fas fa-heartbeat"></i>
                  </div>
                  <div className="badge-text">
                    <strong>Bedside Recovery</strong>
                    <span>Inpatient &amp; Post-Surgical Care</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SERVICES (CLINIC VISIT & HOME VISIT OPTIONS)
      ═══════════════════════════════════════════════ */}
      <section id="services" style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-label">
              <i className="fas fa-stethoscope"></i> Care Options
            </span>
            <h2 className="section-title" style={{ marginBottom: '14px' }}>Our Physiotherapy Services</h2>
            <p style={{ color: '#64748b', maxWidth: '680px', margin: '0 auto', fontSize: '0.97rem', lineHeight: 1.7 }}>
              We provide two dedicated physiotherapy options designed around your lifestyle and recovery requirements — receive care at our Warakapola center or enjoy specialized bedside rehabilitation at your residence.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* OPTION 1: CLINIC VISIT */}
            <div className="col-lg-6">
              <div className="visit-option-card">
                <div className="visit-option-img-wrap">
                  <img
                    src="/images/services/physical-therapy.jpg"
                    alt="In-Clinic Physiotherapy Care at Physio Care"
                  />
                  <span className="visit-badge-pill visit-badge-clinic">
                    <i className="fas fa-clinic-medical"></i> In-Clinic Care
                  </span>
                </div>
                <div className="visit-option-body">
                  <div className="visit-option-header">
                    <div>
                      <h3 className="visit-option-title">Clinic Visit</h3>
                      <small style={{ color: '#0b6870', fontWeight: 600 }}>Warakapola Center</small>
                    </div>
                    <div className="visit-option-price-tag">
                      <div className="visit-option-price">LKR 3,500</div>
                      <span className="visit-option-duration"><i className="far fa-clock"></i> 45 Minutes Session</span>
                    </div>
                  </div>

                  <p className="visit-option-desc">
                    Comprehensive clinical consultation and hands-on physiotherapy rehabilitation utilizing specialized clinic apparatus, mobility tools, and guided therapeutic exercises.
                  </p>

                  <ul className="visit-checklist">
                    <li className="visit-check-item">
                      <i className="fas fa-check-circle" style={{ color: '#0b6870' }}></i>
                      <span><strong>Complete Clinical Evaluation:</strong> In-depth musculoskeletal assessment and joint mobility testing.</span>
                    </li>
                    <li className="visit-check-item">
                      <i className="fas fa-check-circle" style={{ color: '#0b6870' }}></i>
                      <span><strong>Advanced Therapy Equipment:</strong> Full access to resistance bands, traction apparatus, and clinical gym.</span>
                    </li>
                    <li className="visit-check-item">
                      <i className="fas fa-check-circle" style={{ color: '#0b6870' }}></i>
                      <span><strong>Targeted Mobilization:</strong> Hands-on joint manipulation, pain relief modalities, and posture realignment.</span>
                    </li>
                    <li className="visit-check-item">
                      <i className="fas fa-check-circle" style={{ color: '#0b6870' }}></i>
                      <span><strong>Private &amp; Sanitized Environment:</strong> Strict hygiene, air filtration, and sterile treatment rooms.</span>
                    </li>
                  </ul>

                  <div className="visit-option-footer">
                    <button
                      type="button"
                      onClick={() => handleSelectVisitOption('Clinic Visit')}
                      className="btn btn-primary w-100"
                      style={{ padding: '12px 20px', borderRadius: '10px', fontWeight: 700 }}
                    >
                      <i className="fas fa-calendar-check me-2"></i> Book Clinic Visit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* OPTION 2: HOME VISIT */}
            <div className="col-lg-6">
              <div className="visit-option-card">
                <div className="visit-option-img-wrap">
                  <img
                    src="/images/clinical-care.jpg"
                    alt="Bedside and Home Physiotherapy Care by Physio Care"
                  />
                  <span className="visit-badge-pill visit-badge-home">
                    <i className="fas fa-home"></i> Bedside &amp; Home Care
                  </span>
                </div>
                <div className="visit-option-body">
                  <div className="visit-option-header">
                    <div>
                      <h3 className="visit-option-title">Home Visit</h3>
                      <small style={{ color: '#16a34a', fontWeight: 600 }}>At Patient Residence</small>
                    </div>
                    <div className="visit-option-price-tag">
                      <div className="visit-option-price" style={{ color: '#16a34a' }}>LKR 5,000</div>
                      <span className="visit-option-duration"><i className="far fa-clock"></i> 60 Minutes Session</span>
                    </div>
                  </div>

                  <p className="visit-option-desc">
                    Compassionate, one-on-one bedside physiotherapy administered directly at your home. Ideal for post-operative individuals, bedridden patients, and elderly mobility recovery.
                  </p>

                  <ul className="visit-checklist">
                    <li className="visit-check-item">
                      <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                      <span><strong>Zero Travel Stress:</strong> Safe, comfortable recovery in your personal home environment without difficult travel.</span>
                    </li>
                    <li className="visit-check-item">
                      <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                      <span><strong>Bedside &amp; Post-Surgical Rehab:</strong> Gentle limb mobilization, wound-safe movement, and circulation support.</span>
                    </li>
                    <li className="visit-check-item">
                      <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                      <span><strong>Geriatric Mobility &amp; Gait:</strong> Safe transfer training, balance restoration, and fall prevention.</span>
                    </li>
                    <li className="visit-check-item">
                      <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                      <span><strong>Caregiver Instruction:</strong> Practical training for family members on safe positioning and assisted movement.</span>
                    </li>
                  </ul>

                  <div className="visit-option-footer">
                    <button
                      type="button"
                      onClick={() => handleSelectVisitOption('Home Visit')}
                      className="btn btn-success w-100"
                      style={{ padding: '12px 20px', borderRadius: '10px', fontWeight: 700, background: '#16a34a', borderColor: '#16a34a' }}
                    >
                      <i className="fas fa-home me-2"></i> Book Home Visit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ABOUT
      ═══════════════════════════════════════════════ */}
      <section id="about" style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div className="row g-5 align-items-center">
            {/* Left — text */}
            <div className="col-lg-6">
              <span className="section-label">
                <i className="fas fa-hospital-user"></i> Clinical Philosophy
              </span>
              <h2 className="section-title" style={{ marginBottom: '18px' }}>
                Compassionate, Person-Centered Healthcare
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.97rem', lineHeight: 1.75, marginBottom: '14px' }}>
                At <strong style={{ color: '#0f172a' }}>{clinicName}</strong>, we recognize that true healing requires more than clinical expertise — it demands empathy, gentle encouragement, and meticulous attention to individual needs.
              </p>
              <p style={{ color: '#64748b', fontSize: '0.97rem', lineHeight: 1.75, marginBottom: '28px' }}>
                Whether assisting an elderly patient with bedside mobility exercises, helping post-operative individuals regain their stride, or relieving persistent muscular pain, our team is right beside you at every stage.
              </p>
              <div className="row g-2">
                {[
                  'Bedside Mobility & Inpatient Rehab',
                  'Post-Operative Joint Care',
                  'Geriatric Strength & Balance',
                  'Evidence-Based Treatment Plans',
                ].map(item => (
                  <div key={item} className="col-sm-6">
                    <div className="feature-check">
                      <i className="fas fa-check-circle"></i>
                      <span>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — stats */}
            <div className="col-lg-6">
              <div className="row g-3">
                {[
                  { icon: 'fas fa-user-check', color: '#0b6870', bg: '#e8f5f6', val: '500+', lbl: 'Treated Patients' },
                  { icon: 'fas fa-award',      color: '#16a34a', bg: '#f0fdf4', val: '10+',  lbl: 'Years Experience' },
                  { icon: 'fas fa-user-md',    color: '#0284c7', bg: '#f0f9ff', val: '100%', lbl: 'Licensed Specialists' },
                  { icon: 'fas fa-heart',      color: '#dc2626', bg: '#fef2f2', val: '98%',  lbl: 'Patient Satisfaction' },
                ].map(st => (
                  <div key={st.lbl} className="col-6">
                    <div className="stat-box">
                      <i className={st.icon} style={{ fontSize: '1.4rem', color: st.color }}></i>
                      <div className="stat-number">{st.val}</div>
                      <div className="stat-label">{st.lbl}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <i className="fas fa-shield-alt" style={{ fontSize: '1.8rem', color: '#0b6870', flexShrink: 0 }}></i>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Fully Certified &amp; Hygienic Protocol</div>
                  <small style={{ color: '#64748b' }}>Strict adherence to clinical hygiene, PPE, and sanitization standards.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          APPOINTMENT BOOKING
      ═══════════════════════════════════════════════ */}
      <section id="appointment" className="appt-section">
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', color: '#fff' }}>
            <span className="section-label section-label-white">
              <i className="fas fa-calendar-alt"></i> Schedule Your Consultation
            </span>
            <h2 className="section-title" style={{ color: '#fff', marginBottom: '12px' }}>Book an Appointment</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
              Select your preferred care option and fill out your details to reserve your consultation.
            </p>
          </div>

          <div className="appt-card">
            {feedbackMsg && (
              <div className={`alert ${feedbackMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '24px' }}>
                <i className={`fas ${feedbackMsg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                <div>{feedbackMsg.text}</div>
              </div>
            )}

            <form onSubmit={handleAppointmentSubmit}>
              <div className="row g-3">
                {/* CARE OPTION SELECTION */}
                <div className="col-12">
                  <label className="form-label" style={{ fontWeight: 700 }}>Choose Care Option *</label>
                  <div className="row g-2">
                    <div className="col-sm-6">
                      <div
                        onClick={() => setSelectedService('Clinic Visit')}
                        style={{
                          cursor: 'pointer',
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: selectedService === 'Clinic Visit' ? '2px solid #0b6870' : '1.5px solid #cbd5e1',
                          background: selectedService === 'Clinic Visit' ? '#e8f5f6' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: selectedService === 'Clinic Visit' ? '0 0 0 1px #0b6870' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <i className="fas fa-clinic-medical" style={{ color: '#0b6870', fontSize: '1.25rem' }}></i>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Clinic Visit</div>
                            <small style={{ color: '#64748b' }}>Warakapola Center • 45 mins</small>
                          </div>
                        </div>
                        <span style={{ fontWeight: 800, color: '#0b6870', fontSize: '0.95rem' }}>LKR 3,500</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div
                        onClick={() => setSelectedService('Home Visit')}
                        style={{
                          cursor: 'pointer',
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: selectedService === 'Home Visit' ? '2px solid #16a34a' : '1.5px solid #cbd5e1',
                          background: selectedService === 'Home Visit' ? '#f0fdf4' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: selectedService === 'Home Visit' ? '0 0 0 1px #16a34a' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <i className="fas fa-home" style={{ color: '#16a34a', fontSize: '1.25rem' }}></i>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Home Visit</div>
                            <small style={{ color: '#64748b' }}>Bedside at Home • 60 mins</small>
                          </div>
                        </div>
                        <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.95rem' }}>LKR 5,000</span>
                      </div>
                    </div>
                  </div>
                  <input type="hidden" name="service" value={selectedService} />
                </div>

                {/* Patient Information */}
                <div className="col-md-6">
                  <label className="form-label">Full Name *</label>
                  <input type="text" name="name" className="form-control" placeholder="e.g. John Silva" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Address *</label>
                  <input type="email" name="email" className="form-control" placeholder="name@example.com" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone Number *</label>
                  <input type="tel" name="phone" className="form-control" placeholder="+94 77 123 4567" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    <i className="far fa-calendar-alt text-primary me-1"></i> Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    min={getTodayString()}
                    required
                  />
                  <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                    <i className="fas fa-info-circle me-1"></i>Past dates cannot be selected
                  </small>
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    <i className="far fa-clock text-primary me-1"></i> Preferred Time (AM / PM) *
                  </label>
                  <select name="time" className="form-select" required defaultValue="">
                    <option value="" disabled>Choose Time Slot (AM / PM)...</option>
                    <optgroup label="Morning (AM)">
                      <option value="08:30 AM">08:30 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                    </optgroup>
                    <optgroup label="Afternoon &amp; Evening (PM)">
                      <option value="12:00 PM">12:00 PM (Noon)</option>
                      <option value="12:30 PM">12:30 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="01:30 PM">01:30 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="05:30 PM">05:30 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="06:30 PM">06:30 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                    </optgroup>
                  </select>
                </div>

                {/* Conditional Address Field for Home Visit */}
                {selectedService === 'Home Visit' && (
                  <div className="col-12">
                    <label className="form-label" style={{ fontWeight: 700, color: '#16a34a' }}>
                      <i className="fas fa-map-marker-alt me-1"></i> Home Visit Address / Residence Location *
                    </label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      placeholder="e.g. No. 42, Temple Road, Warakapola (Include nearby landmark for therapist arrival)"
                      required
                    />
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label">Clinical Notes / Condition (Optional)</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    rows={3}
                    placeholder="Describe any symptoms, recent surgery, mobility restrictions, or special instructions..."
                  ></textarea>
                </div>

                <div className="col-12" style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ minWidth: '280px' }}>
                    {submitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span> Submitting...</>
                    ) : (
                      <><i className="fas fa-check-circle me-2"></i> Confirm {selectedService}</>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CONTACT
      ═══════════════════════════════════════════════ */}
      <section id="contact" style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-label">
              <i className="fas fa-map-marker-alt"></i> Clinic Location
            </span>
            <h2 className="section-title" style={{ marginBottom: '12px' }}>Contact &amp; Location</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>We welcome your inquiries and look forward to assisting your recovery</p>
          </div>

          <div className="row g-4 justify-content-center">
            {[
              { icon: 'fas fa-map-marked-alt', title: 'Clinic Address',  value: loading ? 'Loading...' : (settings?.clinicAddress || '49, Masjid Mawatha, Warakapola, Sri Lanka') },
              { icon: 'fas fa-phone-alt',      title: 'Phone Contact',   value: loading ? 'Loading...' : (settings?.clinicPhone   || '+94 77 337 8718') },
              { icon: 'fas fa-envelope-open-text', title: 'Official Email', value: loading ? 'Loading...' : (settings?.clinicEmail  || 'azrinphysiocare@gmail.com') },
            ].map(card => (
              <div key={card.title} className="col-sm-6 col-lg-4">
                <div className="contact-card">
                  <div className="contact-icon">
                    <i className={card.icon}></i>
                  </div>
                  <h5 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px', fontSize: '1rem' }}>{card.title}</h5>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════ */}
      <footer className="site-footer">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div className="footer-brand">
                <i className="fas fa-hand-holding-medical"></i>
                {clinicName}
              </div>
              <small>Professional Clinical &amp; Bedside Physiotherapy Rehabilitation</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                © 2026 {clinicName}. All rights reserved.
              </div>
              <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.78rem', marginTop: '4px' }}>
                Developed by <span style={{ color: '#5eead4', fontWeight: 600 }}>Najath Mohomed</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
