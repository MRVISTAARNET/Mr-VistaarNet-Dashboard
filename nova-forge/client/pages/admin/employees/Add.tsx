import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '@/services/employees';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '@/services/organization';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, User, Mail, Phone, Calendar, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const AddEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'employee',
    joiningDate: ''
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: organizationService.getDepartments,
  });

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: organizationService.getPositions,
  });

  const filteredPositions = positions?.filter(pos =>
    !formData.department || pos.departmentId === formData.department
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      await employeeService.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as 'employee' | 'admin',
        status: 'active',
        departmentId: formData.department,
        positionId: formData.position,
        joinDate: formData.joiningDate,
      });

      toast.success('Employee created successfully');
      navigate('/admin/employees/directory');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Add New Employee</h1>
          <p className="text-gray-400">Create a new employee profile and assign credentials.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-neon-cyan" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@techcorp.com"
                  className="pl-9 bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="pl-9 bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-neon-purple" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select onValueChange={(val) => handleSelectChange('department', val)} value={formData.department}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  {departments?.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                onValueChange={(val) => handleSelectChange('position', val)}
                value={formData.position}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select Position" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  {filteredPositions?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                defaultValue="employee"
                onValueChange={(val) => handleSelectChange('role', val)}
                value={formData.role}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select System Role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="pl-9 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-neon-lime to-emerald-500 text-black font-semibold hover:shadow-lg hover:shadow-neon-lime/20 min-w-[150px]">
            {isLoading ? 'Creating...' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
