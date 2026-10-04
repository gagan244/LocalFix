import React, { useState, useEffect } from 'react';
import { ServiceRequest, Technician, RequestStatus, RequestPriority } from './types';
import { INITIAL_REQUESTS, INITIAL_TECHNICIANS } from './mockData';
import { 
  Wrench, 
  Search, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  User, 
  ShieldCheck, 
  LogOut,
  Smartphone,
  Laptop,
  Tv,
  Wind,
  AlertCircle
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'track' | 'owner'>('create');
  
  // Data state
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  
  // Customer New Request Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [deviceType, setDeviceType] = useState('Laptop');
  const [brandModel, setBrandModel] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('MEDIUM');
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  // Customer Tracking State
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<ServiceRequest | null>(INITIAL_REQUESTS[0]);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Owner Auth State
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const [ownerUsername, setOwnerUsername] = useState('owner');
  const [ownerPassword, setOwnerPassword] = useState('password123');
  const [ownerLoginError, setOwnerLoginError] = useState('');

  // Owner Dashboard Filter & Modals
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerStatusFilter, setOwnerStatusFilter] = useState('ALL');
  const [selectedReqForAssign, setSelectedReqForAssign] = useState<ServiceRequest | null>(null);
  const [selectedReqForUpdate, setSelectedReqForUpdate] = useState<ServiceRequest | null>(null);
  
  // Modal Update Form state
  const [modalStatus, setModalStatus] = useState<RequestStatus>('PENDING');
  const [modalEstCost, setModalEstCost] = useState<number>(0);
  const [modalActualCost, setModalActualCost] = useState<number | string>('');
  const [modalNotes, setModalNotes] = useState('');

  // Load from API on mount
  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setRequests(data);
      })
      .catch(() => {});

    fetch('/api/technicians')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTechnicians(data);
      })
      .catch(() => {});
  }, []);

  // Handle Customer Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !serviceAddress || !problemDescription) return;

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          serviceAddress,
          deviceType,
          brandModel: brandModel || deviceType,
          problemDescription,
          priority,
        }),
      });

      if (res.ok) {
        const created: ServiceRequest = await res.json();
        setRequests(prev => [created, ...prev]);
        setLastCreatedId(created.requestId);
        setTrackedRequest(created);
        setTrackingInput(created.requestId);

        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setServiceAddress('');
        setBrandModel('');
        setProblemDescription('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Customer Tracking Search
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;

    const query = trackingInput.trim().toUpperCase();
    const found = requests.find(r => r.requestId.toUpperCase() === query);
    if (found) {
      setTrackedRequest(found);
      setTrackingError(null);
    } else {
      setTrackedRequest(null);
      setTrackingError(`No service request found for ID: ${query}`);
    }
  };

  // Handle Owner Login
  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (ownerUsername === 'owner' && (ownerPassword === 'password123' || ownerPassword === 'admin123')) {
      setIsOwnerLoggedIn(true);
      setOwnerLoginError('');
    } else {
      setOwnerLoginError('Invalid username or password. Use owner / password123');
    }
  };

  // Handle Assign Technician
  const handleAssignSubmit = async (requestId: string | number, technicianId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
        setSelectedReqForAssign(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Update Modal
  const openUpdateModal = (req: ServiceRequest) => {
    setSelectedReqForUpdate(req);
    setModalStatus(req.status);
    setModalEstCost(req.estimatedCost || 0);
    setModalActualCost(req.actualCost !== null && req.actualCost !== undefined ? req.actualCost : '');
    setModalNotes(req.resolutionNotes || '');
  };

  // Handle Update Status & Cost
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForUpdate) return;

    try {
      const res = await fetch(`/api/requests/${selectedReqForUpdate.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: modalStatus,
          estimatedCost: modalEstCost,
          actualCost: modalActualCost !== '' ? Number(modalActualCost) : null,
          notes: modalNotes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
        setSelectedReqForUpdate(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter requests for owner
  const filteredOwnerRequests = requests.filter(r => {
    if (ownerStatusFilter !== 'ALL' && r.status !== ownerStatusFilter) return false;
    if (ownerSearch.trim()) {
      const q = ownerSearch.toLowerCase();
      return (
        r.requestId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.deviceType.toLowerCase().includes(q) ||
        r.brandModel.toLowerCase().includes(q) ||
        r.problemDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Bootstrap Style Navbar */}
      <nav className="bg-slate-900 text-white shadow-sm border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              LF
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">LocalFix Tracker</span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Java Spring Boot + MySQL
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'create' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              + New Request
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'track' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Track Status
            </button>

            <button
              onClick={() => setActiveTab('owner')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'owner' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Owner Portal {isOwnerLoggedIn && '✓'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">

        {/* ---------------- 1. CUSTOMER: CREATE SERVICE REQUEST ---------------- */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            {/* Success Notification after submission */}
            {lastCreatedId && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg p-4 mb-5 shadow-xs flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Service Request Logged Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your unique Tracking ID is: <strong className="font-mono text-sm underline">{lastCreatedId}</strong>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('track');
                    setTrackingInput(lastCreatedId);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Track Status &rarr;
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h2 className="text-base font-bold text-slate-900">Customer Service Request Form</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your device and issue details to get a service request ID and track repair status.
                </p>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">1. Contact & Location</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patel"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="customer@email.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Service Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="Flat / House No, Street, Landmark"
                        value={serviceAddress}
                        onChange={(e) => setServiceAddress(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">2. Device & Problem Specification</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Device Type *</label>
                      <select
                        value={deviceType}
                        onChange={(e) => setDeviceType(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="Laptop">Laptop / PC</option>
                        <option value="Smartphone">Smartphone / Tablet</option>
                        <option value="AC">AC / Air Conditioner</option>
                        <option value="Refrigerator">Refrigerator</option>
                        <option value="Washing Machine">Washing Machine</option>
                        <option value="Television">Television / Smart TV</option>
                        <option value="Other Appliance">Other Home Appliance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Brand & Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Dell Inspiron 15"
                        value={brandModel}
                        onChange={(e) => setBrandModel(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency / Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as RequestPriority)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="LOW">Low (Flexible)</option>
                        <option value="MEDIUM">Medium (Standard)</option>
                        <option value="HIGH">High (Urgent)</option>
                        <option value="EMERGENCY">Emergency (Immediate)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Description & Fault *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe the exact issue, error signs, or symptoms (e.g. Device not powering on, water leakage, strange rattling noise...)"
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">An automatic Request ID will be generated upon saving.</span>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    Submit Service Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- 2. CUSTOMER: TRACK REQUEST STATUS ---------------- */}
        {activeTab === 'track' && (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Search Box */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-1">Track Service Request Status</h2>
              <p className="text-xs text-slate-500 mb-3">
                Enter your Request ID (e.g. <code>REQ-1001</code>) to check the live assignment status, technician details, and repair estimates.
              </p>
              <form onSubmit={handleTrackSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Request ID (e.g. REQ-1001)"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 text-sm font-mono px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded transition-colors cursor-pointer"
                >
                  Track
                </button>
              </form>

              {trackingError && (
                <div className="mt-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded">
                  {trackingError}
                </div>
              )}
            </div>

            {/* Found Request Card */}
            {trackedRequest && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">Tracking Request</span>
                    <span className="font-mono text-base font-bold text-blue-700">{trackedRequest.requestId}</span>
                  </div>
                  <div>
                    {trackedRequest.status === 'COMPLETED' ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full border border-emerald-300">
                        ✓ COMPLETED
                      </span>
                    ) : trackedRequest.status === 'IN_PROGRESS' ? (
                      <span className="bg-blue-100 text-blue-800 font-bold text-xs px-3 py-1 rounded-full border border-blue-300">
                        ⚙ IN PROGRESS
                      </span>
                    ) : trackedRequest.status === 'ASSIGNED' ? (
                      <span className="bg-indigo-100 text-indigo-800 font-bold text-xs px-3 py-1 rounded-full border border-indigo-300">
                        👤 TECHNICIAN ASSIGNED
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full border border-amber-300">
                        ⏳ PENDING ASSIGNMENT
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4 text-xs text-slate-700">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-3 rounded border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Device & Brand</span>
                      <strong className="text-slate-900 text-sm">{trackedRequest.deviceType}</strong>
                      <span className="text-slate-500 block">({trackedRequest.brandModel})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Customer Name</span>
                      <strong className="text-slate-900 text-sm">{trackedRequest.customerName}</strong>
                      <span className="text-slate-500 block">{trackedRequest.customerPhone}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Reported Problem:</span>
                    <p className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-800">
                      {trackedRequest.problemDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Assigned Technician:</span>
                      {trackedRequest.technicianName ? (
                        <span className="font-semibold text-slate-900 text-sm">
                          {trackedRequest.technicianName}
                        </span>
                      ) : (
                        <span className="text-amber-700 italic">Not assigned yet</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Estimated Cost:</span>
                      <span className="font-mono text-base font-bold text-slate-900">
                        ${trackedRequest.estimatedCost?.toFixed(2) || '0.00'}
                      </span>
                      {trackedRequest.actualCost !== null && trackedRequest.actualCost !== undefined && (
                        <span className="ml-2 font-mono text-emerald-700 font-bold">
                          (Actual: ${trackedRequest.actualCost.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  {trackedRequest.resolutionNotes && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                      <strong className="block mb-0.5 text-xs">Technician Remarks / Work Done:</strong>
                      <span>{trackedRequest.resolutionNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- 3. OWNER / STAFF DASHBOARD ---------------- */}
        {activeTab === 'owner' && (
          <div>
            {!isOwnerLoggedIn ? (
              /* Simple Owner Login */
              <div className="max-w-sm mx-auto bg-white rounded-lg border border-slate-200 p-6 shadow-xs mt-6">
                <div className="text-center mb-4">
                  <h2 className="text-base font-bold text-slate-900">Shop Owner Login</h2>
                  <p className="text-xs text-slate-500">Sign in to manage requests and technicians</p>
                </div>

                {ownerLoginError && (
                  <div className="mb-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded text-center">
                    {ownerLoginError}
                  </div>
                )}

                <form onSubmit={handleOwnerLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={ownerUsername}
                      onChange={(e) => setOwnerUsername(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                    />
                    <small className="text-[11px] text-slate-400">Default demo: <code>owner / password123</code></small>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded transition-colors cursor-pointer mt-2"
                  >
                    Log In
                  </button>
                </form>
              </div>
            ) : (
              /* Owner Dashboard Content */
              <div className="space-y-5">
                {/* Header & Quick stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Service Requests Management</h2>
                    <p className="text-xs text-slate-500">Logged in as Shop Manager (Role: OWNER)</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">Total: {requests.length}</span>
                      <span className="bg-amber-100 px-2 py-1 rounded text-amber-800">
                        Pending: {requests.filter(r => r.status === 'PENDING').length}
                      </span>
                      <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                        In Progress: {requests.filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length}
                      </span>
                    </div>

                    <button
                      onClick={() => setIsOwnerLoggedIn(false)}
                      className="text-xs text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="relative flex-1 w-full">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search requests by ID, customer name, device..."
                      value={ownerSearch}
                      onChange={(e) => setOwnerSearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    <select
                      value={ownerStatusFilter}
                      onChange={(e) => setOwnerStatusFilter(e.target.value)}
                      className="text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-white font-medium"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Requests Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase">
                        <tr>
                          <th className="px-4 py-3">Request ID</th>
                          <th className="px-4 py-3">Customer & Device</th>
                          <th className="px-4 py-3">Problem Description</th>
                          <th className="px-4 py-3">Priority</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Assigned Tech</th>
                          <th className="px-4 py-3">Est. Cost</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOwnerRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-blue-700">
                              {req.requestId}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-semibold text-slate-900">{req.customerName}</div>
                              <div className="text-[11px] text-slate-400">{req.deviceType} ({req.brandModel})</div>
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              <p className="line-clamp-2 text-slate-600">{req.problemDescription}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' :
                                req.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                req.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {req.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                req.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                req.status === 'ASSIGNED' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                                'bg-amber-50 text-amber-800 border-amber-300'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {req.technicianName ? (
                                <span className="font-semibold text-slate-800">{req.technicianName}</span>
                              ) : (
                                <span className="text-slate-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-900">
                              ${req.estimatedCost?.toFixed(2) || '0.00'}
                              {req.actualCost !== null && req.actualCost !== undefined && (
                                <div className="text-[10px] text-emerald-600 font-bold">Act: ${req.actualCost.toFixed(2)}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedReqForAssign(req)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
                                >
                                  Assign Tech
                                </button>
                                <button
                                  onClick={() => openUpdateModal(req)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
                                >
                                  Update / Cost
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredOwnerRequests.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400">
                              No matching service requests found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Technicians List Section */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">Field Technicians</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {technicians.map((t) => (
                      <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-slate-500 mt-0.5">{t.specialty}</div>
                        <div className="text-slate-400 mt-0.5">{t.phone}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            t.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.status}
                          </span>
                          <span className="font-mono font-semibold">${t.hourlyRate}/hr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ---------------- OWNER ASSIGN MODAL ---------------- */}
      {selectedReqForAssign && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800">
                Assign Technician - <span className="font-mono text-blue-600">{selectedReqForAssign.requestId}</span>
              </h3>
              <button onClick={() => setSelectedReqForAssign(null)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600">
                <strong>Device:</strong> {selectedReqForAssign.deviceType} ({selectedReqForAssign.brandModel})
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Technician</label>
                <select
                  id="techAssignSelect"
                  defaultValue={selectedReqForAssign.technicianId || ''}
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="">-- None (Unassigned) --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty} - {t.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReqForAssign(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const select = document.getElementById('techAssignSelect') as HTMLSelectElement;
                  handleAssignSubmit(selectedReqForAssign.id, select.value);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- OWNER UPDATE STATUS & COST MODAL ---------------- */}
      {selectedReqForUpdate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800">
                Update Status & Cost - <span className="font-mono text-blue-600">{selectedReqForUpdate.requestId}</span>
              </h3>
              <button onClick={() => setSelectedReqForUpdate(null)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as RequestStatus)}
                  className="w-full text-xs p-2 border border-slate-300 rounded bg-white font-semibold"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={modalEstCost}
                    onChange={(e) => setModalEstCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Final Actual Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 48.00"
                    value={modalActualCost}
                    onChange={(e) => setModalActualCost(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution Remarks / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Replaced display connector and battery. Tested OK."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="bg-slate-50 -mx-4 -mb-4 mt-4 px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReqForUpdate(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-medium">
        &copy; 2026 LocalFix by Gagan
      </footer>
    </div>
  );
}

export default App;
