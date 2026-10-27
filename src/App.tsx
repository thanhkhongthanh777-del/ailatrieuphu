import React, { useState, useEffect } from 'react';
import { Student, Question, LifelineState, PRIZE_LADDER } from './types/game';
import { INITIAL_STUDENTS, PRIMARY_QUESTIONS, BACKUP_QUESTIONS } from './data/questions';
import { StudentSpinner } from './components/StudentSpinner';
import { PrizeLadder } from './components/PrizeLadder';
import { QuestionBoard } from './components/QuestionBoard';
import { LifelineBar } from './components/LifelineBar';
import { AudiencePollModal, CallAdvisorModal } from './components/LifelineModals';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { GameResultModal } from './components/GameResultModal';
import { Navbar } from './components/Navbar';
import { sounds } from './utils/audio';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  // Load or initialize students from localStorage
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('altp_students');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STUDENTS;
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('altp_questions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRIMARY_QUESTIONS;
  });

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [timerSeconds, setTimerSeconds] = useState<number>(45);

  const [lifelines, setLifelines] = useState<LifelineState>({
    fiftyFifty: { used: false, active: false, eliminatedIndices: [] },
    askAudience: { used: false, active: false },
    callAdvisor: { used: false, active: false },
    switchQuestion: { used: false, active: false },
  });

  // Modals state
  const [showSettings, setShowSettings] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'students' | 'questions'>('settings');
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [isLadderCollapsed, setIsLadderCollapsed] = useState(false);
  const [isStudentSidebarOpen, setIsStudentSidebarOpen] = useState(true);

  const [resultModal, setResultModal] = useState<{
    open: boolean;
    type: 'victory' | 'walkaway' | 'gameover';
    student: Student;
    finalLevel: number;
  } | null>(null);

  // Sync students to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('altp_students', JSON.stringify(students));
    } catch {}
  }, [students]);

  // Sync questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('altp_questions', JSON.stringify(questions));
    } catch {}
  }, [questions]);

  // Current question object
  const currentQuestion = questions.find(q => q.level === currentLevel) || questions[0];

  // Helper to record student achievements
  const updateStudentScore = (studentId: string, levelReached: number, isWin = false) => {
    const prizeObj = PRIZE_LADDER.find(p => p.level === levelReached);
    const prizeStr = prizeObj ? prizeObj.amount : '0 đ';

    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          answeredCount: s.answeredCount + 1,
          correctCount: isWin ? 15 : Math.max(s.correctCount, levelReached),
          highestPrize: prizeStr,
          status: 'completed',
          stars: s.stars + (isWin ? 5 : levelReached >= 10 ? 3 : levelReached >= 5 ? 2 : 1),
        };
      })
    );
  };

  // Select student to put on Hot Seat
  const handleSelectStudent = (student: Student) => {
    setCurrentStudent(student);
    setStudents(prev =>
      prev.map(s => (s.id === student.id ? { ...s, status: 'answering' } : s))
    );
  };

  // When answer is correct, update current score (does NOT auto-skip)
  const handleAnswerCorrect = () => {
    if (!currentStudent) return;
    updateStudentScore(currentStudent.id, currentLevel, currentLevel === 15);
  };

  // Host/Student clicks "CÂU HỎI TIẾP THEO" button
  const handleNextQuestion = () => {
    if (currentLevel === 15) {
      if (currentStudent) {
        setResultModal({
          open: true,
          type: 'victory',
          student: currentStudent,
          finalLevel: 15,
        });
      }
    } else {
      setCurrentLevel(prev => prev + 1);
      // Reset 50:50 eliminated indices for next question
      setLifelines(prev => ({
        ...prev,
        fiftyFifty: { ...prev.fiftyFifty, eliminatedIndices: [] },
      }));
    }
  };

  // Wrong answer handler
  const handleAnswerWrong = () => {
    if (!currentStudent) return;

    let guaranteedLevel = 0;
    if (currentLevel > 10) guaranteedLevel = 10;
    else if (currentLevel > 5) guaranteedLevel = 5;

    updateStudentScore(currentStudent.id, guaranteedLevel);

    setTimeout(() => {
      setResultModal({
        open: true,
        type: 'gameover',
        student: currentStudent,
        finalLevel: currentLevel,
      });
    }, 2000);
  };

  // Walk Away Lifeline
  const handleWalkAway = () => {
    if (!currentStudent) return;
    const securedLevel = Math.max(1, currentLevel - 1);
    updateStudentScore(currentStudent.id, securedLevel);

    setResultModal({
      open: true,
      type: 'walkaway',
      student: currentStudent,
      finalLevel: securedLevel,
    });
  };

  // 50:50 Lifeline
  const handleUseFiftyFifty = () => {
    if (lifelines.fiftyFifty.used || !currentQuestion) return;

    const wrongIndices = [0, 1, 2, 3].filter(i => i !== currentQuestion.correctIndex);
    const shuffled = [...wrongIndices].sort(() => 0.5 - Math.random());
    const eliminated = shuffled.slice(0, 2);

    setLifelines(prev => ({
      ...prev,
      fiftyFifty: { used: true, active: true, eliminatedIndices: eliminated },
    }));
  };

  // Ask Audience Lifeline
  const handleUseAskAudience = () => {
    if (lifelines.askAudience.used) return;
    setLifelines(prev => ({
      ...prev,
      askAudience: { used: true, active: true },
    }));
    setShowAudienceModal(true);
  };

  // Call Advisor Lifeline
  const handleUseCallAdvisor = () => {
    if (lifelines.callAdvisor.used) return;
    setLifelines(prev => ({
      ...prev,
      callAdvisor: { used: true, active: true },
    }));
    setShowAdvisorModal(true);
  };

  // Switch Question Lifeline
  const handleUseSwitchQuestion = () => {
    if (lifelines.switchQuestion.used) return;

    const backup = BACKUP_QUESTIONS[currentLevel];
    if (backup) {
      setQuestions(prev =>
        prev.map(q => (q.level === currentLevel ? { ...backup, level: currentLevel } : q))
      );
    }

    setLifelines(prev => ({
      ...prev,
      switchQuestion: { used: true, active: true },
      fiftyFifty: { ...prev.fiftyFifty, eliminatedIndices: [] },
    }));
  };

  // Reset student statuses to available
  const handleResetStudentStatuses = () => {
    setStudents(prev =>
      prev.map(s => ({
        ...s,
        status: 'available',
      }))
    );
  };

  // Reset entire game session
  const handleResetGame = () => {
    setCurrentLevel(1);
    setLifelines({
      fiftyFifty: { used: false, active: false, eliminatedIndices: [] },
      askAudience: { used: false, active: false },
      callAdvisor: { used: false, active: false },
      switchQuestion: { used: false, active: false },
    });
    setResultModal(null);
  };

  const handleContinueWithNewStudent = () => {
    handleResetGame();
    setCurrentStudent(null);
  };

  const handleOpenSettingsTab = (tab: 'settings' | 'students' | 'questions' = 'settings') => {
    setSettingsInitialTab(tab);
    setShowSettings(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden altp-stage-arena">
      {/* Top Header Navbar */}
      <Navbar
        onOpenSettings={() => handleOpenSettingsTab('settings')}
        onResetGame={handleResetGame}
      />

      {/* Main Studio Arena Layout */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left Column: Student List & Randomizer Wheel Spinner (Cài đặt đã chuyển vào Settings) */}
        <div className={`transition-all duration-300 flex shrink-0 ${isStudentSidebarOpen ? 'w-full lg:w-80 xl:w-88' : 'w-0 overflow-hidden'}`}>
          <StudentSpinner
            students={students}
            currentStudent={currentStudent}
            onSelectStudent={handleSelectStudent}
            onOpenSettings={handleOpenSettingsTab}
            onResetStudentStatuses={handleResetStudentStatuses}
            isGameInProgress={currentLevel > 1}
          />
        </div>

        {/* Center Stage: Question Board & Lifelines */}
        <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto">
          {/* Lifelines Bar (Top of central stage with iconic circular medallions) */}
          <div className="p-2 sm:px-6 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
            <button
              onClick={() => setIsStudentSidebarOpen(!isStudentSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
              title="Mở danh sách học sinh"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span>Học sinh</span>
            </button>

            <LifelineBar
              lifelines={lifelines}
              onUseFiftyFifty={handleUseFiftyFifty}
              onUseAskAudience={handleUseAskAudience}
              onUseCallAdvisor={handleUseCallAdvisor}
              onUseSwitchQuestion={handleUseSwitchQuestion}
              onWalkAway={handleWalkAway}
              disabled={!currentStudent}
              canWalkAway={currentLevel > 1}
            />

            <button
              onClick={() => setIsLadderCollapsed(!isLadderCollapsed)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isLadderCollapsed ? 'Mở thang tiền thưởng' : 'Thu gọn thang'}
            >
              {isLadderCollapsed ? <ChevronLeft className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Central Question Arena */}
          <div className="flex-1 flex flex-col justify-center">
            <QuestionBoard
              question={currentQuestion}
              currentLevel={currentLevel}
              currentStudent={currentStudent}
              eliminatedIndices={lifelines.fiftyFifty.eliminatedIndices}
              timerSeconds={timerSeconds}
              onAnswerCorrect={handleAnswerCorrect}
              onAnswerWrong={handleAnswerWrong}
              onNextQuestion={handleNextQuestion}
              onSpinRequest={() => {
                if (!isStudentSidebarOpen) setIsStudentSidebarOpen(true);
              }}
            />
          </div>
        </main>

        {/* Right Column: Prize Ladder (1 - 15) */}
        <PrizeLadder
          currentLevel={currentLevel}
          isCollapsed={isLadderCollapsed}
          onToggleCollapse={() => setIsLadderCollapsed(!isLadderCollapsed)}
        />
      </div>

      {/* Modals */}
      {showAudienceModal && currentQuestion && (
        <AudiencePollModal
          question={currentQuestion}
          eliminatedIndices={lifelines.fiftyFifty.eliminatedIndices}
          onClose={() => setShowAudienceModal(false)}
        />
      )}

      {showAdvisorModal && currentQuestion && (
        <CallAdvisorModal
          question={currentQuestion}
          eliminatedIndices={lifelines.fiftyFifty.eliminatedIndices}
          onClose={() => setShowAdvisorModal(false)}
        />
      )}

      {showSettings && (
        <TeacherSettingsModal
          initialTab={settingsInitialTab}
          students={students}
          onUpdateStudents={setStudents}
          questions={questions}
          onUpdateQuestions={setQuestions}
          timerSeconds={timerSeconds}
          onUpdateTimer={setTimerSeconds}
          onResetGame={handleResetGame}
          onClose={() => setShowSettings(false)}
        />
      )}

      {resultModal?.open && (
        <GameResultModal
          type={resultModal.type}
          student={resultModal.student}
          finalLevel={resultModal.finalLevel}
          onContinueWithNewStudent={handleContinueWithNewStudent}
          onResetGame={handleResetGame}
          onClose={() => setResultModal(null)}
        />
      )}
    </div>
  );
}
