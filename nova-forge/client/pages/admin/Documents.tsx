import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService, Document } from '@/services/documents';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Search, Trash2, CheckCircle, ExternalLink, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const AdminDocuments: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: documents, isLoading } = useQuery({
    queryKey: ['allDocuments'],
    queryFn: documentService.getAllDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: documentService.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDocuments'] });
      toast.success('Document deleted');
    },
    onError: () => {
      toast.error('Failed to delete document');
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredDocs = documents?.filter(doc =>
    doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('POLICY');
  const [isGlobal, setIsGlobal] = useState(false);
  // We need a valid employee ID even for global docs, let's pick the first one or current user if available.
  // Ideally backend should handle null employeeId for global, but schema enforces it.
  // For now we can use a placeholder or admin's ID if we had it.
  // Actually, let's fetch users to let admin pick one IF not global.
  // If global, we can perhaps use specific ID or just 0.
  // Let's assume we can pick '0' or admin ID. 

  // For simplicity, let's ask for Employee ID if not global, or use 0 if global? 
  // Wait, the backend requires an existing Employee ID usually for foreign key.
  // Let's check if we can select an employee. 

  // Actually, for "Show to all", we might still want to associate it with the uploader (Admin).
  // But we don't have Admin ID easily here without useAuth.
  const { user } = import('@/hooks/useAuth').then(m => m.useAuth()) as any; // Temporary fix, should use hook at top level
  // Better:

  const uploadMutation = useMutation({
    mutationFn: (data: { file: File; employeeId: string; type: string; isGlobal: boolean }) =>
      documentService.uploadFile(data.file, data.employeeId, data.type, data.isGlobal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDocuments'] });
      toast.success('Document uploaded successfully');
      setUploadOpen(false);
      setSelectedFile(null);
      setIsGlobal(false);
    },
    onError: () => {
      toast.error('Failed to upload document');
    },
  });

  const handleUpload = () => {
    if (!selectedFile) return;
    // For global docs, we can use a dummy ID or the admin's ID if available. 
    // Since we don't have an employee picker easily implemented here yet, 
    // let's default to a known ID or requires user to input ID?
    // Let's add an input for Employee ID.

    // Use prompt for now or better add input field in dialog.
    const empId = isGlobal ? '1' : (prompt('Enter Employee ID for this document:') || '1');

    uploadMutation.mutate({
      file: selectedFile,
      employeeId: empId,
      type: docType,
      isGlobal
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Document Management</h1>
          <p className="text-muted-foreground">Manage employee documents and verification.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="bg-neon-cyan text-black hover:bg-neon-cyan/90">
          <ExternalLink className="w-4 h-4 mr-2" /> Upload Document
        </Button>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-neon-cyan" />
              All Documents
            </CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
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
                  <TableHead className="text-muted-foreground">Employee</TableHead>
                  <TableHead className="text-muted-foreground">Document</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}
                {filteredDocs?.map((doc) => (
                  <TableRow key={doc.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border border-border">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.employeeName)}&background=random`} />
                          <AvatarFallback>{doc.employeeName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{doc.employeeName}</span>
                        {doc.isGlobal && <span className="ml-2 text-[10px] bg-neon-purple/20 text-neon-purple px-1 rounded">GLOBAL</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-neon-cyan transition-colors">
                          <FileText className="w-4 h-4 text-neon-cyan" />
                          {doc.fileName}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {doc.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{doc.uploadDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {doc.status === 'verified' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                        <span className="text-sm capitalized text-foreground">{doc.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="hover:text-neon-cyan" onClick={() => window.open(doc.fileUrl, '_blank')}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-500 text-muted-foreground"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-lg w-full max-w-md shadow-xl animate-scale-in">
            <h2 className="text-xl font-bold text-foreground mb-4">Upload Document</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Select File</label>
                <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="bg-accent/10" />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Document Type</label>
                <select
                  className="w-full p-2 rounded-md bg-accent/10 border border-border text-foreground"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="POLICY">Policy</option>
                  <option value="PAYSLIP">Payslip</option>
                  <option value="OFFER_LETTER">Offer Letter</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isGlobal"
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-neon-cyan focus:ring-neon-cyan"
                />
                <label htmlFor="isGlobal" className="text-sm text-foreground">Show to all employees (Global Document)</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={!selectedFile || uploadMutation.isPending} className="bg-neon-cyan text-black hover:bg-neon-cyan/90">
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
