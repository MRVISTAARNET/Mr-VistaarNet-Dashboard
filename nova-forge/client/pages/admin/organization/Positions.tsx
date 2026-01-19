import React, { useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Briefcase,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  Badge
} from 'lucide-react';

import { Position } from '@/types';

const Positions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    departmentId: '',
    level: 'Mid',
  });

  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: organizationService.getPositions,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: organizationService.getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: organizationService.createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      handleCloseDialog();
      toast.success('Position created successfully');
    },
    onError: (error) => toast.error(error.message || 'Failed to create position')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, position }: { id: string; position: Partial<Position> }) =>
      organizationService.updatePosition(id, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      handleCloseDialog();
      toast.success('Position updated successfully');
    },
    onError: (error) => toast.error(error.message || 'Failed to update position')
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.deletePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position deleted');
    },
    onError: (error) => toast.error(error.message || 'Failed to delete position')
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.departmentId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingPosition) {
      updateMutation.mutate({
        id: editingPosition.id,
        position: {
          title: formData.title,
          departmentId: formData.departmentId,
          level: formData.level
        }
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ title: '', departmentId: '', level: 'Mid' });
    setEditingPosition(null);
  };

  const handleEdit = (pos: Position) => {
    setEditingPosition(pos);
    setFormData({
      title: pos.title,
      departmentId: pos.departmentId,
      level: pos.level
    });
    setIsDialogOpen(true);
  };

  const getDepartmentName = (id: string) => {
    return departments?.find(d => d.id === id)?.name || 'Unknown';
  };

  const filteredPositions = positions?.filter((pos) =>
    pos.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Positions</h1>
          <p className="text-muted-foreground">Manage job titles and hierarchy levels.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPosition(null);
                setFormData({ title: '', departmentId: '', level: 'Mid' });
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-neon-purple to-neon-magenta hover:shadow-lg hover:shadow-neon-purple/20 transition-all text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingPosition ? 'Edit Position' : 'Add New Position'}</DialogTitle>
              <DialogDescription>
                {editingPosition ? 'Update position details.' : 'Define a new role within a department.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Position Title</Label>
                <Input
                  placeholder="e.g. Senior Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(val) => setFormData({ ...formData, departmentId: val })}
                >
                  <SelectTrigger className="bg-background/50 border-input">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(val) => setFormData({ ...formData, level: val })}
                >
                  <SelectTrigger className="bg-background/50 border-input">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-neon-purple text-white hover:bg-neon-purple/80"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingPosition ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-foreground">All Positions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
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
                  <TableHead className="text-muted-foreground">Title</TableHead>
                  <TableHead className="text-muted-foreground">Department</TableHead>
                  <TableHead className="text-muted-foreground">Level</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions?.map((pos) => (
                  <TableRow key={pos.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-neon-purple/10 text-neon-purple">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        {pos.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground/80">
                      {getDepartmentName(pos.departmentId)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${pos.level === 'Senior' ? 'bg-indigo-500/20 text-indigo-400' :
                          pos.level === 'Manager' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'}`}>
                        {pos.level}
                      </span>
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
                            onClick={() => handleEdit(pos)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-destructive/20 hover:text-destructive cursor-pointer text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              deleteMutation.mutate(pos.id);
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

export default Positions;
