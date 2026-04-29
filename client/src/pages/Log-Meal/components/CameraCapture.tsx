import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, RefreshCw, X } from "lucide-react";

interface Props {
  onCapture: (file: File) => void;
}

export function CameraCapture({ onCapture }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"idle" | "camera">("idle");
  const [preview, setPreview] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setPreview(imageSrc);
    setMode("idle");
    fetch(imageSrc)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        onCapture(file);
      });
  }, [onCapture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onCapture(file);
  };

  if (preview) {
    return (
      <div className="relative">
        <img src={preview} alt="captured" className="w-full rounded-2xl object-cover max-h-64" />
        <button
          onClick={() => { setPreview(null); }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white backdrop-blur-sm"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  if (mode === "camera") {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full"
          videoConstraints={{ facingMode: "environment" }}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={() => setMode("idle")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/90 text-white backdrop-blur-sm"
          >
            <X size={20} />
          </button>
          <button
            onClick={capture}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl"
          >
            <div className="h-12 w-12 rounded-full border-4 border-slate-900" />
          </button>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/90 text-white backdrop-blur-sm">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => setMode("camera")}
        className="flex flex-1 flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-700 py-8 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
      >
        <Camera size={32} className="text-emerald-400" />
        <span className="text-sm font-medium text-slate-300">Rasm olish</span>
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="flex flex-1 flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-700 py-8 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
      >
        <Upload size={32} className="text-emerald-400" />
        <span className="text-sm font-medium text-slate-300">Yuklash</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
