import React, { useState } from 'react';
import { Question, Student } from '../types/game';
import { INITIAL_STUDENTS } from '../data/questions';
import { 
  Settings, 
  Plus, 
  Trash2, 
  X, 
  Download, 
  Upload, 
  Check, 
  RotateCcw, 
  Users, 
  HelpCircle, 
  FileText, 
  Edit2
} from 'lucide-react';

interface TeacherSettingsModalProps {
  initialTab?: 'settings' | 'students' | 'questions';
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  timerSeconds: number;
  onUpdateTimer: (seconds: number) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  initialTab = 'settings',
  students,
  onUpdateStudents,
  questions,
  onUpdateQuestions,
  timerSeconds,
  onUpdateTimer,
  onResetGame,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'students' | 'questions'>(initialTab);

  // Student Tab state
  const [newStudentName, setNewStudentName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');

  // Questions Tab state
  const [newLevel, setNewLevel] = useState<number>(1);
  const [newCategory, setNewCategory] = useState<string>('Kiến thức chung');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [options, setOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState<string>('');
  const [importText, setImportText] = useState<string>('');
  const [showImport, setShowImport] = useState(false);

  // Add single student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStudentName.trim();
    if (!trimmed) return;

    const newStudent: Student = {
      id: `hs-${Date.now()}`,
      number: students.length + 1,
      name: trimmed,
      answeredCount: 0,
      correctCount: 0,
      highestPrize: '0 đ',
      status: 'available',
      stars: 0,
    };

    onUpdateStudents([...students, newStudent]);
    setNewStudentName('');
  };

  // Bulk import students
  const handleBulkImport = () => {
    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return;

    const newStudents: Student[] = lines.map((name, idx) => ({
      id: `hs-bulk-${Date.now()}-${idx}`,
      number: idx + 1,
      name: name.replace(/^(\d+[\.\-\s:]+)/, ''), // Remove leading numbers
      answeredCount: 0,
      correctCount: 0,
      highestPrize: '0 đ',
      status: 'available',
      stars: 0,
    }));

    onUpdateStudents(newStudents);
    setShowBulkInput(false);
    setBulkText('');
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    const updated = students
      .filter(s => s.id !== id)
      .map((s, idx) => ({
        ...s,
        number: idx + 1,
      }));
    onUpdateStudents(updated);
  };

  // Edit student name
  const handleSaveStudentEdit = (id: string) => {
    if (!editNameText.trim()) return;
    const updated = students.map(s => 
      s.id === id ? { ...s, name: editNameText.trim() } : s
    );
    onUpdateStudents(updated);
    setEditingStudentId(null);
  };

  // Reset to default students
  const handleResetDefaultStudents = () => {
    if (confirm('Bạn có chắc muốn đặt lại danh sách học sinh mặc định?')) {
      onUpdateStudents(INITIAL_STUDENTS);
    }
  };

  // Add question
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || options.some(opt => !opt.trim())) {
      return;
    }

    const created: Question = {
      id: `custom-q-${Date.now()}`,
      level: newLevel,
      category: newCategory.trim() || 'Tổng hợp',
      question: newQuestionText.trim(),
      options: [...options] as [string, string, string, string],
      correctIndex,
      explanation: newExplanation.trim() || undefined,
    };

    const updated = questions.filter(q => q.level !== newLevel);
    updated.push(created);
    updated.sort((a, b) => a.level - b.level);

