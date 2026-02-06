'use client';

import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Upload, FileWarning, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import {
  importDrawio,
  readDrawioFile,
  validateDrawioContent,
  DrawioImportResult,
} from '@/lib/import/drawio-import';

// ============================================================================
// Types
// ============================================================================

interface DrawioImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (nodes: Node[], edges: Edge[]) => void;
}

type ImportState = 'idle' | 'reading' | 'parsing' | 'success' | 'error';

// ============================================================================
// Component
// ============================================================================

export function DrawioImportDialog({
  open,
  onOpenChange,
  onImport,
}: DrawioImportDialogProps) {
  const [state, setState] = useState<ImportState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrawioImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const resetState = useCallback(() => {
    setState('idle');
    setError(null);
    setResult(null);
  }, []);

  const processFile = useCallback(async (file: File) => {
    // Validate file type
    const validExtensions = ['.drawio', '.xml', '.drawio.xml'];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      setError('Please upload a .drawio or .xml file');
      setState('error');
      return;
    }

    try {
      // Read file
      setState('reading');
      const content = await readDrawioFile(file);

      // Validate content
      const validation = validateDrawioContent(content);
      if (!validation.valid) {
        setError(validation.error || 'Invalid draw.io file');
        setState('error');
        return;
      }

      // Parse and import
      setState('parsing');
      const importResult = await importDrawio(content);
      setResult(importResult);
      setState('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import file');
      setState('error');
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (result) {
      onImport(result.nodes, result.edges);
      onOpenChange(false);
      resetState();
    }
  }, [result, onImport, onOpenChange, resetState]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(resetState, 200);
  }, [onOpenChange, resetState]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import from draw.io
          </DialogTitle>
          <DialogDescription>
            Upload a .drawio or .xml file to import your diagram
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Idle / Upload state */}
          {(state === 'idle' || state === 'error') && (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400',
                state === 'error' && 'border-red-300 bg-red-50'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept=".drawio,.xml,.drawio.xml"
                onChange={handleFileInput}
                className="hidden"
                id="drawio-file-input"
              />

              {state === 'error' ? (
                <>
                  <FileWarning className="h-12 w-12 mx-auto mb-4 text-red-400" />
                  <p className="text-red-600 font-medium mb-2">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetState}
                  >
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <Upload
                    className={cn(
                      'h-12 w-12 mx-auto mb-4',
                      dragActive ? 'text-blue-500' : 'text-gray-400'
                    )}
                  />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your draw.io file here, or
                  </p>
                  <label
                    htmlFor="drawio-file-input"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    browse to upload
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports .drawio and .xml files
                  </p>
                </>
              )}
            </div>
          )}

          {/* Loading state */}
          {(state === 'reading' || state === 'parsing') && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
              <p className="text-gray-600">
                {state === 'reading' ? 'Reading file...' : 'Parsing diagram...'}
              </p>
            </div>
          )}

          {/* Success state */}
          {state === 'success' && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                <div>
                  <p className="font-medium text-green-700">
                    File parsed successfully
                  </p>
                  <p className="text-sm text-green-600">
                    Ready to import your diagram
                  </p>
                </div>
              </div>

              {/* Import Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-3">Import Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nodes:</span>
                    <span className="font-medium">
                      {result.metadata.importedNodes}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Edges:</span>
                    <span className="font-medium">
                      {result.metadata.importedEdges}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total cells:</span>
                    <span className="font-medium">
                      {result.metadata.totalCells}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Skipped:</span>
                    <span className="font-medium">
                      {result.metadata.skippedCells}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {result.metadata.warnings.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-medium text-sm text-yellow-700">
                      Warnings ({result.metadata.warnings.length})
                    </h4>
                  </div>
                  <ul className="text-xs text-yellow-600 space-y-1 max-h-24 overflow-y-auto">
                    {result.metadata.warnings.slice(0, 5).map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                    {result.metadata.warnings.length > 5 && (
                      <li className="text-yellow-500">
                        ... and {result.metadata.warnings.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview of node types */}
              {result.nodes.length > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Node types found: </span>
                  {[...new Set(result.nodes.map((n) => n.type || 'default'))]
                    .slice(0, 5)
                    .join(', ')}
                  {new Set(result.nodes.map((n) => n.type)).size > 5 &&
                    ` and ${
                      new Set(result.nodes.map((n) => n.type)).size - 5
                    } more`}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {state === 'success' && (
            <Button onClick={handleConfirmImport}>
              Import {result?.metadata.importedNodes} Nodes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DrawioImportDialog;
