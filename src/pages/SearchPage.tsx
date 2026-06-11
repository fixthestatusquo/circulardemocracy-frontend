import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageViewDialog } from "@/components/dashboard/MessageViewDialog";
import { MessageList } from "@/components/dashboard/MessageList";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Search } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type JmapClient from "jmap-cli";

interface SearchResultMessage {
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

async function searchMessages(
  jmapClient: JmapClient,
  email: string,
): Promise<{ messages: SearchResultMessage[]; totalCount: number }> {
  // JMAP filter: search across all message fields (from, to, subject, body)
  const filter = { text: email };

  let jmapMessages: Awaited<ReturnType<typeof jmapClient.searchMessages>>;
  try {
    jmapMessages = await jmapClient.searchMessages({
      filter,
      sort: "receivedAt",
      order: "desc",
    });
  } catch {
    // JMAP server may skip Email/get when query returns zero results
    return { messages: [], totalCount: 0 };
  }

  // Cross-reference with Supabase to enrich with database fields
  const jmapIds = jmapMessages.map((m) => m.id).filter(Boolean) as string[];
  let dbMessages: Record<string, Partial<SearchResultMessage>> = {};
  if (jmapIds.length > 0) {
    const { data } = await getSupabase()
      .from("messages")
      .select("external_id, duplicate_rank, processing_status, reply_sent_at, reply_template_id, reply_id, sender_country, classification_confidence, language, processed_at")
      .in("external_id", jmapIds);
    if (data) {
      for (const row of data) {
        if (row.external_id) {
          dbMessages[row.external_id] = row;
        }
      }
    }
  }

  const messages: SearchResultMessage[] = jmapMessages.map(
    (jmapMsg, index) => {
      const db = jmapMsg.id ? dbMessages[jmapMsg.id] : undefined;
      return {
        id: index,
        external_id: jmapMsg.id ?? null,
        sender_country: db?.sender_country ?? null,
        duplicate_rank: (db?.duplicate_rank as number) ?? 0,
        classification_confidence: (db?.classification_confidence as number) ?? 0,
        language: (db?.language as string) ?? "",
        received_at: jmapMsg.receivedAt ?? "",
        processed_at: (db?.processed_at as string) ?? "",
        reply_sent_at: (db?.reply_sent_at as string) ?? null,
        reply_template_id: (db?.reply_template_id as number) ?? null,
        processing_status: (db?.processing_status as string) ?? "",
        reply_id: (db?.reply_id as string) ?? null,
      };
    },
  );

  return { messages, totalCount: messages.length };
}

interface SearchContentProps {
  email: string;
  jmapClient: JmapClient;
}

function SearchContent({ email, jmapClient }: SearchContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const [messageDialogMsg, setMessageDialogMsg] =
    useState<SearchResultMessage | null>(null);
  const [viewedMessageIds, setViewedMessageIds] = useState<Set<string>>(
    new Set(),
  );

  const { data: searchData } = useSuspenseQuery<
    { messages: SearchResultMessage[]; totalCount: number },
    Error
  >({
    queryKey: ["search-messages", email, currentPage],
    queryFn: () => searchMessages(jmapClient, email),
    staleTime: 30000,
  });

  const allMessages = searchData?.messages || [];
  const totalCount = searchData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleViewMessage = (_messageId: number, jmapId: string) => {
    if (!jmapId) return;
    window.history.pushState(
      null,
      "",
      `/message/${encodeURIComponent(jmapId)}`,
    );
    const msg = allMessages.find((m) => m.external_id === jmapId) ?? null;
    setMessageDialogMsg(msg);
    setViewedMessageIds((prev) => new Set(prev).add(jmapId));
  };

  // Close dialog when browser back/forward navigates away from message URL
  useEffect(() => {
    const handlePopState = () => {
      if (messageDialogMsg) {
        setMessageDialogMsg(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [messageDialogMsg]);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-primary">
            Results for "{email}"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MessageList
            messages={allMessages}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onViewMessage={handleViewMessage}
            onViewHistory={() => {}}
            viewedMessageIds={viewedMessageIds}
            replyStatusFilter="all"
            onReplyStatusFilterChange={() => {}}
            emptyMessage="No messages found for this email address."
            showReplyFilter={false}
          />
        </CardContent>
      </Card>

      {/* Message View Dialog */}
      <MessageViewDialog
        messageId={messageDialogMsg?.external_id || ""}
        open={!!messageDialogMsg}
        replySentAt={messageDialogMsg?.reply_sent_at ?? null}
        replyTemplateId={messageDialogMsg?.reply_template_id ?? null}
        onOpenChange={(open) => {
          if (!open) {
            setMessageDialogMsg(null);
            if (window.location.pathname.startsWith("/message/")) {
              window.history.back();
            }
          }
        }}
      />
    </div>
  );
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";
  const [emailInput, setEmailInput] = useState(queryFromUrl);
  const [searchedEmail, setSearchedEmail] = useState<string | null>(
    queryFromUrl || null,
  );
  const { jmapClient } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (trimmed) {
      setSearchParams({ query: trimmed });
      setSearchedEmail(trimmed);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Search Messages</h1>
        <p className="text-gray-600">
          Messages from your constituents
        </p>

        <Card className="p-4">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                type="text"
                placeholder="Search by email or sender name..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={!emailInput.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchedEmail && jmapClient ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            }
          >
            <SearchContent email={searchedEmail} jmapClient={jmapClient} />
          </Suspense>
        ) : searchedEmail && !jmapClient ? (
          <Card className="p-4">
            <CardContent className="text-center py-8 text-muted-foreground">
              JMAP client is not available. Please log in with your
              representative account first.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </PageLayout>
  );
}
