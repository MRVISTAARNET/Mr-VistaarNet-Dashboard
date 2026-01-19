import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, Task } from '@/services/tasks';
import { useAuth } from '@/hooks/useAuth';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, AlertCircle, Clock, CheckCircle2, MoreVertical, PlayCircle, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';

const MyTasks: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['myTasks', user?.id],
        queryFn: () => taskService.getMyTasks(user?.id || ''),
        enabled: !!user?.id
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: Task['status'] }) =>
            taskService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTasks'] });
            toast.success('Task status updated');
        }
    });

    const handleStatusChange = (id: string, status: Task['status']) => {
        updateStatusMutation.mutate({ id, status });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="w-4 h-4 text-neon-cyan" />;
            case 'In Progress': return <Clock className="w-4 h-4 text-neon-magenta" />;
            case 'Review': return <AlertCircle className="w-4 h-4 text-neon-purple" />;
            default: return <PlayCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">My Tasks</h1>
                <p className="text-gray-400">Track your assignments and update progress.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks?.map((task) => (
                        <Card key={task.id} className="border-white/10 bg-black/40 backdrop-blur-xl hover:border-primary/50 transition-all group">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                        {task.priority} Priority
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-gray-200">
                                            <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'In Progress')}>
                                                Mark Working
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'Completed')}>
                                                Mark Done
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-xl text-white mt-2 leading-tight">{task.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">{task.description}</p>
                                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        Due: {task.dueDate}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {getStatusIcon(task.status)}
                                        <span className={
                                            task.status === 'Completed' ? 'text-neon-cyan' :
                                                task.status === 'In Progress' ? 'text-neon-magenta' :
                                                    'text-amber-400'
                                        }>{task.status === 'In Progress' ? 'Working' : task.status === 'Completed' ? 'Done' : 'Pending'}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${task.status === 'Completed' ? 'w-full bg-neon-cyan' :
                                            task.status === 'Review' ? 'w-3/4 bg-neon-purple' :
                                                task.status === 'In Progress' ? 'w-1/2 bg-neon-magenta' :
                                                    'w-0 bg-transparent'
                                            }`}
                                    />
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {tasks?.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-500">
                    <p>No tasks assigned to you yet.</p>
                </div>
            )}
        </div>
    );
};

export default MyTasks;
