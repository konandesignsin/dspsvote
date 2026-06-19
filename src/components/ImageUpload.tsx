import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface Props {
  value?: string;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  shape?: "circle" | "square";
  accept?: string;
  maxSize?: number; // px, longest side after resize
  preserveTransparency?: boolean;
}

async function fileToResizedDataUrl(file: File, max = 512, preserveTransparency = false): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const ratio = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return preserveTransparency ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.9);
}

export function ImageUpload({
  value, onChange, label = "Upload image", shape = "square",
  accept = "image/*", maxSize = 512, preserveTransparency = false,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const radius = shape === "circle" ? "rounded-full" : "rounded-2xl";

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    try {
      const url = await fileToResizedDataUrl(f, maxSize, preserveTransparency);
      onChange(url);
    } finally {
      setLoading(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative w-20 h-20 ${radius} overflow-hidden glass flex items-center justify-center flex-shrink-0`}
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <Upload className="w-6 h-6 text-white/40" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={loading}
          className="glass rounded-full px-4 py-2 text-xs text-white hover:scale-105 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" /> {loading ? "Processing..." : value ? "Replace" : label}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-white/50 hover:text-red-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} onChange={handle} className="hidden" />
    </div>
  );
}