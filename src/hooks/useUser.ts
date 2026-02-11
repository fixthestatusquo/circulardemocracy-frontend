import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

async function fetchCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase!.auth.getUser();
  if (error) return null;

  return data.user;
}

export function useUser() {
  return useSuspenseQuery<User | null, Error>({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });
}
