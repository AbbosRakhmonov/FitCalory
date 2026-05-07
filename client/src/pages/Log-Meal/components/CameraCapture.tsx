import { useRef, useState, useCallback, DragEvent } from "react";
import Webcam from "react-webcam";
import { Camera, ImagePlus, RefreshCw, X } from "lucide-react";

interface Props {
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "gif", "avif", "bmp"];

function isImageFile(f: File): boolean {
  if (f.type.startsWith("image/")) return true;
  // Android: some browsers return empty MIME type for gallery images
  if (!f.type) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    return IMAGE_EXTENSIONS.includes(ext);
  }
  return false;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CameraCapture({ onFilesChange, disabled }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"idle" | "camera">("idle");
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  async function addFiles(incoming: FileList | File[]) {
    const imageFiles = Array.from(incoming).filter(isImageFile);
    if (!imageFiles.length) return;
    // Use FileReader data URLs — more reliable on mobile than blob URLs
    const newPreviews = await Promise.all(
      imageFiles.map(async (f) => ({ url: await fileToDataUrl(f), file: f }))
    );
    setPreviews((prev) => {
      const updated = [...prev, ...newPreviews];
      onFilesChange(updated.map((p) => p.file));
      return updated;
    });
  }

  function removeFile(index: number) {
    setPreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesChange(updated.map((p) => p.file));
      return updated;
    });
  }

  const capture = useCallback(() => {
    const src = webcamRef.current?.getScreenshot();
    if (!src) return;
    setMode("idle");
    fetch(src)
      .then((r) => r.blob())
      .then((blob) => {
        addFiles([new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" })]);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }
  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) addFiles(e.dataTransfer.files);
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
    <div className="flex flex-col gap-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && fileRef.current?.click()}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-all",
          isDragging
            ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
            : "border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
          <ImagePlus size={28} className={isDragging ? "text-emerald-300" : "text-emerald-400"} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">
            {isDragging ? "Qo'yib yuboring!" : "Rasm tashlang yoki bosing"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Bir vaqtda bir nechta rasm yuklash mumkin
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      <button
        onClick={() => setMode("camera")}
        disabled={disabled}
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors disabled:opacity-50"
      >
        <Camera size={18} />
        Kamera bilan olish
      </button>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map(({ url }, i) => (
            <div key={i} className="relative aspect-square">
              <img src={url} alt="preview" className="h-full w-full rounded-xl object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 text-white backdrop-blur-sm hover:bg-red-500/80 transition-colors"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-1 left-1 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[10px] text-slate-300 backdrop-blur-sm">
                #{i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
