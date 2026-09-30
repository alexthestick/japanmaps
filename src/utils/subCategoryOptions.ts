import {
  FASHION_SUB_CATEGORIES,
  FOOD_SUB_CATEGORIES,
  HOME_GOODS_SUB_CATEGORIES,
} from '../lib/constants';
import type { MainCategory } from '../types/store';

/**
 * The sub-category options for a given main category. Coffee, Museum and
 * Spots have none — matches AddStoreForm.tsx / EditStoreForm.tsx, which
 * only render a sub-category picker for Fashion/Food/Home Goods.
 */
export function getSubCategoryOptions(mainCategory: MainCategory): readonly string[] {
  switch (mainCategory) {
    case 'Fashion':
      return FASHION_SUB_CATEGORIES;
    case 'Food':
      return FOOD_SUB_CATEGORIES;
    case 'Home Goods':
      return HOME_GOODS_SUB_CATEGORIES;
    default:
      return [];
  }
}

/**
 * discover-store's category_hint (e.g. "vintage") is drawn from the same
 * vocabulary as the sub-category picker, so when it matches one of the
 * current main category's options, pre-select it in the review card
 * instead of starting from a blank picker on every single approval. Alex
 * can still add to or clear the selection before publishing.
 */
export function defaultSubCategoriesFromHint(
  mainCategory: MainCategory,
  categoryHint: string | undefined,
): string[] {
  if (!categoryHint) return [];
  const hint = categoryHint.trim().toLowerCase();
  if (!hint) return [];
  const match = getSubCategoryOptions(mainCategory).find((opt) => opt.toLowerCase() === hint);
  return match ? [match] : [];
}
