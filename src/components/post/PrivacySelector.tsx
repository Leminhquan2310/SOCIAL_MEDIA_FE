import React from "react";
import { Globe, Users, Lock, ChevronDown } from "lucide-react";
import { Privacy } from "../../../types";

interface PrivacyOption {
  value: Privacy;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const OPTIONS: PrivacyOption[] = [
  {
    value: Privacy.PUBLIC,
    label: "Công khai",
    icon: <Globe size={16} />,
    description: "Bất kỳ ai cũng có thể xem"
  },
  {
    value: Privacy.FRIEND_ONLY,
    label: "Bạn bè",
    icon: <Users size={16} />,
    description: "Chỉ bạn bè của bạn mới có thể xem"
  },
  {
    value: Privacy.ONLY_ME,
    label: "Chỉ mình tôi",
    icon: <Lock size={16} />,
    description: "Chỉ mình bạn mới có thể xem"
  }
];

interface PrivacySelectorProps {
  value: Privacy;
  onChange: (value: Privacy) => void;
}

const PrivacySelector: React.FC<PrivacySelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = OPTIONS.find(opt => opt.value === value) || OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
      >
        {selectedOption.icon}
        <span className="text-[12px] font-bold">{selectedOption.label}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20 animate-fade-in">
            <h4 className="text-[13px] font-bold text-gray-900 px-3 py-2 border-b border-gray-50 mb-1">
              Chọn đối tượng xem bài viết
            </h4>
            <div className="space-y-1">
              {OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors ${
                    value === option.value ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className={`p-2 rounded-full ${value === option.value ? "bg-blue-100" : "bg-gray-100"}`}>
                    {option.icon}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-bold">{option.label}</p>
                    <p className="text-[11px] text-gray-400">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PrivacySelector;
