import { Recipe, CartItem, AggregatedIngredient } from '../types';

/**
 * 3-4. 소수점 셋째 자리에서 내림(버림, Floor) 처리
 * 소수점 둘째 자리까지 보존하고 셋째 자리부터 버림 처리합니다.
 * 부동소수점 오차 방지를 위해 1e-6 반올림 보정 사용
 * 예: 1.333333... -> 1.33, 2.5 -> 2.5, 3.0 -> 3
 */
export function floorToTwoDecimals(num: number): number {
  if (isNaN(num)) return 0;
  // 부동소수점 오차 방지 보정 (예: 0.29999999999999993 -> 0.3)
  const normalized = Math.round(num * 1000000) / 1000000;
  return Math.floor(normalized * 100) / 100;
}

/**
 * 숫자를 깔끔한 문자열로 포맷팅 (불필요한 뒤쪽 0 제거)
 * 예: 2 -> "2", 2.5 -> "2.5", 2.33 -> "2.33"
 */
export function formatAmount(num: number): string {
  const floored = floorToTwoDecimals(num);
  // 정수면 정수 표기, 소수면 최대 둘째 자리까지 표기
  return Number.isInteger(floored) ? floored.toString() : floored.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * 3-3. 단일 레시피의 인분 수 비례 재료 계산
 * 공식: 기존 양 * (목표 M인분 / 기준 N인분)
 */
export function calculateScaledAmount(amount: number, targetServings: number, baseServings: number): number {
  if (!baseServings || baseServings <= 0) return amount;
  const scaled = amount * (targetServings / baseServings);
  return floorToTwoDecimals(scaled);
}

/**
 * 3-5 & 3-6. 장바구니에 담긴 전체 레시피의 재료 합산 및 가나다순 정렬
 * - "재료명과 단위가 모두 완전히 일치하는" 항목만 수량을 합산
 * - 재료명을 기준으로 가나다/알파벳 순으로 자동 정렬
 */
export function aggregateCartIngredients(
  recipes: Recipe[],
  cart: CartItem[]
): AggregatedIngredient[] {
  const recipeMap = new Map<string, Recipe>();
  recipes.forEach((r) => recipeMap.set(r.id, r));

  // key: `${name}____${unit}`
  const totalsMap = new Map<string, { name: string; unit: string; totalRaw: number }>();

  cart.forEach((cartItem) => {
    const recipe = recipeMap.get(cartItem.recipeId);
    if (!recipe) return;

    const baseServings = recipe.servings > 0 ? recipe.servings : 1;
    const targetServings = cartItem.targetServings > 0 ? cartItem.targetServings : 1;
    const ratio = targetServings / baseServings;

    recipe.ingredients.forEach((ing) => {
      const name = ing.name.trim();
      const unit = ing.unit.trim();
      const rawAmount = typeof ing.amount === 'number' ? ing.amount : 0;
      if (!name || rawAmount <= 0) return;

      const key = `${name}____${unit}`;
      const existing = totalsMap.get(key);
      const calculatedForThis = rawAmount * ratio;

      if (existing) {
        existing.totalRaw += calculatedForThis;
      } else {
        totalsMap.set(key, {
          name,
          unit,
          totalRaw: calculatedForThis,
        });
      }
    });
  });

  // 배열로 변환 및 3-4 소수점 셋째 자리 버림 적용
  const aggregatedList: AggregatedIngredient[] = Array.from(totalsMap.values()).map((item) => ({
    name: item.name,
    unit: item.unit,
    totalAmount: floorToTwoDecimals(item.totalRaw),
  }));

  // 3-6. 재료명 기준 가나다/알파벳 순 정렬 (재료명이 같으면 단위 순)
  aggregatedList.sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name, 'ko');
    if (nameCompare !== 0) return nameCompare;
    return a.unit.localeCompare(b.unit, 'ko');
  });

  return aggregatedList;
}
