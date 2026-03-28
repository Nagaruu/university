import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/universities";

function App() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [formData, setFormData] = useState({ name: "", country_code: "", website: "" });

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: {
          search: searchTerm,
          limit,
          offset: page * limit
        }
      });
      setUniversities(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Failed to load universities.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUniversities();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page, fetchUniversities]);

  const handleOpenModal = (uni = null) => {
    if (uni) {
      setEditingUniversity(uni);
      setFormData({ name: uni.name, country_code: uni.country_code, website: uni.website });
    } else {
      setEditingUniversity(null);
      setFormData({ name: "", country_code: "", website: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUniversity(null);
    setFormData({ name: "", country_code: "", website: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUniversity) {
        await axios.put(`${API_URL}/${editingUniversity.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      handleCloseModal();
      fetchUniversities();
    } catch (err) {
      alert("Error saving data: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this university?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUniversities();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  const getThumbnail = (website) => {
    if (!website) return "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800&q=80";
    // Using WordPress mshots service for screenshots
    let cleanUrl = website.startsWith('http') ? website : `http://${website}`;
    return `https://s0.wp.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=400&h=300`;
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;

    let pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - 2);
    let end = Math.min(totalPages, start + maxVisible);
    
    if (end === totalPages) {
       start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => setPage(i)} 
          className={`page-btn ${page === i ? 'active' : ''}`}
        >
          {i + 1}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="page-btn">Prev</button>
        {pages}
        <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="page-btn">Next</button>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span style={{ fontSize: "1.8rem" }}>🎓</span> UniExplorer
        </div>
        
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input"
            placeholder="Search by name or country..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <span>+</span> Add University
        </button>
      </header>

      <div className="container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>
            <div className="spinner" style={{ marginBottom: "1rem" }}>⏳</div>
            Loading universities...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Showing {total.toLocaleString()} universities found
            </div>
            
            <div className="grid">
              {universities.map((uni) => (
                <div key={uni.id} className="card">
                  <div className="card-image">
                    <img 
                      src={getThumbnail(uni.website)} 
                      alt={uni.name} 
                      onError={(e) => {
                         e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800&q=80";
                      }}
                    />
                  </div>
                  <div className="card-content">
                    <div className="card-country">{uni.country_code}</div>
                    <h3 className="card-title" title={uni.name}>{uni.name}</h3>
                    {uni.website && (
                      <a href={uni.website} target="_blank" rel="noopener noreferrer" className="card-link">
                        <span>🔗</span> {uni.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                  <div className="card-actions">
                    <button className="btn btn-outline btn-icon" onClick={() => handleOpenModal(uni)} title="Edit">
                      ✏️ Edit
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(uni.id)} title="Delete">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {renderPagination()}
          </>
        )}

        {!loading && universities.length === 0 && (
          <div style={{ textAlign: "center", padding: "100px", background: "white", borderRadius: "16px", marginTop: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
            <h2 style={{ margin: "0 0 10px 0" }}>No results found</h2>
            <p style={{ color: "var(--text-muted)" }}>Try searching with a different keyword!</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingUniversity ? "Edit University" : "New University"}</h2>
              <button onClick={handleCloseModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">University Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country Code (e.g. US, VN)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={formData.country_code}
                    onChange={(e) => setFormData({...formData, country_code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://example.edu"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;