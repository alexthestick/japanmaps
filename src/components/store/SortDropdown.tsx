import { ChevronDown } from 'lucide-react';

interface SortDropdownProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedCity?: string | null;
}

const SORT_OPTIONS = [
  { value: 'random', label: 'Random' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'alphabetical', label: 'Alphabetical' },
  // 'City' is only useful when showing stores from multiple cities
  { value: 'city', label: 'City', hiddenWhenCitySelected: true },
];

export function SortDropdown({ sortBy, onSortChange, selectedCity }: SortDropdownProps) {
  const visibleOptions = SORT_OPTIONS.filter(opt =>
    !(opt.hiddenWhenCitySelected && selectedCity)
  );

  return (
    <div className="relative">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {visibleOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
    </div>
  );
}
