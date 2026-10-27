import React, { useState, useEffect } from 'react';
import { Question } from '../types/game';
import { Users, PhoneCall, X, BarChart3, CheckCircle, Clock } from 'lucide-react';

interface AudiencePollModalProps {
  question: Question;
  eliminatedIndices: number[];
  onClose: () => void;
}

export const AudiencePollModal: React.FC<AudiencePollModalProps> = ({
  question,
  eliminatedIndices,
  onClose,
}) => {
  const [percentages, setPercentages] = useState<number[]>([0, 0, 0, 0]);
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    // Generate intelligent simulation weighted heavily to correct answer
    // For easy questions: ~75-85% correct
    // For medium: ~55-70% correct
    // For hard: ~40-55% correct
    let correctWeight = question.level <= 5 ? 78 : question.level <= 10 ? 62 : 48;
    const remainingWeight = 100 - correctWeight;

    const availableIndices = [0, 1, 2, 3].filter(i => !eliminatedIndices.includes(i));
    const wrongIndices = availableIndices.filter(i => i !== question.correctIndex);

    const weights = [0, 0, 0, 0];
    weights[question.correctIndex] = correctWeight;

    // Distribute remaining
    if (wrongIndices.length > 0) {
      let rest = remainingWeight;
      wrongIndices.forEach((idx, i) => {
        if (i === wrongIndices.length - 1) {
          weights[idx] = rest;
        } else {
          const share = Math.floor(Math.random() * (rest - 5));
          weights[idx] = share;
          rest -= share;
        }
      });
    }

    // Animate up
    const timeout = setTimeout(() => {
      setPercentages(weights);
      setIsCalculated(true);
    }, 400);

    return () => clearTimeout(timeout);
  }, [question, eliminatedIndices]);

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/50 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-game text-lg font-bold text-white tracking-wide uppercase">
              Kết Quả Bình Chọn Của Khán Giả
            </h3>
            <p className="text-xs text-slate-400">
              Tổng hợp ý kiến biểu quyết từ các bạn học sinh trong lớp
            </p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 mb-5">
          <div className="grid grid-cols-4 gap-4 h-48 items-end">
            {labels.map((lbl, idx) => {
              const pct = percentages[idx];
              const isEliminated = eliminatedIndices.includes(idx);
              const isHighest = pct === Math.max(...percentages) && pct > 0;

              return (
                <div key={lbl} className="flex flex-col items-center h-full justify-end">
                  <div className="text-xs font-bold font-game mb-1 text-slate-300">
                    {isEliminated ? '—' : `${pct}%`}
                  </div>

                  {/* Vertical bar */}
                  <div className="w-full bg-slate-900 rounded-t-lg h-36 flex items-end p-1 border border-slate-800">
                    <div
                      style={{ height: `${isEliminated ? 0 : pct}%` }}
                      className={`w-full rounded-t transition-all duration-1000 ease-out ${
                        isEliminated
                          ? 'bg-transparent'
                          : isHighest
                          ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-amber-400 shadow-lg shadow-indigo-500/30'
                          : 'bg-gradient-to-t from-slate-700 to-indigo-500/60'
                      }`}
                    />
                  </div>

                  <div className={`mt-2 font-game font-bold text-sm ${isHighest ? 'text-amber-400' : 'text-slate-400'}`}>
                    {lbl}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Ý kiến lớp học chỉ mang tính chất tham khảo.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-game font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-indigo-600/30"
          >
            Đã Tiếp Nhận Ý Kiến
          </button>
        </div>
      </div>
    </div>
  );
};

interface CallAdvisorModalProps {
  question: Question;
  eliminatedIndices: number[];
  onClose: () => void;
}

export const CallAdvisorModal: React.FC<CallAdvisorModalProps> = ({
  question,
  eliminatedIndices,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [callState, setCallState] = useState<'connecting' | 'talking' | 'done'>('connecting');
  const [advisorName] = useState('Thầy Nguyễn Khắc Hiếu (Tổ trưởng Chuyên môn)');

  const labels = ['A', 'B', 'C', 'D'];
  const correctLetter = labels[question.correctIndex];
  const correctText = question.options[question.correctIndex];

  useEffect(() => {
    // Ring for 1.5 seconds, then talk
    const ringTimeout = setTimeout(() => {
      setCallState('talking');
    }, 1500);

    return () => clearTimeout(ringTimeout);
  }, []);

  useEffect(() => {
    if (callState !== 'talking') return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCallState('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-game text-lg font-bold text-white tracking-wide uppercase">
              Gọi Điện Cho Thầy Cô Cố Vấn
            </h3>
            <div className="text-xs text-emerald-400 font-medium">
              {advisorName}
            </div>
          </div>
        </div>

        {/* Call status & timer */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${callState === 'talking' ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold text-slate-300">
                {callState === 'connecting'
                  ? 'Đang đổ chuông tút tút...'
                  : callState === 'talking'
                  ? 'Cuộc gọi đang diễn ra'
                  : 'Hết thời gian tư vấn (30 giây)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-game text-sm font-bold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}</span>
            </div>
          </div>

          {/* Conversation speech bubble */}
          {callState === 'connecting' ? (
            <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
              Đang kết nối đến điện thoại của Thầy Cô...
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-emerald-400 block mb-1">
                  Thầy Cô trả lời:
                </span>
                "Chào em! Câu hỏi này thầy/cô đã xem qua rồi. Về chủ đề{' '}
                <strong className="text-white">"{question.category}"</strong>, thầy/cô khá chắc chắn đáp án đúng là phương án{' '}
                <span className="text-amber-400 font-black font-game text-sm px-1 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded inline-block">
                  {correctLetter}: {correctText}
                </span>
                . Em hãy tự tin xem xét phương án này nhé!"
              </div>

              {question.explanation && (
                <div className="text-[11px] text-slate-400 italic">
                  💡 Ghi chú: {question.explanation}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-game font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Cảm Ơn Thầy Cô & Trở Lại Trò Chơi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
