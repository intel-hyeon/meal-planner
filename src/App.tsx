import { useState, useEffect } from 'react';
import { ChefHat, ShoppingBag, Trash2, Plus, Database, RefreshCw } from 'lucide-react';
import { ActiveTab, Recipe, CartItem } from './types';
import {
  loadRecipes,
  saveRecipes,
  deleteRecipeFromStorage,
  loadCart,
  deleteCartItemFromStorage,
  clearAllStorage,
  INITIAL_RECIPES,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // 1-2. 브라우저 내 LocalStorage에서 초기 데이터 불러오기
  useEffect(() => {
    const loadedRecipes = loadRecipes();
    const loadedCart = loadCart();
    setRecipes(loadedRecipes);
    setCart(loadedCart);
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // 1-3. 캐시에서 특정 레시피 데이터를 안전하게 제거하는 삭제 함수
  const handleDeleteRecipe = (id: string, name: string) => {
    if (!window.confirm(`'${name}' 레시피를 정말 삭제하시겠습니까? (캐시에서도 영구 삭제됩니다)`)) {
      return;
    }
    deleteRecipeFromStorage(id);
    const updatedRecipes = recipes.filter((r) => r.id !== id);
    setRecipes(updatedRecipes);

    // 장바구니에 해당 레시피가 있다면 함께 안전하게 제거
    deleteCartItemFromStorage(id);
    const updatedCart = cart.filter((item) => item.recipeId !== id);
    setCart(updatedCart);

    showStatus(`'${name}' 레시피가 LocalStorage 캐시에서 성공적으로 삭제되었습니다.`);
  };

  // 기본 샘플 레시피 다시 채우기
  const handleResetSampleData = () => {
    saveRecipes(INITIAL_RECIPES);
    setRecipes(INITIAL_RECIPES);
    showStatus('기본 샘플 레시피가 LocalStorage에 다시 저장되었습니다.');
  };

  // 캐시 완전 비우기
  const handleClearAllStorage = () => {
    if (!window.confirm('LocalStorage의 모든 캐시 데이터를 초기화하시겠습니까?')) return;
    clearAllStorage();
    setRecipes([]);
    setCart([]);
    showStatus('모든 로컬 캐시 데이터가 삭제되었습니다.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* 상단 네비게이션 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">식단 플래너 & 장바구니</h1>
              <p className="text-xs text-slate-500">레시피 기반 맞춤 식재료 비례 계산기</p>
            </div>
          </div>

          {/* 1-1. 레시피 탭과 장바구니 탭 전환 버튼 */}
          <nav className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                activeTab === 'recipes'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>레시피 관리</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700">
                {recipes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                activeTab === 'cart'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>장바구니</span>
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-bold ${
                cart.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {cart.length}
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* 상태 안내 토스트 바 */}
      {statusMessage && (
        <div className="bg-emerald-600 text-white text-sm py-2 px-4 text-center font-medium shadow-sm transition-all">
          {statusMessage}
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        {/* 탭 1: 레시피 관리 화면 */}
        {activeTab === 'recipes' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">등록된 레시피 목록</h2>
                <p className="text-sm text-slate-500 mt-1">
                  작성된 레시피는 브라우저 LocalStorage에 안전하게 영구 저장됩니다. (새로고침 시 유지)
                </p>
              </div>

              {/* 상단 보조 조작 버튼들 */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleResetSampleData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  title="기본 샘플 레시피 다시 불러오기"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  샘플 복원
                </button>
                <button
                  onClick={handleClearAllStorage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                  title="로컬 스토리지 캐시 비우기"
                >
                  <Database className="w-3.5 h-3.5" />
                  캐시 비우기
                </button>
                <button
                  disabled
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg opacity-60 cursor-not-allowed shadow-xs"
                  title="2단계에서 레시피 등록 폼이 완성됩니다"
                >
                  <Plus className="w-4 h-4" />
                  새 레시피 작성 (2단계 예정)
                </button>
              </div>
            </div>

            {/* 레시피 카드 목록 그리드 */}
            {recipes.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">저장된 레시피가 없습니다</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  우측 상단의 '샘플 복원' 버튼을 누르거나 2단계에서 새 레시피를 추가해 보세요.
                </p>
                <button
                  onClick={handleResetSampleData}
                  className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  기본 샘플 레시피 불러오기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{recipe.name}</h3>
                          <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            기준 {recipe.servings}인분
                          </span>
                        </div>
                        {/* 1-3. 캐시 삭제 함수와 연결된 삭제 버튼 */}
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="레시피 삭제 (LocalStorage에서 영구 제거)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 재료 목록 미리보기 */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">
                          재료 목록 ({recipe.ingredients.length}개)
                        </p>
                        <ul className="space-y-1">
                          {recipe.ingredients.slice(0, 4).map((ing) => (
                            <li key={ing.id} className="text-xs text-slate-600 flex justify-between">
                              <span>• {ing.name}</span>
                              <span className="font-mono text-slate-500">
                                {ing.amount} {ing.unit}
                              </span>
                            </li>
                          ))}
                          {recipe.ingredients.length > 4 && (
                            <li className="text-xs text-slate-400">
                              + 외 {recipe.ingredients.length - 4}개 재료
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">LocalStorage 동기화됨</span>
                      <button
                        disabled
                        className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
                      >
                        장바구니 담기 (3단계 예정)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 탭 2: 장바구니 화면 */}
        {activeTab === 'cart' && (
          <section className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">장바구니 및 비례 계산 목록</h2>
              <p className="text-sm text-slate-500 mt-1">
                담긴 레시피의 목표 인분 수에 맞춰 식재료 양을 자동 계산하고 동일 재료를 합산합니다.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">장바구니 기능 준비 중</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
                현재 <strong>1단계(기본 레이아웃 및 LocalStorage 스토리지 연동)</strong>가 준비되었습니다.<br />
                3단계 및 4단계에서 목표 인분 수(M인분) 설정, 비례 계산 및 재료 정렬 합산 기능이 연동됩니다.
              </p>
              <button
                onClick={() => setActiveTab('recipes')}
                className="px-5 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors inline-flex items-center gap-2"
              >
                <ChefHat className="w-4 h-4" />
                레시피 관리 탭으로 돌아가기
              </button>
            </div>
          </section>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        식단 플래너 & 장바구니 • 모든 데이터는 브라우저 내부 LocalStorage에만 저장됩니다 (오프라인 지원)
      </footer>
    </div>
  );
}
