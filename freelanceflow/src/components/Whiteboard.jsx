
import React, { useEffect, useRef, useState } from 'react';

const Whiteboard = ({ projectId, onClose }) => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);

    useEffect(() => {
        // Dynamically load Fabric.js
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js";
        script.async = true;
        script.onload = initCanvas;
        document.body.appendChild(script);

        return () => {
            if (fabricRef.current) {
                fabricRef.current.dispose();
            }
            const existingScript = document.querySelector('script[src*="fabric.min.js"]');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);

    const initCanvas = () => {
        if (!window.fabric || !canvasRef.current) return;
        const fabric = window.fabric;
        const canvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: true,
            width: window.innerWidth * 0.8,
            height: window.innerHeight * 0.7,
            backgroundColor: '#ffffff'
        });

        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = brushSize;
        fabricRef.current = canvas;
    };

    const handleColorChange = (newColor) => {
        setColor(newColor);
        if (fabricRef.current) {
            fabricRef.current.freeDrawingBrush.color = newColor;
        }
    };

    const handleBrushSizeChange = (size) => {
        setBrushSize(parseInt(size));
        if (fabricRef.current) {
            fabricRef.current.freeDrawingBrush.width = parseInt(size);
        }
    };

    const clearCanvas = () => {
        if (fabricRef.current) {
            fabricRef.current.clear();
            fabricRef.current.backgroundColor = '#ffffff';
            fabricRef.current.renderAll();
        }
    };

    const downloadImage = () => {
        if (fabricRef.current) {
            const dataURL = fabricRef.current.toDataURL({
                format: 'png',
                quality: 1
            });
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `whiteboard-project-${projectId}.png`;
            link.click();
        }
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={{ margin: 0 }}>🎨 Collaborative Whiteboard</h2>
                    <button onClick={onClose} style={styles.closeBtn}>×</button>
                </div>

                <div style={styles.toolbar}>
                    <div style={styles.toolGroup}>
                        <label>Color: </label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => handleColorChange(e.target.value)}
                            style={styles.colorPicker}
                        />
                    </div>

                    <div style={styles.toolGroup}>
                        <label>Size: </label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => handleBrushSizeChange(e.target.value)}
                        />
                    </div>

                    <button onClick={clearCanvas} style={styles.actionBtn}>Clear</button>
                    <button onClick={downloadImage} style={styles.actionBtn}>Save Image</button>
                </div>

                <div style={styles.canvasWrapper} onClick={(e) => e.stopPropagation()}>
                    <canvas ref={canvasRef} />
                </div>

                <p style={styles.footer}>Note: Drawing is local in this sync version. Use Chat to share screenshots!</p>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(5px)'
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: '20px',
        width: '85vw',
        maxWidth: '1000px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: {
        padding: '20px',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '32px',
        cursor: 'pointer'
    },
    toolbar: {
        padding: '15px 20px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    toolGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600'
    },
    colorPicker: {
        width: '30px',
        height: '30px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    actionBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        background: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s'
    },
    canvasWrapper: {
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9'
    },
    footer: {
        padding: '10px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#64748b',
        margin: 0
    }
};

export default Whiteboard;
