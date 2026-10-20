"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    category: "",
    image: "",
    isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingService 
        ? `/api/services/${editingService._id}`
        : "/api/services";
      
      const method = editingService ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save service");
      
      await fetchServices();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete service");
      
      await fetchServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      image: service.image || "",
      isActive: service.isActive
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      duration: 30,
      price: 0,
      category: "",
      image: "",
      isActive: true
    });
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...service, isActive: !service.isActive }),
      });
      
      if (!response.ok) throw new Error("Failed to update service status");
      
      await fetchServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "Clinic Consultation",
    "Bedside & Home Care",
    "General"
  ];

  return (
    <AdminLayout>
      <div className="services-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">
            <i className="fas fa-stethoscope me-2 text-primary"></i>
            Services
          </h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-1"></i>
            New Service
          </button>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={fetchServices}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading services...</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredServices.length === 0 ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <i className="fas fa-stethoscope fs-1 text-muted mb-3 d-block"></i>
                    <h5 className="text-muted">No services found</h5>
                    <p className="text-muted">Create your first service to get started.</p>
                  </div>
                </div>
              </div>
            ) : (
              filteredServices.map(service => (
                <div key={service._id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100 overflow-hidden">
                    <div style={{ height: '140px', overflow: 'hidden', position: 'relative', backgroundColor: '#f1f5f9' }}>
                      <img 
                        src={service.image || '/images/services/physical-therapy.jpg'} 
                        alt={service.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e: any) => { e.currentTarget.src = '/images/services/physical-therapy.jpg'; }}
                      />
                      <span className="badge bg-dark bg-opacity-75 position-absolute bottom-0 start-0 m-2">
                        {service.category}
                      </span>
                      <div className="position-absolute top-0 end-0 m-2 bg-white bg-opacity-90 px-2 py-1 rounded-pill shadow-sm">
                        <div className="form-check form-switch m-0 d-flex align-items-center">
                          <input
                            className="form-check-input mt-0"
                            type="checkbox"
                            checked={service.isActive}
                            onChange={() => toggleServiceStatus(service)}
                            title={service.isActive ? "Active" : "Inactive"}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title mb-2 text-dark fw-bold">{service.name}</h5>
                      
                      <p className="card-text text-muted small mb-3" style={{ minHeight: '38px' }}>
                        {service.description}
                      </p>
                      
                      <div className="row g-2 mb-3 py-2 border-top border-bottom bg-light bg-opacity-50 rounded">
                        <div className="col-6">
                          <small className="text-muted d-block">Duration</small>
                          <div className="fw-semibold text-secondary">
                            <i className="far fa-clock me-1 text-primary"></i>
                            {service.duration} min
                          </div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Fee</small>
                          <div className="fw-bold text-teal" style={{ color: '#0d9488' }}>
                            LKR {service.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-outline-primary btn-sm flex-fill"
                          onClick={() => handleEdit(service)}
                        >
                          <i className="fas fa-edit me-1"></i>
                          Edit
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(service._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-hand-holding-medical text-primary me-2"></i>
                    {editingService ? 'Edit Service' : 'New Service'}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label">Service Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Duration (minutes) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                          min="15"
                          step="15"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Price (LKR) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                          min="0"
                          step="50"
                          placeholder="e.g. 4000"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Service Image (URL or path)</label>
                        <div className="input-group mb-2">
                          <span className="input-group-text"><i className="fas fa-image"></i></span>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            placeholder="/images/services/physical-therapy.jpg or external https:// link"
                          />
                        </div>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          <small className="text-muted w-100">Quick Clinical Presets:</small>
                          <button type="button" className="btn btn-sm btn-light border py-0 px-2" onClick={() => setFormData({...formData, image: '/images/services/physical-therapy.jpg'})}>General Physio</button>
                          <button type="button" className="btn btn-sm btn-light border py-0 px-2" onClick={() => setFormData({...formData, image: '/images/services/sports-rehab.jpg'})}>Sports Rehab</button>
                          <button type="button" className="btn btn-sm btn-light border py-0 px-2" onClick={() => setFormData({...formData, image: '/images/services/manual-massage.jpg'})}>Manual Therapy</button>
                          <button type="button" className="btn btn-sm btn-light border py-0 px-2" onClick={() => setFormData({...formData, image: '/images/services/neuro-rehab.jpg'})}>Neuro Rehab</button>
                          <button type="button" className="btn btn-sm btn-light border py-0 px-2" onClick={() => setFormData({...formData, image: '/images/services/orthopedic-spine.jpg'})}>Orthopedic & Spine</button>
                        </div>
                        {formData.image && (
                          <div className="mt-2 p-2 border rounded bg-light d-flex align-items-center gap-3">
                            <img 
                              src={formData.image} 
                              alt="Preview" 
                              style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                              onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <small className="text-muted">Image Preview</small>
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description *</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          required
                          placeholder="Describe the service..."
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          />
                          <label className="form-check-label">
                            Service is active and available for booking
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingService ? 'Update' : 'Create'} Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 