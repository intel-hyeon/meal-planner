import { Recipe, CartItem } from '../types';

export const RECIPES_STORAGE_KEY = 'meal_organizer_recipes_v1';
export const CART_STORAGE_KEY = 'meal_organizer_cart_v1';

// 초기 샘플 데이터 (첫 방문 시 빈 화면 방지 및 기능 확인용)
export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'sample-recipe-1',
    name: '김치찌개',
    servings: 2,
    createdAt: Date.now() - 100000,
    ingredients: [
      { id: 'ing-1-1', name: '김치', amount: 300, unit: 'g' },
      { id: 'ing-1-2', name: '돼지고기', amount: 200, unit: 'g' },
      { id: 'ing-1-3', name: '양파', amount: 1, unit: '개' },
      { id: 'ing-1-4', name: '대파', amount: 0.5, unit: '대' },
      { id: 'ing-1-5', name: '다진마늘', amount: 1, unit: '큰술' }
    ]
  },
  {
    id: 'sample-recipe-2',
    name: '계란 볶음밥',
    servings: 1,
    createdAt: Date.now() - 50000,
    ingredients: [
      { id: 'ing-2-1', name: '밥', amount: 1, unit: '공기' },
      { id: 'ing-2-2', name: '계란', amount: 2, unit: '개' },
      { id: 'ing-2-3', name: '대파', amount: 0.5, unit: '대' },
      { id: 'ing-2-4', name: '식용유', amount: 1.5, unit: '큰술' }
    ]
  }
];

/**
 * 1-2. 로컬스토리지에서 레시피 목록 불러오기
 */
export function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (!raw) {
      saveRecipes(INITIAL_RECIPES);
      return INITIAL_RECIPES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load recipes from localStorage:', error);
    return [];
  }
}

/**
 * 1-2. 로컬스토리지에 레시피 목록 영구 저장
 */
export function saveRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.error('Failed to save recipes to localStorage:', error);
  }
}

/**
 * 1-3. 로컬스토리지에서 특정 레시피 삭제
 */
export function deleteRecipeFromStorage(id: string): void {
  try {
    const current = loadRecipes();
    const filtered = current.filter((r) => r.id !== id);
    saveRecipes(filtered);
  } catch (error) {
    console.error(`Failed to delete recipe ${id} from localStorage:`, error);
  }
}

/**
 * 로컬스토리지에서 장바구니 목록 불러오기
 */
export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
}

/**
 * 로컬스토리지에 장바구니 목록 영구 저장
 */
export function saveCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
}

/**
 * 로컬스토리지에서 특정 장바구니 항목 제거
 */
export function deleteCartItemFromStorage(recipeId: string): void {
  try {
    const current = loadCart();
    const filtered = current.filter((item) => item.recipeId !== recipeId);
    saveCart(filtered);
  } catch (error) {
    console.error(`Failed to delete cart item for recipe ${recipeId} from localStorage:`, error);
  }
}

/**
 * 캐시 전체 초기화 (테스트용)
 */
export function clearAllStorage(): void {
  try {
    localStorage.removeItem(RECIPES_STORAGE_KEY);
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}
