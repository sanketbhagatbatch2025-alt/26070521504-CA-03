import React, { useState } from 'react';
import { Plus, Wallet, CreditCard, PiggyBank, Tag, Trash2, Edit3, X, AlertTriangle, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  'Transport',
  'Accommodation',
  'Food & Dining',
  'Activities & Sightseeing',
  'Shopping',
  'Miscellaneous'
];

const CATEGORY_COLORS = {
  'Transport': '#0284c7',
  'Accommodation': '#0d9488',
  'Food & Dining': '#f59e0b',
  'Activities & Sightseeing': '#8b5cf6',
  'Shopping': '#ec4899',
  'Miscellaneous': '#64748b'
};

export default function BudgetSection({
  trip,
  expenses = [],
  budgetSummary = {},
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Transport',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const estimatedBudget = trip?.estimatedBudget || 0;
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingBudget = Math.max(0, estimatedBudget - totalSpent);
  const isOverBudget = totalSpent > estimatedBudget && estimatedBudget > 0;
  const percentUsed = estimatedBudget > 0 ? Math.min(100, Math.round((totalSpent / estimatedBudget) * 100)) : 0;

  // Calculate category aggregates
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      category: 'Transport',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category || 'Miscellaneous',
      description: exp.description || '',
      amount: exp.amount ?? '',
      date: exp.date ? exp.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.amount === '' || Number(formData.amount) < 0) {
      errors.amount = 'Valid amount is required (≥ 0)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await onUpdateExpense(editingExpense._id, {
          ...formData,
          amount: Number(formData.amount)
        });
      } else {
        await onAddExpense({
          ...formData,
          amount: Number(formData.amount)
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="budget-planner-wrap">
      {/* Top Overview Cards */}
      <div className="budget-kpi-grid">
        <div className="kpi-card estimated">
          <div className="kpi-icon-wrap" style={{ background: '#f0f9ff' }}>
            <Wallet size={22} color="#0284c7" />
          </div>
          <div>
            <span className="kpi-label">Estimated Budget</span>
            <h3 className="kpi-val">{formatINR(estimatedBudget)}</h3>
          </div>
        </div>

        <div className="kpi-card spent">
          <div className="kpi-icon-wrap" style={{ background: '#fffbeb' }}>
            <CreditCard size={22} color="#d97706" />
          </div>
          <div>
            <span className="kpi-label">Total Recorded Expenses</span>
            <h3 className="kpi-val" style={{ color: isOverBudget ? '#dc2626' : 'inherit' }}>
              {formatINR(totalSpent)}
            </h3>
          </div>
        </div>

        <div className="kpi-card remaining">
          <div className="kpi-icon-wrap" style={{ background: '#f0fdfa' }}>
            <PiggyBank size={22} color="#0d9488" />
          </div>
          <div>
            <span className="kpi-label">
              {isOverBudget ? 'Budget Exceeded By' : 'Remaining Balance'}
            </span>
            <h3
              className="kpi-val"
              style={{ color: isOverBudget ? '#dc2626' : '#059669' }}
            >
              {formatINR(isOverBudget ? totalSpent - estimatedBudget : remainingBudget)}
            </h3>
          </div>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="budget-progress-box">
        <div className="progress-labels">
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
            Budget Utilization: {percentUsed}% used
          </span>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {formatINR(totalSpent)} of {formatINR(estimatedBudget)}
          </span>
        </div>
        <div className="progress-track-large">
          <div
            className="progress-fill-large"
            style={{
              width: `${Math.min(100, (totalSpent / (estimatedBudget || 1)) * 100)}%`,
              background: isOverBudget ? '#ef4444' : percentUsed > 75 ? '#f59e0b' : 'linear-gradient(90deg, #0284c7, #0d9488)'
            }}
          ></div>
        </div>
        {isOverBudget && (
          <div className="budget-alert-chip">
            <AlertTriangle size={14} />
            <span>Warning: Expenses have exceeded planned budget by {formatINR(totalSpent - estimatedBudget)}!</span>
          </div>
        )}
      </div>

      {/* Category Breakdown Cards */}
      <div className="category-section">
        <h4 className="section-subheading">Expense Breakdown by Category</h4>
        <div className="category-grid">
          {CATEGORIES.map((cat) => {
            const spent = categoryTotals[cat] || 0;
            const pct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
            const color = CATEGORY_COLORS[cat] || '#64748b';

            return (
              <div key={cat} className="category-pill-card">
                <div className="cat-header">
                  <span className="cat-color-dot" style={{ backgroundColor: color }}></span>
                  <span className="cat-name">{cat}</span>
                  <span className="cat-pct">{pct}%</span>
                </div>
                <div className="cat-amount">{formatINR(spent)}</div>
                <div className="cat-bar-track">
                  <div
                    className="cat-bar-fill"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Table / List */}
      <div className="expenses-table-section">
        <div className="expense-header-row">
          <div>
            <h4 className="section-subheading" style={{ marginBottom: '0.2rem' }}>
              Recorded Expenses List ({expenses.length})
            </h4>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              All planned and completed transactions for this trip
            </span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleOpenAdd}
            id="add-expense-btn"
          >
            <Plus size={15} />
            <span>Record Expense</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="empty-expenses">
            <CreditCard size={28} color="#94a3b8" />
            <p>No expenses recorded yet. Track flights, hotels, food, or shopping!</p>
          </div>
        ) : (
          <div className="expense-list">
            {expenses.map((exp) => (
              <div key={exp._id} className="expense-item">
                <div className="expense-left">
                  <span
                    className="category-badge"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[exp.category] || '#64748b'}18`,
                      color: CATEGORY_COLORS[exp.category] || '#64748b',
                      borderColor: `${CATEGORY_COLORS[exp.category] || '#64748b'}33`
                    }}
                  >
                    {exp.category}
                  </span>
                  <div>
                    <h5 className="expense-desc">{exp.description}</h5>
                    <span className="expense-date">{formatDate(exp.date)}</span>
                  </div>
                </div>

                <div className="expense-right">
                  <span className="expense-amount">{formatINR(exp.amount)}</span>
                  <div className="expense-actions">
                    <button
                      className="action-icon-btn edit-btn"
                      onClick={() => handleOpenEdit(exp)}
                      title="Edit Expense"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      className="action-icon-btn delete-btn"
                      onClick={() => onDeleteExpense(exp._id)}
                      title="Delete Expense"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record / Edit Expense Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                {editingExpense ? 'Edit Expense' : 'Record an Expense'}
              </h3>
              <button className="action-icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formErrors.submit && (
                  <div className="submit-error-banner">{formErrors.submit}</div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="expense-category">Category *</label>
                  <select
                    id="expense-category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="expense-desc">Description *</label>
                  <input
                    id="expense-desc"
                    type="text"
                    placeholder="e.g. Flight tickets, 3 nights hotel, Scuba diving pass"
                    className={`form-input ${formErrors.description ? 'error' : ''}`}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  {formErrors.description && (
                    <span className="form-error">{formErrors.description}</span>
                  )}
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="expense-amount">Amount (₹ INR) *</label>
                    <input
                      id="expense-amount"
                      type="number"
                      min="0"
                      step="50"
                      placeholder="1500"
                      className={`form-input ${formErrors.amount ? 'error' : ''}`}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                    {formErrors.amount && (
                      <span className="form-error">{formErrors.amount}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="expense-date">Date</label>
                    <input
                      id="expense-date"
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  id="save-expense-btn"
                >
                  {isSubmitting ? 'Saving...' : editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .budget-planner-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .budget-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .kpi-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
        }

        .kpi-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .kpi-val {
          font-family: var(--font-heading);
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--primary-deep);
          margin-top: 0.15rem;
          line-height: 1.1;
        }

        .budget-progress-box {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.6rem;
        }

        .progress-track-large {
          height: 10px;
          background: #f1f5f9;
          border-radius: 5px;
          overflow: hidden;
        }

        .progress-fill-large {
          height: 100%;
          border-radius: 5px;
          transition: width 0.4s ease;
        }

        .budget-alert-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.75rem;
          background: #fee2e2;
          color: #dc2626;
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          font-weight: 600;
        }

        .section-subheading {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary-deep);
          margin-bottom: 0.85rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .category-pill-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          box-shadow: 0 1px 3px rgba(10,37,64,0.03);
        }

        .cat-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          margin-bottom: 0.35rem;
        }

        .cat-color-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .cat-name {
          font-weight: 600;
          color: var(--text-main);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cat-pct {
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .cat-amount {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--primary-deep);
          margin-bottom: 0.45rem;
        }

        .cat-bar-track {
          height: 4px;
          background: #f1f5f9;
          border-radius: 2px;
          overflow: hidden;
        }

        .cat-bar-fill {
          height: 100%;
          border-radius: 2px;
        }

        .expenses-table-section {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .expense-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-light);
        }

        .empty-expenses {
          text-align: center;
          padding: 2.5rem 1.5rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
        }

        .expense-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .expense-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          background: #ffffff;
          transition: all var(--transition-fast);
        }

        .expense-item:hover {
          background: var(--sand-bg);
          border-color: #cbd5e1;
        }

        .expense-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .category-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid;
          white-space: nowrap;
        }

        .expense-desc {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.15rem;
        }

        .expense-date {
          font-size: 0.78rem;
          color: var(--text-dim);
        }

        .expense-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .expense-amount {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--primary-deep);
        }

        .expense-actions {
          display: flex;
          gap: 0.35rem;
        }
      `}</style>
    </div>
  );
}
