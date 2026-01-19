import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/services/organization';
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  Users
} from 'lucide-react';
import { Department } from '@/types';
import { toast } from 'sonner';

const Departments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const queryClient = useQueryClient();

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: organizationService.getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: organizationService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      handleCloseDialog();
      toast.success('Department created successfully');
    },
    onError: (error) => toast.error(error.message || 'Failed to create department')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => organizationService.updateDepartment(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      handleCloseDialog();
      toast.success('Department updated successfully');
    },
    onError: (error) => toast.error(error.message || 'Failed to update department')
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted');
    },
    onError: (error) => toast.error(error.message || 'Failed to delete department')
  });

  const handleSubmit = () => {
    if (!newDepartmentName.trim()) return;

    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, name: newDepartmentName });
    } else {
      createMutation.mutate(newDepartmentName);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewDepartmentName('');
    setEditingDepartment(null);
  };

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setNewDepartmentName(dept.name);
    setIsDialogOpen(true);
  };

  const filteredDepartments = departments?.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Departments</h1>
          <p className="text-muted-foreground">Manage company departments and their heads.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingDepartment(null);
                setNewDepartmentName('');
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-neon-cyan to-primary hover:shadow-lg hover:shadow-neon-cyan/20 transition-all font-semibold text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add New Department'}</DialogTitle>
              <DialogDescription>
                {editingDepartment ? 'Update department details.' : 'Create a new department for the organization.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Department Name</Label>
                <Input
                  placeholder="e.g. Engineering"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-neon-cyan text-black hover:bg-neon-cyan/80"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-foreground">All Departments</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-background/50 border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Head of Department</TableHead>
                  <TableHead className="text-muted-foreground">Employees</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments?.map((dept) => (
                  <TableRow key={dept.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan">
                          <Building2 className="w-4 h-4" />
                        </div>
                        {dept.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground/80">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                          {dept.head.charAt(0)}
                        </div>
                        {dept.head}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground/80">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {dept.employeeCount} Members
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                          <DropdownMenuItem
                            className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            onClick={() => handleEdit(dept)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-destructive/20 hover:text-destructive cursor-pointer text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              deleteMutation.mutate(dept.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Departments;
