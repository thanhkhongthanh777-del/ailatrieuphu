import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types/game';
import { sounds } from '../utils/audio';
import { 
  Dices, 
  RotateCcw, 
  Settings, 
  Sparkles,
  Trophy,
  Shuffle,
  Search,
  CheckCircle2
} from 'lucide-react';

interface StudentSpinnerProps {
  students: Student[];
  currentStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onOpenSettings: (tab?: 'settings' | 'students' | 'questions') => void;
  onResetStudentStatuses: () => void;
  isGameInProgress: boolean;
}

export const StudentSpinner: React.FC<StudentSpinnerProps> = ({
  students,
  currentStudent,
  onSelectStudent,
  onOpenSettings,
  onResetStudentStatuses,
  isGameInProgress,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayStudent, setDisplayStudent] = useState<Student | null>(currentStudent || students[0] || null);
  const [excludeAnswered, setExcludeAnswered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const spinIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentStudent) {
      setDisplayStudent(currentStudent);
    }
  }, [currentStudent]);

  // Candidates eligible for spin
  const candidates = students.filter(s => {
    if (s.status === 'absent') return false;
    if (excludeAnswered && s.status === 'completed') return false;
    return true;
  });

  const handleSpin = () => {
    if (isSpinning || candidates.length === 0) return;

    setIsSpinning(true);
    let speed = 45; // ms
    let iterations = 0;
    const maxIterations = 35 + Math.floor(Math.random() * 15);
    const chosenWinner = candidates[Math.floor(Math.random() * candidates.length)];

    const step = () => {
      iterations++;
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      setDisplayStudent(randomCandidate);
      sounds.playSpinClick(1 + (iterations / maxIterations) * 0.5);

      if (iterations >= maxIterations) {
        setDisplayStudent(chosenWinner);
        setIsSpinning(false);
        sounds.playSpinWinner();
        onSelectStudent(chosenWinner);
      } else {
        if (iterations > maxIterations - 12) {
          speed += 28;
        } else if (iterations > maxIterations - 20) {
          speed += 12;
        }
        spinIntervalRef.current = window.setTimeout(step, speed);
      }
    };

    spinIntervalRef.current = window.setTimeout(step, speed);
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(s.number).includes(searchQuery)
  );

  return (
    <aside className="w-full lg:w-80 xl:w-88 flex flex-col h-full bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-md">
      {/* Randomizer Top Banner */}
      <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Dices className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-wider uppercase text-amber-400 font-game">
                Máy Quay Số Học Sinh
              </h2>
              <div className="text-[11px] text-slate-400">
                Sĩ số: {students.length} · Sẵn sàng: {candidates.length}
              </div>
            </div>
          </div>

          {/* Quick link to student management inside Settings */}
          <button
            onClick={() => onOpenSettings('students')}
            title="Quản lý danh sách học sinh trong Cài Đặt"
            className="p-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Sửa danh sách</span>
          </button>
        </div>

        {/* Digital Slot Display Screen */}
        <div className="relative p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 via-blue-950/40 to-slate-950 border-2 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.18)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />

          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {isSpinning ? 'Đang quay số...' : 'Học sinh được chọn'}
            </span>
            {displayStudent && (
              <span className="text-amber-400 font-game text-xs font-bold">
                SỐ #{displayStudent.number}
              </span>
            )}
          </div>

          {/* Student Name Screen */}
          <div className="py-3 px-3 min-h-[64px] flex items-center justify-center text-center bg-slate-950/90 rounded-xl border border-blue-500/30">
            {displayStudent ? (
              <div className={`transition-all transform ${isSpinning ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}>
                <div className="text-base sm:text-lg font-bold text-white tracking-wide font-game drop-shadow-md flex items-center justify-center gap-1.5">
                  <span className="text-amber-400">★</span>
                  <span>{displayStudent.name}</span>
                  <span className="text-amber-400">★</span>
                </div>
                {!isSpinning && displayPrizeBadge(displayStudent)}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">Nhấn nút bên dưới để quay số</span>
            )}
          </div>

          {/* Action Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || candidates.length === 0}
            className={`w-full mt-3 py-2.5 px-4 rounded-xl font-game font-bold tracking-wider uppercase text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              isSpinning
                ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed border border-amber-500/30'
                : candidates.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30 active:scale-[0.98] border border-amber-300'
            }`}
          >
            <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Đang quay...' : 'Quay Số Chọn Học Sinh'}</span>
          </button>

          {/* Mode Toggles */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={excludeAnswered}
                onChange={(e) => setExcludeAnswered(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Loại bạn đã trả lời</span>
            </label>

            <button
              onClick={onResetStudentStatuses}
              title="Đặt lại trạng thái học sinh về sẵn sàng"
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Làm mới lượt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Filter for Student Roster */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số báo danh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Clean Student Roster List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 px-1 font-semibold flex justify-between">
          <span>Danh sách lớp ({filteredStudents.length})</span>
          <span className="text-[10px] text-slate-500">Bấm để chỉ định</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Không tìm thấy học sinh nào
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isCurrent = currentStudent?.id === student.id;
            return (
              <div
                key={student.id}
                onClick={() => {
                  onSelectStudent(student);
                  sounds.playSelectOption();
                }}
                className={`group relative p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500/80 shadow-md shadow-amber-500/10'
                    : student.status === 'completed'
                    ? 'bg-slate-950/40 border-emerald-900/30 text-slate-400'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-game text-[11px] font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : student.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {student.number}
                  </span>

                  <div className="min-w-0">
                    <div className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                      <span className={isCurrent ? 'text-amber-300 font-bold' : ''}>
                        {student.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-full font-bold">
                          Ghế nóng
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      {student.correctCount > 0 ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          {student.correctCount} câu đúng
                        </span>
                      ) : (
                        <span>Sẵn sàng</span>
                      )}
                      {student.highestPrize !== '0 đ' && (
                        <span className="text-amber-400 font-game">· {student.highestPrize}</span>
                      )}
                    </div>
                  </div>
                </div>

                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-1" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Hint */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950 text-center text-[11px] text-slate-500">
        Muốn thêm hoặc sửa danh sách học sinh? Mở <button onClick={() => onOpenSettings('students')} className="text-amber-400 hover:underline font-semibold">Cài Đặt</button>
      </div>
    </aside>
  );
};

function displayPrizeBadge(student: Student) {
  if (student.correctCount === 0) {
    return (
      <div className="text-[11px] text-slate-400 mt-0.5">
        Sẵn sàng bước lên ghế nóng
      </div>
    );
  }
  return (
    <div className="text-[11px] text-emerald-400 font-medium flex items-center justify-center gap-1 mt-0.5">
      <Trophy className="w-3 h-3 text-amber-400" />
      <span>{student.correctCount} câu đúng · {student.highestPrize}</span>
    </div>
  );
}
