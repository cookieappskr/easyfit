import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  ...prefix("users", [
    index("features/users/pages/index-page.tsx"),
    route("/:id", "features/users/pages/detail-page.tsx"),
  ]),
  ...prefix("categories", [
    index("features/categories/pages/index-page.tsx"),
    route("/:id", "features/categories/pages/detail-page.tsx"),
    route("/new", "features/categories/pages/new-page.tsx"),
  ]),
  ...prefix("auth", [
    route("/login", "features/auth/pages/login-page.tsx"),
    route("/update-profile", "features/auth/pages/update-profile-page.tsx"),
  ]),
] satisfies RouteConfig;
