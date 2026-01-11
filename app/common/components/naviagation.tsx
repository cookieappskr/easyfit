import { Link } from "react-router";
import Logo from "./logo";

const menus = [
  {
    name: "유형관리",
    to: "/categories",
  },
  {
    name: "운동관리",
    to: "/exercises",
  },
  {
    name: "부하플랜관리",
    to: "/plans",
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
    <nav className="flex items-center justify-between p-4 fixed px-20 h-16 bg-background/50">
      <Logo />
      <div className="flex flex-row items-center gap-4">
        {menus.map((menu) => (
          <div key={menu.to}>
            <Link to={menu.to}>{menu.name}</Link>
          </div>
        ))}
      </div>
    </nav>
  );
}
