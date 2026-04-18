import React from "react";
import { Smile, X } from "lucide-react";

interface Feeling {
  label: string;
  emoji: string;
}

const FEELINGS: Feeling[] = [
  { label: "Happy", emoji: "😊" },
  { label: "Excited", emoji: "😍" },
  { label: "Sad", emoji: "😢" },
  { label: "Angry", emoji: "😡" },
  { label: "Tired", emoji: "😴" },
  { label: "Loved", emoji: "🥰" },
  { label: "Worried", emoji: "😟" },
  { label: "Surprised", emoji: "😲" },
];

interface FeelingSelectorProps {
  selected?: string;
  onSelect: (feeling: string | undefined) => void;
}

const FeelingSelector: React.FC<FeelingSelectorProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentFeeling = FEELINGS.find(f => f.label === selected);

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer select-none ${selected ? "bg-yellow-50 text-yellow-700" : "text-gray-500 hover:bg-gray-50"
          }`}
      >
        <Smile size={17} className={selected ? "text-yellow-600" : "text-yellow-500"} />
        <span className="text-[13px] font-semibold">
          {selected ? `Feeling ${currentFeeling?.emoji} ${selected}` : "Feeling"}
        </span>
        {selected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(undefined);
            }}
            className="ml-1 hover:bg-yellow-100 rounded-full p-0.5"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20 animate-slide-up">
            <h4 className="text-[12px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
              How are you feeling?
            </h4>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {FEELINGS.map((feeling) => (
                <button
                  key={feeling.label}
                  onClick={() => {
                    onSelect(feeling.label);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-colors ${selected === feeling.label ? "bg-yellow-50 text-yellow-700" : "hover:bg-gray-50 text-gray-700"
                    }`}
                >
                  <span className="text-lg">{feeling.emoji}</span>
                  <span className="text-[13px]">{feeling.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeelingSelector;
