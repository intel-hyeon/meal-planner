import { useState, useEffect, useMemo } from 'react';
import { ChefHat, ShoppingBag, Plus, Sparkles, RotateCcw } from 'lucide-react';
import { ActiveTab, Recipe, CartItem } from './types';
import {
  loadRecipes,
  saveRecipes,
  deleteRecipeFromStorage,
  loadCart,
  saveCart,
  deleteCartItemFromStorage,
  clearAllStorage,
} from './utils/storage';
import { aggregateCartIngredients } from './utils/calculator';
import RecipeModal from './components/RecipeModal';
import RecipeCard from './components/RecipeCard';
import CartView from './components/CartView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // 모달 상태 (새 작성 / 수정)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // 1-2. 브라우저 내 LocalStorage에서 초기 데이터 불러오기
  useEffect(() => {
    const loadedRecipes = loadRecipes();
    const loadedCart = loadCart();

    // 4-1 무결성 방어: 캐시에 남아있는 고아 장바구니 항목(존재하지 않는 레시피 ID) 자동 청소
    const validRecipeIds = new Set(loadedRecipes.map((r) => r.id));
    const sanitizedCart = loadedCart.filter((item) => validRecipeIds.has(item.recipeId));
    if (sanitizedCart.length !== loadedCart.length) {
      saveCart(sanitizedCart);
    }

    setRecipes(loadedRecipes);
    setCart(sanitizedCart);
  }, []);

  // 레시피 목록이 변경될 때 장바구니의 무결성을 항상 보장 (고아 데이터 자동 제거)
  useEffect(() => {
    if (recipes.length === 0 && cart.length > 0) {
      setCart([]);
      saveCart([]);
      return;
    }
    const validIds = new Set(recipes.map((r) => r.id));
    setCart((prevCart) => {
      const filtered = prevCart.filter((item) => validIds.has(item.recipeId));
      if (filtered.length !== prevCart.length) {
        saveCart(filtered);
        return filtered;
      }
      return prevCart;
    });
  }, [recipes]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // 2-1 & 2-2. 새 레시피 작성 모달 열기
  const handleOpenCreateModal = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  // 2-7. 기존 레시피 수정 모달 열기
  const handleOpenEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  // 2-6 & 2-7. 레시피 저장 (신규 등록 및 수정) -> 캐시 즉각 동기화
  const handleSaveRecipe = (savedRecipe: Recipe) => {
    let updatedRecipes: Recipe[];
    const isEdit = recipes.some((r) => r.id === savedRecipe.id);

    if (isEdit) {
      updatedRecipes = recipes.map((r) => (r.id === savedRecipe.id ? savedRecipe : r));
      showStatus(`'${savedRecipe.name}' 레시피가 수정되었습니다.`);
    } else {
      updatedRecipes = [savedRecipe, ...recipes];
      showStatus(`새 레시피 '${savedRecipe.name}'가 등록되었습니다.`);
    }

    setRecipes(updatedRecipes);
    saveRecipes(updatedRecipes);
  };

  // 1-3 & 2-7 & 4-1. 캐시에서 특정 레시피 삭제
  const handleDeleteRecipe = (id: string, name: string) => {
    if (!window.confirm(`'${name}' 레시피를 정말 삭제하시겠습니까? (캐시에서도 영구 삭제됩니다)`)) {
      return;
    }
    deleteRecipeFromStorage(id);
    const updatedRecipes = recipes.filter((r) => r.id !== id);
    setRecipes(updatedRecipes);

    // 4-1. 장바구니 동기화 삭제 (장바구니에 담겨있던 해당 레시피를 찾아 자동으로 지워 기존/null 값이 남지 않도록 동기화)
    deleteCartItemFromStorage(id);
    const updatedCart = cart.filter((item) => item.recipeId !== id);
    setCart(updatedCart);
    saveCart(updatedCart);

    showStatus(`'${name}' 레시피가 삭제되었습니다.`);
  };

  // 캐시 전체 비우기 (경고창 확인 후 안전하게 초기화)
  const handleClearAllStorage = () => {
    const confirmed = window.confirm(
      '⚠️ 경고: LocalStorage의 모든 캐시 데이터를 삭제하시겠습니까?\n등록된 모든 레시피와 장바구니 내용이 영구적으로 초기화됩니다.'
    );
    if (!confirmed) return;

    clearAllStorage();
    setRecipes([]);
    setCart([]);
    showStatus('모든 로컬 캐시 데이터가 초기화되었습니다.');
  };

  // 3-1. 레시피 카드를 장바구니에 담기 / 빼기 토글
  const handleToggleCart = (recipe: Recipe) => {
    const existingIndex = cart.findIndex((item) => item.recipeId === recipe.id);
    let updatedCart: CartItem[];

    if (existingIndex >= 0) {
      // 이미 담겨있으면 제거
      updatedCart = cart.filter((item) => item.recipeId !== recipe.id);
      showStatus(`'${recipe.name}' 레시피가 장바구니에서 제외되었습니다.`);
    } else {
      // 새로 담기 (3-2. 초기 디폴트 M인분 값: 1)
      const newItem: CartItem = {
        recipeId: recipe.id,
        targetServings: 1,
      };
      updatedCart = [...cart, newItem];
      showStatus(`'${recipe.name}' 레시피가 장바구니에 담겼습니다.`);
    }

    setCart(updatedCart);
    saveCart(updatedCart);
  };

  // 3-2. 장바구니 내 요리할 인분 수(M) 수정 및 캐시 동기화
  const handleUpdateTargetServings = (recipeId: string, targetServings: number) => {
    const updatedCart = cart.map((item) =>
      item.recipeId === recipeId ? { ...item, targetServings } : item
    );
    setCart(updatedCart);
    saveCart(updatedCart);
  };

  // 장바구니에서 단일 항목 제거
  const handleRemoveFromCart = (recipeId: string) => {
    deleteCartItemFromStorage(recipeId);
    const updatedCart = cart.filter((item) => item.recipeId !== recipeId);
    setCart(updatedCart);
    saveCart(updatedCart);
  };

  // 3-5 & 3-6. 중복 재료 합산 및 가나다순 정렬 계산 (메모이제이션)
  const aggregatedIngredients = useMemo(() => {
    return aggregateCartIngredients(recipes, cart);
  }, [recipes, cart]);

  const isRecipeInCart = (recipeId: string) => {
    return cart.some((item) => item.recipeId === recipeId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* 상단 헤더 네비게이션 */}
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

          {/* 1-1. 레시피 탭 / 장바구니 탭 전환 버튼 */}
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
        <div className="bg-emerald-600 text-white text-sm py-2 px-4 text-center font-medium shadow-sm flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4" />
          <span>{statusMessage}</span>
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
              </div>

              {/* 상단 컨트롤 버튼 그룹 */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleClearAllStorage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shadow-2xs"
                  title="로컬 스토리지 캐시 전체 초기화"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  캐시 비우기
                </button>
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  새 레시피 작성
                </button>
              </div>
            </div>

            {/* 레시피 카드 목록 그리드 */}
            {recipes.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">저장된 레시피가 없습니다</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  '새 레시피 작성' 버튼을 눌러 첫 레시피를 등록해 보세요!
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> 새 레시피 작성
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteRecipe}
                    onAddToCart={handleToggleCart}
                    isInCart={isRecipeInCart(recipe.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 탭 2: 장바구니 화면 */}
        {activeTab === 'cart' && (
          <section className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">장바구니</h2>
              <p className="text-sm text-slate-500 mt-1">
                담긴 레시피의 목표 인분 수에 맞춰 식재료 양을 자동 계산하고 동일 재료를 합산합니다.
              </p>
            </div>

            <CartView
              recipes={recipes}
              cart={cart}
              aggregatedIngredients={aggregatedIngredients}
              onUpdateTargetServings={handleUpdateTargetServings}
              onRemoveFromCart={handleRemoveFromCart}
              onGoToRecipes={() => setActiveTab('recipes')}
              onShowToast={showStatus}
            />
          </section>
        )}
      </main>

      {/* 2-1. 레시피 작성 및 수정 모달 다이얼로그 */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecipe}
        editingRecipe={editingRecipe}
      />

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        식단 플래너 & 장바구니 • 모든 데이터는 브라우저 내부 LocalStorage에만 저장됩니다 (오프라인 지원)
      </footer>
    </div>
  );
}
