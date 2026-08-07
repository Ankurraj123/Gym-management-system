import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MdAssessment, MdPictureAsPdf, MdGridOn, MdFilterList, MdRefresh } from 'react-icons/md';

export default function Reports() {
  const [reportType, setReportType] = useState('Revenue');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports', { params: { type: reportType } });
      setData(res.data);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const exportExcelCSV = () => {
    if (!data || !data.rows || data.rows.length === 0) return toast.error('No report data available to export');

    const headers = Object.keys(data.rows[0]);
    const csvRows = [
      headers.join(','),
      ...data.rows.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Titanium_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel / CSV report exported successfully!');
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Reports & Intelligence</h1>
          <p className="page-sub">Analytics exporter & operational insights</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={exportExcelCSV} disabled={loading || !data}>
            <MdGridOn size={18} color="#14f195" /> Export Excel (CSV)
          </button>
          <button className="btn btn-neon" onClick={exportPDF} disabled={loading || !data}>
            <MdPictureAsPdf size={18} /> Export / Print PDF
          </button>
        </div>
      </div>

      {/* Selector Cards */}
      <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-muted)' }}>
          <MdFilterList size={16} /> SELECT REPORT CATEGORY
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { id: 'Revenue', label: '💰 Revenue Report' },
            { id: 'Attendance', label: '📅 Attendance Report' },
            { id: 'Membership', label: '💳 Membership Growth' },
            { id: 'Trainer', label: '🏋️ Trainer Performance' },
            { id: 'ActiveMembers', label: '🔥 Top Active Members' },
            { id: 'Expired', label: '⚠️ Expired Memberships' }
          ].map(r => (
            <button
              key={r.id}
              className={`btn ${reportType === r.id ? 'btn-neon' : 'btn-secondary'}`}
              onClick={() => setReportType(r.id)}
              style={{ fontSize: '0.85rem' }}
            >
              {r.label}
            </button>
          ))}
          <button className="btn btn-secondary btn-icon" onClick={fetchReport} title="Refresh">
            <MdRefresh size={18} />
          </button>
        </div>
      </div>

      {/* Report Summary Metric Banner */}
      {data?.summary && (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {Object.entries(data.summary).map(([key, val], idx) => (
            <div key={idx} className="glass" style={{ padding: '18px', borderRadius: '14px', borderLeft: '4px solid var(--neon)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1')}
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
                {typeof val === 'number' && key.toLowerCase().includes('revenue') ? `₹${val.toLocaleString()}` : val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Data Table */}
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {data?.title || `${reportType} Summary Report`}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Generated on {new Date().toLocaleDateString('en-IN')}
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {data?.headers ? (
                  data.headers.map((h, i) => <th key={i}>{h}</th>)
                ) : (
                  <th>Data Header</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Generating report analytics...
                  </td>
                </tr>
              ) : !data?.rows || data.rows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No records found for this report.
                  </td>
                </tr>
              ) : (
                data.rows.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} style={{ color: j === 0 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: j === 0 ? 700 : 400 }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
