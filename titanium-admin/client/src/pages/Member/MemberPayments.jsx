import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import Table from '../../components/layout/Table';
import Modal from '../../components/layout/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdPayment, MdReceipt, MdDownload } from 'react-icons/md';

export default function MemberPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/member-portal/payments');
        if (res.data.success) {
          setPayments(res.data.payments || []);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const columns = [
    { header: 'Invoice ID', accessor: 'invoiceId', render: (row) => row.invoiceId || `INV-${row._id.slice(-6).toUpperCase()}` },
    { header: 'Date', accessor: 'date', render: (row) => new Date(row.date).toLocaleDateString('en-US') },
    { header: 'Plan', accessor: 'plan', render: (row) => row.plan || 'Membership Fee' },
    { header: 'Amount', accessor: 'amount', render: (row) => `₹${(row.amount || 0).toLocaleString()}` },
    { header: 'Method', accessor: 'method', render: (row) => row.method || 'Online' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Receipt',
      accessor: 'action',
      render: (row) => (
        <button className="btn btn-sm btn-dark" onClick={() => setSelectedInvoice(row)}>
          <MdReceipt size={16} style={{ marginRight: 4 }} /> View
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
      <div className="module-header">
        <h2 className="module-title">Payment History & Invoices</h2>
        <p className="module-subtitle">View past transaction receipts and download official PDF invoices</p>
      </div>

      <Card title="Billing History Ledger" icon={<MdPayment />}>
        {payments.length > 0 ? (
          <Table columns={columns} data={payments} searchable={false} />
        ) : (
          <p style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No payment transactions found.
          </p>
        )}
      </Card>

      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Receipt Details — ${selectedInvoice?.invoiceId || 'INV'}`}
      >
        {selectedInvoice && (
          <div className="invoice-modal-content">
            <div className="invoice-header-brand">
              <h3>TITANIUM FITNESS</h3>
              <p>Official Billing Receipt</p>
            </div>
            <hr className="divider" />
            <div className="invoice-row"><span>Invoice ID:</span> <strong>{selectedInvoice.invoiceId || 'INV-2026'}</strong></div>
            <div className="invoice-row"><span>Date Paid:</span> <strong>{new Date(selectedInvoice.date).toLocaleDateString()}</strong></div>
            <div className="invoice-row"><span>Plan/Item:</span> <strong>{selectedInvoice.plan || 'Membership'}</strong></div>
            <div className="invoice-row"><span>Payment Method:</span> <strong>{selectedInvoice.method || 'UPI/Card'}</strong></div>
            <div className="invoice-row"><span>Total Amount:</span> <strong className="amount-highlight">₹{(selectedInvoice.amount || 0).toLocaleString()}</strong></div>
            <hr className="divider" />
            <button className="btn btn-neon-primary full-width" onClick={() => toast.success('Downloading PDF receipt...')}>
              <MdDownload size={18} style={{ marginRight: 6 }} /> Download PDF Invoice
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
