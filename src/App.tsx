import { useState, useRef, useEffect, useDeferredValue } from 'react';
import * as htmlToImage from 'html-to-image';
import { Download, X, Copy, Check, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start sm:items-center justify-between p-5 md:p-6 text-left focus:outline-none group"
      >
        <span className="font-bold text-lg text-zinc-800 flex items-start gap-4 group-hover:text-black transition-colors pr-6">
          <span className="text-zinc-300 font-medium select-none">Q.</span>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 bg-zinc-50 p-2 rounded-full group-hover:bg-zinc-100 transition-colors mt-1 sm:mt-0"
        >
          <ChevronDown className="text-zinc-500" size={18} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 px-5 md:px-6 text-[15px] font-medium leading-relaxed text-zinc-600 pl-12 md:pl-14">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function App() {
  const [text, setText] = useState('brat');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(12); 
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [visits, setVisits] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  
  const [blurLevel, setBlurLevel] = useState(1.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const deferredFontSize = useDeferredValue(fontSize);
  const deferredBgColor = useDeferredValue(bgColor);
  const deferredText = useDeferredValue(text);
  const deferredBlurLevel = useDeferredValue(blurLevel);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('https://api.counterapi.dev/v1/brat-generator-app/visits/up')
      .then(res => res.json())
      .then(data => setVisits(data.count))
      .catch(err => console.error("Counter API failed", err));
  }, []);

  const generateBlob = async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    setIsGenerating(true);
    
    // Slight delay to ensure DOM is fully repainted before capturing
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const options = {
        pixelRatio: 4, 
        backgroundColor: deferredBgColor,
        style: {
          transform: 'scale(1)', // Neutralize any external transform that might mess up sizing
          borderRadius: '0px'
        }
      };

      let blob: Blob | null;
      if (format === 'jpg') {
        blob = await htmlToImage.toBlob(canvasRef.current, { ...options, type: 'image/jpeg' });
      } else {
        blob = await htmlToImage.toBlob(canvasRef.current, options);
      }
      
      setIsGenerating(false);
      return blob;
    } catch (err) {
      console.error('Failed to generate image', err);
      setIsGenerating(false);
      return null;
    }
  };

  const handleDownload = async () => {
    const blob = await generateBlob();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `brat.${format}`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleCopy = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error("Failed to generate image blob");

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image', err);
      alert('Fitur "Copy" gagal. Browser ini mungkin tidak mendukung akses langsung ke memori (Clipboard API). Silakan unduh gambar secara manual.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900 selection:bg-black selection:text-white relative overflow-x-hidden">
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-5 md:px-12 flex justify-between items-center sticky top-0 z-40"
      >
        <div className="font-bold text-xl tracking-tighter">brat generator</div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-black transition">Home</a>
          <a href="#faq" className="hover:text-black transition">FAQ</a>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-8 space-y-10 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 w-full"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Brat Generator</h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base px-2">Create your own iconic Brat album cover. Customize styles and download high-quality images instantly.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
        >
          
          {/* Canvas Preview */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center lg:sticky lg:top-28 w-full max-w-sm mx-auto lg:max-w-md">
            <div className="w-full aspect-square shadow-xl rounded-sm transition-colors border border-gray-200/50 relative overflow-hidden">
              <div 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden"
                style={{ backgroundColor: deferredBgColor }}
              >
                <div 
                  data-text-el
                  className="text-center px-4 font-medium w-full"
                  style={{
                    color: '#000000',
                    fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif',
                    fontSize: `min(${deferredFontSize}vw, ${deferredFontSize * 5.5}px)`,
                    lineHeight: '0.85',
                    letterSpacing: '-0.05em',
                    transform: 'scaleY(1.15)',
                    filter: `blur(${deferredBlurLevel}px)`,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {deferredText.toLowerCase()}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div variants={itemVariants} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col space-y-6 w-full max-w-lg mx-auto lg:max-w-full">
            <div className="space-y-5 lg:space-y-6">
              <h2 className="font-semibold text-lg border-b border-gray-100 pb-2">Styles & Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brat Title</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none min-h-[90px] sm:min-h-[120px]"
                  placeholder="type anything here..."
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shrink-0 block"
                  />
                  <div className="flex-1 flex items-center justify-center px-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 font-mono text-sm uppercase min-w-[100px]">
                    {bgColor}
                  </div>
                  <button 
                    onClick={() => setBgColor('#8ACE00')} 
                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Brat Green
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                  <span>Text Size</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="0.5"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-black cursor-grab active:cursor-grabbing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                  <span>Blur Level</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={blurLevel}
                  onChange={(e) => setBlurLevel(Number(e.target.value))}
                  className="w-full accent-black cursor-grab active:cursor-grabbing"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Download Format</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer group bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <input 
                      type="radio" 
                      name="format" 
                      value="png" 
                      checked={format === 'png'} 
                      onChange={() => setFormat('png')} 
                      className="w-4 h-4 text-black focus:ring-black accent-black"
                    />
                    <span className="text-sm font-medium">PNG (High Quality)</span>
                  </label>
                  
                  <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer group bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                    <input 
                      type="radio" 
                      name="format" 
                      value="jpg" 
                      checked={format === 'jpg'} 
                      onChange={() => setFormat('jpg')} 
                      className="w-4 h-4 text-black focus:ring-black accent-black"
                    />
                    <span className="text-sm font-medium">JPG (Smaller Size)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={!isGenerating ? { scale: 1.01 } : {}}
                  whileTap={!isGenerating ? { scale: 0.98 } : {}}
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white font-semibold py-4 px-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                  {isGenerating ? 'Generating...' : `Download ${format.toUpperCase()}`}
                </motion.button>

                <motion.button
                  whileHover={!isGenerating ? { scale: 1.01 } : {}}
                  whileTap={!isGenerating ? { scale: 0.98 } : {}}
                  onClick={handleCopy}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 bg-white text-black border border-gray-200 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy Image to Clipboard"
                >
                  {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* FAQ Section */}
      <motion.section 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariants}
        id="faq" 
        className="w-full bg-zinc-100 text-zinc-900 py-16 md:py-24 px-6 md:px-12 flex justify-center mt-8 border-t border-zinc-200 relative overflow-hidden"
      >
        <div className="max-w-4xl w-full relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center tracking-tight">FAQ About Brat Generator</h2>
          <div className="flex flex-col space-y-4">
            
            <FaqItem 
              question="What is this site?" 
              answer='It&apos;s a fast, easy tool intended to let you make your own covers that look identical to the "Brat" album. Just type your word and save the image.'
            />

            <FaqItem 
              question="How do I make my own cover?" 
              answer="Simply type what you want in the input box, experiment with the size and background color, and click download. It immediately saves to your device."
            />

            <FaqItem 
              question="Is the generator free?" 
              answer="Absolutely! Generating and downloading these aesthetic pictures is 100% free with no limits."
            />

            <FaqItem 
              question="Can I change the background color?" 
              answer="Yes you can. While the iconic neon green is standard, our tool provides a color picker so you can make it white, black, or whatever you want."
            />

          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-black pt-12 pb-8 px-6 md:px-12 flex flex-col items-center text-zinc-400">
        <div className="max-w-4xl w-full flex flex-col md:flex-row justify-between gap-10 mb-10">
          <div className="space-y-4 max-w-xs md:max-w-sm w-full">
            <h4 className="text-white font-bold text-xl tracking-tight">brat generator</h4>
            <p className="text-sm leading-relaxed">
              Create the iconic Charli XCX Brat album cover instantly. High quality and absolutely free.
            </p>
          </div>
          
          <div className="flex gap-16 md:gap-12 w-full md:w-auto">
            <div className="space-y-4 flex-1 md:flex-none">
              <h4 className="text-white font-semibold text-sm tracking-wide">Navigation</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Home</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div className="space-y-4 flex-1 md:flex-none">
              <h4 className="text-white font-semibold text-sm tracking-wide">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition text-left">Privacy Policy</button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('terms')} className="hover:text-white transition text-left">Terms of Service</button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-between border-t border-zinc-800 pt-8 gap-4 text-sm text-center md:text-left">
          <p>
            Made by <a href="https://x.com/recausze" target="_blank" rel="noreferrer" className="text-white font-medium hover:underline">Keith</a>.
          </p>
          {visits !== null && (
            <div className="flex items-center gap-2 justify-center w-full md:w-auto mt-4 md:mt-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>{visits.toLocaleString()} Visitors</span>
            </div>
          )}
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" 
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 relative shadow-2xl overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 pr-8">
                {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              
              <div className="prose prose-sm md:prose-base text-gray-600 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {activeModal === 'privacy' ? (
                  <>
                    <p className="font-medium text-black">Last Updated: {new Date().toLocaleDateString()}</p>
                    <p>Welcome to Brat Generator. We respect your privacy and are committed to protecting it. This minimal Privacy Policy explains our practices.</p>
                    <h3 className="text-black font-semibold mt-6 mb-2">1. Information We Collect</h3>
                    <p>We do not collect, store, or process any personal data, images, or text that you input into the generator. Everything stays securely on your local device.</p>
                    <h3 className="text-black font-semibold mt-6 mb-2">2. Third-Party Services</h3>
                    <p>We use a simple anonymous visitor counter (CounterAPI) to keep track of total hits to the website. This does not track personal identifiers.</p>
                    <h3 className="text-black font-semibold mt-6 mb-2">3. Local Storage</h3>
                    <p>Any images generated are downloaded directly through your browser's native API and are never uploaded to our servers.</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-black">Last Updated: {new Date().toLocaleDateString()}</p>
                    <p>By using, predicting, or viewing the Brat Generator, you agree to these simple terms.</p>
                    <h3 className="text-black font-semibold mt-6 mb-2">1. Use of the Tool</h3>
                    <p>This is a fan-made tool intended for personal, non-commercial use to generate transformative parodies. Users are strictly responsible for whatever text they choose to generate on the canvas.</p>
                    <h3 className="text-black font-semibold mt-6 mb-2">2. Disclaimer of Liability</h3>
                    <p>We do not claim ownership of the "Brat" typography or aesthetic, which is the property of Charli XCX and Atlantic Records. It is maintained strictly as an homage. The project is provided "as is" without warranty of any kind.</p>
                  </>
                )}
              </div>
              
              <button 
                onClick={() => setActiveModal(null)}
                className="mt-8 w-full bg-black text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 transition active:scale-[0.98]"
              >
                Understood & Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
