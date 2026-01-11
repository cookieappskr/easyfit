/**
 * 폰트 디자인 시스템 설정
 *
 * 프로젝트에서 사용하는 모든 폰트를 중앙에서 관리합니다.
 * 새로운 폰트를 추가할 때는 이 파일을 업데이트하세요.
 */

export const fonts = {
  /**
   * 기본 본문 폰트
   */
  sans: {
    name: "Inter",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    cssVariable: "--font-sans",
    fallback: [
      "ui-sans-serif",
      "system-ui",
      "sans-serif",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      "Noto Color Emoji",
    ],
  },
  /**
   * 타이틀 폰트
   */
  title: {
    name: "Black Han Sans",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap",
    cssVariable: "--font-title",
    fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  },
} as const;

/**
 * 폰트 링크 설정을 생성하는 헬퍼 함수
 * React Router의 LinksFunction에서 사용할 수 있습니다.
 */
export function createFontLinks() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    ...Object.values(fonts).map((font) => ({
      rel: "stylesheet" as const,
      href: font.googleFontsUrl,
    })),
  ];
}

/**
 * 폰트 타입
 */
export type FontKey = keyof typeof fonts;
