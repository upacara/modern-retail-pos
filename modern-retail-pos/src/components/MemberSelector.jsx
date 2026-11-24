import React, { useState, useMemo } from 'react';
import { UserPlus, X, Award } from 'lucide-react';
import Modal from './Modal.jsx';

export default function MemberSelector({
  members,
  selectedMember,
  onSelectMember,
  onCreateMember,
  enablePoints
}) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members.filter((m) => m.status === 'active').slice(0, 6);
    return members
      .filter(
        (m) =>
          m.status === 'active' &&
          (m.name.toLowerCase().includes(q) || m.phone.includes(q))
      )
      .slice(0, 8);
  }, [members, query]);

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await onCreateMember(form);
    setSubmitting(false);
    if (res.success && res.data) {
      onSelectMember(res.data);
      setForm({ name: '', phone: '', email: '' });
      setShowQuickModal(false);
    }
  };

  return (
    <div className="member-box">
      {selectedMember ? (
        <div className="member-selected-card">
          <div className="member-selected-info">
            <strong>
              {selectedMember.name} ({selectedMember.phone})
            </strong>
            <span>
              <Award size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
              {enablePoints ? `${selectedMember.points || 0} pts` : 'Registered Member'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onSelectMember(null)}
            title="Remove member from order"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="member-search-row">
          <input
            type="text"
            className="input"
            style={{ height: 32, fontSize: 12.5 }}
            value={query}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            placeholder="Assign member (name or phone)..."
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ height: 32 }}
            onClick={() => setShowQuickModal(true)}
            title="Quick register new member"
          >
            <UserPlus size={14} />
            New
          </button>
        </div>
      )}

      {!selectedMember && showDropdown && filteredMembers.length > 0 && (
        <div className="member-dropdown">
          {filteredMembers.map((m) => (
            <button
              key={m.member_id}
              type="button"
              className="member-dropdown-item"
              onMouseDown={() => {
                onSelectMember(m);
                setQuery('');
                setShowDropdown(false);
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.phone}</div>
              </div>
              <span className="badge badge-neutral">{m.points || 0} pts</span>
            </button>
          ))}
        </div>
      )}

      <Modal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        title="Quick Register Member"
      >
        <form onSubmit={handleQuickRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Andi Pratama"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              className="input"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 08123456789"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email (Optional)</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="member@email.com"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowQuickModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save & Attach Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
