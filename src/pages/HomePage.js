import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/HomePage.css';
// Import logo
import logo from '../components/layout/logo.png';

function HomePage() {
  const { darkMode } = useTheme();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('health');
  const featuresRef = useRef(null);

  // Elements to animate on scroll
  const sectionRefs = {
    how: useRef(null),
    features: useRef(null),
    testimonials: useRef(null),
    cta: useRef(null),
    faq: useRef(null)
  };

  // Handle scroll to features
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to specific section
  const scrollToSection = (sectionId) => {
    sectionRefs[sectionId]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Simulate loading effect
  useEffect(() => {
    setIsVisible(true);
    
    // Add scroll animation observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe all section refs
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });
    
    return () => {
      Object.values(sectionRefs).forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  // Auto-cycle through features every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % allFeatures.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // All features from the application
  const allFeatures = [
    {
      id: 'health-tracker',
      icon: '📊',
      title: 'Health Tracker',
      description: 'Track and monitor your vital health metrics including heart rate, blood pressure, weight, and more with interactive charts and trend analysis.',
      color: 'teal',
      highlight: 'AI-powered health insights based on your personal metrics',
      category: 'health'
    },
    {
      id: 'medicine-reminders',
      icon: '💊',
      title: 'Medicine Reminders',
      description: 'Never miss a dose with customizable medication reminders. Set schedules, dosages, and receive timely notifications on all your devices.',
      color: 'pink',
      highlight: 'Smart reminders that adjust to your daily routine',
      category: 'medical'
    },
    {
      id: 'doctor-consultation',
      icon: '👨‍⚕️',
      title: 'Doctor Consultation',
      description: 'Book appointments with healthcare professionals, manage your medical calendar, and access telehealth services within the platform.',
      color: 'purple',
      highlight: 'Secure video consultations with specialized healthcare providers',
      category: 'medical'
    },
    {
      id: 'mental-wellness',
      icon: '🧠',
      title: 'Mental Wellness',
      description: 'Access guided meditation, stress management tools, mood tracking, and mental health resources to support your emotional wellbeing.',
      color: 'violet',
      highlight: 'Personalized mental wellness programs based on your needs',
      category: 'wellness'
    },
    {
      id: 'first-aid',
      icon: '🩹',
      title: 'First Aid Guide',
      description: 'Access comprehensive first aid procedures and emergency guidance with step-by-step instructions available offline.',
      color: 'orange',
      highlight: 'Emergency protocols with visual instructions and voice guidance',
      category: 'medical'
    },
    {
      id: 'recipes',
      icon: '🥗',
      title: 'Healthy Recipes',
      description: 'Discover thousands of nutritious meal ideas tailored to your dietary preferences, restrictions, and health goals.',
      color: 'cyan',
      highlight: 'Nutrition analysis and meal planning assistance',
      category: 'wellness'
    },
    {
      id: 'water-tracker',
      icon: '💧',
      title: 'Water Tracker',
      description: 'Stay hydrated with personalized water intake goals and reminders based on your activity level, climate, and personal needs.',
      color: 'blue',
      highlight: 'Smart hydration insights that adapt to your daily activity',
      category: 'health'
    },
    {
      id: 'exercise',
      icon: '🏋️',
      title: 'Exercise Routines',
      description: 'Access curated workout plans from certified trainers, track your fitness progress, and get form guidance for optimal results.',
      color: 'green',
      highlight: 'Over 500 expert-designed exercise routines with video demonstrations',
      category: 'health'
    },
    {
      id: 'symptoms',
      icon: '🔍',
      title: 'Symptom Checker',
      description: 'Evaluate your symptoms with our AI-assisted tool that provides preliminary insights and guidance on when to seek medical attention.',
      color: 'amber',
      highlight: 'Physician-reviewed symptom assessment algorithms',
      category: 'medical'
    },
    {
      id: 'forum',
      icon: '💬',
      title: 'Community Forum',
      description: 'Connect with others on similar health journeys, share experiences, and get support from a community focused on wellbeing.',
      color: 'indigo',
      highlight: 'Moderated discussions with input from healthcare professionals',
      category: 'wellness'
    },
    {
      id: 'sleep',
      icon: '😴',
      title: 'Sleep Tracker',
      description: 'Monitor your sleep patterns, analyze your sleep quality, and receive personalized recommendations for better rest.',
      color: 'lightblue',
      highlight: 'Advanced sleep cycle analysis and smart alarm features',
      category: 'health'
    },
    {
      id: 'challenges',
      icon: '🏆',
      title: 'Daily Challenges',
      description: 'Participate in health-focused challenges designed to build healthy habits and maintain motivation through achievement systems.',
      color: 'red',
      highlight: 'Community challenges with rewards and achievement tracking',
      category: 'wellness'
    }
  ];

  // Filter features by category
  const getFeaturesByCategory = (category) => {
    return allFeatures.filter(feature => feature.category === category);
  };

  // Testimonials data
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      profession: "Cardiologist",
      text: "I recommend My Well Being to all my patients. The comprehensive health tracking has helped them maintain better habits between appointments, and I've seen measurable improvements in their vitals.",
      avatar: "S"
    },
    {
      name: "Marcus Thompson",
      profession: "Fitness Coach",
      text: "The exercise and tracking tools in this platform are exceptional. My clients who use it consistently show better adherence to their workout regimens and improved overall wellness metrics.",
      avatar: "M"
    },
    {
      name: "Elena Rodriguez",
      profession: "Working Professional",
      text: "As someone with a busy schedule, My Well Being has been invaluable. The medicine reminders and quick health tracking fit seamlessly into my day, and the sleep insights have transformed my rest.",
      avatar: "E"
    },
   
    
  ];

  return (
    <div className={`home-page ${darkMode ? 'dark' : ''} ${isVisible ? 'visible' : ''}`}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="animated-background">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <img src={logo} alt="My Well Being Logo" className="hero-logo" />
            <div className="hero-badge">The Complete Wellness Platform</div>
            <h1 className="hero-title">My Well Being</h1>
            <p className="hero-subtitle">
              Your comprehensive platform for health tracking, medication management, and wellness optimization. Experience the future of personalized healthcare technology.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="primary-button pulse">Get Started Today</Link>
              <Link to="/login" className="secondary-button">Log In</Link>
            </div>
            <div className="hero-features">
              <div className="hero-feature">
                <span className="feature-check">✓</span>
                <span>Free 14-day trial</span>
              </div>
              <div className="hero-feature">
                <span className="feature-check">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="hero-feature">
                <span className="feature-check">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dot"></div>
                <div className="preview-dot"></div>
                <div className="preview-dot"></div>
              </div>
              <div className="preview-content">
                <div className="preview-logo">
                  <img src={logo} alt="My Well Being Logo" className="preview-logo-image" />
                </div>
                <div className="preview-stat"></div>
                <div className="preview-row">
                  <div className="preview-card"></div>
                  <div className="preview-card"></div>
                </div>
                <div className="preview-row">
                  <div className="preview-card"></div>
                  <div className="preview-card"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator" onClick={scrollToFeatures}>
          <span>Explore Features</span>
          <div className="arrow-down"></div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="trust-badges-section">
        <div className="section-container">
          <div className="trust-badges">
            <div className="trust-badge">
              <div className="badge-icon">🔒</div>
              <div className="badge-text">HIPAA Compliant</div>
            </div>
            <div className="trust-badge">
              <div className="badge-icon">🏆</div>
              <div className="badge-text">Top-Rated App</div>
            </div>
            <div className="trust-badge">
              <div className="badge-icon">👨‍⚕️</div>
              <div className="badge-text">Doctor Approved</div>
            </div>
            <div className="trust-badge">
              <div className="badge-icon">⚡</div>
              <div className="badge-text">24/7 Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how" ref={sectionRefs.how}>
        <div className="section-container">
          <h2 className="section-title">How My Well Being Works</h2>
          <p className="section-subtitle">Get started in minutes and transform your health management</p>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>Sign up in less than 60 seconds and customize your wellness goals and preferences.</p>
              <div className="step-icon">📝</div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Track Your Metrics</h3>
              <p>Use our intuitive tools to monitor your health activities, medication, and vital signs.</p>
              <div className="step-icon">📊</div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Personalized Insights</h3>
              <p>Receive tailored recommendations and analytics based on your unique health data.</p>
              <div className="step-icon">💡</div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Achieve Your Goals</h3>
              <p>Follow your customized wellness plan and track your progress over time.</p>
              <div className="step-icon">🎯</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features" ref={featuresRef}>
        <div className="section-container" ref={sectionRefs.features}>
          <h2 className="section-title">Complete Wellness Platform</h2>
          <p className="section-subtitle">All the tools you need to manage your health in one secure place</p>
          
          <div className="category-tabs">
            <button 
              className={`category-tab ${activeTab === 'health' ? 'active' : ''}`} 
              onClick={() => setActiveTab('health')}
            >
              Health Tracking
            </button>
            <button 
              className={`category-tab ${activeTab === 'medical' ? 'active' : ''}`} 
              onClick={() => setActiveTab('medical')}
            >
              Medical Tools
            </button>
            <button 
              className={`category-tab ${activeTab === 'wellness' ? 'active' : ''}`} 
              onClick={() => setActiveTab('wellness')}
            >
              Wellness Support
            </button>
          </div>
          
          
          <div className="features-grid">
            {getFeaturesByCategory(activeTab).map((feature) => (
              <div className="feature-card" key={feature.id}>
                <div className={`feature-icon ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-highlight">
                  <span className="highlight-icon">✓</span>
                  <span className="highlight-text">{feature.highlight}</span>
                </div>
                <Link to="/register" className="feature-link">
                  Learn more <span className="arrow">→</span>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="featured-carousel">
            <h3 className="carousel-title">Featured Tools</h3>
            <div className="carousel-container">
              <div className="carousel-track">
                {allFeatures.map((feature, index) => (
                  <div 
                    className={`carousel-item ${activeFeature === index ? 'active' : ''}`} 
                    key={feature.id}
                  >
                    <div className={`carousel-icon ${feature.color}`}>{feature.icon}</div>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
              <div className="carousel-indicators">
                {allFeatures.map((_, index) => (
                  <button 
                    key={index} 
                    className={`carousel-indicator ${activeFeature === index ? 'active' : ''}`}
                    onClick={() => setActiveFeature(index)}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-overlay"></div>
        <div className="stats-content">
          <h2>Making a Difference in Health Management</h2>
          <div className="stats-grid">
            <div className="stat-block">
              <div className="stat-value">87%</div>
              <div className="stat-label">of users report improved medication adherence</div>
            </div>
            <div className="stat-block">
              <div className="stat-value">12M+</div>
              <div className="stat-label">health metrics tracked monthly</div>
            </div>
            <div className="stat-block">
              <div className="stat-value">68%</div>
              <div className="stat-label">increase in daily water consumption</div>
            </div>
            <div className="stat-block">
              <div className="stat-value">4.2h</div>
              <div className="stat-label">average improvement in weekly exercise</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="testimonials" ref={sectionRefs.testimonials}>
        <div className="section-container">
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">Hear from our community of healthcare professionals and users</p>
          
          <div className="testimonials-container">
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div className="testimonial-rating">★★★★★</div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <h4 className="testimonial-name">{testimonial.name}</h4>
                <p className="testimonial-profession">{testimonial.profession}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta-section" ref={sectionRefs.cta}>
        <div className="section-container">
          <div className="cta-content">
            <h2>Start Your Wellness Journey Today</h2>
            <p>Join thousands of users who are already experiencing the benefits of a more organized and informed approach to health management.</p>
            <div className="cta-features">
              <div className="cta-feature">✓ Free 14-day trial</div>
              <div className="cta-feature">✓ No credit card required</div>
              <div className="cta-feature">✓ Cancel anytime</div>
            </div>
            <Link to="/register" className="primary-button cta-button">Get Started Today</Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="faq" ref={sectionRefs.faq}>
        <div className="section-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-container">
            <details className="faq-item">
              <summary>Is my health data secure?</summary>
              <p>Yes, we take your privacy and security extremely seriously. All your health data is encrypted using industry-standard encryption both in transit and at rest. We comply with HIPAA and other health information privacy standards and never share your data with third parties without your explicit consent.</p>
            </details>
            <details className="faq-item">
              <summary>Can I use the app on multiple devices?</summary>
              <p>Absolutely! My Well Being synchronizes your data across all your devices in real-time. Simply log in with your account, and your health information will be available on your smartphone, tablet, or computer.</p>
            </details>
            <details className="faq-item">
              <summary>How do I cancel my subscription?</summary>
              <p>You can cancel your account at any time from your account settings page. If you decide to stop using the service, your data will be securely deleted from our servers upon request.</p>
            </details>
            <details className="faq-item">
              <summary>Do you offer customer support?</summary>
              <p>Yes, we offer 24/7 customer support via chat and email. Our dedicated team is always ready to help you with any questions or issues you might encounter while using our platform.</p>
            </details>
            <details className="faq-item">
              <summary>Can I export my health data?</summary>
              <p>Yes, you can export your health data in various formats including PDF and CSV. This makes it easy to share your information with healthcare providers or keep personal backups.</p>
            </details>
            <details className="faq-item">
              <summary>Is there a mobile app available?</summary>
              <p>Yes, My Well Being is available on iOS and Android devices. You can download the app from the App Store or Google Play Store to track your health on the go.</p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;