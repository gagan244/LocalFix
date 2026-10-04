import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_REQUESTS, INITIAL_TECHNICIANS } from './src/mockData.ts';
import { ServiceRequest, Technician, SystemStats } from './src/types.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// In-Memory Database Store (Simulating Spring Data JPA & MySQL)
let requests: ServiceRequest[] = [...INITIAL_REQUESTS];
let technicians: Technician[] = [...INITIAL_TECHNICIANS];

function getSystemStats(): SystemStats {
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
  const assignedRequests = requests.filter(r => r.status === 'ASSIGNED').length;
  const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS').length;
  const completedRequests = requests.filter(r => r.status === 'COMPLETED').length;

  return {
    totalRequests: requests.length,
    pendingRequests,
    assignedRequests,
    inProgressRequests,
    completedRequests,
  };
}

// ---------------- REST API ROUTES ----------------

// GET /api/stats
app.get('/api/stats', (_req, res) => {
  res.json(getSystemStats());
});

// GET /api/requests
app.get('/api/requests', (req, res) => {
  const { status, deviceType, search } = req.query;
  let filtered = [...requests];

  if (status && status !== 'ALL') {
    filtered = filtered.filter(r => r.status === status);
  }
  if (deviceType && deviceType !== 'ALL') {
    filtered = filtered.filter(r => r.deviceType === deviceType);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.requestId.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.brandModel.toLowerCase().includes(q) ||
      r.deviceType.toLowerCase().includes(q) ||
      r.problemDescription.toLowerCase().includes(q)
    );
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(filtered);
});

// GET /api/requests/track/:trackingId - Customer Tracking
app.get('/api/requests/track/:trackingId', (req, res) => {
  const id = req.params.trackingId.trim().toUpperCase();
  const request = requests.find(r => r.requestId.toUpperCase() === id);
  if (!request) {
    return res.status(404).json({ error: `No service request found for ID: ${id}` });
  }
  res.json(request);
});

// GET /api/requests/:id
app.get('/api/requests/:id', (req, res) => {
  const request = requests.find(r => String(r.id) === String(req.params.id) || r.requestId === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Service request not found' });
  }
  res.json(request);
});

// POST /api/requests - Customer creates request
app.post('/api/requests', (req, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    serviceAddress,
    deviceType,
    brandModel,
    problemDescription,
    priority = 'MEDIUM',
    estimatedCost,
  } = req.body;

  if (!customerName || !customerPhone || !serviceAddress || !deviceType || !problemDescription) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const nextNum = 1001 + requests.length;
  const requestId = `REQ-${nextNum}`;

  // Default initial estimate if not passed
  let initialEstimate = Number(estimatedCost);
  if (isNaN(initialEstimate) || initialEstimate <= 0) {
    switch (deviceType.toLowerCase()) {
      case 'laptop': initialEstimate = 65.0; break;
      case 'smartphone': initialEstimate = 35.0; break;
      case 'ac': initialEstimate = 80.0; break;
      case 'refrigerator': initialEstimate = 70.0; break;
      case 'washing machine': initialEstimate = 55.0; break;
      case 'television': initialEstimate = 50.0; break;
      default: initialEstimate = 45.0; break;
    }
  }

  const newRequest: ServiceRequest = {
    id: Date.now(),
    requestId,
    customerName,
    customerPhone,
    customerEmail: customerEmail || '',
    serviceAddress,
    deviceType,
    brandModel: brandModel || deviceType,
    problemDescription,
    priority,
    status: 'PENDING',
    technicianId: null,
    technicianName: null,
    estimatedCost: initialEstimate,
    actualCost: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  requests.unshift(newRequest);
  res.status(201).json(newRequest);
});

// POST /api/requests/:id/assign - Owner assigns technician
app.post('/api/requests/:id/assign', (req, res) => {
  const { technicianId } = req.body;
  const reqIndex = requests.findIndex(r => String(r.id) === String(req.params.id) || r.requestId === req.params.id);

  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (!technicianId) {
    requests[reqIndex] = {
      ...requests[reqIndex],
      technicianId: null,
      technicianName: null,
      status: 'PENDING',
      updatedAt: new Date().toISOString(),
    };
    return res.json(requests[reqIndex]);
  }

  const tech = technicians.find(t => String(t.id) === String(technicianId));
  if (!tech) {
    return res.status(404).json({ error: 'Technician not found' });
  }

  requests[reqIndex] = {
    ...requests[reqIndex],
    technicianId: tech.id,
    technicianName: tech.name,
    status: 'ASSIGNED',
    updatedAt: new Date().toISOString(),
  };

  res.json(requests[reqIndex]);
});

// POST /api/requests/:id/status - Owner updates status, cost, remarks
app.post('/api/requests/:id/status', (req, res) => {
  const { status, estimatedCost, actualCost, notes } = req.body;
  const reqIndex = requests.findIndex(r => String(r.id) === String(req.params.id) || r.requestId === req.params.id);

  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const prev = requests[reqIndex];
  requests[reqIndex] = {
    ...prev,
    status: status || prev.status,
    estimatedCost: estimatedCost !== undefined && estimatedCost !== null ? Number(estimatedCost) : prev.estimatedCost,
    actualCost: actualCost !== undefined && actualCost !== null ? Number(actualCost) : prev.actualCost,
    resolutionNotes: notes !== undefined ? notes : prev.resolutionNotes,
    updatedAt: new Date().toISOString(),
  };

  res.json(requests[reqIndex]);
});

// GET /api/technicians
app.get('/api/technicians', (_req, res) => {
  res.json(technicians);
});

// POST /api/technicians
app.post('/api/technicians', (req, res) => {
  const { name, phone, specialty, hourlyRate = 50.0 } = req.body;
  if (!name || !phone || !specialty) {
    return res.status(400).json({ error: 'Name, phone, and specialty required' });
  }

  const newTech: Technician = {
    id: Date.now(),
    name,
    phone,
    specialty,
    status: 'AVAILABLE',
    hourlyRate: Number(hourlyRate),
  };

  technicians.push(newTech);
  res.status(201).json(newTech);
});

// PUT /api/technicians/:id/status
app.put('/api/technicians/:id/status', (req, res) => {
  const { status } = req.body;
  const idx = technicians.findIndex(t => String(t.id) === String(req.params.id));
  if (idx === -1) {
    return res.status(404).json({ error: 'Technician not found' });
  }

  technicians[idx] = {
    ...technicians[idx],
    status: status || (technicians[idx].status === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE'),
  };
  res.json(technicians[idx]);
});

// Simple Login Check
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'owner' && (password === 'password123' || password === 'admin123')) {
    return res.json({ success: true, user: { username: 'owner', role: 'OWNER', fullName: 'Shop Manager' } });
  }
  return res.status(401).json({ success: false, error: 'Invalid username or password' });
});

// Mount Static Production files or fallback to Vite Dev Server
async function startServer() {
  const distPath = path.resolve('dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

  if (hasDist) {
    // Serve clean compiled production bundle: 0 WebSocket connections, 0 HMR errors!
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`[LocalFix] Serving production build from ${distPath}`);
  } else {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LocalFix] Full-stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
