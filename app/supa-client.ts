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

export const browserClient = createBrowserClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
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
