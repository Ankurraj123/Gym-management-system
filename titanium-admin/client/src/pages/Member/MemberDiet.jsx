import React, { useState, useEffect } from 'react';
import Card from '../../components/layout/Card';
import api from '../../api/axios';
import { MdRestaurantMenu, MdLocalFireDepartment } from 'react-icons/md';

export default function MemberDiet() {
  const [loading, setLoading] = useState(true);
  const [diet, setDiet] = useState(null);

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const res = await api.get('/member-portal/diet');
        if (res.data.success && res.data.diet) {
          setDiet(res.data.diet);
        }
      } catch (err) {
        console.error('Error fetching diet plan:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiet();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const [waterGlasses, setWaterGlasses] = useState(() => Number(localStorage.getItem('member_water') || 4));
  const [completedMeals, setCompletedMeals] = useState({
    breakfast: false,
    lunch: false,
    snacks: false,
    dinner: false
  });

  const handleAddWater = () => {
    setWaterGlasses(prev => {
      const next = Math.min(prev + 1, 12);
      localStorage.setItem('member_water', next);
      toast.success(`Hydration logged! ${next}/8 glasses today 💧`);
      return next;
    });
  };

  const toggleMeal = (mealKey) => {
    setCompletedMeals(prev => {
      const updated = !prev[mealKey];
      if (updated) toast.success(`Meal logged as completed! 🍽️`);
      return { ...prev, [mealKey]: updated };
    });
  };

  const mealsList = [
    { key: 'breakfast', title: 'Meal 1: Breakfast', items: [diet?.breakfast || 'Oatmeal, Eggs, Green Tea'] },
    { key: 'lunch', title: 'Meal 2: Lunch', items: [diet?.lunch || 'Grilled Chicken/Tofu, Rice, Greens'] },
    { key: 'snacks', title: 'Meal 3: Evening Snacks', items: [diet?.snacks || 'Protein Shake, Almonds'] },
    { key: 'dinner', title: 'Meal 4: Dinner', items: [diet?.dinner || 'Fish/Paneer, Salad, Soup'] }
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">{diet?.name || 'Nutrition & Macro Diet Plan'}</h2>
        <p className="module-subtitle">Goal: <strong>{diet?.goal || 'General Health'}</strong> • Assigned by Personal Trainer</p>
      </div>

      {/* Water & Tracker Bar */}
      <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💧 Water Intake Tracker
          </h4>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Goal: 8 Glasses (2.5 Liters) • Currently Logged: <strong>{waterGlasses} / 8 Glasses</strong>
          </p>
        </div>
        <button className="btn btn-neon-primary" onClick={handleAddWater}>
          + Add 1 Glass (250ml)
        </button>
      </div>

      {/* Macros Row */}
      <div className="metrics-grid">
        <Card title="Daily Calorie Target" badge="Target" icon={<MdLocalFireDepartment color="#f59e0b" />}>
          <div className="metric-large">{diet?.calories || 2200} <span className="unit">kcal</span></div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '80%', backgroundColor: '#f59e0b' }} /></div>
        </Card>

        <Card title="Protein Goal" badge="Primary" icon={<MdRestaurantMenu color="var(--accent)" />}>
          <div className="metric-large">{diet?.protein || 140} <span className="unit">grams</span></div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '75%', backgroundColor: 'var(--accent)' }} /></div>
        </Card>

        <Card title="Carbohydrates Target" badge="Energy" icon={<MdRestaurantMenu color="#3b82f6" />}>
          <div className="metric-large">{diet?.carbs || 220} <span className="unit">grams</span></div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '70%', backgroundColor: '#3b82f6' }} /></div>
        </Card>

        <Card title="Healthy Fats Target" badge="Essential" icon={<MdRestaurantMenu color="#a855f7" />}>
          <div className="metric-large">{diet?.fat || 60} <span className="unit">grams</span></div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '65%', backgroundColor: '#a855f7' }} /></div>
        </Card>
      </div>

      {/* Meals Grid */}
      <h3 style={{ marginTop: 25, marginBottom: 15 }}>Today's Meal Breakdown</h3>
      <div className="dashboard-charts-grid">
        {mealsList.map((m, idx) => (
          <Card key={idx} title={m.title} icon={<MdRestaurantMenu />}>
            <ul className="meal-items-list" style={{ marginBottom: '16px' }}>
              {m.items.map((item, itemIdx) => (
                <li key={itemIdx}>{item}</li>
              ))}
            </ul>
            <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: completedMeals[m.key] ? 'var(--accent)' : 'var(--text-muted)' }}>
                {completedMeals[m.key] ? '✓ Meal Completed' : 'Pending'}
              </span>
              <button
                className={`btn ${completedMeals[m.key] ? 'btn-secondary' : 'btn-neon-primary'}`}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => toggleMeal(m.key)}
              >
                {completedMeals[m.key] ? 'Undo' : 'Mark Ate'}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
