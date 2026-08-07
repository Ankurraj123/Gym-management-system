import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import Modal from '../../components/layout/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdCardMembership, MdCheckCircle } from 'react-icons/md';

export default function MemberMembership() {
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const res = await api.get('/member-portal/membership');
        if (res.data.success) {
          setCurrentPlan(res.data.currentPlan);
          setAvailablePlans(res.data.availablePlans || []);
        }
      } catch (err) {
        console.error('Error fetching membership:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembership();
  }, []);

  const handleRenew = async () => {
    try {
      const res = await api.post('/member-portal/membership/renew');
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit renewal request');
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan to upgrade to');
      return;
    }
    try {
      const res = await api.post('/member-portal/membership/upgrade', { planName: selectedPlan });
      if (res.data.success) {
        toast.success(res.data.message);
        setUpgradeModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit upgrade request');
    }
  };

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
          <h2 className="module-title">My Membership Plan</h2>
          <p className="module-subtitle">View active tier details, renew subscription, or request an upgrade</p>
        </div>
        <div className="action-buttons-row">
          <button className="btn btn-dark" onClick={handleRenew}>Renew Active Plan</button>
          <button className="btn btn-neon-primary" onClick={() => setUpgradeModalOpen(true)}>Upgrade Tier</button>
        </div>
      </div>

      <div className="dashboard-charts-grid">
        <Card title={currentPlan?.name || 'Basic Membership'} badge={currentPlan?.status || 'Active'} icon={<MdCardMembership />}>
          <div className="plan-detail-hero">
            <div className="plan-price-large">₹{(currentPlan?.price || 999).toLocaleString()}</div>
            <p className="plan-dates">
              Valid from <strong>{currentPlan?.startDate ? new Date(currentPlan.startDate).toLocaleDateString() : 'N/A'}</strong> to <strong>{currentPlan?.endDate ? new Date(currentPlan.endDate).toLocaleDateString() : 'N/A'}</strong>
            </p>

            <div className="days-counter-box glass">
              <span className="days-number">{currentPlan?.daysLeft || 0}</span>
              <span className="days-label">Days Remaining</span>
            </div>

            <h4 style={{ marginTop: 25, marginBottom: 10 }}>Included Perks & Benefits:</h4>
            <ul className="perks-list">
              {(currentPlan?.benefits || ['Gym Access', 'Locker Room', 'Group Classes']).map((f, idx) => (
                <li key={idx}>
                  <MdCheckCircle color="var(--accent)" size={18} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Available Membership Tiers" icon={<MdCardMembership />}>
          <div className="tiers-comparison-list">
            {availablePlans.map((plan, idx) => (
              <div key={idx} className="tier-card-item glass">
                <div className="tier-header">
                  <strong>{plan.name} Plan</strong>
                  <span className="tier-p">₹{plan.price.toLocaleString()}</span>
                </div>
                <ul className="tier-features-mini">
                  {(plan.benefits || []).map((feat, fIdx) => (
                    <li key={fIdx}>✓ {feat}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Upgrade Membership Tier"
      >
        <div className="upgrade-options-list">
          {availablePlans.map((p) => (
            <div
              key={p._id || p.name}
              className={`upgrade-option-card ${selectedPlan === p.name ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(p.name)}
            >
              <div className="opt-title">
                <strong>{p.name} Tier</strong>
                <span>₹{p.price.toLocaleString()}</span>
              </div>
              <p className="opt-desc">{(p.benefits || []).join(' • ')}</p>
            </div>
          ))}

          <button className="btn btn-neon-primary full-width margin-top" onClick={handleConfirmUpgrade}>
            Proceed with Request
          </button>
        </div>
      </Modal>
    </div>
  );
}
