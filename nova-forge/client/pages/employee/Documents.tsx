import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService, Document } from '@/services/documents';
import { useAuth } from '@/hooks/useAuth';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Download, Eye, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import ContactHRDialog from '@/components/ContactHRDialog';

const EmployeeDocuments: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'personal',
    file: null as File | null
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['myDocuments', user?.id],
    queryFn: () => documentService.getMyDocuments(user?.id || ''),
    enabled: !!user?.id
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => documentService.uploadFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDocuments'] });
      setIsUploadOpen(false);
      toast.success('Document uploaded successfully');
      setUploadForm({ name: '', type: 'personal', file: null });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload document');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: documentService.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDocuments'] });
      toast.success('Document deleted');
    }
  });

  const handleUpload = () => {
    if (!uploadForm.file) {
      toast.error('Please select a file');
      return;
    }

    if (!user?.id) {
      toast.error('User ID not found. Please re-login.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('employeeId', user?.id || '');
    formData.append('type', uploadForm.type);

    uploadMutation.mutate(formData);
  };

  const myDocs = documents?.filter(d => d.type !== 'policy');
  const policyDocs = documents?.filter(d => d.type === 'policy');

  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <ContactHRDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Documents</h1>
          <p className="text-gray-400">Access your personal files, payslips, and company policies.</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold">
              <Upload className="w-4 h-4 mr-2" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>File Selection</Label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-neon-cyan/50 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">{uploadForm.file ? uploadForm.file.name : "Click to select a file"}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={uploadForm.type}
                  onValueChange={(val) => setUploadForm({ ...uploadForm, type: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 text-white">
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/80"
                onClick={handleUpload}
                disabled={uploadMutation.isPending || !uploadForm.file}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg">Personal Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" /></div>
            ) : myDocs?.length === 0 ? (
              <p className="text-gray-500 text-sm">No personal documents found.</p>
            ) : (
              myDocs?.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-neon-cyan/10 text-neon-cyan">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{doc.uploadDate} • {doc.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (confirm('Delete this document?')) deleteMutation.mutate(doc.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg">Company Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-500/20 text-center">
              <p className="text-sm text-indigo-300 mb-2">No policies uploaded yet.</p>
              <Button
                variant="link"
                className="text-neon-cyan h-auto p-0"
                onClick={() => setIsContactOpen(true)}
              >
                Contact HR for Policies <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDocuments;
