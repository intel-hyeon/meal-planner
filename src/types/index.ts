export interface Ingredient {
  id: string;
  name: string; // 최대 20자
  amount: number | ''; // 양의 실수
  unit: string; // 최대 10자
}

export interface Recipe {
  id: string;
  name: string;
  servings: number; // 기준 인분 수 (N)
  ingredients: Ingredient[];
  createdAt: number;
}

export interface CartItem {
  recipeId: string;
  targetServings: number; // 목표 인분 수 (M)
}

export interface AggregatedIngredient {
  name: string;
  unit: string;
  totalAmount: number;
}

export type ActiveTab = 'recipes' | 'cart';
