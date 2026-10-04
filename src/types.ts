export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export type RequestStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ServiceRequest {
  id: string | number;
  requestId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceAddress: string;
  deviceType: string;
  brandModel: string;
  problemDescription: string;
  priority: RequestPriority;
  status: RequestStatus;
  technicianId?: string | number | null;
  technicianName?: string | null;
  estimatedCost: number;
  actualCost?: number | null;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
}

export interface Technician {
  id: string | number;
  name: string;
  phone: string;
  specialty: string;
  status: 'AVAILABLE' | 'ON_JOB' | 'OFFLINE';
  hourlyRate: number;
}

export interface SystemStats {
  totalRequests: number;
  pendingRequests: number;
  assignedRequests: number;
  inProgressRequests: number;
  completedRequests: number;
}
