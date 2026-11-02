import { AggregatedIngredient } from '../types';
import { formatAmount } from './calculator';

/**
 * 4-2. 최종 장바구니 리스트를 보기 좋은 텍스트(문자열) 형태로 가공
 * 예:
 * [장보기 목록]
 * - 당근: 1.5개
 * - 마늘: 30g
 * - 양파: 2개
 */
export function formatCartListToText(aggregatedIngredients: AggregatedIngredient[]): string {
  if (aggregatedIngredients.length === 0) {
    return '[장보기 목록]\n(장바구니에 담긴 재료가 없습니다)';
  }

  const lines = aggregatedIngredients.map(
    (item) => `- ${item.name}: ${formatAmount(item.totalAmount)} ${item.unit}`.trim()
  );

  return `[장보기 목록]\n${lines.join('\n')}`;
}

/**
 * 4-3. 가공된 텍스트를 클립보드에 복사 (오프라인 / 비보안 환경 폴백 포함)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard failed, using fallback:', err);
  }

  // 폴백: textarea execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('execCommand copy failed:', err);
    return false;
  }
}
