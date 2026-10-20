"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    appointments: 0,
    patients: 0,
    staff: 0,
    services: 0,
    paidCount: 0,
    totalRevenue: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal States
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form State for Editing
  const [editFormData, setEditFormData] = useState({
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

  // Quick Payment Confirmation State
  const [paymentForm, setPaymentForm] = useState({
    paymentAmount: 0,
    paymentMethod: "cash" as "cash" | "card" | "bank_transfer" | "online" | "insurance",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [apptsRes, patientsRes, staffRes, servicesRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/patients"),
        fetch("/api/staff"),
        fetch("/api/services"),
      ]);

      if (!apptsRes.ok) throw new Error("Failed to fetch appointments");
      if (!patientsRes.ok) throw new Error("Failed to fetch patients");
      if (!staffRes.ok) throw new Error("Failed to fetch staff");
      if (!servicesRes.ok) throw new Error("Failed to fetch services");

      const appts: Appointment[] = await apptsRes.json();
      const patients = await patientsRes.json();
      const staff = await staffRes.json();
      const services = await servicesRes.json();

      setAvailableServices(services);

      const paid = appts.filter((a) => a.paymentStatus === "paid");
      const revenue = paid.reduce((sum, a) => sum + (Number(a.paymentAmount) || 0), 0);

      setCounts({
        appointments: appts.length,
        patients: patients.length,
        staff: staff.length,
        services: services.length,
        paidCount: paid.length,
        totalRevenue: revenue,
      });

      setRecentAppointments(appts.slice(0, 8));
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenView = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setShowViewModal(true);
  };

  const handleOpenEdit = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setEditFormData({
      patientName: appt.patientName,
      email: appt.email,
      phone: appt.phone,
      service: appt.service,
      date: appt.date,
      time: appt.time,
      status: appt.status,
      paymentStatus: appt.paymentStatus || "unpaid",
      paymentAmount: appt.paymentAmount || 0,
      paymentMethod: appt.paymentMethod || "cash",
      notes: appt.notes || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editFormData, sendNotification: true }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update appointment");
      }

      setSuccessMsg("Appointment updated successfully! Notification email dispatched.");
      setShowEditModal(false);
      await fetchData();
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
      if (!res.ok) throw new Error("Failed to change status");
      const updated = await res.json();
      setSelectedAppointment(updated);
      setSuccessMsg(`Status updated to ${newStatus.toUpperCase()} and patient notified via email.`);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPaymentConfirm = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setPaymentForm({
      paymentAmount: appt.paymentAmount || 100,
      paymentMethod: appt.paymentMethod || "cash",
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
      setSuccessMsg(`Payment of LKR ${paymentForm.paymentAmount.toLocaleString()} confirmed! Official receipt email sent to ${updated.email}.`);
      setShowPaymentModal(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
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

  return (
    <AdminLayout>
      <div className="dashboard">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h1 className="h3 mb-1 fw-bold text-dark">
              <i className="fas fa-tachometer-alt me-2 text-primary"></i>
              Clinical Management Dashboard
            </h1>
            <p className="text-muted small mb-0">Overview of clinic operations, appointments, and billing</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm d-flex align-items-center" onClick={fetchData} disabled={loading}>
              <i className={`fas fa-sync-alt me-1 ${loading ? "fa-spin" : ""}`}></i>
              Refresh
            </button>
            <Link href="/admin/appointments" className="btn btn-primary btn-sm">
              <i className="fas fa-plus me-1"></i>
              New Appointment
            </Link>
          </div>
        </div>

        {/* Alerts */}
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

        {loading && !recentAppointments.length ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading clinical metrics...</p>
          </div>
        ) : (
          <>
            {/* Metric Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="service-icon-wrapper me-3">
                        <i className="fas fa-calendar-check text-primary"></i>
                      </div>
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Appointments</span>
                        <h3 className="mb-0 fw-bold text-dark">{counts.appointments}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="service-icon-wrapper me-3" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <i className="fas fa-user-injured"></i>
                      </div>
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Active Patients</span>
                        <h3 className="mb-0 fw-bold text-dark">{counts.patients}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="service-icon-wrapper me-3" style={{ background: "rgba(14, 165, 233, 0.1)", color: "#0ea5e9" }}>
                        <i className="fas fa-user-md"></i>
                      </div>
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Clinical Staff</span>
                        <h3 className="mb-0 fw-bold text-dark">{counts.staff}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="service-icon-wrapper me-3" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <i className="fas fa-file-invoice-dollar"></i>
                      </div>
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Paid Sessions</span>
                        <h3 className="mb-0 fw-bold text-dark">
                          {counts.paidCount} <small className="text-success fs-6 fw-normal">(LKR {counts.totalRevenue.toLocaleString()})</small>
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Appointments Section */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i className="fas fa-clock text-primary me-2 fs-5"></i>
                  <h5 className="mb-0 fw-bold text-dark">Recent Appointments</h5>
                </div>
                <Link href="/admin/appointments" className="btn btn-outline-primary btn-sm">
                  View All ({counts.appointments})
                </Link>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 ps-3">Patient</th>
                        <th className="border-0">Service</th>
                        <th className="border-0">Date & Time</th>
                        <th className="border-0">Booking Status</th>
                        <th className="border-0">Payment</th>
                        <th className="border-0 text-end pe-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-5 text-muted">
                            <i className="fas fa-calendar-times fs-1 mb-2 d-block"></i>
                            No appointments found.
                          </td>
                        </tr>
                      ) : (
                        recentAppointments.map((appt) => (
                          <tr key={appt._id}>
                            <td className="ps-3">
                              <div className="fw-bold text-dark">{appt.patientName}</div>
                              <small className="text-muted">{appt.phone} • {appt.email}</small>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">{appt.service}</span>
                            </td>
                            <td>
                              <div className="fw-semibold text-dark">{new Date(appt.date).toLocaleDateString()}</div>
                              <small className="text-muted">{appt.time}</small>
                            </td>
                            <td>
                              <span className={getStatusBadge(appt.status)}>
                                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                {getPaymentBadge(appt.paymentStatus)}
                                {appt.paymentStatus !== "paid" && (
                                  <button
                                    className="btn btn-sm btn-outline-success py-0 px-1 ms-1"
                                    title="Confirm Payment"
                                    onClick={() => handleOpenPaymentConfirm(appt)}
                                  >
                                    <i className="fas fa-dollar-sign"></i> Pay
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="text-end pe-3">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  title="View Details & Confirm"
                                  onClick={() => handleOpenView(appt)}
                                >
                                  <i className="fas fa-eye me-1"></i> View
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  title="Edit Appointment"
                                  onClick={() => handleOpenEdit(appt)}
                                >
                                  <i className="fas fa-edit me-1"></i> Edit
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

            {/* Quick Management Links */}
            <div className="row g-3">
              <div className="col-md-6 col-lg-3">
                <Link href="/admin/appointments" className="card border-0 shadow-sm text-decoration-none h-100 p-2">
                  <div className="card-body text-center p-3">
                    <div className="service-icon-wrapper mx-auto mb-2">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Appointments</h6>
                    <small className="text-muted">Manage sessions & filter status</small>
                  </div>
                </Link>
              </div>

              <div className="col-md-6 col-lg-3">
                <Link href="/admin/patients" className="card border-0 shadow-sm text-decoration-none h-100 p-2">
                  <div className="card-body text-center p-3">
                    <div className="service-icon-wrapper mx-auto mb-2" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                      <i className="fas fa-user-injured"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Patient Directory</h6>
                    <small className="text-muted">Clinical records & histories</small>
                  </div>
                </Link>
              </div>

              <div className="col-md-6 col-lg-3">
                <Link href="/admin/staff" className="card border-0 shadow-sm text-decoration-none h-100 p-2">
                  <div className="card-body text-center p-3">
                    <div className="service-icon-wrapper mx-auto mb-2" style={{ background: "rgba(14, 165, 233, 0.1)", color: "#0ea5e9" }}>
                      <i className="fas fa-user-nurse"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Staff Roster</h6>
                    <small className="text-muted">Physiotherapists & roles</small>
                  </div>
                </Link>
              </div>

              <div className="col-md-6 col-lg-3">
                <Link href="/admin/settings" className="card border-0 shadow-sm text-decoration-none h-100 p-2">
                  <div className="card-body text-center p-3">
                    <div className="service-icon-wrapper mx-auto mb-2" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                      <i className="fas fa-cog"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Clinic Settings</h6>
                    <small className="text-muted">Hours, notifications & info</small>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

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
                  {/* Patient Info */}
                  <div className="col-md-6">
                    <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">Patient Profile</h6>
                    <p className="mb-2"><strong>Name:</strong> {selectedAppointment.patientName}</p>
                    <p className="mb-2"><strong>Email:</strong> <a href={`mailto:${selectedAppointment.email}`}>{selectedAppointment.email}</a></p>
                    <p className="mb-2"><strong>Phone:</strong> <a href={`tel:${selectedAppointment.phone}`}>{selectedAppointment.phone}</a></p>
                    {selectedAppointment.notes && (
                      <div className="bg-light p-3 rounded mt-2 border">
                        <strong className="small text-muted d-block mb-1">Clinical Notes / Reason:</strong>
                        <div className="small">{selectedAppointment.notes}</div>
                      </div>
                    )}
                  </div>

                  {/* Appointment & Payment Info */}
                  <div className="col-md-6">
                    <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">Schedule & Status</h6>
                    <p className="mb-2"><strong>Service:</strong> <span className="badge bg-light text-dark border">{selectedAppointment.service}</span></p>
                    <p className="mb-2"><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                    <p className="mb-2"><strong>Time:</strong> {selectedAppointment.time}</p>
                    <p className="mb-3">
                      <strong>Booking Status:</strong>{" "}
                      <span className={getStatusBadge(selectedAppointment.status)}>
                        {selectedAppointment.status.toUpperCase()}
                      </span>
                    </p>

                    {/* Payment Box */}
                    <div className="card p-3 bg-light border">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong className="text-dark">Payment Status:</strong>
                        {getPaymentBadge(selectedAppointment.paymentStatus)}
                      </div>
                      {selectedAppointment.paymentStatus === "paid" ? (
                        <div className="small text-success">
                          <div><strong>Receipt:</strong> {selectedAppointment.receiptNumber || "Generated"}</div>
                          <div><strong>Amount Paid:</strong> LKR {Number(selectedAppointment.paymentAmount || 0).toLocaleString()} ({selectedAppointment.paymentMethod?.toUpperCase()})</div>
                        </div>
                      ) : (
                        <div>
                          <small className="text-muted d-block mb-2">No payment recorded yet for this session.</small>
                          <button
                            className="btn btn-success btn-sm w-100"
                            onClick={() => {
                              setShowViewModal(false);
                              handleOpenPaymentConfirm(selectedAppointment);
                            }}
                          >
                            <i className="fas fa-check-circle me-1"></i> Confirm Payment Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Status Update Bar */}
                <div className="border-top pt-3 mt-4">
                  <label className="form-label small fw-bold text-muted">Quick Update Booking Status (Sends Email Automatically):</label>
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
                    handleOpenEdit(selectedAppointment);
                  }}
                >
                  <i className="fas fa-edit me-1"></i> Full Edit
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-edit me-2"></i>
                  Edit Appointment
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Patient Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.patientName}
                        onChange={(e) => setEditFormData({ ...editFormData, patientName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Phone *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Service *</label>
                      <select
                        className="form-select"
                        value={editFormData.service}
                        onChange={(e) => setEditFormData({ ...editFormData, service: e.target.value })}
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
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Time (AM / PM) *</label>
                      <select
                        className="form-select"
                        value={editFormData.time}
                        onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
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
                        {editFormData.time && !["08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM"].includes(editFormData.time) && (
                          <option value={editFormData.time}>{editFormData.time}</option>
                        )}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Booking Status *</label>
                      <select
                        className="form-select"
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
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
                        value={editFormData.paymentStatus}
                        onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value as any })}
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
                        value={editFormData.paymentAmount}
                        onChange={(e) => setEditFormData({ ...editFormData, paymentAmount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Payment Method</label>
                      <select
                        className="form-select"
                        value={editFormData.paymentMethod}
                        onChange={(e) => setEditFormData({ ...editFormData, paymentMethod: e.target.value as any })}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card / POS</option>
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
                        value={editFormData.notes}
                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm">
                    {actionLoading ? "Saving..." : "Save Changes"}
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
                    Confirming will mark the appointment as <strong>Paid</strong> and send an official receipt email to <strong>{selectedAppointment.email}</strong>.
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
                    {actionLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Processing Receipt...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-envelope me-1"></i> Confirm & Send Email Receipt
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}