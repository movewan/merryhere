/**
 * 전화번호 포맷팅 유틸리티
 */

/**
 * 전화번호를 010-1234-5678 형식으로 포맷팅
 * @param value 입력된 전화번호 (숫자 또는 하이픈 포함)
 * @returns 포맷팅된 전화번호
 */
export function formatPhoneNumber(value: string): string {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, "");

  // 길이에 따라 포맷팅
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else if (numbers.length <= 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else {
    // 11자리 초과 시 11자리까지만
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
}

/**
 * 포맷팅된 전화번호에서 숫자만 추출
 * @param value 포맷팅된 전화번호
 * @returns 숫자만 있는 전화번호
 */
export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * 전화번호 유효성 검증
 * @param value 전화번호
 * @returns 유효 여부
 */
export function isValidPhoneNumber(value: string): boolean {
  const numbers = unformatPhoneNumber(value);

  // 010, 011, 016, 017, 018, 019로 시작하는 10-11자리 번호
  const phoneRegex = /^01[0-9]\d{7,8}$/;

  return phoneRegex.test(numbers);
}
