import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChartStore } from '@/store/chart-store';
import { motion } from 'framer-motion';

export function ChartZoomControls() {
  const { zoomIn, zoomOut, resetZoom } = useChartStore();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div 
      ref={containerRef}
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg p-1 shadow-lg cursor-move select-none"
      style={{ 
        left: `calc(50% + ${position.x}px)`, 
        bottom: `${16 + position.y}px`
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        borderColor: 'rgba(59, 130, 246, 0.5)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const startPos = { ...position };
        
        const handleMouseMove = (e: MouseEvent) => {
          const deltaX = e.clientX - startX;
          const deltaY = startY - e.clientY; // Invert Y for bottom positioning
          
          setPosition({
            x: Math.max(-200, Math.min(200, startPos.x + deltaX)),
            y: Math.max(-100, Math.min(100, startPos.y + deltaY))
          });
        };
        
        const handleMouseUp = () => {
          setIsDragging(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomIn}
        className="px-2 py-1 h-8"
        title="Zoom In (Ctrl/Cmd + Wheel Up)"
        disabled={isDragging}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomOut}
        className="px-2 py-1 h-8"
        title="Zoom Out (Ctrl/Cmd + Wheel Down)"
        disabled={isDragging}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={resetZoom}
        className="px-2 py-1 h-8"
        title="Reset Zoom"
        disabled={isDragging}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}