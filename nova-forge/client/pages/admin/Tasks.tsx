import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, Task } from '@/services/tasks';
import { employeeService } from '@/services/employees';
import { useAuth } from '@/hooks/useAuth';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Calendar, User, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminTasks: React.FC = () => {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth(); // In real app, use this to get current user info if needed

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigneeName: '', // Simplified for mock: manually type name
        assigneeId: '', // Default to empty
        dueDate: '',
        priority: 'Medium' as Task['priority'],
        status: 'Todo' as Task['status']
    });

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['allTasks'],
        queryFn: taskService.getAllTasks,
    });

    const { data: employees } = useQuery({
        queryKey: ['allEmployees'],
        queryFn: employeeService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: taskService.createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allTasks'] });
            setIsDialogOpen(false);
            toast.success('Task assigned successfully');
            setFormData({
                title: '',
                description: '',
                assigneeName: '',
                assigneeId: '2',
                dueDate: '',
                priority: 'Medium',
                status: 'Todo'
            });
        },
        onError: () => {
            toast.error('Failed to assign task');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="w-4 h-4 text-neon-cyan" />;
            case 'In Progress': return <Clock className="w-4 h-4 text-neon-magenta" />;
            case 'Review': return <AlertCircle className="w-4 h-4 text-neon-purple" />;
            default: return <Circle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        }
    };

    const filteredTasks = tasks?.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.assigneeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Task Management</h1>
                    <p className="text-muted-foreground">Assign, track, and manage employee tasks.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold shadow-lg shadow-neon-cyan/20">
                            <Plus className="w-4 h-4 mr-2" />
                            Assign New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Assign New Task</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Create a task and assign it to an employee.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Task Title</Label>
                                <Input
                                    placeholder="Enter task title"
                                    className="bg-accent/5 border-border"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="Task details..."
                                    className="bg-accent/5 border-border"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Assignee</Label>
                                    <Select
                                        value={formData.assigneeId}
                                        onValueChange={(val) => {
                                            const emp = employees?.find(e => e.id === val);
                                            setFormData({
                                                ...formData,
                                                assigneeId: val,
                                                assigneeName: emp?.name || 'Unknown'
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="bg-accent/5 border-border">
                                            <SelectValue placeholder="Select employee" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border text-foreground">
                                            {employees?.map((emp) => (
                                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input
                                        type="date"
                                        className="bg-accent/5 border-border"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(val: any) => setFormData({ ...formData, priority: val })}
                                >
                                    <SelectTrigger className="bg-accent/5 border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground">
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="submit" disabled={createMutation.isPending} className="bg-neon-cyan hover:bg-neon-cyan/90 text-black w-full">
                                    {createMutation.isPending ? 'Assigning...' : 'Assign Task'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Task Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-border bg-card/50 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="text-muted-foreground text-sm mb-1">Total Tasks</div>
                        <div className="text-3xl font-bold text-foreground">{tasks?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/50 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="text-muted-foreground text-sm mb-1">In Progress</div>
                        <div className="text-3xl font-bold text-neon-magenta">
                            {tasks?.filter(t => t.status === 'In Progress').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/50 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="text-muted-foreground text-sm mb-1">To Do</div>
                        <div className="text-3xl font-bold text-amber-400">
                            {tasks?.filter(t => t.status === 'Todo').length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/50 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="text-muted-foreground text-sm mb-1">Completed</div>
                        <div className="text-3xl font-bold text-neon-cyan">
                            {tasks?.filter(t => t.status === 'Completed').length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <CardTitle className="text-foreground">All Active Tasks</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks or employees..."
                                className="pl-8 bg-accent/5 border-border text-foreground placeholder:text-muted-foreground"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                    <TableHead className="text-muted-foreground">Task Title</TableHead>
                                    <TableHead className="text-muted-foreground">Assignee</TableHead>
                                    <TableHead className="text-muted-foreground">Priority</TableHead>
                                    <TableHead className="text-muted-foreground">Due Date</TableHead>
                                    <TableHead className="text-muted-foreground">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTasks?.map((task) => (
                                    <TableRow key={task.id} className="border-border hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium text-foreground">
                                            {task.title}
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{task.description}</p>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px]">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                {task.assigneeName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {task.dueDate}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm">
                                                {getStatusIcon(task.status)}
                                                <span className="text-foreground">{task.status}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTasks?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No tasks found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminTasks;
