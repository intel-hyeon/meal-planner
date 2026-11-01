import { useState } from 'react';
import { Trash2, Edit3, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string, name: string) => void;
  onAddToCart?: (recipe: Recipe) => void;
  isInCart?: boolean;
}

export default function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  onAddToCart,
  isInCart = false,
}: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayIngredients = isExpanded
    ? recipe.ingredients
    : recipe.ingredients.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* 상단: 레시피 이름, 인분 수, 액션 버튼 */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-lg truncate" title={recipe.name}>
              {recipe.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                기준 {recipe.servings}인분
              </span>
              <span className="text-xs text-slate-400">
                재료 {recipe.ingredients.length}개
              </span>
            </div>
          </div>

          {/* 카드 우측 상단 수정/삭제 버튼 */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(recipe)}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="레시피 수정"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(recipe.id, recipe.name)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="레시피 삭제 (LocalStorage에서 영구 제거)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 재료 목록 리스트 */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">등록된 식재료</span>
            {recipe.ingredients.length > 4 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-0.5"
              >
                {isExpanded ? (
                  <>
                    접기 <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    +{recipe.ingredients.length - 4}개 더보기 <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>

          <ul className="space-y-1.5">
            {displayIngredients.map((ing) => (
              <li
                key={ing.id}
                className="text-xs text-slate-700 flex items-center justify-between py-0.5 px-1.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium truncate max-w-[65%]">• {ing.name}</span>
                <span className="font-mono text-slate-500 font-medium shrink-0">
                  {ing.amount} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 카드 하단 액션 바 */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">LocalStorage 캐시 동기화</span>
        <button
          onClick={() => onAddToCart && onAddToCart(recipe)}
          disabled={!onAddToCart}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
            isInCart
              ? 'bg-emerald-100 text-emerald-800'
              : onAddToCart
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {isInCart ? '장바구니에 담김' : '장바구니 담기 (3단계)'}
        </button>
      </div>
    </div>
  );
}
