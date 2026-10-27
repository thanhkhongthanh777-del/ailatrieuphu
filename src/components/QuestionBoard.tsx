import React, { useState, useEffect } from 'react';
import { Question, Student, AnswerStatus, PRIZE_LADDER } from '../types/game';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  RotateCcw,
  Trophy,
  ChevronRight
} from 'lucide-react';

interface QuestionBoardProps {
  question: Question;
  currentLevel: number; // 1 to 15
  currentStudent: Student | null;
  eliminatedIndices: number[];
  timerSeconds: number;
  onAnswerCorrect: () => void;
  onAnswerWrong: () => void;
  onNextQuestion: () => void;
  onSpinRequest: () => void;
}

export const QuestionBoard: React.FC<QuestionBoardProps> = ({
  question,
  currentLevel,
  currentStudent,
  eliminatedIndices,
  timerSeconds,
  onAnswerCorrect,
  onAnswerWrong,
  onNextQuestion,
  onSpinRequest,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [status, setStatus] = useState<AnswerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  const currentPrize = PRIZE_LADDER.find(p => p.level === currentLevel);
  const nextPrize = PRIZE_LADDER.find(p => p.level === currentLevel + 1);
  const isMilestone = currentPrize?.isMilestone ?? false;

  // Reset state on new question
  useEffect(() => {
    setSelectedAnswer(null);
    setStatus('idle');
    setTimeLeft(timerSeconds);
    sounds.startTension();

    return () => {
      sounds.stopTension();
    };
  }, [question, currentLevel, timerSeconds]);

  // Countdown timer effect
  useEffect(() => {
    if (timerSeconds <= 0 || status === 'revealed' || status === 'confirmed' || !currentStudent) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerSeconds, status, currentStudent]);

  const handleTimeOut = () => {
    setStatus('revealed');
    sounds.stopTension();
    sounds.playWrong();
    onAnswerWrong();
  };

  const handleSelectOption = (idx: number) => {
    if (status === 'confirmed' || status === 'revealed' || eliminatedIndices.includes(idx)) {
      return;
    }
    sounds.playSelectOption();
    setSelectedAnswer(idx);
    setStatus('selected');
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null || status !== 'selected') return;

    setStatus('confirmed');
    sounds.playLockIn();

    // Suspense delay like TV broadcast
    setTimeout(() => {
      sounds.stopTension();
      const isCorrect = selectedAnswer === question.correctIndex;
      setStatus('revealed');

      if (isCorrect) {
        sounds.playCorrect(isMilestone);
        if (isMilestone) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
        onAnswerCorrect();
      } else {
        sounds.playWrong();
        onAnswerWrong();
      }
    }, 1500);
  };

  const letters = ['A', 'B', 'C', 'D'];
  const isAnswerCorrect = selectedAnswer === question.correctIndex;

  // If no student is picked yet, show welcoming Hot Seat banner
  if (!currentStudent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-lg p-8 sm:p-10 rounded-3xl bg-slate-950/85 border-2 border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.2)] backdrop-blur-md">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-blue-500/30 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-game text-white tracking-wide uppercase mb-3 drop-shadow">
            Sẵn Sàng Bước Lên Ghế Nóng!
          </h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Hãy bấm nút <span className="text-amber-400 font-bold uppercase font-game">Quay Số Chọn Học Sinh</span> ở cột bên trái để máy tính chọn ngẫu nhiên bạn học sinh trả lời câu hỏi!
          </p>
          <button
            onClick={onSpinRequest}
            className="w-full py-3.5 px-6 rounded-2xl font-game font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Quay Số Ngay</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 max-w-5xl mx-auto w-full relative">
      {/* Top Status Bar: Student on Hot Seat, Question Level, Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        {/* Current Student Profile on the Hot Seat */}
        <div className="flex items-center gap-3 bg-slate-950/90 border-2 border-amber-500/60 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg shadow-amber-500/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-game font-black text-base flex items-center justify-center shadow-md">
            #{currentStudent.number}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1 font-game">
              <span>Người chơi chính</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-base font-extrabold text-white font-game drop-shadow-sm">
              {currentStudent.name}
            </div>
          </div>
        </div>

        {/* Level and Prize Money Header */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-950/90 border border-slate-700 px-4 py-2 rounded-2xl text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              Cấp độ câu hỏi
            </div>
            <div className="font-game font-extrabold text-base text-white tracking-wider">
              CÂU {currentLevel} <span className="text-slate-500 font-medium">/ 15</span>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-2xl border-2 text-center transition-all ${
            isMilestone 
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20' 
              : 'bg-slate-950/90 border-blue-500/50 text-amber-400'
          }`}>
            <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center justify-center gap-1 font-game">
              <span>Trị giá câu hỏi</span>
              {isMilestone && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div className="font-game font-black text-lg sm:text-xl tracking-wider drop-shadow">
              {currentPrize?.amount}
            </div>
          </div>

          {/* Timer display */}
          {timerSeconds > 0 && (
            <div className={`px-4 py-2 rounded-2xl border-2 flex items-center gap-2 font-game font-bold text-base ${
              timeLeft <= 10
                ? 'bg-rose-950/90 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-950/90 border-slate-700 text-slate-200'
            }`}>
              <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Authentic TV Studio Question & Answers Arena */}
      <div className="relative my-auto py-2">
        {/* Category banner */}
        <div className="text-center mb-3">
          <span className="inline-block px-4 py-1 bg-blue-950/90 border-2 border-blue-400/50 rounded-full text-xs font-bold uppercase tracking-wider text-cyan-300 font-game shadow-md">
            Chủ đề: {question.category}
          </span>
        </div>

        {/* Center Question Diamond Frame with Connecting Laser Lines */}
        <div className="relative mx-auto max-w-4xl">
          {/* Connecting horizontal laser lines running across the frame */}
          <div className="hidden md:block absolute top-1/2 -left-12 -right-12 h-0.5 altp-laser-h pointer-events-none -z-1" />

          {/* Hexagonal Question Container */}
          <div className="relative altp-bevel-question bg-gradient-to-b from-blue-950 via-slate-950 to-blue-950 border-2 border-slate-400/80 p-6 sm:p-9 text-center shadow-[0_0_35px_rgba(59,130,246,0.35)]">
            {/* Corner diamond pins */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 bg-cyan-400 shadow-md shadow-cyan-400" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 bg-cyan-400 shadow-md shadow-cyan-400" />

            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-relaxed drop-shadow-md">
              {question.question}
            </h1>
          </div>
        </div>

        {/* 4 Options Grid (A, B on row 1; C, D on row 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto mt-6 relative">
          {question.options.map((option, idx) => {
            const letter = letters[idx];
            const isEliminated = eliminatedIndices.includes(idx);
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === question.correctIndex;

            let cardStyle = 'bg-slate-950/90 border-slate-600/90 text-slate-200 hover:border-amber-400 hover:bg-blue-950/70';

            if (isEliminated) {
              cardStyle = 'opacity-0 pointer-events-none';
            } else if (status === 'revealed') {
              if (isCorrect) {
                cardStyle = 'altp-correct text-white';
              } else if (isSelected) {
                cardStyle = 'altp-wrong text-white';
              } else {
                cardStyle = 'opacity-35 bg-slate-950 border-slate-800 text-slate-500';
              }
            } else if (status === 'confirmed' && isSelected) {
              cardStyle = 'bg-amber-600 border-amber-300 text-white shadow-xl shadow-amber-500/50';
            } else if (isSelected) {
              cardStyle = 'altp-selected text-white';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isEliminated || status === 'confirmed' || status === 'revealed'}
                className={`relative group altp-bevel-option p-4 sm:p-4.5 text-left transition-all duration-150 border-2 cursor-pointer flex items-center min-h-[62px] shadow-md ${cardStyle}`}
              >
                {/* Diamond Letter Badge */}
                <span className={`w-8 font-game text-base sm:text-lg font-bold shrink-0 ${
                  isSelected ? 'text-amber-200' : 'text-amber-400 group-hover:text-yellow-300'
                }`}>
                  {letter}:
                </span>

                {/* Option Text */}
                <span className="text-sm sm:text-base font-medium flex-1 tracking-wide leading-snug">
                  {option}
                </span>

                {/* Status indicators */}
                {status === 'revealed' && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 ml-2 animate-bounce" />
                )}
                {status === 'revealed' && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-white shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Lock-in Confirmation Bar */}
        {status === 'selected' && (
          <div className="mt-5 max-w-lg mx-auto p-4 bg-slate-950 border-2 border-amber-500/70 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="text-xs text-amber-300 font-semibold">
              Bạn có chắc chắn đây là đáp án cuối cùng?
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedAnswer(null);
                  setStatus('idle');
                }}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition-colors hover:bg-slate-900"
              >
                Chọn lại
              </button>
              <button
                onClick={handleConfirmAnswer}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-game font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
              >
                Chốt Đáp Án!
              </button>
            </div>
          </div>
        )}

        {/* Explanation Card when revealed */}
        {status === 'revealed' && question.explanation && (
          <div className="mt-5 max-w-2xl mx-auto p-4 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-xs text-slate-300 leading-relaxed shadow-xl">
            <span className="font-bold text-amber-400 block mb-1">
              💡 Kiến thức mở rộng:
            </span>
            {question.explanation}
          </div>
        )}
      </div>

      {/* REVEALED RESULTS & NEXT QUESTION BUTTON (YÊU CẦU TRỌNG TÂM CỦA NGƯỜI DÙNG) */}
      {status === 'revealed' && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/95 border-2 border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-fade-in">
          {/* Status Message */}
          <div className="flex items-center gap-3">
            {isAnswerCorrect ? (
              <div className="flex items-center gap-2 text-emerald-400 font-game text-sm sm:text-base font-bold">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span>CHÍNH XÁC! Bạn đã vượt qua Câu số {currentLevel} ({currentPrize?.amount})!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 font-game text-sm sm:text-base font-bold">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <span>RẤT TIẾC! Đáp án chính xác là {letters[question.correctIndex]} ({question.options[question.correctIndex]})</span>
              </div>
            )}
          </div>

          {/* Action Buttons: NEXT QUESTION or SPIN NEXT */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {isAnswerCorrect ? (
              <button
                onClick={onNextQuestion}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-game font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/35 active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-amber-300"
              >
                <span>
                  {currentLevel === 15 
                    ? 'Vinh Danh Triệu Phú 🏆' 
                    : `Câu Hỏi Tiếp Theo (Câu ${currentLevel + 1})`}
                </span>
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </button>
            ) : (
              <button
                onClick={onSpinRequest}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-game font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Quay bạn tiếp theo</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
