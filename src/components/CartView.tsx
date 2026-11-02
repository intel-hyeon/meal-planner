import { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ListOrdered, Copy } from 'lucide-react';
import { Recipe, CartItem, AggregatedIngredient } from '../types';
import { calculateScaledAmount, formatAmount } from '../utils/calculator';

interface CartViewProps {
  recipes: Recipe[];
  cart: CartItem[];
  aggregatedIngredients: AggregatedIngredient[];
  onUpdateTargetServings: (recipeId: string, targetServings: number) => void;
  onRemoveFromCart: (recipeId: string) => void;
  onGoToRecipes: () => void;
}

export default function CartView({
  recipes,
  cart,
  aggregatedIngredients,
  onUpdateTargetServings,
  onRemoveFromCart,
  onGoToRecipes,
}: CartViewProps) {
  const [showPreviewMap, setShowPreviewMap] = useState<Record<string, boolean>>({});

  const recipeMap = new Map<string, Recipe>();
  recipes.forEach((r) => recipeMap.set(r.id, r));

  const togglePreview = (id: string) => {
    setShowPreviewMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">장바구니가 비어 있습니다</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          레시피 탭에서 원하는 레시피를 장바구니에 담아보세요.<br />
          요리할 인분 수에 맞춰 식재료 양을 자동으로 계산해 드립니다.
        </p>
        <button
          onClick={onGoToRecipes}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors inline-flex items-center gap-2 shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
          레시피 담으러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 2단 레이아웃: 좌측(담긴 레시피 및 인분 수 조절) / 우측(가나다순 합산 결과 목록) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 좌측: 담긴 레시피 목록 및 인분 수(M) 조절 (5컬럼) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>담긴 요리 레시피 ({cart.length}개)</span>
            </h3>
            <span className="text-xs text-slate-500">목표 인분 수를 조절하세요</span>
          </div>

          <div className="space-y-4">
            {cart.map((cartItem) => {
              const recipe = recipeMap.get(cartItem.recipeId);
              if (!recipe) return null;

              const targetServings = cartItem.targetServings;
              const baseServings = recipe.servings;
              const isPreviewOpen = !!showPreviewMap[cartItem.recipeId];

              return (
                <div
                  key={cartItem.recipeId}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all"
                >
                  {/* 레시피 기본 정보 및 삭제 버튼 */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{recipe.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        기준 {baseServings}인분
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(cartItem.recipeId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="장바구니에서 제외"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 3-2. 목표 인분 수(M인분) 조절 컨트롤 */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      요리할 인분 수
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          onUpdateTargetServings(
                            cartItem.recipeId,
                            Math.max(1, targetServings - 1)
                          )
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-2xs"
                        title="1 감소"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={targetServings}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onUpdateTargetServings(
                              cartItem.recipeId,
                              isNaN(val) || val < 1 ? 1 : val
                            );
                          }}
                          className="w-16 text-center py-1 px-1 text-sm font-bold bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">인분</span>

                      <button
                        onClick={() =>
                          onUpdateTargetServings(cartItem.recipeId, targetServings + 1)
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-2xs"
                        title="1 증가"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 3-3 & 3-4. 비례 계산된 해당 레시피 개별 재료 미리보기 */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => togglePreview(cartItem.recipeId)}
                      className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-emerald-700 font-medium py-1"
                    >
                      <span>비례 계산 미리보기 ({baseServings}인분 → {targetServings}인분)</span>
                      <span>{isPreviewOpen ? '접기 ▲' : '펼치기 ▼'}</span>
                    </button>
                    {isPreviewOpen && (
                      <div className="space-y-1 mt-1.5 pt-1.5 border-t border-slate-50">
                        {recipe.ingredients.map((ing) => {
                          const rawAmount = typeof ing.amount === 'number' ? ing.amount : 0;
                          const scaled = calculateScaledAmount(rawAmount, targetServings, baseServings);
                          return (
                            <div
                              key={ing.id}
                              className="text-xs text-slate-600 flex items-center justify-between py-0.5"
                            >
                              <span className="truncate max-w-[65%]">• {ing.name}</span>
                              <span className="font-mono font-medium text-emerald-700 bg-emerald-50/60 px-1.5 py-0.5 rounded text-[11px]">
                                {formatAmount(scaled)} {ing.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 우측: 3-5 & 3-6. 최종 가나다순 합산 장보기 목록 (7컬럼) */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-emerald-600" />
                <span>최종 합산 장보기 목록</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                재료명과 단위가 완전히 동일한 항목끼리 합산되며, 가나다순으로 자동 정렬됩니다.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              총 {aggregatedIngredients.length}종
            </span>
          </div>

          {/* 합산 목록 리스트 */}
          {aggregatedIngredients.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              합산할 유효한 재료가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 mt-2 max-h-[420px] overflow-y-auto pr-1">
              {aggregatedIngredients.map((item, index) => (
                <div
                  key={`${item.name}-${item.unit}-${index}`}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-slate-400 w-5">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-base font-bold text-emerald-700">
                      {formatAmount(item.totalAmount)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4단계 예정: 클립보드 복사 안내 영역 */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              ※ 클립보드 복사 및 외부 내보내기는 다음 4단계에서 구현됩니다.
            </span>
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 cursor-not-allowed"
              title="4단계에서 클립보드 복사 기능이 활성화됩니다"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>클립보드 복사 (4단계 예정)</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
