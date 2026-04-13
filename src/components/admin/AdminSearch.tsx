import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

interface AdminSearchProps {
  items: NavItem[];
}

const AdminSearch: React.FC<AdminSearchProps> = ({ items }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-200 uppercase-first"
          placeholder="Search admin modules..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-96 overflow-y-auto py-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-start gap-3 transition-colors group"
                >
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">
                  No modules found matching <span className="font-semibold text-gray-700">"{query}"</span>
                </p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              Tip: Enter the name or function of the module
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSearch;
