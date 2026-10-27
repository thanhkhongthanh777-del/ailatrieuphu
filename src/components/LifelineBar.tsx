import React from 'react';
import { LifelineState } from '../types/game';
import { sounds } from '../utils/audio';
import { Users, PhoneCall, Shuffle, Percent, LogOut } from 'lucide-react';

interface LifelineBarProps {
  lifelines: LifelineState;
  onUseFiftyFifty: () => void;
  onUseAskAudience: () => void;
  onUseCallAdvisor: () => void;
  onUseSwitchQuestion: () => void;
  onWalkAway: () => void;
  disabled: boolean;
  canWalkAway: boolean;
}

export const LifelineBar: React.FC<LifelineBarProps> = ({
  lifelines,
  onUseFiftyFifty,
  onUseAskAudience,
  onUseCallAdvisor,
  onUseSwitchQuestion,
  onWalkAway,
  disabled,
  canWalkAway,
}) => {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* 50:50 Medallion */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            if (!lifelines.fiftyFifty.used && !disabled) {
              sounds.playLifeline();
              onUseFiftyFifty();
            }
          }}
          disabled={lifelines.fiftyFifty.used || disabled}
          className="altp-lifeline-btn group cursor-pointer"
          title="50:50 - Loại bỏ 2 phương án sai"
        >
          <span className="font-game font-black text-xs text-amber-300 tracking-tighter drop-shadow-sm group-hover:scale-110 transition-transform">
            50:50
          </span>
          {lifelines.fiftyFifty.used && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-1 bg-rose-600 rounded-full rotate-45 shadow-sm shadow-black" />
            </div>
          )}
        </button>
        <span className="text-[10px] text-slate-400 font-game mt-1 hidden sm:block">50:50</span>
      </div>

      {/* Hỏi khán giả / Cả lớp Medallion */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            if (!lifelines.askAudience.used && !disabled) {
              sounds.playLifeline();
              onUseAskAudience();
            }
          }}
          disabled={lifelines.askAudience.used || disabled}
          className="altp-lifeline-btn group cursor-pointer"
          title="Hỏi ý kiến cả lớp / Khán giả"
        >
          <Users className="w-5 h-5 text-indigo-300 drop-shadow-sm group-hover:scale-110 transition-transform" />
          {lifelines.askAudience.used && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-1 bg-rose-600 rounded-full rotate-45 shadow-sm shadow-black" />
            </div>
          )}
        </button>
        <span className="text-[10px] text-slate-400 font-game mt-1 hidden sm:block">Khán Giả</span>
      </div>

      {/* Gọi điện thoại cho Thầy Cô Medallion */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            if (!lifelines.callAdvisor.used && !disabled) {
              sounds.playLifeline();
              onUseCallAdvisor();
            }
          }}
          disabled={lifelines.callAdvisor.used || disabled}
          className="altp-lifeline-btn group cursor-pointer"
          title="Gọi điện cho Thầy Cô cố vấn"
        >
          <PhoneCall className="w-5 h-5 text-emerald-300 drop-shadow-sm group-hover:scale-110 transition-transform" />
          {lifelines.callAdvisor.used && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-1 bg-rose-600 rounded-full rotate-45 shadow-sm shadow-black" />
            </div>
          )}
        </button>
        <span className="text-[10px] text-slate-400 font-game mt-1 hidden sm:block">Gọi Thầy Cô</span>
      </div>

      {/* Đổi câu hỏi Medallion */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => {
            if (!lifelines.switchQuestion.used && !disabled) {
              sounds.playLifeline();
              onUseSwitchQuestion();
            }
          }}
          disabled={lifelines.switchQuestion.used || disabled}
          className="altp-lifeline-btn group cursor-pointer"
          title="Đổi câu hỏi khác cùng cấp độ"
        >
          <Shuffle className="w-5 h-5 text-amber-300 drop-shadow-sm group-hover:scale-110 transition-transform" />
          {lifelines.switchQuestion.used && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-1 bg-rose-600 rounded-full rotate-45 shadow-sm shadow-black" />
            </div>
          )}
        </button>
        <span className="text-[10px] text-slate-400 font-game mt-1 hidden sm:block">Đổi Câu</span>
      </div>

      {/* Dừng cuộc chơi */}
      {canWalkAway && (
        <button
          onClick={onWalkAway}
          disabled={disabled}
          className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-game text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 transition-all active:scale-95 shadow-md shadow-rose-950/40"
          title="Bảo toàn giải thưởng và dừng cuộc chơi"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Dừng Cuộc Chơi</span>
        </button>
      )}
    </div>
  );
};
