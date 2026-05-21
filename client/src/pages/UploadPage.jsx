import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, FileText, Image, Loader2, CheckCircle, AlertCircle,
  Plane, ArrowRight, Sparkles, File
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { uploadAPI, ocrAPI } from '../api/upload';
import { itineraryAPI } from '../api/itinerary';
import toast from 'react-hot-toast';

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const FileIcon = ({ type }) => {
  if (type === 'application/pdf') return <FileText size={20} color="#ef4444" />;
  return <Image size={20} color="#6366f1" />;
};

const UploadPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stage, setStage] = useState('select'); // select | uploading | extracting | ready
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [generating, setGenerating] = useState(false);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      rejected.forEach((f) => {
        toast.error(`${f.file.name}: ${f.errors[0]?.message || 'Invalid file'}`);
      });
    }
    const newFiles = accepted.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  });

  const removeFile = (id) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const handleUploadAndExtract = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setStage('uploading');

    try {
      // Step 1: Upload files
      toast.loading('Uploading documents...', { id: 'upload' });
      const uploadRes = await uploadAPI.upload(
        files.map((f) => f.file),
        (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        }
      );

      const docs = uploadRes.data.data.documents;
      toast.success(`${docs.length} file(s) uploaded!`, { id: 'upload' });

      setStage('extracting');

      // Step 2: OCR extraction
      toast.loading('Extracting travel data with AI...', { id: 'ocr' });
      const docIds = docs.map((d) => d._id);
      const ocrRes = await ocrAPI.extractBatch(docIds);

      setUploadedDocs(
        ocrRes.data.data.results.map((r, i) => ({
          ...docs[i],
          ...r,
        }))
      );

      toast.success('Data extracted successfully!', { id: 'ocr' });
      setStage('ready');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed', { id: 'upload' });
      toast.dismiss('ocr');
      setStage('select');
    }
  };

  const handleGenerate = async () => {
    if (uploadedDocs.length === 0) return;
    setGenerating(true);

    try {
      toast.loading('Generating your AI itinerary... (this may take 30-60 seconds)', { id: 'gen', duration: 90000 });
      const res = await itineraryAPI.generate({
        documentIds: uploadedDocs.map((d) => d._id),
        additionalContext,
      });

      toast.success('Itinerary created! 🎉', { id: 'gen' });
      navigate(`/itinerary/${res.data.data.itinerary._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Generation failed. Please try again.', { id: 'gen' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: 260, padding: '2rem', maxWidth: 900 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            Upload Travel Documents
          </h1>
          <p style={{ color: '#64748b' }}>
            Upload your flight tickets, hotel reservations, visas, or any travel documents. We'll extract the details and generate your itinerary.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { id: 'select', label: '1. Select Files' },
            { id: 'uploading', label: '2. Uploading' },
            { id: 'extracting', label: '3. Extracting' },
            { id: 'ready', label: '4. Generate' },
          ].map((s, i, arr) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.875rem',
                borderRadius: 100,
                fontSize: '0.8rem',
                fontWeight: 600,
                background: stage === s.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: stage === s.id ? '#818cf8' : '#475569',
                border: `1px solid ${stage === s.id ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                transition: 'all 0.3s',
              }}>
                {s.label}
              </div>
              {i < arr.length - 1 && <ArrowRight size={14} color="#334155" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Upload Zone */}
          {(stage === 'select') && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`upload-zone ${isDragActive ? 'drag-over' : ''}`}
                style={{ padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem' }}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={{ y: isDragActive ? -10 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: isDragActive ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    transition: 'all 0.3s',
                  }}>
                    <Upload size={32} color="#6366f1" />
                  </div>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    {isDragActive ? 'Drop your files here!' : 'Drag & drop your travel documents'}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    or click to browse files
                  </p>
                  <p style={{ color: '#475569', fontSize: '0.8rem' }}>
                    Supports PDF, PNG, JPG, JPEG, WEBP — Max 10MB per file, up to 10 files
                  </p>
                </motion.div>
              </div>

              {/* File List */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '1.5rem' }}
                  >
                    <h3 style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Selected Files ({files.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {files.map((f) => (
                        <motion.div
                          key={f.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: 'var(--surface-card)',
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {f.preview ? (
                            <img src={f.preview} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileIcon type={f.file.type} />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {f.file.name}
                            </p>
                            <p style={{ color: '#475569', fontSize: '0.75rem' }}>{formatSize(f.file.size)}</p>
                          </div>
                          <button
                            onClick={() => removeFile(f.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}
                          >
                            <X size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {files.length > 0 && (
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                  onClick={handleUploadAndExtract}
                >
                  <Upload size={18} />
                  Upload & Extract Data
                  <ArrowRight size={16} />
                </button>
              )}
            </motion.div>
          )}

          {/* Uploading/Extracting Stage */}
          {(stage === 'uploading' || stage === 'extracting') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '4rem 2rem' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block', marginBottom: '2rem' }}
              >
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: '3px solid rgba(99,102,241,0.2)',
                  borderTopColor: '#6366f1',
                  borderRightColor: '#8b5cf6',
                }} />
              </motion.div>

              <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                {stage === 'uploading' ? 'Uploading Documents...' : 'Extracting Travel Data...'}
              </h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                {stage === 'uploading'
                  ? 'Securely uploading your travel documents'
                  : 'AI is reading and parsing your travel details'}
              </p>

              {stage === 'uploading' && (
                <div style={{ maxWidth: 300, margin: '0 auto' }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.5rem' }}>{uploadProgress}%</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Ready Stage */}
          {stage === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{
                padding: '1.5rem',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}>
                <CheckCircle size={20} color="#10b981" />
                <div>
                  <p style={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>Data Extracted Successfully!</p>
                  <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{uploadedDocs.length} document(s) processed</p>
                </div>
              </div>

              {/* Extracted data preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {uploadedDocs.map((doc) => (
                  <div key={doc._id} className="glass" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <FileText size={16} color="#818cf8" />
                      <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem' }}>{doc.originalName}</span>
                      <span className={`badge badge-${doc.ocrStatus === 'completed' ? 'success' : 'error'}`} style={{ marginLeft: 'auto' }}>
                        {doc.ocrStatus}
                      </span>
                    </div>
                    {doc.parsedData && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {Object.entries(doc.parsedData)
                          .filter(([k, v]) => v && k !== 'documentType' && k !== 'customFields')
                          .slice(0, 6)
                          .map(([key, value]) => (
                            <div key={key} style={{
                              padding: '0.25rem 0.625rem',
                              background: 'rgba(99,102,241,0.08)',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                            }}>
                              <span style={{ color: '#64748b' }}>{key}: </span>
                              <span style={{ color: '#c4b5fd' }}>{String(value).substring(0, 30)}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Additional context */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Additional Preferences (Optional)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="e.g., I prefer vegetarian food, budget is around $2000, interested in museums and historical sites..."
                  className="input-field"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <motion.button
                onClick={handleGenerate}
                disabled={generating}
                whileHover={{ scale: generating ? 1 : 1.02 }}
                whileTap={{ scale: generating ? 1 : 0.98 }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  opacity: generating ? 0.7 : 1,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 30px rgba(99,102,241,0.3)',
                }}
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Generating Itinerary... (30-60s)
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate AI Itinerary
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UploadPage;
