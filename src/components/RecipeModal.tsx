import { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, ChefHat } from 'lucide-react';
import { Recipe, Ingredient } from '../types';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  editingRecipe?: Recipe | null;
}

export default function RecipeModal({
  isOpen,
  onClose,
  onSave,
  editingRecipe,
}: RecipeModalProps) {
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState<number>(1);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // 2-2. 모달 열릴 때 초기화 (신규 작성 시 기본 1개 빈칸 제공, 수정 시 기존 데이터 로드)
  useEffect(() => {
    if (!isOpen) return;

    if (editingRecipe) {
      setRecipeName(editingRecipe.name);
      setServings(editingRecipe.servings || 1);
      setIngredients(
        editingRecipe.ingredients.length > 0
          ? editingRecipe.ingredients.map((ing) => ({ ...ing }))
          : [{ id: `ing-${Date.now()}-1`, name: '', amount: '', unit: '' }]
      );
    } else {
      setRecipeName('');
      setServings(1);
      // 2-2. 기본 1개 빈 재료 입력란 제공
      setIngredients([{ id: `ing-${Date.now()}-1`, name: '', amount: '', unit: '' }]);
    }
    setErrorMessage('');
  }, [isOpen, editingRecipe]);

  if (!isOpen) return null;

  // 2-2 & 2-3. "+" 버튼: 동적 추가 및 최대 100개 제한
  const handleAddIngredient = () => {
    if (ingredients.length >= 100) {
      setErrorMessage('재료는 레시피당 최대 100개까지만 추가할 수 있습니다.');
      return;
    }
    setErrorMessage('');
    setIngredients((prev) => [
      ...prev,
      { id: `ing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: '', amount: '', unit: '' },
    ]);
  };

  // 2-4. "-" 버튼: 해당 재료 칸 즉시 삭제
  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length <= 1) {
      setIngredients([{ id: `ing-${Date.now()}-1`, name: '', amount: '', unit: '' }]);
      return;
    }
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    if (ingredients.length - 1 < 100) {
      setErrorMessage('');
    }
  };

  // 재료 필드 업데이트 (2-1. 재료명 20자, 단위 10자, 양의 실수 제약)
  const handleIngredientChange = (
    id: string,
    field: keyof Omit<Ingredient, 'id'>,
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;

        if (field === 'name') {
          // 최대 20자 제한
          return { ...ing, name: value.slice(0, 20) };
        }

        if (field === 'unit') {
          // 최대 10자 제한
          return { ...ing, unit: value.slice(0, 10) };
        }

        if (field === 'amount') {
          // 양의 실수 입력 제약
          if (value === '') {
            return { ...ing, amount: '' };
          }
          const num = parseFloat(value);
          if (isNaN(num)) return ing;
          if (num < 0) return { ...ing, amount: 0 };
          return { ...ing, amount: num };
        }

        return ing;
      })
    );
  };

  // 2-6. 저장 시 빈칸 자동 정리 (Cleanup) 및 저장
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipeName.trim()) {
      setErrorMessage('레시피 이름을 입력해 주세요.');
      return;
    }

    if (!servings || servings <= 0) {
      setErrorMessage('기준 인분 수(N)는 1 이상의 양수여야 합니다.');
      return;
    }

    // 2-6. 내용이 없는 공란(빈칸) 데이터 자동 제거 (Cleanup)
    const cleanedIngredients = ingredients
      .filter((ing) => {
        const hasName = ing.name.trim().length > 0;
        const hasAmount = ing.amount !== '' && typeof ing.amount === 'number' && ing.amount > 0;
        const hasUnit = ing.unit.trim().length > 0;
        return hasName && (hasAmount || hasUnit);
      })
      .map((ing) => ({
        ...ing,
        name: ing.name.trim(),
        unit: ing.unit.trim(),
        amount: typeof ing.amount === 'number' && ing.amount > 0 ? ing.amount : 1,
      }));

    if (cleanedIngredients.length === 0) {
      setErrorMessage('적어도 1개 이상의 유효한 재료(재료명 및 양/단위)를 입력해 주세요. (빈칸은 자동 제거됩니다)');
      return;
    }

    const newRecipe: Recipe = {
      id: editingRecipe ? editingRecipe.id : `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: recipeName.trim(),
      servings: Number(servings),
      ingredients: cleanedIngredients,
      createdAt: editingRecipe ? editingRecipe.createdAt : Date.now(),
    };

    onSave(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingRecipe ? '레시피 수정' : '새 레시피 작성'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 폼 바디 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                레시피 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="예: 김치찌개, 된장찌개"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                maxLength={40}
                required
              />
            </div>

            {/* 2-5. 기준 인분 수 (N인분) 입력란 */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                기준 인분 수 (N) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10 font-medium"
                  required
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium pointer-events-none">
                  인분
                </span>
              </div>
            </div>
          </div>

          {/* 재료 목록 동적 입력 섹션 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  식재료 목록 ({ingredients.length} / 100개)
                </label>
                <span className="text-[11px] text-slate-400">
                  재료명(20자), 양(양의 실수), 단위(10자)
                </span>
              </div>
              {/* 2-2 & 2-3. "+" 버튼 (최대 100개) */}
              <button
                type="button"
                onClick={handleAddIngredient}
                disabled={ingredients.length >= 100}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  ingredients.length >= 100
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                재료 추가 (+)
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {ingredients.map((ing, index) => (
                <div
                  key={ing.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                >
                  <span className="text-xs font-mono text-slate-400 w-6 text-center shrink-0">
                    {index + 1}
                  </span>

                  {/* 2-1. 재료명: 최대 20자 */}
                  <div className="flex-2 min-w-0">
                    <input
                      type="text"
                      maxLength={20}
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(ing.id, 'name', e.target.value)}
                      placeholder="재료명 (최대 20자)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* 2-1 & 5-1. 양: 양의 실수 (0 이상, 스피너 1단위 정상 증감 개선) */}
                  <div className="flex-1 min-w-[70px]">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={ing.amount}
                      onChange={(e) => handleIngredientChange(ing.id, 'amount', e.target.value)}
                      placeholder="수량 (예: 1.5)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  {/* 2-1. 단위: 최대 10자 */}
                  <div className="flex-1 min-w-[70px]">
                    <input
                      type="text"
                      maxLength={10}
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(ing.id, 'unit', e.target.value)}
                      placeholder="단위 (예: 개, g)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* 2-4. "-" 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="이 재료 칸 삭제 (-)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              💡 입력하지 않고 남겨둔 빈 재료 칸은 저장 시 자동으로 정리되어 사라집니다.
            </p>
          </div>

          {/* 모달 하단 액션 버튼 */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
            >
              {editingRecipe ? '수정 완료 (저장)' : '레시피 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
