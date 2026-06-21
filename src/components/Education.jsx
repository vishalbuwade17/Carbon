import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, Heart, Share2, Compass, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Education() {
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch('/api/edu/articles', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setArticles(data);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadArticles();
  }, [token]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-light)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading educational articles...</p>
        </div>
      </div>
    );
  }

  // Categories helper for color tags
  const getCategoryColor = (category) => {
    switch (category) {
      case 'diet': return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--accent-primary)' };
      case 'transportation': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6' };
      case 'energy': return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' };
      case 'water': return { bg: 'rgba(6, 182, 212, 0.1)', text: '#06B6D4' };
      default: return { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6' };
    }
  };

  const filteredArticles = filter === 'all' 
    ? articles 
    : articles.filter(a => a.category === filter);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px' }}>
      
      {/* If reading an article, show reader layout */}
      {selectedArticle ? (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <button 
            onClick={() => setSelectedArticle(null)} 
            className="btn btn-secondary" 
            style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <ArrowLeft size={16} /> Back to Library
          </button>

          <article className="card" style={{ padding: '2.5rem', overflow: 'visible' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                background: getCategoryColor(selectedArticle.category).bg,
                color: getCategoryColor(selectedArticle.category).text
              }}>
                {selectedArticle.category}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Clock size={12} /> {selectedArticle.read_time} min read
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1.5rem' }}>
              {selectedArticle.title}
            </h1>

            {selectedArticle.image_url && (
              <div style={{ width: '100%', height: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <img src={selectedArticle.image_url} alt={selectedArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      ) : (
        /* Library listing layout */
        <div>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Educational Hub</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Learn the science of climate changes and check out actionable carbon cutting tutorials.
            </p>
          </div>

          {/* Quick facts list */}
          <div className="card" style={{ display: 'flex', gap: '1.25rem', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.15)', marginBottom: '2rem', alignItems: 'flex-start' }}>
            <AlertCircle size={24} style={{ color: '#3B82F6', flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <h4 style={{ fontWeight: '700', marginBottom: '0.25rem', color: '#3B82F6' }}>Climate Spotlight Fact</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Globally, fossil fuels burned for road transportation are responsible for nearly 15% of all greenhouse gas emissions. Transitioning just half of your daily commutes to walking, cycling, or public transport can slash your personal transport footprint by over 2 tons of CO₂ annually!
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            {[
              { id: 'all', label: 'All Articles' },
              { id: 'diet', label: 'Diet & Food' },
              { id: 'transportation', label: 'Transportation' },
              { id: 'energy', label: 'Energy' },
              { id: 'water', label: 'Water' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`btn`}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  background: filter === cat.id ? 'var(--accent-primary)' : 'transparent',
                  color: filter === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
                  border: filter === cat.id ? '1px solid var(--accent-primary)' : 'none',
                  fontWeight: '600'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Articles list grid */}
          <div className="grid grid-cols-2">
            {filteredArticles.map(a => {
              const colors = getCategoryColor(a.category);
              return (
                <div 
                  key={a.id} 
                  className="card glow-top" 
                  style={{ display: 'flex', flexDirection: 'column', height: '380px', cursor: 'pointer' }}
                  onClick={() => setSelectedArticle(a)}
                >
                  {a.image_url && (
                    <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                      <img src={a.image_url} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: '700', 
                      textTransform: 'uppercase',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      background: colors.bg,
                      color: colors.text
                    }}>
                      {a.category}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Clock size={10} /> {a.read_time} min read
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                    {a.title}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.4',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    marginTop: 'auto'
                  }}>
                    {a.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
          div.card {
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
