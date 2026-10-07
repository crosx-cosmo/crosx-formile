// App database connection (user's own project). Publishable key is safe in browser code.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const URL = "https://butlkydfpogqsbnifaiy.supabase.co";
const KEY = "sb_publishable_rXlQke_8-QPC7SqVd9puWQ_60WFq8On";

function makeClient() {
  const isBrowser = typeof window !== "undefined";
  return createClient<Database>(URL, KEY, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization") === `Bearer ${KEY}`) headers.delete("Authorization");
        headers.set("apikey", KEY);
        return fetch(input, { ...init, headers });
      },
    },
    auth: {
      storageKey: "formile-auth",
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
    },
  });
}

let _client: ReturnType<typeof makeClient> | undefined;
export const supabase = new Proxy({} as ReturnType<typeof makeClient>, {
  get(_, prop) {
    if (!_client) _client = makeClient();
    const v = Reflect.get(_client, prop);
    return typeof v === "function" ? v.bind(_client) : v;
  },
});
