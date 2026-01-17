import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, FileText } from 'lucide-react';

// --- Components ---

const MusicWidget = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initial volume
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, []);

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback failed", err);
        setIsPlaying(false);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="w-full bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-x border-b border-white/[0.08] rounded-b-xl backdrop-blur-sm overflow-hidden">
      <audio 
        ref={audioRef} 
        src="./profilemusic.mp3" 
        loop 
        onEnded={handleEnded}
      />
      
      <div className="w-full p-3 flex gap-3 items-center justify-between">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex gap-2 items-center">
            <div 
              className={`w-1.5 h-1.5 rounded-full bg-[#333] shrink-0 transition-colors duration-300 ${isPlaying ? 'bg-white shadow-[0_0_8px_#fff] animate-pulse-dot' : ''}`}
              aria-hidden="true"
            />
            <span className="text-[0.6rem] opacity-45 lowercase">now playing</span>
          </div>
          <p className="text-[0.82rem] opacity-75 m-0 lowercase whitespace-nowrap overflow-hidden text-ellipsis">
            profile-music
          </p>
        </div>

        <button 
          onClick={togglePlayback}
          className="w-10 h-10 min-w-[40px] rounded-full border-[1.5px] border-white/15 bg-white/[0.08] flex items-center justify-center text-white cursor-pointer transition-all duration-200 hover:bg-white/15 active:scale-90"
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? (
            <Pause size={14} fill="currentColor" />
          ) : (
            <Play size={14} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};

const NotepadModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [content, setContent] = useState<string>("loading...");

  useEffect(() => {
    if (isOpen) {
      // Fetch the content from notepad.txt
      fetch('./notepad.txt')
        .then(res => {
          if (!res.ok) throw new Error("File not found");
          return res.text();
        })
        .then(text => setContent(text))
        .catch(err => {
          console.error(err);
          setContent("could not load notepad content. please ensure 'notepad.txt' exists in the root directory.");
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-sm font-medium opacity-80 lowercase flex items-center gap-2">
            <FileText size={14} className="opacity-50" />
            notepad
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors opacity-60 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto custom-scrollbar whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/70">
          {content}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [showNotepad, setShowNotepad] = useState(false);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[340px] mx-auto z-10">
      
      {/* Fog Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)] blur-[50px] z-0 pointer-events-none" />

      {/* Profile Card */}
      <div className="w-full max-w-[300px] z-10">
        {/* Header */}
        <div className="w-full min-h-[88px] flex gap-3 items-center p-3 rounded-t-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm transition-colors duration-200">
          <img 
            src="./avatar.png" 
            alt="radit" 
            className="w-[76px] h-[76px] rounded-md object-cover grayscale transition-all duration-200 hover:grayscale-0"
            onError={(e) => {
              // Fallback if image fails
              (e.target as HTMLImageElement).src = 'https://picsum.photos/76/76';
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="m-0 text-[1.05rem] tracking-wider lowercase text-white animate-subtle-glow">
              radit
            </h1>
            <p className="mt-1 text-[0.7rem] opacity-45 lowercase">
              description iwguess
            </p>
          </div>
        </div>

        {/* Music Player */}
        <MusicWidget />
      </div>

      {/* About Section */}
      <div className="mt-5 w-full max-w-[300px] p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] text-center backdrop-blur-sm z-10">
        <h2 className="text-[0.9rem] mb-2 opacity-80 font-medium lowercase">about me</h2>
        <p className="text-[0.75rem] m-0 opacity-50 leading-relaxed lowercase">
          i keep wondering what it felt like to become energetic
        </p>
      </div>

      {/* Notepad Button */}
      <button 
        onClick={() => setShowNotepad(true)}
        className="mt-3 w-full max-w-[300px] py-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-transparent hover:bg-white/[0.03] transition-all duration-200 group flex items-center justify-center gap-2 z-10 cursor-pointer"
      >
        <FileText size={14} className="opacity-40 group-hover:opacity-70 transition-opacity" />
        <span className="text-[0.75rem] opacity-40 group-hover:opacity-70 lowercase transition-opacity">
          notepad
        </span>
      </button>

      {/* Bottom Left Image */}
      <img 
        src="something.webp" 
        alt="" 
        className="fixed bottom-5 left-5 w-[60px] h-auto z-[100] border-none pointer-events-none opacity-80 transition-opacity duration-300 hover:opacity-100 max-[480px]:w-[45px] max-[480px]:bottom-[15px] max-[480px]:left-[15px]"
        aria-hidden="true"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* Notepad Modal Overlay */}
      <NotepadModal isOpen={showNotepad} onClose={() => setShowNotepad(false)} />

    </div>
  );
}
