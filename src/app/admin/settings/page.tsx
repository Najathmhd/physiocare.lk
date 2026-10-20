"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface Settings {
  _id: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicWebsite: string;
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  appointmentSettings: {
    slotDuration: number;
    maxAppointmentsPerDay: number;
    advanceBookingDays: number;
    cancellationHours: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    reminderHours: number;
  };
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    clinicName: "",
    clinicAddress: "",
    clinicPhone: "",
    clinicEmail: "",
    clinicWebsite: "",
    businessHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "15:00", closed: false },
      sunday: { open: "09:00", close: "15:00", closed: true }
    },
    appointmentSettings: {
      slotDuration: 30,
      maxAppointmentsPerDay: 20,
      advanceBookingDays: 30,
      cancellationHours: 24
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: true,
      reminderHours: 24
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setSettings(data);
      if (data) {
        setFormData({
          clinicName: data.clinicName || "",
          clinicAddress: data.clinicAddress || "",
          clinicPhone: data.clinicPhone || "",
          clinicEmail: data.clinicEmail || "",
          clinicWebsite: data.clinicWebsite || "",
          businessHours: data.businessHours || formData.businessHours,
          appointmentSettings: data.appointmentSettings || formData.appointmentSettings,
          notificationSettings: data.notificationSettings || formData.notificationSettings
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save settings");
      
      await fetchSettings();
      setSuccess("Settings saved successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBusinessHourChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value
        }
      }
    }));
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: formData.clinicEmail }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSuccess('Test email sent successfully! Check your inbox.');
      } else {
        setError(`Failed to send test email: ${result.error}`);
      }
    } catch (err: any) {
      setError(`Error sending test email: ${err.message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <AdminLayout>
      <div className="settings-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">
            <i className="fas fa-cog me-2 text-primary"></i>
            Settings
          </h1>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Clinic Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-hospital me-2 text-primary"></i>
                  Clinic Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Clinic Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.clinicName}
                      onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Clinic Phone *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.clinicPhone}
                      onChange={(e) => setFormData({...formData, clinicPhone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Clinic Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.clinicEmail}
                      onChange={(e) => setFormData({...formData, clinicEmail: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.clinicWebsite}
                      onChange={(e) => setFormData({...formData, clinicWebsite: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Clinic Address *</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.clinicAddress}
                      onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-clock me-2 text-primary"></i>
                  Business Hours
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {daysOfWeek.map(day => (
                    <div key={day.key} className="col-md-6 col-lg-4">
                      <div className="card border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">{day.label}</h6>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={!formData.businessHours[day.key as keyof typeof formData.businessHours].closed}
                                onChange={(e) => handleBusinessHourChange(day.key, 'closed', !e.target.checked)}
                              />
                            </div>
                          </div>
                          {!formData.businessHours[day.key as keyof typeof formData.businessHours].closed && (
                            <div className="row g-2">
                              <div className="col-6">
                                <label className="form-label small">Open</label>
                                <input
                                  type="time"
                                  className="form-control form-control-sm"
                                  value={formData.businessHours[day.key as keyof typeof formData.businessHours].open}
                                  onChange={(e) => handleBusinessHourChange(day.key, 'open', e.target.value)}
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label small">Close</label>
                                <input
                                  type="time"
                                  className="form-control form-control-sm"
                                  value={formData.businessHours[day.key as keyof typeof formData.businessHours].close}
                                  onChange={(e) => handleBusinessHourChange(day.key, 'close', e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointment Settings */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-calendar-check me-2 text-primary"></i>
                  Appointment Settings
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Appointment Slot Duration (minutes)</label>
                    <select
                      className="form-select"
                      value={formData.appointmentSettings.slotDuration}
                      onChange={(e) => setFormData({
                        ...formData,
                        appointmentSettings: {
                          ...formData.appointmentSettings,
                          slotDuration: parseInt(e.target.value)
                        }
                      })}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Maximum Appointments Per Day</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.appointmentSettings.maxAppointmentsPerDay}
                      onChange={(e) => setFormData({
                        ...formData,
                        appointmentSettings: {
                          ...formData.appointmentSettings,
                          maxAppointmentsPerDay: parseInt(e.target.value)
                        }
                      })}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Advance Booking Days</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.appointmentSettings.advanceBookingDays}
                      onChange={(e) => setFormData({
                        ...formData,
                        appointmentSettings: {
                          ...formData.appointmentSettings,
                          advanceBookingDays: parseInt(e.target.value)
                        }
                      })}
                      min="1"
                      max="365"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Cancellation Notice (hours)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.appointmentSettings.cancellationHours}
                      onChange={(e) => setFormData({
                        ...formData,
                        appointmentSettings: {
                          ...formData.appointmentSettings,
                          cancellationHours: parseInt(e.target.value)
                        }
                      })}
                      min="1"
                      max="72"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-bell me-2 text-primary"></i>
                  Notification Settings
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.notificationSettings.emailNotifications}
                        onChange={(e) => setFormData({
                          ...formData,
                          notificationSettings: {
                            ...formData.notificationSettings,
                            emailNotifications: e.target.checked
                          }
                        })}
                      />
                      <label className="form-check-label">
                        Enable Email Notifications
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.notificationSettings.smsNotifications}
                        onChange={(e) => setFormData({
                          ...formData,
                          notificationSettings: {
                            ...formData.notificationSettings,
                            smsNotifications: e.target.checked
                          }
                        })}
                      />
                      <label className="form-check-label">
                        Enable SMS Notifications
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Appointment Reminder (hours before)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.notificationSettings.reminderHours}
                      onChange={(e) => setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings,
                          reminderHours: parseInt(e.target.value)
                        }
                      })}
                      min="1"
                      max="72"
                    />
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Email Notifications</h6>
                        <p className="text-muted mb-0 small">
                          Test the email notification system to ensure it's working properly.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleTestEmail}
                        disabled={testingEmail || !formData.notificationSettings.emailNotifications}
                      >
                        {testingEmail ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-envelope me-2"></i>
                            Test Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="text-end">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg px-5"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
} 