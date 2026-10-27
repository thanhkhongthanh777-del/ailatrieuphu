import React, { useEffect } from 'react';
import { Student, PRIZE_LADDER } from '../types/game';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Shuffle, Sparkles, X } from 'lucide-react';

interface GameResultModalProps {
  type: 'victory' | 'walkaway' | 'gameover';
  student: Student;
  finalLevel: number;
  onContinueWithNewStudent: () => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  type,
  student,
  finalLevel,
  onContinueWithNewStudent,
  onResetGame,
  onClose,
}) => {
  // Calculate guaranteed safety prize for gameover
  const getGuaranteedPrize = () => {
    if (type === 'victory') return '150.000.000 đ';
    if (type === 'walkaway') {
      const p = PRIZE_LADDER.find(l => l.level === finalLevel);
      return p ? p.amount : '0 đ';
    }
    // GameOver fallback
    if (finalLevel >= 10) return '22.000.000 đ';
    if (finalLevel >= 5) return '2.000.000 đ';
    return '0 đ';
  };

  const prizeAmount = getGuaranteedPrize();

  useEffect(() => {
    if (type === 'victory') {
      sounds.playGrandVictory();
      const end = Date.now() + 3000;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    } else if (type === 'walkaway') {
      sounds.playCorrect(true);
    }
  }, [type]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Emblem */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/20 to-amber-500/30 border-2 border-amber-400/50 flex items-center justify-center shadow-xl shadow-amber-500/20">
          {type === 'victory' ? (
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          ) : (
            <Award className="w-10 h-10 text-amber-400" />
          )}
        </div>

        {/* Title */}
        <h2 className="font-game font-black text-2xl sm:text-3xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 mb-2">
          {type === 'victory'
            ? 'TRIỆU PHÚ XUẤT SẮC!'
            : type === 'walkaway'
            ? 'BẢO TOÀN THÀNH CÔNG!'
            : 'KẾT THÚC LƯỢT CHƠI'}
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-slate-300 mb-5">
          {type === 'victory'
            ? `Chúc mừng bạn ${student.name} đã xuất sắc vượt qua cả 15 câu hỏi và trở thành Triệu Phú!`
            : type === 'walkaway'
            ? `Bạn ${student.name} đã chủ động dừng cuộc chơi tại câu số ${finalLevel} và giữ vững giải thưởng.`
            : `Rất tiếc cho bạn ${student.name}! Bạn đã thi đấu hết mình tại câu số ${finalLevel}.`}
        </p>

        {/* Prize Box */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 mb-6 shadow-inner">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
            Số tiền thưởng đạt được:
          </div>
          <div className="font-game font-black text-3xl sm:text-4xl text-amber-400 tracking-wider">
            {prizeAmount}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thành tích đã được lưu vào bảng điểm học sinh</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onContinueWithNewStudent}
            className="flex-1 py-3 px-4 rounded-xl font-game font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            <span>Quay Học Sinh Tiếp Theo</span>
          </button>

          <button
            onClick={onResetGame}
            className="py-3 px-4 rounded-xl font-game font-semibold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Chơi Ván Mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};
