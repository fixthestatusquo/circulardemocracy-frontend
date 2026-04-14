import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface AnalyticsData {
  totalMessages: number;
  repliesSent: number;
  pendingReplies: number;
  messagesByDay: Array<{
    date: string;
    count: number;
  }>;
  messagesByCampaign: Array<{
    campaignId: number;
    campaignName: string;
    count: number;
  }>;
  dailyCampaignData?: Array<{
    date: string;
    campaigns: { [campaignName: string]: number };
  }>;
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const {
    data: { session },
  } = await supabase!.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  try {
    const { data: summary, error } = await supabase!
      .from("message_analytics_summary")
      .select("total_messages, replies_sent, pending_replies, messages_by_day, messages_by_campaign, daily_campaign_data")
      .single();

    if (error) {
      console.error("analytics summary returned error:", error);
      return {
        totalMessages: 0,
        repliesSent: 0,
        pendingReplies: 0,
        messagesByDay: [],
        messagesByCampaign: [],
        dailyCampaignData: [],
      };
    }

    if (!summary) {
      return {
        totalMessages: 0,
        repliesSent: 0,
        pendingReplies: 0,
        messagesByDay: [],
        messagesByCampaign: [],
        dailyCampaignData: [],
      };
    }

    return {
      totalMessages: summary.total_messages ?? 0,
      repliesSent: summary.replies_sent ?? 0,
      pendingReplies: summary.pending_replies ?? 0,
      messagesByDay: summary.messages_by_day ?? [],
      messagesByCampaign: summary.messages_by_campaign ?? [],
      dailyCampaignData: summary.daily_campaign_data ?? [],
    };
  } catch (error) {
    console.warn("Failed to fetch analytics, returning empty data:", error);
    return {
      totalMessages: 0,
      repliesSent: 0,
      pendingReplies: 0,
      messagesByDay: [],
      messagesByCampaign: [],
      dailyCampaignData: [],
    };
  }
}

export function useAnalytics() {
  return useQuery<AnalyticsData, Error>({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    refetchInterval: 60000,
  });
}
