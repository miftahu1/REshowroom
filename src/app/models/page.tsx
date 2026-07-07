'use client';

import { useEffect, useState } from 'react';

interface Model {
  id: string;
  name: string;
  engine: string;
  power: string;
  torque: string;
  price: string;
  imageUrl: string;
  category: string;
}

const ModelsPage = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    // Normally, you'd fetch this from an API
    const allModels: Model[] = [
      {
        id: '1',
        name: 'Classic 350',
        engine: '349cc, Single-Cylinder, 4-stroke',
        power: '20.2 BHP @ 6100 RPM',
        torque: '27 Nm @ 4000 RPM',
        price: '₹ 1.93 Lakh onwards',
        imageUrl: '/assets/images/motor-1.png',
        category: 'Cruiser'
      },
      {
        id: '2',
        name: 'Meteor 350',
        engine: '349cc, Single-Cylinder, 4-stroke',
        power: '20.2 BHP @ 6100 RPM',
        torque: '27 Nm @ 4000 RPM',
        price: '₹ 2.03 Lakh onwards',
        imageUrl: '/assets/images/motor-2.png',
        category: 'Cruiser'
      },
      {
        id: '3',
        name: 'Himalayan',
        engine: '411cc, Single-Cylinder, 4-stroke',
        power: '24.3 BHP @ 6500 RPM',
        torque: '32 Nm @ 4000-4500 RPM',
        price: '₹ 2.16 Lakh onwards',
        imageUrl: '/assets/images/motor-3.png',
        category: 'Adventure'
      },
      {
        id: '4',
        name: 'Interceptor 650',
        engine: '648cc, Parallel-Twin, 4-stroke',
        power: '47 BHP @ 7150 RPM',
        torque: '52 Nm @ 5250 RPM',
        price: '₹ 3.03 Lakh onwards',
        imageUrl: '/assets/images/motor-4.png',
        category: 'Roadster'
      },
      {
        id: '5',
        name: 'Continental GT 650',
        engine: '648cc, Parallel-Twin, 4-stroke',
        power: '47 BHP @ 7150 RPM',
        torque: '52 Nm @ 5250 RPM',
        price: '₹ 3.19 Lakh onwards',
        imageUrl: '/assets/images/motor-5.png',
        category: 'Cafe Racer'
      },
      {
        id: '6',
        name: 'Scram 411',
        engine: '411cc, Single-Cylinder, 4-stroke',
        power: '24.3 BHP @ 6500 RPM',
        torque: '32 Nm @ 4000-4500 RPM',
        price: '₹ 2.06 Lakh onwards',
        imageUrl: '/assets/images/motor-6.png',
        category: 'Scrambler'
      },
    ];

    setModels(allModels);
    setFilteredModels(allModels);
  }, []);

  const handleFilter = (category: string) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredModels(models);
    } else {
      const filtered = models.filter(model => model.category === category);
      setFilteredModels(filtered);
    }
  };

  const filterOptions = ['All', 'Cruiser', 'Adventure', 'Roadster', 'Cafe Racer', 'Scrambler'];

  return (
    <div id="models">
      <div className="section-header">
        <h2 className="section-title">Our Legendary Lineup</h2>
        <p className="section-subtitle">Explore the complete range of Royal Enfield motorcycles. Each machine is a piece of history, built to rule the road.</p>
      </div>

      <div className="filter-bar-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div className="filter-bar" style={{ display: 'flex', gap: '10px', background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {filterOptions.map(option => (
            <button 
              key={option} 
              onClick={() => handleFilter(option)} 
              className={`filter-btn ${activeFilter === option ? 'active' : ''}`}
              style={{
                padding: '10px 20px',
                borderRadius: '999px',
                border: 'none',
                background: activeFilter === option ? 'var(--gold)' : 'transparent',
                color: activeFilter === option ? 'var(--text-inverted)' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="models-grid">
        {filteredModels.map(model => (
          <div className="model-card" key={model.id}>
            <div className="model-card-img">
              <img src={model.imageUrl} alt={model.name} />
              {model.category && <div className="model-card-badge">{model.category}</div>}
            </div>
            <div className="model-card-body">
              <h3 className="model-card-name">{model.name}</h3>
              <p className="model-card-engine">{model.engine}</p>
              <div className="model-card-specs">
                <div className="model-spec">
                  <span className="model-spec-val">{model.power}</span>
                  <span className="model-spec-label">Power</span>
                </div>
                <div className="model-spec">
                  <span className="model-spec-val">{model.torque}</span>
                  <span className="model-spec-label">Torque</span>
                </div>
              </div>
              <div className="model-card-footer">
                <div className="model-price">{model.price}</div>
                <a href={`/product/${model.id}`} className="model-explore-btn">Explore &rarr;</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelsPage; 
