"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  medicalHistory?: string;
  emergencyContact?: string;
  createdAt: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    medicalHistory: "",
    emergencyContact: ""
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/patients");
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPatient 
        ? `/api/patients/${editingPatient._id}`
        : "/api/patients";
      
      const method = editingPatient ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save patient");
      
      setSuccessMsg(editingPatient ? "Patient updated successfully." : "New patient registered successfully.");
      await fetchPatients();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient record?")) return;
    
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete patient");
      setSuccessMsg("Patient deleted successfully.");
      await fetchPatients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenView = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth === "Not specified" ? "" : patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      medicalHistory: patient.medicalHistory || "",
      emergencyContact: patient.emergencyContact || ""
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPatient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      medicalHistory: "",
      emergencyContact: ""
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth || dateOfBirth === "Not specified") return "N/A";
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return "N/A";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} yrs`;
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesGender = genderFilter === "all" || patient.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <AdminLayout>
      <div className="patients-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold text-dark">
              <i className="fas fa-users me-2 text-primary"></i>
              Patient Directory
            </h1>
            <p className="text-muted small mb-0">Manage registered clinical patients and medical histories</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-1"></i>
            New Patient
          </button>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {successMsg}
            <button type="button" className="btn-close" onClick={() => setSuccessMsg("")}></button>
          </div>
        )}

        {/* Filter and Search */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-3">
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={fetchPatients}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        {loading && !patients.length ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading patients...</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 ps-3">Patient</th>
                      <th className="border-0">Contact</th>
                      <th className="border-0">Age & Gender</th>
                      <th className="border-0">Address</th>
                      <th className="border-0 text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5 text-muted">
                          <i className="fas fa-user-times fs-1 mb-2 d-block"></i>
                          No patients found.
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map(patient => (
                        <tr key={patient._id}>
                          <td className="ps-3">
                            <div className="fw-bold text-dark">{patient.name}</div>
                            <small className="text-muted">ID: {patient._id.slice(-6).toUpperCase()}</small>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{patient.phone}</div>
                            <small className="text-muted">{patient.email}</small>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{calculateAge(patient.dateOfBirth)}</div>
                            <small className="text-muted text-capitalize">{patient.gender}</small>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '220px' }} title={patient.address}>
                              {patient.address}
                            </div>
                          </td>
                          <td className="text-end pe-3">
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary" 
                                title="View Details"
                                onClick={() => handleOpenView(patient)}
                              >
                                <i className="fas fa-eye me-1"></i> View
                              </button>
                              <button 
                                className="btn btn-outline-success" 
                                title="Edit"
                                onClick={() => handleEdit(patient)}
                              >
                                <i className="fas fa-edit me-1"></i> Edit
                              </button>
                              <button 
                                className="btn btn-outline-danger" 
                                title="Delete"
                                onClick={() => handleDelete(patient._id)}
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

        {/* VIEW PATIENT MODAL */}
        {showViewModal && selectedPatient && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">
                    <i className="fas fa-user-circle me-2"></i>
                    Patient Profile
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="text-center mb-3">
                    <div className="service-icon-wrapper mx-auto mb-2" style={{ width: '64px', height: '64px' }}>
                      <i className="fas fa-user"></i>
                    </div>
                    <h5 className="fw-bold mb-0">{selectedPatient.name}</h5>
                    <small className="text-muted">Record ID: {selectedPatient._id}</small>
                  </div>

                  <div className="list-group list-group-flush border rounded mb-3">
                    <div className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Phone:</span>
                      <strong>{selectedPatient.phone}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Email:</span>
                      <strong>{selectedPatient.email}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Date of Birth:</span>
                      <strong>{selectedPatient.dateOfBirth} ({calculateAge(selectedPatient.dateOfBirth)})</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Gender:</span>
                      <strong className="text-capitalize">{selectedPatient.gender}</strong>
                    </div>
                    <div className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Emergency Contact:</span>
                      <strong>{selectedPatient.emergencyContact || 'Not provided'}</strong>
                    </div>
                    <div className="list-group-item">
                      <span className="text-muted d-block mb-1">Residential Address:</span>
                      <div>{selectedPatient.address}</div>
                    </div>
                  </div>

                  {selectedPatient.medicalHistory && (
                    <div className="bg-light p-3 rounded border">
                      <strong className="text-muted small d-block mb-1">Medical History & Clinical Notes:</strong>
                      <div className="small">{selectedPatient.medicalHistory}</div>
                    </div>
                  )}
                </div>
                <div className="modal-footer bg-light">
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm me-auto" 
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedPatient);
                    }}
                  >
                    <i className="fas fa-edit me-1"></i> Edit Profile
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowViewModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD / EDIT PATIENT MODAL */}
        {showAddModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">
                    <i className={`fas ${editingPatient ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                    {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Email Address *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Phone Number *</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Gender *</label>
                        <select
                          className="form-select"
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Emergency Contact</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.emergencyContact}
                          onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                          placeholder="e.g. +94 77 000 0000"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold">Residential Address *</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          required
                          placeholder="Full address"
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold">Medical History / Chronic Conditions</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.medicalHistory}
                          onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                          placeholder="Prior injuries, surgeries, allergies, mobility restrictions..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      {editingPatient ? 'Save Changes' : 'Register Patient'}
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