interface QuickQuestionsProps {
  onSelect: (question: string) => void;
}

const QUESTIONS = [
  "Summarize this ocean location",
  "Explain the subsurface temperature profile",
  "Where is the sharpest thermocline gradient?",
  "How does SST relate to subsurface temperature?",
  "What do current vectors indicate here?",
  "Which fish species thrive in this thermal window?"
];

export function QuickQuestions({ onSelect }: QuickQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3 mb-2">
      {QUESTIONS.map((q, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(q)}
          className="text-[11px] font-medium px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:border-[#0B3A82] dark:hover:border-blue-400 hover:text-[#0B3A82] dark:hover:text-blue-300 hover:bg-[#F0F5FC] dark:hover:bg-slate-750 transition-all text-left cursor-pointer shadow-xs"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
