import { Link } from "react-router";
import Logo from "./logo";
import NavigationMenuItem from "./navigation-menu-item";

const menus = [
  {
    name: "유형관리",
    to: "/categories",
    isAuthMenu: false,
  },
  {
    name: "운동관리",
    to: "/exercises",
    isAuthMenu: false,
  },
  {
    name: "부하플랜관리",
    to: "/plans",
    isAuthMenu: false,
  },
  {
    name: "로그인",
    to: "/auth/login",
    isAuthMenu: true,
  },
  {
    name: "로그아웃",
    to: "/auth/logout",
    isAuthMenu: true,
  },
];

export default function Navigation({
  isAuthenticated,
  isAdmin,
  profile,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  profile: any;
}) {
  return (
    <nav className="flex w-full items-center justify-between p-4 fixed px-20 h-16 bg-amber-50">
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <Logo />
      </Link>
      <div className="flex flex-row items-center gap-4">
        {menus.map((menu) => (
          <NavigationMenuItem
            key={menu.to}
            name={menu.name}
            to={menu.to}
            isAuthenticated={isAuthenticated}
            isAuthMenu={menu.isAuthMenu}
          />
        ))}
      </div>
    </nav>
  );
}