    onUpdateQuestions(updated);
    setNewQuestionText('');
    setOptions(['', '', '', '']);
    setNewExplanation('');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `bo-cau-hoi-ai-la-trieu-phu-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdateQuestions(parsed);
        setShowImport(false);
        setImportText('');
      }
    } catch {
      alert('Định dạng JSON không hợp lệ!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-game text-base font-bold text-white tracking-wide uppercase">
                Bảng Cài Đặt Lớp Học & Quản Trị
              </h3>
              <p className="text-xs text-slate-400">
                Quản lý danh sách học sinh, bộ câu hỏi và thời gian thi đấu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'students'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh sách học sinh ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Luật chơi & Thời gian</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'questions'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ngân hàng câu hỏi ({questions.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* TAB 1: QUẢN LÝ HỌC SINH (Yêu cầu di dời từ giao diện chính) */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Add Student & Bulk Actions */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Thêm học sinh vào lớp</span>
                  </h4>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowBulkInput(!showBulkInput)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Dán danh sách cả lớp</span>
                    </button>

                    <button
                      onClick={handleResetDefaultStudents}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                      title="Khôi phục danh sách mẫu ban đầu"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Danh sách mẫu</span>
                    </button>
                  </div>
                </div>

                {/* Single Add Form */}
                <form onSubmit={handleAddStudent} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập họ và tên học sinh mới..."
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!newStudentName.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-game font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Thêm ngay
                  </button>
                </form>

                {/* Bulk Import Collapsible */}
                {showBulkInput && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <p className="text-[11px] text-slate-400">
                      Dán danh sách học sinh từ Excel hoặc Word (mỗi bạn một dòng):
                    </p>
                    <textarea
                      rows={5}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder="1. Nguyễn Văn An&#10;2. Trần Thị Bình&#10;3. Lê Hoàng Châu..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkInput(false)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Đóng
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkImport}
                        disabled={!bulkText.trim()}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        Nhập vào danh sách
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Students List Table */}
              <div className="space-y-2">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-400 px-1 flex justify-between">
                  <span>Sĩ số hiện tại: {students.length} học sinh</span>
                  <span>Thao tác sửa / xóa</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-slate-800 text-amber-400 font-game font-bold flex items-center justify-center shrink-0">
                          {student.number}
                        </span>

                        {editingStudentId === student.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editNameText}
                              onChange={(e) => setEditNameText(e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveStudentEdit(student.id)}
                              className="p-1 text-emerald-400 hover:bg-emerald-950/50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-200 truncate">
                              {student.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Đã trả lời: {student.correctCount} câu đúng · {student.highestPrize}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingStudentId(student.id);
                            setEditNameText(student.name);
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Sửa tên học sinh"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Xóa học sinh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LUẬT CHƠI & THỜI GIAN */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  Thời gian suy nghĩ mỗi câu hỏi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Không giới hạn', val: 0 },
                    { label: '30 giây', val: 30 },
                    { label: '45 giây', val: 45 },
                    { label: '60 giây', val: 60 },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => onUpdateTimer(item.val)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-game font-semibold border transition-all ${
                        timerSeconds === item.val
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Import/Export */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200">
                  Lưu trữ & Xuất/Nhập bộ câu hỏi:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tải về file câu hỏi (JSON)</span>
                  </button>

                  <button
                    onClick={() => setShowImport(!showImport)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Dán file câu hỏi mới</span>
                  </button>
                </div>

                {showImport && (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={5}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Dán mã JSON bộ câu hỏi vào đây..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono"
                    />
                    <button
                      onClick={handleImportJSON}
                      disabled={!importText.trim()}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                    >
                      Áp dụng câu hỏi
                    </button>
                  </div>
                )}
              </div>

              {/* Reset Game button */}
              <div className="p-4 bg-rose-950/20 rounded-2xl border border-rose-900/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-300">
                    Bắt đầu trận đấu mới
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Đặt lại câu hỏi về câu số 1 và khôi phục các quyền trợ giúp.
                  </div>
                </div>
                <button
                  onClick={() => {
                    onResetGame();
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm mới trận đấu</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NGÂN HÀNG CÂU HỎI */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <form onSubmit={handleAddQuestion} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm hoặc thay thế câu hỏi cho cấp độ</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Cấp độ câu (1 - 15)</label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>Câu {num}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Chủ đề môn học</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="VD: Lịch sử, Toán, Tiếng Anh..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nội dung câu hỏi</label>
                  <textarea
                    rows={2}
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Nhập nội dung câu hỏi..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                {/* 4 Options */}
                <div className="grid grid-cols-2 gap-2">
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <div key={letter} className="flex items-center gap-1.5">
                      <span className="w-5 text-center font-bold text-amber-400 font-game text-xs">{letter}:</span>
                      <input
                        type="text"
                        value={options[idx]}
                        onChange={(e) => {
                          const updated = [...options] as [string, string, string, string];
                          updated[idx] = e.target.value;
                          setOptions(updated);
                        }}
                        placeholder={`Phương án ${letter}...`}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct answer selector */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-300 font-medium">Đáp án đúng:</span>
                    {['A', 'B', 'C', 'D'].map((lbl, idx) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setCorrectIndex(idx)}
                        className={`w-6 h-6 rounded text-xs font-bold font-game ${
                          correctIndex === idx
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={!newQuestionText.trim() || options.some(o => !o.trim())}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-game font-bold text-xs rounded-lg transition-colors"
                  >
                    Lưu câu hỏi
                  </button>
                </div>
              </form>

              {/* Current Questions List */}
              <div className="space-y-2">
                <div className="text-[11px] uppercase font-semibold text-slate-400">
                  Danh sách 15 câu hỏi hiện tại:
                </div>
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-game font-bold text-amber-400">Câu {q.level}</span>
                        <span className="text-[10px] text-slate-400">· {q.category}</span>
                      </div>
                      <div className="text-slate-200 font-medium">{q.question}</div>
                      <div className="text-[11px] text-emerald-400 mt-1">
                        Đáp án đúng: {['A', 'B', 'C', 'D'][q.correctIndex]} ({q.options[q.correctIndex]})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
