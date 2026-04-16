import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../lib/cropImage'

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedFile: File, croppedUrl: string) => void
  onCancel: () => void
  cropShape?: 'rect' | 'round'
  aspect?: number
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ 
  imageSrc, 
  onCropComplete, 
  onCancel,
  cropShape = 'rect',
  aspect = 1
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [loading, setLoading] = useState(false)

  const onCropChange = (crop: any) => setCrop(crop)
  const onRotationChange = (rotation: any) => setRotation(rotation)
  const onZoomChange = (zoom: any) => setZoom(zoom)

  const onCropCompleteEvent = useCallback((croppedArea: any, croppedAreaPx: any) => {
    setCroppedAreaPixels(croppedAreaPx)
  }, [])

  const handleConfirm = async () => {
    try {
      setLoading(true)
      const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      if (croppedImageFile) {
        const croppedImageUrl = URL.createObjectURL(croppedImageFile)
        onCropComplete(croppedImageFile, croppedImageUrl)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl overflow-hidden flex flex-col h-[85vh] lg:h-[700px] shadow-2xl relative">
        <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low shrink-0">
          <h2 className="font-headline font-bold text-lg text-on-surface">Ajustar Foto</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
          </button>
        </div>

        <div className="relative flex-grow bg-surface-container-lowest">
          <Cropper
            image={imageSrc}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteEvent}
            onZoomChange={onZoomChange}
            cropShape={cropShape}
            showGrid={false}
          />
        </div>

        <div className="p-6 bg-surface-container-low border-t border-outline-variant/20 flex flex-col gap-6 shrink-0">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Zoom</label>
                <span className="text-xs font-medium text-on-surface-variant">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Girar</label>
                <span className="text-xs font-medium text-on-surface-variant">{rotation}°</span>
              </div>
              <input
                type="range"
                value={rotation}
                min={0}
                max={360}
                step={1}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-xl text-on-surface font-bold hover:bg-surface-container-highest transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3.5 bg-primary text-on-primary font-bold rounded-xl shadow-md hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">check</span>
                  Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
