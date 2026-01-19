import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '@/services/announcements';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Megaphone, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AdminAnnouncements: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'MEDIUM'
    });

    const { data: announcements, isLoading } = useQuery({
        queryKey: ['announcements'],
        queryFn: announcementService.getAll
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => announcementService.create(data, user?.id || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            setIsDialogOpen(false);
            setFormData({ title: '', content: '', priority: 'Medium' });
            toast.success('Announcement posted');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: announcementService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            toast.success('Announcement deleted');
        }
    });

    const handleSubmit = () => {
        if (!formData.title || !formData.content) {
            toast.error("Please fill all fields");
            return;
        }
        createMutation.mutate(formData);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Announcements</h1>
                    <p className="text-gray-400">Manage company-wide announcements and news.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold">
                            <Plus className="w-4 h-4 mr-2" /> Post Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>New Announcement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white"
                                    placeholder="e.g. Holiday Schedule"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(val) => setFormData({ ...formData, priority: val })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white min-h-[100px]"
                                    placeholder="Announcement details..."
                                />
                            </div>
                            <Button
                                className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/80"
                                onClick={handleSubmit}
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? 'Posting...' : 'Post Announcement'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-center p-8 text-gray-500">Loading announcements...</div>
                ) : announcements?.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 border border-dashed border-white/10 rounded-lg">
                        No announcements found.
                    </div>
                ) : (
                    announcements?.map((ann) => (
                        <Card key={ann.id} className="border-white/10 bg-black/40 backdrop-blur-xl hover:bg-white/5 transition-colors">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div>
                                    <CardTitle className="text-white text-lg flex items-center gap-2">
                                        {ann.title}
                                        <span className={`text-xs px-2 py-0.5 rounded-full border 
                                            ${ann.priority === 'High' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                                ann.priority === 'Low' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                                                    'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'}`}>
                                            {ann.priority}
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-gray-400 text-sm mt-1">
                                        Posted by {ann.postedBy} on {ann.date}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-500 hover:text-red-400"
                                    onClick={() => {
                                        if (confirm("Delete this announcement?")) deleteMutation.mutate(ann.id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-300 whitespace-pre-wrap">{ann.content}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncements;
