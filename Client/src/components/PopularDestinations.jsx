import React from 'react';
import { MapPin, Sparkles, ArrowRight } from 'lucide-react';

const destinations = [
  {
    name: 'Goa',
    country: 'India',
    tag: 'Beaches & Nightlife',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    budget: '₹40,000',
    duration: '5-6 Days'
  },
  {
    name: 'Manali',
    country: 'Himachal Pradesh',
    tag: 'Snow & Adventure',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    budget: '₹35,000',
    duration: '6 Days'
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    tag: 'Temples & Tropical',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    budget: '₹90,000',
    duration: '8 Days'
  },
  {
    name: 'Jaipur',
    country: 'Rajasthan',
    tag: 'Royal Heritage & Forts',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    budget: '₹30,000',
    duration: '4-5 Days'
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    tag: 'Historic Shrines & Zen',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    budget: '₹1,50,000',
    duration: '7 Days'
  },
  {
    name: 'Amalfi Coast',
    country: 'Italy',
    tag: 'Cliffside Coastal Bliss',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    budget: '₹2,10,000',
    duration: '7 Days'
  }
];

export default function PopularDestinations({ onSelectDestination }) {
  return (
    <section className="inspiration-section">
      <div className="section-header">
        <div>
          <div className="section-badge">
            <Sparkles size={14} />
            <span>Travel Inspiration</span>
          </div>
          <h2 className="section-title">Popular Dream Destinations</h2>
          <p className="section-desc">Handcrafted ideas to inspire your next memorable adventure.</p>
        </div>
      </div>

      <div className="destinations-grid">
        {destinations.map((dest, i) => (
          <div key={i} className="destination-card">
            <div className="dest-image-wrap">
              <img src={dest.image} alt={dest.name} loading="lazy" />
              <div className="dest-overlay"></div>
              <span className="dest-tag">{dest.tag}</span>
            </div>
            <div className="dest-info">
              <div className="dest-title-row">
                <h3 className="dest-name">{dest.name}</h3>
                <span className="dest-country">{dest.country}</span>
              </div>
              <div className="dest-meta">
                <span>Avg: {dest.budget}</span>
                <span>•</span>
                <span>{dest.duration}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm dest-btn"
                onClick={() => onSelectDestination(dest)}
              >
                <span>Plan Trip Here</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .inspiration-section {
          margin-top: 3rem;
          margin-bottom: 3rem;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.65rem;
          background: #f0fdfa;
          color: #0d9488;
          border: 1px solid #a7f3d0;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .section-title {
          font-size: 1.6rem;
          color: var(--primary-deep);
        }

        .section-desc {
          font-size: 0.925rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .destinations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .destination-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
          display: flex;
          flex-direction: column;
        }

        .destination-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .dest-image-wrap {
          height: 170px;
          position: relative;
          overflow: hidden;
        }

        .dest-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .destination-card:hover .dest-image-wrap img {
          transform: scale(1.06);
        }

        .dest-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(10, 37, 64, 0.6) 100%);
        }

        .dest-tag {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: rgba(10, 37, 64, 0.75);
          backdrop-filter: blur(6px);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.02em;
        }

        .dest-info {
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .dest-title-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 0.35rem;
        }

        .dest-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary-deep);
        }

        .dest-country {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .dest-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          color: var(--text-dim);
          margin-bottom: 1rem;
        }

        .dest-btn {
          width: 100%;
          margin-top: auto;
          justify-content: space-between;
          border-color: #e2e8f0;
          font-size: 0.85rem;
        }

        .dest-btn:hover {
          background: var(--primary-subtle);
          color: var(--primary-blue);
          border-color: var(--primary-light);
        }
      `}</style>
    </section>
  );
}
