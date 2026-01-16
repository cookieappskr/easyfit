import { Link, useLocation } from "react-router";
import { browserClient } from "~/supa-client";
import { cn } from "~/lib/utils";

interface NavigationMenuItemProps {
  /**
   * 메뉴 이름
   */
  name: string;
  /**
   * 이동할 경로
   */
  to: string;
  /**
   * 로그인 상태
   */
  isAuthenticated: boolean;
  /**
   * 로그인 관련 메뉴인지 여부 (로그인/로그아웃)
   */
  isAuthMenu?: boolean;
}

/**
 * 네비게이션 메뉴 아이템 컴포넌트
 *
 * - 마우스 오버 시 2px 보더 표시
 * - 클릭 시 해당 화면으로 이동
 * - 로그인 상태에 따라 로그인/로그아웃 메뉴 표시
 */
export default function NavigationMenuItem({
  name,
  to,
  isAuthenticated,
  isAuthMenu = false,
}: NavigationMenuItemProps) {
  const location = useLocation();
  
  // 현재 경로와 메뉴 경로가 일치하는지 확인
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
  
  // 로그인 메뉴: 로그인 상태가 아닐 때만 표시
  // 로그아웃 메뉴: 로그인 상태일 때만 표시
  if (isAuthMenu) {
    const isLoginMenu = to === "/auth/login";
    const isLogoutMenu = to === "/auth/logout";

    if (isLoginMenu && isAuthenticated) {
      return null; // 로그인 상태면 로그인 메뉴 숨김
    }
    if (isLogoutMenu && !isAuthenticated) {
      return null; // 로그아웃 상태면 로그아웃 메뉴 숨김
    }
  }

  // 로그아웃의 경우 클릭 시 로그아웃 처리
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (to === "/auth/logout") {
      e.preventDefault();
      await browserClient.auth.signOut();
      // 로그아웃 후 홈으로 리다이렉트
      window.location.href = "/";
      return;
    }
    
    // 같은 페이지를 다시 클릭한 경우 페이지 새로고침
    if (isActive && !isAuthMenu) {
      e.preventDefault();
      window.location.href = to;
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(
        "px-4 py-2 rounded transition-all border-2",
        isActive && !isAuthMenu
          ? "border-foreground bg-foreground/5"
          : "border-transparent hover:border-foreground"
      )}
    >
      {name}
    </Link>
  );
}
