import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdDownload, MdReceipt, MdCheckCircle, MdUndo, MdClose, MdPrint } from 'react-icons/md';

function AddPaymentModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    memberName: '',
    plan: 'Basic',
    amount: 1999,
    status: 'Paid',
    method: 'UPI',
    description: 'Monthly Membership Renewal'
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/members?limit=100').then(r => setMembers(r.data.members || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const member = members.find(m => m.name === form.memberName);
      await api.post('/payments', {
        ...form,
        member: member?._id,
        invoiceId: `INV-2026-${Math.floor(100 + Math.random() * 900)}`
      });
      toast.success('Payment invoice generated & recorded!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Record Payment & Invoice</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Select Member *</label>
              <select className="input" value={form.memberName} onChange={e => setForm(p => ({ ...p, memberName: e.target.value }))} required>
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m._id} value={m.name}>{m.name} ({m.memberId})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Membership Plan</label>
              <select className="input" value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
                <option>Basic</option>
                <option>Standard</option>
                <option>Premium</option>
                <option>VIP</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input className="input" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select className="input" value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
                <option>UPI</option>
                <option>Card</option>
                <option>Cash</option>
                <option>NetBanking</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Paid</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-neon" disabled={loading}>{loading ? 'Generating...' : 'Record Payment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InvoiceModal({ payment, onClose }) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" style={{ maxWidth: '500px', width: '90%', padding: '32px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--neon)' }}>TITANIUM FITNESS</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Payment Receipt</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MdClose size={22} /></button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Invoice ID:</span> <br />
            <strong style={{ color: 'var(--neon)', fontFamily: 'monospace' }}>{payment.invoiceId || 'INV-2026-001'}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--text-muted)' }}>Date:</span> <br />
            <strong>{new Date(payment.date).toLocaleDateString('en-IN')}</strong>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Billed To:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{payment.memberName || payment.member?.name || 'Member'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Membership Plan:</span>
            <span className="badge badge-info">{payment.plan} Plan</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
            <strong>{payment.method || 'UPI'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Total Amount Paid:</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--neon)' }}>₹{payment.amount?.toLocaleString()}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <MdPrint size={16} /> Print Receipt
          </button>
          <button className="btn btn-neon" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('All');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [addModal, setAddModal] = useState(false);
  const [invoicePayment, setInvoicePayment] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/payments', { params: { status, page, limit: 10 } });
      setPayments(res.data.payments || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setTotalRevenue(res.data.totalRevenue || 0);
    } catch {
      toast.error('Failed to load payment transactions');
    }
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/payments/${id}/status`, { status: newStatus });
      toast.success(`Payment status updated to ${newStatus}`);
      load();
    } catch {
      toast.error('Failed to update payment status');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Payments & Billing</h1>
          <p className="page-sub">Financial ledger & revenue management</p>
        </div>
        <button className="btn btn-neon" onClick={() => setAddModal(true)}>
          <MdAdd size={18} /> Record New Payment
        </button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid var(--neon)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '6px' }}>Total Cumulative Revenue</div>
          <div style={{ color: 'var(--neon)', fontSize: '1.8rem', fontWeight: 900 }}>₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="glass" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '6px' }}>Total Transactions</div>
          <div style={{ color: '#3b82f6', fontSize: '1.8rem', fontWeight: 900 }}>{total}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['All', 'Paid', 'Pending', 'Refunded'].map(s => (
          <button
            key={s}
            className={`btn ${status === s ? 'btn-neon' : 'btn-secondary'} btn-sm`}
            onClick={() => { setStatus(s); setPage(1); }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p._id}>
                    <td style={{ color: 'var(--neon)', fontFamily: 'monospace', fontWeight: 700 }}>{p.invoiceId || 'INV-2026-001'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.memberName || p.member?.name}</td>
                    <td><span className="badge badge-info">{p.plan}</span></td>
                    <td style={{ color: 'var(--neon)', fontWeight: 800 }}>₹{p.amount?.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.method || 'UPI'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(p.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge ${p.status === 'Paid' ? 'badge-success' : p.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setInvoicePayment(p)} title="Download / Print Invoice">
                          <MdReceipt size={16} color="var(--neon)" />
                        </button>
                        {p.status === 'Pending' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange(p._id, 'Paid')}>
                            <MdCheckCircle size={14} color="#14f195" /> Mark Paid
                          </button>
                        )}
                        {p.status === 'Paid' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange(p._id, 'Refunded')}>
                            <MdUndo size={14} color="#ef4444" /> Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pagination" style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              ← Prev
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-neon' : 'btn-secondary'}`} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>

      {addModal && <AddPaymentModal onClose={() => setAddModal(false)} onSave={() => { setAddModal(false); load(); }} />}
      {invoicePayment && <InvoiceModal payment={invoicePayment} onClose={() => setInvoicePayment(null)} />}
    </div>
  );
}
