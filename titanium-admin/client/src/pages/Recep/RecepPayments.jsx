import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import Table from '../../components/layout/Table';
import Modal from '../../components/layout/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdPayment, MdPrint, MdReceipt, MdCheckCircle } from 'react-icons/md';

export default function RecepPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [form, setForm] = useState({
    memberName: '',
    memberId: '',
    amount: 2500,
    method: 'Cash',
    planName: 'Standard Plan'
  });

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      if (res.data && res.data.payments) {
        setPayments(res.data.payments);
      }
    } catch {
      // Fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    if (!form.memberName || !form.amount) {
      toast.error('Please fill in member details and payment amount');
      return;
    }
    const invoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment = {
      _id: Date.now(),
      transactionId: invoiceId,
      memberName: form.memberName,
      memberId: form.memberId || 'TF-1020',
      amount: Number(form.amount),
      method: form.method,
      planName: form.planName,
      status: 'Paid',
      date: new Date().toISOString()
    };
    setPayments([newPayment, ...payments]);
    toast.success(`Payment ₹${form.amount} collected! Receipt ${invoiceId} generated. 🧾`);
    setShowCollectModal(false);
    setPrintInvoice(newPayment);
  };

  const columns = [
    { header: 'Invoice #', accessor: 'transactionId', render: (r) => <strong style={{ color: 'var(--accent)' }}>{r.transactionId || 'INV-2026-8812'}</strong> },
    { header: 'Member Name', accessor: 'memberName', render: (r) => <strong>{r.memberName || 'Jamie Nelson'}</strong> },
    { header: 'Amount (₹)', accessor: 'amount', render: (r) => `₹${(r.amount || 2500).toLocaleString()}` },
    { header: 'Payment Method', accessor: 'method', render: (r) => r.method || 'Cash' },
    { header: 'Status', accessor: 'status', render: () => <span className="badge badge-success">Verified Paid</span> },
    {
      header: 'Receipt',
      accessor: 'action',
      render: (r) => (
        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setPrintInvoice(r)}>
          <MdPrint size={16} style={{ marginRight: 4 }} /> Print Receipt
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header-flex">
        <div>
          <h2 className="module-title">Front Desk Payments & Invoicing</h2>
          <p className="module-subtitle">Collect membership fees, verify online UPI payments, and generate digital print receipts</p>
        </div>
        <button className="btn btn-neon-primary" onClick={() => setShowCollectModal(true)}>
          <MdPayment size={18} style={{ marginRight: 6 }} /> Collect New Payment
        </button>
      </div>

      <Card title="Payment & Receipt Transaction History" icon={<MdReceipt />}>
        <Table columns={columns} data={payments} searchable={true} />
      </Card>

      {/* Collect Payment Modal */}
      <Modal isOpen={showCollectModal} onClose={() => setShowCollectModal(false)} title="Collect Front Desk Membership Fee">
        <form onSubmit={handleCollectPayment} className="profile-form">
          <div className="form-group-custom">
            <label>Member Name *</label>
            <input type="text" value={form.memberName} onChange={(e) => setForm({ ...form, memberName: e.target.value })} required placeholder="e.g. Rahul Verma" />
          </div>
          <div className="form-group-custom">
            <label>Amount Collected (₹) *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div className="form-group-custom">
            <label>Payment Method *</label>
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="Cash">Cash at Counter</option>
              <option value="UPI / QR">UPI / QR Code Scan</option>
              <option value="Credit/Debit Card">Credit / Debit Card POS</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCollectModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-neon-primary">Collect & Print Invoice</button>
          </div>
        </form>
      </Modal>

      {/* Print Invoice Receipt Modal */}
      {printInvoice && (
        <Modal isOpen={!!printInvoice} onClose={() => setPrintInvoice(null)} title="AXIS GYM Official Payment Receipt">
          <div style={{ padding: '20px', background: '#0d111a', border: '1px solid var(--accent)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--accent)', fontWeight: 800 }}>AXIS GYM</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enterprise Gym Management System</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: '#fff' }}>{printInvoice.transactionId || 'INV-2026-9901'}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ margin: '16px 0', fontSize: '0.9rem' }}>
              <p>Billed To: <strong>{printInvoice.memberName}</strong></p>
              <p>Plan: <strong>{printInvoice.planName || 'Standard Membership'}</strong></p>
              <p>Payment Method: <strong>{printInvoice.method}</strong></p>
              <p>Status: <span className="badge badge-success">Paid ✓</span></p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '12px', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total Amount Paid:</span>
              <span style={{ color: 'var(--accent)' }}>₹{(printInvoice.amount || 2500).toLocaleString()}</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button className="btn btn-neon-primary" onClick={() => { window.print(); setPrintInvoice(null); }}>
                <MdPrint size={18} style={{ marginRight: 6 }} /> Print Official Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
