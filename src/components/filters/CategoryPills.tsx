import { MAIN_CATEGORIES, MAIN_CATEGORY_ICONS, FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES } from '../../lib/constants';
import type { MainCategory } from '../../types/store';

interface CategoryPillsProps {
  selectedMainCategory: MainCategory | null;
  selectedSubCategories: string[];
  onMainCategoryChange: (category: MainCategory | null) => void;
  onSubCategoryToggle: (category: string) => void;
  storeCounts?: {
    main: Record<string, number>;
    sub: Record<string, number>;
  };
}

export function CategoryPills({
  selectedMainCategory,
  selectedSubCategories,
  onMainCategoryChange,
  onSubCategoryToggle,
  storeCounts,
}: CategoryPillsProps) {

  const isMainCategoryActive = (category: MainCategory) => selectedMainCategory === category;
  const isSubCategoryActive = (category: string) => selectedSubCategories.includes(category);

  return (
    <div className="space-y-3">
      {/* Main Categories */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {/* All option */}
          <button
            onClick={() => onMainCategoryChange(null)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${!selectedMainCategory
                ? 'bg-blue-500 text-white shadow-md scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            All
            {storeCounts?.main?.all && (
              <span className="ml-1.5 opacity-75">({storeCounts.main.all})</span>
            )}
          </button>

          {/* Main category pills */}
          {MAIN_CATEGORIES.map((category) => {
            const icon = MAIN_CATEGORY_ICONS[category];
            const count = storeCounts?.main?.[category];
            const isActive = isMainCategoryActive(category);

            return (
              <button
                key={category}
                onClick={() => onMainCategoryChange(isActive ? null : category)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  flex items-center gap-1.5
                  ${isActive
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }
                `}
              >
                <span>{icon}</span>
                <span>{category}</span>
                {count !== undefined && (
                  <span className="ml-1 opacity-75">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Categories (Fashion) */}
      {selectedMainCategory === 'Fashion' && (
        <div className="animate-fadeIn">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
            Fashion Styles
          </label>
          <div className="flex flex-wrap gap-2">
            {/* All Styles option */}
            <button
              onClick={() => {
                // Clear all sub-categories
                selectedSubCategories.forEach(cat => onSubCategoryToggle(cat));
              }}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${selectedSubCategories.length === 0
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              All Styles
            </button>

            {/* Sub-category pills */}
            {FASHION_SUB_CATEGORIES.map((category) => {
              const isActive = isSubCategoryActive(category);
              const count = storeCounts?.sub?.[category];

              return (
                <button
                  key={category}
                  onClick={() => onSubCategoryToggle(category)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200
                    ${isActive
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                    }
                  `}
                >
                  {category}
                  {count !== undefined && (
                    <span className="ml-1 opacity-75">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Categories (Food) */}
      {selectedMainCategory === 'Food' && (
        <div className="animate-fadeIn">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
            Food Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {FOOD_SUB_CATEGORIES.map((category) => {
              const isActive = isSubCategoryActive(category);
              const count = storeCounts?.sub?.[category];

              return (
                <button
                  key={category}
                  onClick={() => onSubCategoryToggle(category)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200
                    ${isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                    }
                  `}
                >
                  {category}
                  {count !== undefined && (
                    <span className="ml-1 opacity-75">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Categories (Home Goods) */}
      {selectedMainCategory === 'Home Goods' && (
        <div className="animate-fadeIn">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
            Home Goods
          </label>
          <div className="flex flex-wrap gap-2">
            {HOME_GOODS_SUB_CATEGORIES.map((category) => {
              const isActive = isSubCategoryActive(category);
              const count = storeCounts?.sub?.[category];

              return (
                <button
                  key={category}
                  onClick={() => onSubCategoryToggle(category)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200
                    ${isActive
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                    }
                  `}
                >
                  {category}
                  {count !== undefined && (
                    <span className="ml-1 opacity-75">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
