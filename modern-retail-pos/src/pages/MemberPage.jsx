import React, { useState, useMemo } from 'react';
import { UserPlus, Edit2 } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { formatDateOnly } from '../utils/date.js';

export default function MembersPage({ members, onCreateMember, onUpdateMember }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    points: 0,
    status: 'active'
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.email && m.email.toLowerCase().includes(q))
    );
  }, [members, search]);

  const openAdd = () => {
    setEditingMember(null);
    setForm({ name: '', phone: '', email: '', points: 0, status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditingMember(m);
    setForm({
      name: m.name,
      phone: m.phone,
      email: m.email || '',
      points: m.points || 0,
      status: m.status || 'active'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = editingMember
      ? await onUpdateMember({ ...form, member_id: editingMember.member_id })
      : await onCreateMember(form);
    if (res.success) {
      setModalOpen(false);
    }
  };

  return (
    <div className="page-scroll-container">
      <div className="page-header">
        <div className="page-title">
          <h2>Loyalty Members</h2>
          <p>Register store members, track loyalty points, and manage membership status.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          <UserPlus size={16} />
          Register Member
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="input"
          style={{ maxWidth: 320 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search member by name or phone..."
        />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Registered</th>
              <th>Points</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.member_id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{m.member_id}</td>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td className="tabular-nums">{m.phone}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{m.email || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{formatDateOnly(m.registered_at)}</td>
                <td className="tabular-nums">
                  <span className="badge badge-success">{m.points || 0} pts</span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      m.status === 'active' ? 'badge-success' : 'badge-neutral'
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEdit(m)}
                  >
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? 'Edit Member' : 'Register New Member'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              className="input"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Loyalty Points</label>
              <input
                type="number"
                className="input"
                min="0"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
