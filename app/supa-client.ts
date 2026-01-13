import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import type { Database as SupabaseDatabase } from "database.types";
import type { MergeDeep, SetNonNullable, SetFieldType } from "type-fest";

// Supabase를 이용할 때 발생하는 type error를 해결하기 위해 사용
export type Database = MergeDeep<
  SupabaseDatabase,
  {
    public: {
      Views: {};
    };
  }
>;

// 클라이언트 사이드에서는 import.meta.env 사용 (Vite 환경 변수)
// VITE_ 접두사가 붙은 환경 변수만 클라이언트에 노출됨
export const browserClient = createBrowserClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export const makeSSRClient = (request: Request) => {
  const headers = new Headers();
  const serverSideClient = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Promise.resolve(
            parseCookieHeader(request.headers.get("Cookie") ?? "").map(
              (cookie) => ({
                name: cookie.name,
                value: cookie.value ?? "",
              })
            )
          );
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            );
          });
        },
      },
    }
  );
  return {
    client: serverSideClient,
    headers,
  };
};
