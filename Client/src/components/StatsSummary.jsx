import React from 'react';
import { Compass, Calendar, Wallet, CreditCard, PiggyBank } from 'lucide-react';

export default function StatsSummary({ stats, loading }) {
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const statItems = [
    {
      title: 'Total Trips',
      value: loading ? '-' : stats.totalTrips || 0,
      subtitle: `${stats.completedTrips || 0} completed`,
      icon: <Compass size={24} color="#0284c7" />,
      bg: '#f0f9ff',
      border: '#bae6fd'
    },
    {
      title: 'Upcoming Trips',
      value: loading ? '-' : stats.upcomingTrips || 0,
      subtitle: `${stats.ongoingTrips || 0} currently ongoing`,
      icon: <Calendar size={24} color="#0d9488" />,
      bg: '#f0fdfa',
      border: '#a7f3d0'
    },
    {
      title: 'Total Planned Budget',
      value: loading ? '-' : formatINR(stats.totalBudget),
      subtitle: 'Across all journeys',
      icon: <Wallet size={24} color="#d97706" />,
      bg: '#fffbeb',
      border: '#fde68a'
    },
    {
      title: 'Total Spent',
      value: loading ? '-' : formatINR(stats.totalSpent),
      subtitle: `${stats.totalBudget ? Math.round(((stats.totalSpent || 0) / stats.totalBudget) * 100) : 0}% of budget`,
      icon: <CreditCard size={24} color="#8b5cf6" />,
      bg: '#f5f3ff',
      border: '#ddd6fe'
    }
  ];

  return (
    <div className="stats-grid">
      {statItems.map((item, index) => (
        <div key={index} className="stat-card" style={{ '--item-border': item.border }}>
          <div className="stat-header">
            <span className="stat-title">{item.title}</span>
            <div className="stat-icon-wrap" style={{ background: item.bg }}>
              {item.icon}
            </div>
          </div>
          <div className="stat-value">{item.value}</div>
          <div className="stat-subtitle">{item.subtitle}</div>
        </div>
      ))}

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-top: 3px solid var(--item-border, var(--primary-blue));
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.4rem;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
          position: relative;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.6rem;
        }

        .stat-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .stat-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-value {
          font-family: var(--font-heading);
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--primary-deep);
          line-height: 1.2;
          margin-bottom: 0.25rem;
        }

        .stat-subtitle {
          font-size: 0.8rem;
          color: var(--text-dim);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
