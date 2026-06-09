import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/lib/supabase";

interface Message {
  id: number;
  external_id: string | null;
  sender_country: string | null;
  duplicate_rank: number;
  classification_confidence: number;
  language: string;
  received_at: string;
  processed_at: string;
  reply_sent_at: string | null;
  reply_template_id: number | null;
  processing_status: string;
  reply_id: string | null;
}

export function useForwardMessage() {
  const { jmapClient } = useAuth();

  const forwardMutation = useMutation({
    mutationFn: async (message: Message) => {
      if (!jmapClient) {
        throw new Error(
          "JMAP client not available. Please log in with the representative account.",
        );
      }

      const jmapId = message.external_id;
      if (!jmapId) {
        throw new Error("Message has no external ID");
      }

      // Fetch full JMAP message
      const jmapMessage = await jmapClient.getMessage({ messageId: jmapId });
      if (!jmapMessage) {
        throw new Error("Failed to fetch message content");
      }

      // Fetch politician data
      const { data: politician, error: politicianError } = await getSupabase()
        .from("politicians")
        .select("*")
        .maybeSingle();

      if (politicianError || !politician) {
        throw new Error("Failed to fetch politician data");
      }

      const politicianEmail = politician.reply_to || politician.email;
      const constituent = jmapMessage.replyTo?.[0] ?? jmapMessage.from?.[0];

      const constituentEmail = constituent?.email;
      const constituentName = constituent?.name || constituentEmail;

      if (!constituentEmail) {
        throw new Error("No sender email found on the original message");
      }

      // Extract body text
      const bodyText =
        jmapMessage.body ||
        (typeof jmapMessage.textBody === "string"
          ? jmapMessage.textBody
          : Array.isArray(jmapMessage.textBody)
            ? jmapMessage.textBody
                .map((p) =>
                  typeof p === "string" ? p : (p as { partId: string }).partId,
                )
                .join("\n")
            : "(no text content)");

      // Forward: send from the politician's mailbox with the constituent's
      // name as sender, so replies route back to the constituent via replyTo
      await jmapClient.sendEmail({
        from: politicianEmail,
        fromName: constituentName,
        to: politicianEmail,
        subject: jmapMessage.subject || "(no subject)",
        text: bodyText,
      } as import("jmap-cli").SendEmailOptions);
    },
    onSuccess: () => {
      toast.success("Message forwarded to your email");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to forward message");
    },
  });

  const handleForward = (message: Message) => {
    if (!jmapClient) {
      toast.error("Please log in with the representative account first");
      return;
    }
    forwardMutation.mutate(message);
  };

  return { handleForward, isForwarding: forwardMutation.isPending };
}
