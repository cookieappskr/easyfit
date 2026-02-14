import {
  type RouteConfig,
  index,
  route,
  prefix,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("users", [
    index("features/users/pages/index-page.tsx"),
    route("/:id", "features/users/pages/detail-page.tsx"),
    route("/:username/welcome", "features/users/pages/welcome-page.tsx"),
  ]),
  ...prefix("categories", [index("features/categories/pages/index-page.tsx")]),
  ...prefix("exercises", [
    layout("features/exercises/layout/base-layout.tsx", [
      index("features/exercises/pages/index-page.tsx"),
      route("/:id", "features/exercises/pages/detail-page.tsx"),
    ]),
  ]),
  ...prefix("plans", [
    layout("features/plans/layouts/base-layout.tsx", [
      index("features/plans/pages/index-page.tsx"),
      route("/:id", "features/plans/pages/detail-page.tsx"),
    ]),
  ]),
  ...prefix("auth", [
    layout("features/auth/layouts/base-layout.tsx", [
      route("/login", "features/auth/pages/login-page.tsx"),
      route("/callback", "features/auth/pages/callback-page.tsx"),
      route("/update-profile", "features/auth/pages/update-profile-page.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
