// Employee Types
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joiningDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'on-leave';
  avatar?: string;
  manager?: string;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  code: string;
  manager: string;
  employeeCount: number;
  budget: number;
  description: string;
}

// Position Types
export interface Position {
  id: string;
  title: string;
  department: string;
  level: string;
  salaryRange: { min: number; max: number };
  responsibilities: string[];
  requirements: string[];
  openings: number;
}

// Leave Types
export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'sick' | 'casual' | 'earned' | 'unpaid' | 'maternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  createdAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  earned: number;
  casual: number;
  sick: number;
  unpaid: number;
  maternity: number;
}

// Attendance Types
export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  progress: number;
  createdAt: string;
  tags: string[];
}

// Document Types
export interface Document {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'aadhar' | 'pan' | 'certificate' | 'degree' | 'experience' | 'other';
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedDate?: string;
  fileUrl: string;
}

// Analytics Types
export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  pendingDocuments: number;
  completedTasks: number;
  totalTasks: number;
}

export interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  leave: number;
}

export interface PerformanceData {
  employeeName: string;
  productivity: number;
  attendance: number;
  taskCompletion: number;
  overall: number;
}

export interface LeaveData {
  type: string;
  count: number;
  percentage: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sort?: string;
  filter?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
