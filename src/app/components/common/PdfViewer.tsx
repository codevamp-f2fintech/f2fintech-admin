import React from "react";

const PdfViewer: React.FC = ( { src } ) => {
  return (
    <div>
      <a href={src} target="_blank" rel="noopener noreferrer">
        Open PDF
      </a>
    </div>
  );
};

export default PdfViewer;
