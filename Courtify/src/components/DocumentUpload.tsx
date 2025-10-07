import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { uploadDocument } from "@/lib/api";

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  summary?: string;
  keyPoints?: string[];
  uploadProgress: number;
}

const DocumentUpload = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  // Calls backend /upload with fallback inside api.ts
  const processDocument = async (file: File): Promise<{ summary: string; keyPoints: string[] }> => {
    const result = await uploadDocument(file);
    return { summary: result.summary, keyPoints: result.keyPoints };
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'application/msword' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                         file.type === 'text/plain';
      
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported document type. Please upload PDF, DOC, DOCX, or TXT files.`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB size limit.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Create document entries
    const newDocuments: UploadedDocument[] = validFiles.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      uploadProgress: 0
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    // Process each file
    for (const newDoc of newDocuments) {
      const file = validFiles.find(f => f.name === newDoc.name);
      if (!file) continue;

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id && doc.uploadProgress < 100
            ? { ...doc, uploadProgress: Math.min(doc.uploadProgress + 10, 100) }
            : doc
        ));
      }, 200);

      // Wait for upload to complete
      await new Promise(resolve => {
        const checkProgress = () => {
          setDocuments(prev => {
            const doc = prev.find(d => d.id === newDoc.id);
            if (doc?.uploadProgress >= 100) {
              clearInterval(uploadInterval);
              resolve(void 0);
              return prev.map(d => 
                d.id === newDoc.id ? { ...d, status: 'processing' } : d
              );
            }
            return prev;
          });
          setTimeout(checkProgress, 100);
        };
        checkProgress();
      });

      try {
        // Process the document
        const result = await processDocument(file);
        
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id 
            ? { 
                ...doc, 
                status: 'completed',
                summary: result.summary,
                keyPoints: result.keyPoints
              }
            : doc
        ));

        toast({
          title: "Document processed successfully",
          description: `${file.name} has been analyzed and summarized.`
        });
      } catch (error) {
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id ? { ...doc, status: 'error' } : doc
        ));
        
        toast({
          title: "Processing failed",
          description: `Failed to process ${file.name}. Please try again.`,
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-primary mb-4">
            Document Analysis & Summary
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload legal documents for AI-powered analysis, summarization, and plain English explanations
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload Area */}
          <Card 
            className={cn(
              "border-2 border-dashed transition-all duration-300 legal-shadow",
              dragActive 
                ? "border-accent bg-accent/5" 
                : "border-muted-foreground/25 hover:border-accent/50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="p-12 text-center">
              <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Legal Documents</h3>
              <p className="text-muted-foreground mb-6">
                Drag and drop your files here, or click to browse
              </p>
              
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              
              <Button asChild className="bg-primary hover:bg-primary-light">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  Choose Files
                </label>
              </Button>
              
              <div className="mt-4 text-sm text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, TXT • Max size: 10MB per file
              </div>
            </div>
          </Card>

          {/* Document List */}
          {documents.length > 0 && (
            <Card className="p-6 legal-shadow">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Document Analysis Results
              </h3>
              
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4 border">
                    <div className="space-y-3">
                      {/* File Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(doc.size)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {doc.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                          {doc.status === 'error' && (
                            <AlertCircle className="w-5 h-5 text-destructive" />
                          )}
                          <span className={cn(
                            "text-sm font-medium",
                            doc.status === 'completed' && "text-success",
                            doc.status === 'error' && "text-destructive",
                            (doc.status === 'uploading' || doc.status === 'processing') && "text-muted-foreground"
                          )}>
                            {doc.status === 'uploading' && 'Uploading...'}
                            {doc.status === 'processing' && 'Processing...'}
                            {doc.status === 'completed' && 'Completed'}
                            {doc.status === 'error' && 'Failed'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {(doc.status === 'uploading' || doc.status === 'processing') && (
                        <Progress value={doc.status === 'uploading' ? doc.uploadProgress : 50} className="w-full" />
                      )}

                      {/* Summary */}
                      {doc.status === 'completed' && doc.summary && (
                        <div className="space-y-4 pt-3 border-t">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">📄 Document Summary</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {doc.summary}
                            </p>
                          </div>
                          
                          {doc.keyPoints && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">🔍 Key Points</h4>
                              <ScrollArea className="h-32">
                                <ul className="space-y-1">
                                  {doc.keyPoints.map((point, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                                      <span className="text-accent mr-2">•</span>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </ScrollArea>
                            </div>
                          )}
                          
                          <Button variant="outline" size="sm" className="mt-3">
                            <Download className="w-4 h-4 mr-2" />
                            Download Summary Report
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default DocumentUpload;