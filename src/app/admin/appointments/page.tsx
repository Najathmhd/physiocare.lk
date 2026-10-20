"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";

interface Appointment {
  _id: string;
  patientName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus?: "unpaid" | "paid" | "partial" | "refunded";
  paymentAmount?: number;
  paymentMethod?: "cash" | "card" | "bank_transfer" | "online" | "insurance";
  receiptNumber?: string;
  notes?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    status: "pending",
    paymentStatus: "unpaid",
    paymentAmount: 0,
    paymentMethod: "cash",
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentAmount: 0,
    paymentMethod: "cash" as "cash" | "card" | "bank_transfer" | "online" | "insurance",
  });

  useEffect(() => {
    fetchAppointments();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setAvailableServices(data);
      }
    } catch (e) {
      console.error("Failed to fetch services:", e);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/appointments");
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment._id}`
        : "/api/appointments";

      const method = editingAppointment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sendNotification: true }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save appointment");
      }

      setSuccessMsg(
        editingAppointment
          ? "Appointment updated successfully! Notification emails sent."
          : "New appointment created successfully! Confirmation email sent."
      );
      await fetchAppointments();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete appointment");
      setSuccessMsg("Appointment deleted successfully.");
      await fetchAppointments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientName: appointment.patientName,
      email: appointment.email,
      phone: appointment.phone,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      paymentStatus: appointment.paymentStatus || "unpaid",
      paymentAmount: appointment.paymentAmount || 0,
      paymentMethod: appointment.paymentMethod || "cash",
      notes: appointment.notes || "",
    });
    setShowAddModal(true);
  };

  const handleOpenPaymentConfirm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setPaymentForm({
      paymentAmount: appointment.paymentAmount || 100,
      paymentMethod: appointment.paymentMethod || "cash",
    });
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "paid",
          paymentAmount: Number(paymentForm.paymentAmount),
          paymentMethod: paymentForm.paymentMethod,
        }),
      });

      if (!res.ok) throw new Error("Failed to confirm payment");

      const updated = await res.json();
      setSelectedAppointment(updated);
      setSuccessMsg(`Payment of LKR ${paymentForm.paymentAmount.toLocaleString()} confirmed! Receipt sent to ${updated.email}.`);
      setShowPaymentModal(false);
      await fetchAppointments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: "pending" | "confirmed" | "completed" | "cancelled") => {
    if (!selectedAppointment) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, sendNotification: true }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setSelectedAppointment(updated);
      setSuccessMsg(`Status updated to ${newStatus.toUpperCase()}! Email notification dispatched.`);
      await fetchAppointments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAppointment(null);
    setFormData({
      patientName: "",
      email: "",
      phone: "",
      service: "",
      date: "",
      time: "",
      status: "pending",
      paymentStatus: "unpaid",
      paymentAmount: 0,
      paymentMethod: "cash",
      notes: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-warning text-dark",
      confirmed: "bg-success text-white",
      completed: "bg-info text-white",
      cancelled: "bg-danger text-white",
    };
    return `badge ${statusClasses[status as keyof typeof statusClasses] || "bg-secondary"}`;
  };

  const getPaymentBadge = (paymentStatus?: string) => {
    if (paymentStatus === "paid") {
      return <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i> Paid</span>;
    }
    if (paymentStatus === "partial") {
      return <span className="badge bg-info text-dark">Partial</span>;
    }
    if (paymentStatus === "refunded") {
      return <span className="badge bg-secondary">Refunded</span>;
    }
    return <span className="badge bg-warning text-dark"><i className="fas fa-clock me-1"></i> Unpaid</span>;
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "paid" && appointment.paymentStatus === "paid") ||
      (paymentFilter === "unpaid" && appointment.paymentStatus !== "paid");
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <AdminLayout>
      <div className="appointments-page">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h1 className="h3 mb-1 fw-bold text-dark">
              <i className="fas fa-calendar-check me-2 text-primary"></i>
              Appointments & Billing
            </h1>
            <p className="text-muted small mb-0">Schedule consultations, manage patient sessions, and record payments</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus me-1"></i>
            New Appointment
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i className="fas fa-exclamation-triangle me-2 fs-5"></i>
            <div className="flex-grow-1">{error}</div>
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i className="fas fa-check-circle me-2 fs-5"></i>
            <div className="flex-grow-1">{successMsg}</div>
            <button type="button" className="btn-close" onClick={() => setSuccessMsg("")}></button>
          </div>
        )}

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by patient, email, or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Booking Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid Only</option>
                  <option value="unpaid">Unpaid Only</option>
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                  onClick={fetchAppointments}
                >
                  <i className={`fas fa-sync-alt me-1 ${loading ? "fa-spin" : ""}`}></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading && !appointments.length ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading appointments...</p>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 ps-3">Patient Info</th>
                      <th className="border-0">Service</th>
                      <th className="border-0">Date & Time</th>
                      <th className="border-0">Booking Status</th>
                      <th className="border-0">Payment Status</th>
                      <th className="border-0 text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          <i className="fas fa-calendar-times fs-1 mb-2 d-block"></i>
                          No appointments found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <tr key={appointment._id}>
                          <td className="ps-3">
                            <div className="fw-bold text-dark">{appointment.patientName}</div>
                            <small className="text-muted d-block">{appointment.email}</small>
                            <small className="text-muted">{appointment.phone}</small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{appointment.service}</span>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">
                              {new Date(appointment.date).toLocaleDateString()}
                            </div>
                            <small className="text-muted">{appointment.time}</small>
                          </td>
                          <td>
                            <span className={getStatusBadge(appointment.status)}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              {getPaymentBadge(appointment.paymentStatus)}
                              {appointment.paymentStatus === "paid" ? (
                                <small className="text-success fw-bold ms-1">
                                  LKR {Number(appointment.paymentAmount || 0).toLocaleString()}
                                </small>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-success py-0 px-2 ms-1"
                                  title="Confirm Payment"
                                  onClick={() => handleOpenPaymentConfirm(appointment)}
                                >
                                  <i className="fas fa-dollar-sign me-1"></i> Pay
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="text-end pe-3">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                title="View Details"
                                onClick={() => handleOpenView(appointment)}
                              >
                                <i className="fas fa-eye me-1"></i> View
                              </button>
                              <button
                                className="btn btn-outline-success"
                                title="Edit"
                                onClick={() => handleEdit(appointment)}
                              >
                                <i className="fas fa-edit me-1"></i> Edit
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                title="Delete"
                                onClick={() => handleDelete(appointment._id)}
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

        {/* VIEW DETAILS MODAL */}
        {showViewModal && selectedAppointment && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">
                    <i className="fas fa-file-medical me-2"></i>
                    Appointment Details
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">Patient Profile</h6>
                      <p className="mb-2"><strong>Name:</strong> {selectedAppointment.patientName}</p>
                      <p className="mb-2"><strong>Email:</strong> <a href={`mailto:${selectedAppointment.email}`}>{selectedAppointment.email}</a></p>
                      <p className="mb-2"><strong>Phone:</strong> <a href={`tel:${selectedAppointment.phone}`}>{selectedAppointment.phone}</a></p>
                      {selectedAppointment.notes && (
                        <div className="bg-light p-3 rounded mt-2 border">
                          <strong className="small text-muted d-block mb-1">Clinical Notes:</strong>
                          <div className="small">{selectedAppointment.notes}</div>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">Session & Billing</h6>
                      <p className="mb-2"><strong>Service:</strong> <span className="badge bg-light text-dark border">{selectedAppointment.service}</span></p>
                      <p className="mb-2"><strong>Scheduled:</strong> {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}</p>
                      <p className="mb-3">
                        <strong>Booking Status:</strong>{" "}
                        <span className={getStatusBadge(selectedAppointment.status)}>
                          {selectedAppointment.status.toUpperCase()}
                        </span>
                      </p>

                      <div className="card p-3 bg-light border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-dark">Payment Status:</strong>
                          {getPaymentBadge(selectedAppointment.paymentStatus)}
                        </div>
                        {selectedAppointment.paymentStatus === "paid" ? (
                          <div className="small text-success">
                            <div><strong>Receipt #:</strong> {selectedAppointment.receiptNumber || "N/A"}</div>
                            <div><strong>Amount:</strong> LKR {Number(selectedAppointment.paymentAmount || 0).toLocaleString()} via {selectedAppointment.paymentMethod?.toUpperCase()}</div>
                          </div>
                        ) : (
                          <div>
                            <small className="text-muted d-block mb-2">Payment pending for this session.</small>
                            <button
                              className="btn btn-success btn-sm w-100"
                              onClick={() => {
                                setShowViewModal(false);
                                handleOpenPaymentConfirm(selectedAppointment);
                              }}
                            >
                              <i className="fas fa-dollar-sign me-1"></i> Confirm Payment Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-top pt-3 mt-4">
                    <label className="form-label small fw-bold text-muted">Update Booking Status (Sends Patient Notification):</label>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-outline-warning btn-sm"
                        disabled={actionLoading || selectedAppointment.status === "pending"}
                        onClick={() => handleQuickStatusChange("pending")}
                      >
                        Set Pending
                      </button>
                      <button
                        className="btn btn-outline-success btn-sm"
                        disabled={actionLoading || selectedAppointment.status === "confirmed"}
                        onClick={() => handleQuickStatusChange("confirmed")}
                      >
                        <i className="fas fa-check me-1"></i> Confirm Appointment
                      </button>
                      <button
                        className="btn btn-outline-info btn-sm"
                        disabled={actionLoading || selectedAppointment.status === "completed"}
                        onClick={() => handleQuickStatusChange("completed")}
                      >
                        <i className="fas fa-check-double me-1"></i> Mark Completed
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={actionLoading || selectedAppointment.status === "cancelled"}
                        onClick={() => handleQuickStatusChange("cancelled")}
                      >
                        <i className="fas fa-times me-1"></i> Cancel
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm me-auto"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedAppointment);
                    }}
                  >
                    <i className="fas fa-edit me-1"></i> Edit Appointment
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowViewModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NEW / EDIT MODAL */}
        {showAddModal && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">
                    <i className={`fas ${editingAppointment ? "fa-edit" : "fa-plus"} me-2`}></i>
                    {editingAppointment ? "Edit Appointment" : "New Appointment"}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Patient Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.patientName}
                          onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Phone *</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Service *</label>
                        <select
                          className="form-select"
                          value={formData.service}
                          onChange={(e) => {
                            const selected = availableServices.find((s) => s.name === e.target.value);
                            setFormData({
                              ...formData,
                              service: e.target.value,
                              paymentAmount: selected?.price || formData.paymentAmount,
                            });
                          }}
                          required
                        >
                          <option value="">Select Service</option>
                          {availableServices.map((s, idx) => (
                            <option key={s._id || idx} value={s.name}>
                              {s.name} {s.price ? `(LKR ${Number(s.price).toLocaleString()})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          min={editingAppointment ? undefined : new Date().toISOString().split('T')[0]}
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                        {!editingAppointment && (
                          <small className="text-muted" style={{ fontSize: '0.72rem' }}>Past dates are disabled</small>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Time (AM / PM) *</label>
                        <select
                          className="form-select"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                        >
                          <option value="">Select Time Slot (AM / PM)...</option>
                          <optgroup label="Morning (AM)">
                            {["08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Afternoon &amp; Evening (PM)">
                            {["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM"].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </optgroup>
                          {formData.time && !["08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM"].includes(formData.time) && (
                            <option value={formData.time}>{formData.time}</option>
                          )}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Booking Status *</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Payment Status *</label>
                        <select
                          className="form-select"
                          value={formData.paymentStatus}
                          onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="partial">Partial</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Payment Amount (LKR)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.paymentAmount}
                          onChange={(e) => setFormData({ ...formData, paymentAmount: Number(e.target.value) })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Payment Method</label>
                        <select
                          className="form-select"
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Credit / Debit Card</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="online">Online Payment</option>
                          <option value="insurance">Insurance Claim</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold">Clinical Notes</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Condition, symptoms, or bedside requests..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm">
                      {actionLoading ? "Saving..." : editingAppointment ? "Update Appointment" : "Create Appointment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT CONFIRMATION MODAL */}
        {showPaymentModal && selectedAppointment && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title fw-bold">
                    <i className="fas fa-check-circle me-2"></i>
                    Confirm Payment & Send Receipt
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowPaymentModal(false)}></button>
                </div>
                <form onSubmit={handleConfirmPayment}>
                  <div className="modal-body p-4">
                    <div className="alert alert-info py-2 small mb-3">
                      <i className="fas fa-info-circle me-1"></i>
                      Confirming marks this session as <strong>Paid</strong> and delivers an official receipt to <strong>{selectedAppointment.email}</strong>.
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Patient Name</label>
                      <input type="text" className="form-control" value={selectedAppointment.patientName} disabled />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Service</label>
                      <input type="text" className="form-control" value={selectedAppointment.service} disabled />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Payment Amount (LKR) *</label>
                      <input
                        type="number"
                        step="1"
                        className="form-control"
                        value={paymentForm.paymentAmount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentAmount: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Payment Method *</label>
                      <select
                        className="form-select"
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                        required
                      >
                        <option value="cash">Cash Payment</option>
                        <option value="card">Credit / Debit Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="online">Online Payment</option>
                        <option value="insurance">Medical Insurance</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPaymentModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" disabled={actionLoading} className="btn btn-success btn-sm">
                      {actionLoading ? "Processing Receipt..." : "Confirm & Send Email Receipt"}
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