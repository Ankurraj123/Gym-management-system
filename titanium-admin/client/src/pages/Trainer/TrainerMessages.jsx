import React, { useState } from 'react';
import Card from '../../components/layout/Card';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdSend, MdNotificationsActive } from 'react-icons/md';

export default function TrainerMessages() {
  const [recipient, setRecipient] = useState('Jamie Nelson');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('advice'); // 'advice' | 'reminder'

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message) {
      toast.error('Please type a message');
      return;
    }
    toast.success(`${type === 'reminder' ? 'Workout Reminder' : 'Fitness Advice'} sent to ${recipient}! 📩`);
    setMessage('');
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Client Messaging & Notifications</h2>
        <p className="module-subtitle">Send fitness advice, form tips, and workout reminders directly to assigned members</p>
      </div>

      <div className="dashboard-charts-grid">
        <Card title="Send Direct Notification to Member" icon={<MdNotificationsActive />}>
          <form onSubmit={handleSendMessage} className="profile-form">
            <div className="form-group-custom">
              <label>Select Client *</label>
              <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                <option value="Jamie Nelson">Jamie Nelson (TF-1001)</option>
                <option value="Ankur Kumar">Ankur Kumar (TF-1002)</option>
                <option value="Rahul Verma">Rahul Verma (TF-1003)</option>
              </select>
            </div>

            <div className="form-group-custom">
              <label>Message Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="advice">Personal Fitness Advice & Guidance</option>
                <option value="reminder">Scheduled Workout / PT Session Reminder</option>
              </select>
            </div>

            <div className="form-group-custom">
              <label>Message Content *</label>
              <textarea
                rows={4}
                className="input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="e.g. Great progress on bench press yesterday! Make sure to complete 15 mins of post-workout stretching today."
              />
            </div>

            <button type="submit" className="btn btn-neon-primary">
              <MdSend size={16} style={{ marginRight: 6 }} /> Send Notification to Client
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
