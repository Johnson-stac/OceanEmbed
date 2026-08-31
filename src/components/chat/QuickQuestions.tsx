interface QuickQuestionsProps {
  onSelect: (question: string) => void;
}

const QUESTIONS = [
  "Summarize this location",
  "Explain the temperature profile",
  "Which depth changes the most?",
  "What does this profile indicate?",
  "Explain the surface observations"
];

export function QuickQuestions({ onSelect }: QuickQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4 mb-2">
      {QUESTIONS.map((q, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(q)}
          className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50 transition-colors text-left"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
