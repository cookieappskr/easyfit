/**
 * 디자인 토큰 설정
 *
 * 프로젝트의 색상, 간격, 타이포그래피 등 디자인 시스템 토큰을 중앙에서 관리합니다.
 */

/**
 * 브랜드 색상
 */
export const colors = {
  primary: "#008C44",
  secondary: "#FFE700",
} as const;

/**
 * 색상 타입
 */
export type ColorKey = keyof typeof colors;
