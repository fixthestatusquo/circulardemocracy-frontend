import { useMutation } from "@tanstack/react-query";
import type JmapClient from "jmap-cli";
import type { SendEmailOptions } from "jmap-cli";

/**
 * Hook that returns a mutation for sending an email via JMAP.
 *
 * The caller controls `onSuccess` and `onError` on the returned mutation
 * to show custom toast messages and handle side effects.
 *
 * Example:
 *
 *   const sendMutation = useSendEmail(jmapClient);
 *   sendMutation.mutate(
 *     { from, fromName, to, subject, text, html },
 *     { onSuccess: () => { ... }, onError: (err) => { ... } },
 *   );
 */
export function useSendEmail(jmapClient: JmapClient | null) {
  return useMutation({
    mutationFn: async (options: SendEmailOptions) => {
      if (!jmapClient) {
        throw new Error(
          "JMAP client not available. Please log in with the representative account.",
        );
      }
      return jmapClient.sendEmail(options);
    },
  });
}
