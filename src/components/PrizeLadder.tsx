import React from 'react';
import { PRIZE_LADDER } from '../types/game';
import { Award, Check, ChevronRight } from 'lucide-react';

interface PrizeLadderProps {
  currentLevel: number; // 1 to 15
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const PrizeLadder: React.FC<PrizeLadderProps> = ({
  currentLevel,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`transition-all duration-300 border-l border-slate-800/80 bg-slate-900/95 backdrop-blur-md flex flex-col ${
        isCollapsed ? 'w-0 overflow-hidden border-l-0' : 'w-64 xl:w-72'
      }`}
    >
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Award className="w-3.5 h-3.5" />
          </div>
          <span className="font-game text-xs font-bold uppercase tracking-wider text-amber-400">
            Thang Tiền Thưởng
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Câu {currentLevel}/15
        </div>
      </div>

      {/* Ladder levels */}
      <div className="flex-1 flex flex-col justify-center p-3 space-y-1 overflow-y-auto">
        {PRIZE_LADDER.map((item) => {
          const isCurrent = item.level === currentLevel;
          const isCompleted = item.level < currentLevel;
          const isMilestone = item.isMilestone;

          return (
            <div
              key={item.level}
              className={`relative flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-game transition-all ${
                isCurrent
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/30 scale-[1.03] z-10 border border-amber-300'
                  : isCompleted
                  ? 'bg-emerald-950/40 text-emerald-300/80 border border-emerald-900/30'
                  : isMilestone
                  ? 'bg-slate-800/80 text-white font-bold border border-slate-600/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Level indicator */}
              <div className="flex items-center gap-2">
                <span className={`w-5 text-right font-bold ${isCurrent ? 'text-slate-950' : isMilestone ? 'text-amber-400' : 'text-slate-500'}`}>
                  {item.level}
                </span>

                {isCurrent ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-950 fill-current animate-pulse" />
                ) : isCompleted ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${isMilestone ? 'bg-amber-400' : 'bg-slate-700'}`} />
                )}

                {isMilestone && !isCurrent && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase tracking-tighter">
                    Mốc
                  </span>
                )}
              </div>

              {/* Amount */}
              <div className={`tracking-wider ${isCurrent ? 'text-slate-950 text-sm font-black' : isMilestone ? 'text-amber-300 font-bold' : ''}`}>
                {item.amount}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Milestones Summary Footer */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
          Mốc an toàn bảo hiểm:
        </div>
        <div className="flex justify-between text-amber-400 font-game">
          <span>Mốc 5: 2.000.000 đ</span>
          <span>Mốc 10: 22.000.000 đ</span>
        </div>
      </div>
    </aside>
  );
};
