"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface Staff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
  hireDate: string;
  createdAt: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    specialization: "",
    licenseNumber: "",
    isActive: true,
    hireDate: ""
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/staff");
      if (!response.ok) throw new Error("Failed to fetch staff");
      const data = await response.json();
      setStaff(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStaff 
        ? `/api/staff/${editingStaff._id}`
        : "/api/staff";
      
      const method = editingStaff ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save staff member");
      
      await fetchStaff();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete staff member");
      
      await fetchStaff();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      specialization: staffMember.specialization,
      licenseNumber: staffMember.licenseNumber,
      isActive: staffMember.isActive,
      hireDate: staffMember.hireDate
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      specialization: "",
      licenseNumber: "",
      isActive: true,
      hireDate: ""
    });
  };

  const toggleStaffStatus = async (staffMember: Staff) => {
    try {
      const response = await fetch(`/api/staff/${staffMember._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...staffMember, isActive: !staffMember.isActive }),
      });
      
      if (!response.ok) throw new Error("Failed to update staff status");
      
      await fetchStaff();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || staffMember.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roles = [
    "Physiotherapist",
    "Senior Physiotherapist", 
    "Physical Therapist",
    "Rehabilitation Specialist",
    "Sports Therapist",
    "Massage Therapist",
    "Therapy Assistant",
    "Administrator",
    "Manager"
  ];

  const specializations = [
    "Orthopedic",
    "Sports Medicine",
    "Neurological",
    "Cardiovascular",
    "Pediatric",
    "Geriatric",
    "Women's Health",
    "Vestibular",
    "Respiratory",
    "General"
  ];

  const getRoleBadge = (role: string) => {
    const roleClasses = {
      'Physiotherapist': 'bg-primary',
      'Senior Physiotherapist': 'bg-success',
      'Physical Therapist': 'bg-info',
      'Rehabilitation Specialist': 'bg-warning',
      'Sports Therapist': 'bg-danger',
      'Massage Therapist': 'bg-secondary',
      'Therapy Assistant': 'bg-light text-dark',
      'Administrator': 'bg-dark',
      'Manager': 'bg-primary'
    };
    return `badge ${roleClasses[role as keyof typeof roleClasses] || 'bg-secondary'}`;
  };

  return (
    <AdminLayout>
      <div className="staff-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">
            <i className="fas fa-user-md me-2 text-primary"></i>
            Staff
          </h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-1"></i>
            New Staff Member
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
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={fetchStaff}
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
            <p className="mt-2 text-muted">Loading staff...</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">Staff Member</th>
                      <th className="border-0">Contact</th>
                      <th className="border-0">Role & Specialization</th>
                      <th className="border-0">License</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted">
                          <i className="fas fa-user-slash fs-1 mb-3 d-block"></i>
                          No staff members found.
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map(staffMember => (
                        <tr key={staffMember._id}>
                          <td>
                            <div>
                              <div className="fw-semibold">{staffMember.name}</div>
                              <small className="text-muted">ID: {staffMember._id.slice(-6)}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold">{staffMember.email}</div>
                              <small className="text-muted">{staffMember.phone}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="mb-1">
                                <span className={getRoleBadge(staffMember.role)}>
                                  {staffMember.role}
                                </span>
                              </div>
                              <small className="text-muted">{staffMember.specialization}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">{staffMember.licenseNumber}</span>
                          </td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={staffMember.isActive}
                                onChange={() => toggleStaffStatus(staffMember)}
                                title={staffMember.isActive ? "Active" : "Inactive"}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary" 
                                title="View Details"
                                onClick={() => handleEdit(staffMember)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="btn btn-outline-success" 
                                title="Edit"
                                onClick={() => handleEdit(staffMember)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger" 
                                title="Delete"
                                onClick={() => handleDelete(staffMember._id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingStaff ? 'Edit Staff Member' : 'New Staff Member'}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone *</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">License Number *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Role *</label>
                        <select
                          className="form-select"
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          required
                        >
                          <option value="">Select Role</option>
                          {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Specialization *</label>
                        <select
                          className="form-select"
                          value={formData.specialization}
                          onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                          required
                        >
                          <option value="">Select Specialization</option>
                          {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Hire Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.hireDate}
                          onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                          required
                        />
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
                            Staff member is active and available for work
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
                      {editingStaff ? 'Update' : 'Create'} Staff Member
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