import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employees';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  UserPlus,
  MoreVertical,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal
} from 'lucide-react';

const Directory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: employees, isLoading, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
  });

  const filteredEmployees = employees?.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Employee Directory</h1>
          <p className="text-gray-400">Manage all employee records and access.</p>
        </div>
        <Link to="/admin/employees/add">
          <Button className="bg-gradient-to-r from-neon-lime to-emerald-500 hover:shadow-lg hover:shadow-neon-lime/20 transition-all text-black font-semibold">
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Employee
          </Button>
        </Link>
      </div>

      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="border-white/10 text-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Total Employees: <span className="text-white font-semibold">{filteredEmployees?.length || 0}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-gray-400 whitespace-nowrap">Employee</TableHead>
                      <TableHead className="text-gray-400 whitespace-nowrap">Contact</TableHead>
                      <TableHead className="text-gray-400 whitespace-nowrap">Role & Dept</TableHead>
                      <TableHead className="text-gray-400 whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right text-gray-400 whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees?.map((emp) => (
                      <TableRow key={emp.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`}
                              alt={emp.name}
                              className="w-10 h-10 rounded-full border border-white/10"
                            />
                            <div>
                              <p className="font-medium text-white">{emp.name}</p>
                              <p className="text-xs text-gray-500">ID: #{emp.id.substring(0, 6)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Mail className="w-3 h-3 text-gray-500" />
                              {emp.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Phone className="w-3 h-3 text-gray-500" />
                              {emp.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            <p className="text-white font-medium">{emp.position}</p>
                            <p className="text-sm text-gray-400">{emp.department}</p>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap
                                ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              emp.status === 'leave' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${emp.status === 'active' ? 'bg-emerald-400' :
                              emp.status === 'leave' ? 'bg-amber-400' :
                                'bg-gray-400'
                              }`} />
                            {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-gray-300">
                              <DropdownMenuItem
                                className="hover:bg-white/10 hover:text-white cursor-pointer"
                                onClick={() => navigate(`/admin/employees/edit/${emp.id}`)}
                              >
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-white/10 hover:text-white cursor-pointer"
                                onClick={() => navigate(`/admin/employees/edit/${emp.id}`)}
                              >
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="hover:bg-red-500/20 hover:text-red-400 cursor-pointer text-red-400"
                                onSelect={async (e) => {
                                  e.preventDefault(); // Prevent menu from closing immediately if needed, or just standard handling
                                  if (confirm('Are you sure you want to deactivate this employee?')) {
                                    try {
                                      toast.info('Deactivating...');
                                      await employeeService.deactivate(emp.id);
                                      toast.success('Employee deactivated');
                                      refetch();
                                    } catch (error: any) {
                                      console.error(error);
                                      toast.error(`Failed to deactivate: ${error.message || 'Unknown error'}`);
                                    }
                                  }
                                }}
                              >
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Directory;
