import React, { useState, useRef, useCallback } from 'react';
import { 
  Download, 
  Upload, 
  Type, 
  Layout, 
  Image as ImageIcon, 
  Tag, 
  RefreshCw,
  Check,
  Newspaper
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { cn } from './lib/utils';

type TemplateType = 'breaking' | 'modern' | 'classic' | 'social' | 'minimal';
type AspectRatioType = '16:9' | '9:16';
type PaletteType = 'red-yellow-white' | 'blue-red-black' | 'green-white-black' | 'orange-black-white' | 'purple-white-black';

interface NewsData {
  title: string;
  content: string;
  category: string;
  images: string[];
  template: TemplateType;
  aspectRatio: AspectRatioType;
  palette: PaletteType;
  timestamp: string;
  watermark: string;
}

export default function App() {
  const [news, setNews] = useState<NewsData>({
    title: 'TIÊU ĐỀ BẢN TIN MỚI NHẤT',
    content: 'Nội dung chi tiết của bản tin sẽ được hiển thị tại đây. Bạn có thể thay đổi nội dung này trong bảng điều khiển.',
    category: 'TIN NÓNG',
    images: ['https://picsum.photos/seed/news/1200/800'],
    template: 'breaking',
    aspectRatio: '16:9',
    palette: 'red-yellow-white',
    timestamp: new Date().toLocaleDateString('vi-VN'),
    watermark: 'Nang&TheGioi'
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).slice(0, 4 - news.images.length).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNews(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setNews(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const findAiImage = async () => {
    setIsGeneratingImage(true);
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Dựa trên tiêu đề tin tức: "${news.title}" và nội dung: "${news.content}", hãy đưa ra 1 từ khóa tiếng Anh duy nhất (ví dụ: "technology", "sports", "politics", "nature") để tìm kiếm hình ảnh phù hợp trên Unsplash/Picsum. Chỉ trả về đúng 1 từ khóa.`,
      });
      const keyword = response.text?.trim() || 'news';
      const newImage = `https://picsum.photos/seed/${keyword}-${Date.now()}/1200/800`;
      setNews(prev => ({ ...prev, images: [...prev.images, newImage].slice(0, 4) }));
    } catch (error) {
      console.error("Error finding AI image:", error);
      const newImage = `https://picsum.photos/seed/news-${Date.now()}/1200/800`;
      setNews(prev => ({ ...prev, images: [...prev.images, newImage].slice(0, 4) }));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadImage = useCallback(() => {
    if (previewRef.current === null) return;

    // Use higher scale for better quality
    toPng(previewRef.current, { 
      cacheBust: true,
      pixelRatio: 2,
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `news-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  }, [previewRef]);

  const templates: { id: TemplateType; name: string }[] = [
    { id: 'breaking', name: 'Tin Nóng' },
    { id: 'modern', name: 'Hiện Đại' },
    { id: 'classic', name: 'Cổ Điển' },
    { id: 'social', name: 'Mạng Xã Hội' },
    { id: 'minimal', name: 'Tối Giản' }
  ];

  const aspectRatios: { id: AspectRatioType; name: string }[] = [
    { id: '16:9', name: 'Nằm Ngang (16:9)' },
    { id: '9:16', name: 'Dọc (9:16)' }
  ];

  const palettes: { id: PaletteType; name: string; colors: string[] }[] = [
    { id: 'red-yellow-white', name: 'Đỏ - Vàng - Trắng', colors: ['bg-red-600', 'bg-yellow-400', 'bg-white'] },
    { id: 'blue-red-black', name: 'Xanh - Đỏ - Đen', colors: ['bg-blue-600', 'bg-red-600', 'bg-black'] },
    { id: 'green-white-black', name: 'Xanh Lá - Trắng - Đen', colors: ['bg-emerald-600', 'bg-white', 'bg-black'] },
    { id: 'orange-black-white', name: 'Cam - Đen - Trắng', colors: ['bg-orange-500', 'bg-black', 'bg-white'] },
    { id: 'purple-white-black', name: 'Tím - Trắng - Đen', colors: ['bg-purple-600', 'bg-white', 'bg-black'] }
  ];

  const getPalette = () => {
    const pMap: Record<PaletteType, any> = {
      'red-yellow-white': {
        primary: 'bg-red-600',
        secondary: 'bg-yellow-400',
        accent: 'bg-white',
        textPrimary: 'text-white',
        textSecondary: 'text-black',
        border: 'border-red-600',
        accentText: 'text-red-600'
      },
      'blue-red-black': {
        primary: 'bg-blue-600',
        secondary: 'bg-red-600',
        accent: 'bg-black',
        textPrimary: 'text-white',
        textSecondary: 'text-white',
        border: 'border-blue-600',
        accentText: 'text-blue-600'
      },
      'green-white-black': {
        primary: 'bg-emerald-600',
        secondary: 'bg-white',
        accent: 'bg-black',
        textPrimary: 'text-white',
        textSecondary: 'text-black',
        border: 'border-emerald-600',
        accentText: 'text-emerald-600'
      },
      'orange-black-white': {
        primary: 'bg-orange-500',
        secondary: 'bg-black',
        accent: 'bg-white',
        textPrimary: 'text-white',
        textSecondary: 'text-white',
        border: 'border-orange-500',
        accentText: 'text-orange-500'
      },
      'purple-white-black': {
        primary: 'bg-purple-600',
        secondary: 'bg-white',
        accent: 'bg-black',
        textPrimary: 'text-white',
        textSecondary: 'text-black',
        border: 'border-purple-600',
        accentText: 'text-purple-600'
      }
    };
    return pMap[news.palette];
  };

  const p = getPalette();
  const isPortrait = news.aspectRatio === '9:16';

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NewsGen Pro
          </h1>
        </div>
        <button
          onClick={downloadImage}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all active:scale-95 shadow-lg shadow-blue-100"
        >
          <Download className="w-4 h-4" />
          Tải Ảnh Xuống
        </button>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Kích thước */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg">Kích Thước</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {aspectRatios.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setNews(prev => ({ ...prev, aspectRatio: r.id }))}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm font-medium transition-all border-2 flex items-center justify-between",
                    news.aspectRatio === r.id 
                      ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" 
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                  )}
                >
                  {r.name}
                  {news.aspectRatio === r.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>

          {/* Màu sắc */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg">Màu Sắc Template</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {palettes.map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => setNews(prev => ({ ...prev, palette: pal.id }))}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm font-medium transition-all border-2 flex items-center justify-between",
                    news.palette === pal.id 
                      ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" 
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {pal.colors.map((c, i) => (
                        <div key={i} className={cn("w-4 h-4 rounded-full border border-white", c)} />
                      ))}
                    </div>
                    {pal.name}
                  </div>
                  {news.palette === pal.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>

          {/* Template */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg">Chọn Template</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setNews(prev => ({ ...prev, template: t.id }))}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm font-medium transition-all border-2 flex items-center justify-between",
                    news.template === t.id 
                      ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" 
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                  )}
                >
                  {t.name}
                  {news.template === t.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>

          {/* Nội dung */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg">Nội Dung Tin Tức</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Loại Tin</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={news.category}
                    onChange={(e) => setNews(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ví dụ: TIN NÓNG, THỂ THAO..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Tiêu Đề</label>
                <textarea
                  value={news.title}
                  onChange={(e) => setNews(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] resize-none font-bold"
                  placeholder="Nhập tiêu đề tin tức..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nội Dung</label>
                <textarea
                  value={news.content}
                  onChange={(e) => setNews(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[120px] resize-none text-sm leading-relaxed"
                  placeholder="Nhập nội dung chi tiết..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Ngày Xuất Bản</label>
                <input
                  type="text"
                  value={news.timestamp}
                  onChange={(e) => setNews(prev => ({ ...prev, timestamp: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ví dụ: 25/03/2026"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Watermark</label>
                <input
                  type="text"
                  value={news.watermark}
                  onChange={(e) => setNews(prev => ({ ...prev, watermark: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ví dụ: Nang&TheGioi"
                />
              </div>
            </div>
          </section>

          {/* Hình ảnh */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-lg">Hình Ảnh (1-4)</h2>
              </div>
              <button 
                onClick={findAiImage}
                disabled={isGeneratingImage || news.images.length >= 4}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3 h-3", isGeneratingImage && "animate-spin")} />
                Tìm Ảnh AI
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {news.images.map((img, idx) => (
                <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-100">
                  <img src={img} alt={`News ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Check className="w-3 h-3 rotate-45" />
                  </button>
                </div>
              ))}
              {news.images.length < 4 && (
                <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </section>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8">
          <div className="sticky top-28 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-bold text-lg flex items-center gap-2">
                Xem Trước
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full uppercase tracking-widest">Live</span>
              </h2>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>

            {/* The Canvas */}
            <div className="flex justify-center bg-gray-200 rounded-2xl p-4 lg:p-10 overflow-hidden">
              <div 
                ref={previewRef}
                className={cn(
                  "relative bg-black overflow-hidden shadow-2xl ring-1 ring-black/5 transition-all duration-500",
                  isPortrait ? "w-[360px] aspect-[9/16]" : "w-full aspect-video"
                )}
              >
                {/* Image Grid Background */}
                <div className={cn(
                  "absolute inset-0 grid gap-0.5",
                  news.images.length === 1 ? "grid-cols-1" : 
                  news.images.length === 2 ? "grid-cols-2" :
                  news.images.length === 3 ? "grid-cols-2 grid-rows-2" : "grid-cols-2 grid-rows-2"
                )}>
                  {news.images.map((img, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "relative overflow-hidden",
                        news.images.length === 3 && i === 0 ? "row-span-2" : ""
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  {news.images.length === 0 && (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-800" />
                    </div>
                  )}
                </div>

                {/* Watermark */}
                <div className="absolute top-4 right-4 z-40 opacity-50 mix-blend-difference">
                  <span className="text-white text-[10px] font-bold tracking-widest uppercase">@{news.watermark}</span>
                </div>

                {/* Template Overlays */}
                {news.template === 'breaking' && (
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="bg-gradient-to-t from-black/90 via-black/40 to-transparent h-1/2" />
                    <div className={cn("relative space-y-4", isPortrait ? "p-6" : "p-8")}>
                      <div className="flex items-center gap-0">
                        <div className={cn("text-white px-6 py-2 font-black italic skew-x-[-12deg] shadow-xl", p.primary, isPortrait ? "text-lg" : "text-2xl")}>
                          BREAKING NEWS
                        </div>
                        <div className={cn("px-4 py-2 font-bold skew-x-[-12deg] -ml-2 shadow-xl border-l-4", p.secondary, p.textSecondary, p.border, isPortrait ? "text-base" : "text-xl")}>
                          {news.category}
                        </div>
                      </div>
                      <div className={cn("bg-black/80 backdrop-blur-sm border-l-8 shadow-2xl", p.border, isPortrait ? "p-4" : "p-6")}>
                        <h3 className={cn("text-white font-black leading-tight uppercase tracking-tight mb-2 drop-shadow-lg", isPortrait ? "text-2xl" : "text-4xl")}>
                          {news.title}
                        </h3>
                        <p className={cn("text-gray-300 line-clamp-2 font-medium", isPortrait ? "text-sm" : "text-lg")}>
                          {news.content}
                        </p>
                      </div>
                      <div className={cn("absolute right-8 text-white/50 text-xs font-mono tracking-widest uppercase", isPortrait ? "bottom-2" : "bottom-4")}>
                        {news.timestamp}
                      </div>
                    </div>
                  </div>
                )}

                {news.template === 'modern' && (
                  <div className={cn("absolute inset-0 flex flex-col justify-end", isPortrait ? "p-6" : "p-10")}>
                    <div className={cn("absolute inset-0 bg-gradient-to-tr via-transparent to-transparent", news.palette === 'red-yellow-white' ? "from-red-900/80" : "from-blue-900/80")} />
                    <div className="relative max-w-2xl space-y-4">
                      <span className={cn("inline-block px-3 py-1 text-white text-[10px] font-bold rounded-full tracking-widest uppercase mb-2", p.primary)}>
                        {news.category}
                      </span>
                      <h3 className={cn("text-white font-extrabold leading-[1.1] tracking-tighter", isPortrait ? "text-3xl" : "text-5xl")}>
                        {news.title}
                      </h3>
                      <div className={cn("h-1.5 rounded-full", p.secondary, isPortrait ? "w-12" : "w-20")} />
                      <p className={cn("text-white/80 font-medium leading-relaxed", isPortrait ? "text-base" : "text-xl")}>
                        {news.content}
                      </p>
                      <div className="pt-4 text-white/40 text-[10px] font-semibold flex items-center gap-2">
                        <div className={cn("w-1 h-1 rounded-full", p.secondary)} />
                        {news.timestamp}
                      </div>
                    </div>
                  </div>
                )}

                {news.template === 'classic' && (
                  <div className="absolute inset-0 bg-white/10 backdrop-grayscale-[0.5] flex flex-col">
                    <div className={cn("border-b-4 bg-white/90 flex justify-between items-end", p.border, isPortrait ? "p-4" : "p-8")}>
                      <h4 className={cn("font-serif italic font-black tracking-tighter", isPortrait ? "text-2xl" : "text-4xl")}>The Daily Report</h4>
                      <span className="font-serif text-[10px] font-bold uppercase tracking-widest">{news.timestamp}</span>
                    </div>
                    <div className={cn("mt-auto bg-white/95 border-t-8", p.border, isPortrait ? "p-6" : "p-10")}>
                      <span className={cn("inline-block border-2 px-2 py-0.5 text-[10px] font-black uppercase mb-4 tracking-tighter", p.border, p.accentText)}>
                        {news.category}
                      </span>
                      <h3 className={cn("font-serif font-black leading-none mb-6 text-black tracking-tighter", isPortrait ? "text-3xl" : "text-5xl")}>
                        {news.title}
                      </h3>
                      <div className={cn("grid gap-8", isPortrait ? "grid-cols-1" : "grid-cols-2")}>
                        <p className={cn("font-serif leading-snug text-gray-800 first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:mt-1", isPortrait ? "text-sm first-letter:text-3xl" : "text-base first-letter:text-5xl")}>
                          {news.content}
                        </p>
                        {!isPortrait && (
                          <div className="border-l border-gray-300 pl-8 flex flex-col justify-center">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Special Feature</div>
                            <div className="text-sm font-serif italic text-gray-600 leading-relaxed">
                              "A comprehensive look into the events that shaped our world today, providing depth and context to the headlines."
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {news.template === 'social' && (
                  <div className={cn("absolute inset-0 flex items-center justify-center", isPortrait ? "p-6" : "p-12")}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <div className={cn(
                      "relative w-full bg-white flex flex-col justify-between shadow-2xl border-[12px]", 
                      p.border,
                      isPortrait ? "aspect-[4/5] p-6" : "aspect-square max-w-[500px] p-8"
                    )}>
                      <div>
                        <div className="flex justify-between items-center mb-8">
                          <span className={cn("font-black tracking-tighter uppercase", p.accentText, isPortrait ? "text-xl" : "text-2xl")}>NEWS</span>
                          <div className="flex gap-1">
                            {[1,2,3].map(i => <div key={i} className={cn("w-1.5 h-1.5 rounded-full", p.primary)} />)}
                          </div>
                        </div>
                        <h3 className={cn("text-black font-black leading-tight uppercase mb-6 tracking-tighter", isPortrait ? "text-2xl" : "text-4xl")}>
                          {news.title}
                        </h3>
                      </div>
                      <div>
                        <p className={cn("text-gray-600 font-bold leading-tight mb-8 border-l-4 pl-4", p.border, isPortrait ? "text-sm" : "text-lg")}>
                          {news.content}
                        </p>
                        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", p.accentText)}>{news.category}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase">{news.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {news.template === 'minimal' && (
                  <div className={cn("absolute inset-0 flex flex-col justify-end", isPortrait ? "p-8" : "p-12")}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="relative space-y-2">
                      <div className="flex items-center gap-3 text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                        <span>{news.category}</span>
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                        <span>{news.timestamp}</span>
                      </div>
                      <h3 className={cn("text-white font-light leading-none tracking-tighter max-w-3xl", isPortrait ? "text-4xl" : "text-6xl")}>
                        {news.title}
                      </h3>
                      <div className={cn("h-px bg-white/20 my-6", isPortrait ? "w-20" : "w-32")} />
                      <p className={cn("text-white/70 font-light leading-relaxed max-w-xl", isPortrait ? "text-base" : "text-lg")}>
                        {news.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg mt-0.5">
                <RefreshCw className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900">Mẹo nhỏ</h4>
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  Sử dụng ảnh có độ phân giải cao và tiêu đề ngắn gọn để có kết quả tốt nhất. Bạn có thể thay đổi template bất cứ lúc nào để xem phong cách nào phù hợp nhất.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-gray-200 py-10 text-center text-gray-400 text-sm">
        <p>© 2026 NewsGen Pro. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 font-medium">
          <a href="#" className="hover:text-blue-600 transition-colors">Hướng dẫn</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Chính sách</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Liên hệ</a>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
      `}} />
    </div>
  );
}
