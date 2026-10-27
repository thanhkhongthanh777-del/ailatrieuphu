import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { Volume2, VolumeX, Maximize2, Minimize2, Settings, Trophy, Sparkles, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onResetGame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onResetGame,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        {/* Diamond Gameshow Emblem */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-500 rounded-lg rotate-45 shadow-lg shadow-amber-500/20" />
          <div className="absolute inset-[2px] bg-slate-950 rounded-md rotate-45 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400 -rotate-45" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-game font-black text-lg tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 drop-shadow-sm">
              Ai Là Triệu Phú
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold uppercase tracking-wider">
              Phiên Bản Lớp Học
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Quay số ngẫu nhiên gọi học sinh lên ghế nóng trả lời câu hỏi
          </p>
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-2">
        {/* Sound toggle */}
        <button
          onClick={handleToggleSound}
          className={`p-2 rounded-xl border transition-all ${
            isMuted
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-400'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Fullscreen for classroom projector */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all hidden sm:flex"
          title="Toàn màn hình máy chiếu lớp học"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Teacher / Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all"
          title="Cài đặt câu hỏi & luật chơi"
        >
          <Settings className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Cài Đặt Lớp</span>
        </button>

        {/* Reset game */}
        <button
          onClick={onResetGame}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1"
          title="Khởi động lại lượt chơi"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Ván Mới</span>
        </button>
      </div>
    </header>
  );
};
