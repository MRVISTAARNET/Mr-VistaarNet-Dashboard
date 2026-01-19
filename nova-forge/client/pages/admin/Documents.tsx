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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Document Management</h1>
        <p className="text-muted-foreground">Manage employee documents and verification.</p>
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
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neon-cyan" />
                        {doc.fileName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {doc.category}
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
                        <Button variant="ghost" size="icon" className="hover:text-neon-cyan">
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
    </div>
  );
};

export default AdminDocuments;
