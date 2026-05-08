import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Image as ImageIcon, Upload, X, Loader2, MessageSquare, Briefcase } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useSearchByText } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

type SearchMode = 'text' | 'image' | 'describe' | 'service';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function apiPost(path: string, body: object) {
  const res = await fetch(`${BASE}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Request failed');
  }
  return res.json();
}

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const { t, language, setSearchResults, setUploadedImageUrl } = useAppContext();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<SearchMode>('text');
  const [query, setQuery] = useState('');
  const [description, setDescription] = useState('');
  const [serviceQuery, setServiceQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: searchByText, isPending: isSearchingText } = useSearchByText();
  const isPending = isLoading || isSearchingText;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setUploadedImageUrl(url);
      setMode('image');
      setError(null);
    }
  }, [setUploadedImageUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
    disabled: isPending,
  });

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isPending) return;
    setError(null);
    try {
      const results = await searchByText({ data: { query: query.trim(), language } });
      setSearchResults(results);
      setUploadedImageUrl(null);
      setLocation('/results');
    } catch {
      setError('Search failed. Please try again.');
    }
  };

  const handleImageSearch = async () => {
    if (!imageFile || isPending) return;
    setError(null);
    setIsLoading(true);
    try {
      const base64 = await convertToBase64(imageFile);
      const results = await apiPost('/search/analyze', { imageBase64: base64, language });
      setSearchResults(results);
      setLocation('/results');
    } catch {
      setError('Image analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescribeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isPending) return;
    setError(null);
    setIsLoading(true);
    try {
      const results = await apiPost('/search/describe', { description: description.trim(), language });
      setSearchResults(results);
      setUploadedImageUrl(null);
      setLocation('/results');
    } catch {
      setError('Could not process description. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceQuery.trim() || isPending) return;
    setError(null);
    setIsLoading(true);
    try {
      const results = await apiPost('/search/service', { query: serviceQuery.trim(), language });
      setSearchResults(results);
      setUploadedImageUrl(null);
      setLocation('/results');
    } catch {
      setError('Service search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const modes: { key: SearchMode; label: string; icon: React.ReactNode }[] = [
    { key: 'text', label: t('searchModeText'), icon: <Search className="w-4 h-4" /> },
    { key: 'image', label: t('searchModeImage'), icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'describe', label: t('searchModeDescribe'), icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'service', label: t('searchModeService'), icon: <Briefcase className="w-4 h-4" /> },
  ];

  return (
    <div className={cn("w-full max-w-3xl mx-auto space-y-6", compact && "max-w-2xl")}>
      {/* Mode tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3">
        {modes.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
              mode === key
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Search inputs */}
      <AnimatePresence mode="wait">
        {mode === 'text' && (
          <motion.form key="text" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} onSubmit={handleTextSearch} className="relative group">
            <div className="absolute inset-y-0 start-0 ps-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="block w-full rounded-2xl border-2 border-white/10 bg-card/80 backdrop-blur-xl py-5 ps-16 pe-6 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl disabled:opacity-50"
              disabled={isPending}
            />
            <div className="absolute inset-y-0 end-0 pe-4 flex items-center">
              <button type="submit" disabled={!query.trim() || isPending} className="gold-gradient-bg px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </motion.form>
        )}

        {mode === 'describe' && (
          <motion.form key="describe" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} onSubmit={handleDescribeSearch} className="space-y-4">
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('describeSearchPlaceholder')}
                rows={4}
                disabled={isPending}
                className="block w-full rounded-2xl border-2 border-white/10 bg-card/80 backdrop-blur-xl p-6 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl resize-none disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!description.trim() || isPending}
              className="w-full gold-gradient-bg py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <MessageSquare className="w-6 h-6" />}
              {t('describeSearchBtn')}
            </button>
          </motion.form>
        )}

        {mode === 'service' && (
          <motion.form key="service" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} onSubmit={handleServiceSearch} className="relative group">
            <div className="absolute inset-y-0 start-0 ps-6 flex items-center pointer-events-none">
              <Briefcase className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
              placeholder="Logo design, video editing, translation..."
              className="block w-full rounded-2xl border-2 border-white/10 bg-card/80 backdrop-blur-xl py-5 ps-16 pe-6 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl disabled:opacity-50"
              disabled={isPending}
            />
            <div className="absolute inset-y-0 end-0 pe-4 flex items-center">
              <button type="submit" disabled={!serviceQuery.trim() || isPending} className="gold-gradient-bg px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </motion.form>
        )}

        {mode === 'image' && (
          <motion.div key="image" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="rounded-3xl p-2 relative overflow-hidden bg-card/60 backdrop-blur-xl border-2 border-white/10">
            {!imagePreview ? (
              <div {...getRootProps()} className={cn("border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300", isDragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/30 hover:bg-white/5", isPending && "opacity-50 cursor-not-allowed pointer-events-none")}>
                <input {...getInputProps()} />
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <p className="text-xl font-medium text-foreground mb-2">{t('uploadImage')}</p>
                <p className="text-muted-foreground">{t('dragDrop')}</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-video flex items-center justify-center group">
                <img src={imagePreview} alt="Upload preview" className={cn("max-w-full max-h-[380px] object-contain transition-all duration-500", isPending && "opacity-30 scale-95 blur-sm")} />
                {!isPending && (
                  <button onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); setUploadedImageUrl(null); }} className="absolute top-4 end-4 p-2 bg-black/50 hover:bg-destructive rounded-full text-white backdrop-blur-md transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                  {!isPending && (
                    <button onClick={handleImageSearch} className="gold-gradient-bg px-8 py-4 rounded-xl font-bold text-lg shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform">
                      <Search className="w-6 h-6" /> {t('searchModeImage')}
                    </button>
                  )}
                </div>
                {isPending && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <span className="text-lg font-medium">{t('analyzing')}</span>
                  </div>
                )}
              </div>
            )}
            {imagePreview && !isPending && (
              <div className="p-4 xl:hidden">
                <button onClick={handleImageSearch} className="gold-gradient-bg px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 w-full justify-center">
                  <Search className="w-5 h-5" /> {t('searchModeImage')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-destructive font-medium bg-destructive/10 py-3 rounded-xl border border-destructive/20">
          {error}
        </motion.div>
      )}

      {isPending && mode !== 'image' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center gap-3 text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium text-lg">{t('searching')}</span>
        </motion.div>
      )}
    </div>
  );
}
