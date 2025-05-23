import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FileViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

const FileViewer = ({ fileUrl, fileName, onClose }: FileViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [initialScale, setInitialScale] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    // モバイルデバイスの場合、初期スケールを調整
    if (window.innerWidth < 768) {
      setInitialScale(0.8);
      setScale(0.8);
    }
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages || 1));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(2, prevScale + 0.1));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(0.5, prevScale - 0.1));
  };

  const resetZoom = () => {
    setScale(initialScale);
  };

  const fileExtension = fileUrl.split('.').pop()?.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h2 className="text-white font-medium truncate max-w-[60%]">{fileName}</h2>
        <div className="flex items-center space-x-4">
          <a
            href={fileUrl}
            download
            className="p-2 text-white hover:text-gray-300 transition-colors rounded-full bg-white/10"
            title="ダウンロード"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-gray-300 transition-colors rounded-full bg-white/10"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {fileExtension === 'pdf' ? (
          <div className="flex flex-col items-center">
            {/* Controls */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 backdrop-blur-sm rounded-full p-2 flex items-center space-x-2">
              <button
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
                className="p-2 text-white hover:text-gray-300 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white text-sm px-2">
                {pageNumber} / {numPages || '-'}
              </span>
              <button
                onClick={() => changePage(1)}
                disabled={pageNumber >= (numPages || 1)}
                className="p-2 text-white hover:text-gray-300 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/20" />
              <button
                onClick={zoomOut}
                className="p-2 text-white hover:text-gray-300 transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={resetZoom}
                className="text-white hover:text-gray-300 text-sm px-2"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={zoomIn}
                className="p-2 text-white hover:text-gray-300 transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* PDF Document */}
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-w-full touch-none"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="shadow-xl"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        ) : fileExtension && ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension) ? (
          <div className="flex items-center justify-center h-full">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white text-center px-4">
              このファイル形式はプレビューに対応していません。
              <br />
              ダウンロードしてご確認ください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;