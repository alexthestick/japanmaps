import { Search } from 'lucide-react';

interface FloatingSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FloatingSearchBar({ value, onChange, placeholder = "Search stores, neighborhoods..." }: FloatingSearchBarProps) {
  return (
    <div className="absolute top-5 left-5 z-20">
      <div className="w-[340px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-gray-300/70 px-5 py-4 hover:shadow-2xl transition-shadow">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 text-base font-medium"
          />
        </div>
      </div>
    </div>
  );
}
