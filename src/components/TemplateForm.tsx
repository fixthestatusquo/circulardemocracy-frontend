import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import MDEditor, { commands, type RefMDEditor } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import TurndownService from "turndown";

const turndownService = new TurndownService({ headingStyle: "atx" });
import { SendTimingSelector } from "@/components/SendTimingSelector";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/contexts/AuthContext";
import { usePolitician } from "@/hooks/usePolitician";
import { useSendEmail } from "@/hooks/useSendEmail";
import {
  insertReplyTemplate,
  type ReplyTemplateInsertPayload,
  updateReplyTemplate,
} from "@/lib/replyTemplateMutations";
import { getSupabase } from "@/lib/supabase";
import { invalidateCampaignCache } from "@/lib/campaign";
interface Campaign {
  id: number;
  name: string;
}

const templateFormSchema = z
  .object({
    campaign_id: z.number().positive("Campaign is required"),
    politician_id: z.number().nullable().optional(),
    name: z
      .string()
      .min(3, "Template name must be at least 3 characters")
      .max(100, "Template name must be less than 100 characters"),
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(255, "Subject must be less than 255 characters"),
    body: z
      .string()
      .min(10, "Message body must be at least 10 characters")
      .max(10000, "Message body is too long"),
    layout_type: z.enum(["text_only", "standard_header", "EP"]),
    send_timing: z.enum(["immediate", "office_hours", "scheduled"]),
    scheduled_for: z.string().optional(),
    active: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.send_timing === "scheduled") {
        return !!data.scheduled_for && data.scheduled_for.length > 0;
      }
      return true;
    },
    {
      message:
        "Scheduled date/time is required when send timing is set to scheduled",
      path: ["scheduled_for"],
    },
  );

type TemplateFormData = z.infer<typeof templateFormSchema>;
type SendTimingValue = "immediate" | "office_hours" | "scheduled";

interface TemplateFormProps {
  initialData?: Partial<TemplateFormData> & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    const { data, error } = await getSupabase()
      .from("campaigns")
      .select("id, name")
      .order("name");
    if (error) {
      console.error("Error fetching campaigns:", error);
      throw error;
    }
    // Defensive check: ensure data is an array
    return data && Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error in fetchCampaigns:", error);
    throw error; // Re-throw for error boundary
  }
}

function buildInsertPayload(
  data: TemplateFormData,
): ReplyTemplateInsertPayload {
  const scheduledFor =
    data.send_timing === "scheduled" && data.scheduled_for?.trim()
      ? new Date(data.scheduled_for).toISOString()
      : null;

  return {
    campaign_id: data.campaign_id,
    politician_id: data.politician_id,
    name: data.name,
    subject: data.subject,
    body: data.body || "",
    layout_type: data.layout_type || "standard_header",
    send_timing: data.send_timing,
    scheduled_for: scheduledFor,
    active: data.active,
  };
}

export function TemplateForm({
  initialData,
  onSuccess,
  onCancel,
}: TemplateFormProps) {
  const queryClient = useQueryClient();
  const { data: profile } = usePolitician();
  const isEditMode = !!initialData?.id;
  const editorRef = useRef<RefMDEditor>(null);

  // Convert rich-text paste to markdown
  useEffect(() => {
    const el = editorRef.current?.textarea;
    if (!el) return;
    const handler = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const html = e.clipboardData.getData("text/html");
      if (!html) return;
      e.preventDefault();
      const markdown = turndownService.turndown(html);
      // Insert at cursor position using the textarea API
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = el.value.slice(0, start);
      const after = el.value.slice(end);
      el.value = before + markdown + after;
      el.selectionStart = el.selectionEnd = start + markdown.length;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    el.addEventListener("paste", handler);
    return () => el.removeEventListener("paste", handler);
  }, []);

  const { jmapClient } = useAuth();
  const sendMutation = useSendEmail(jmapClient);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendTargetEmail, setSendTargetEmail] = useState("");

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendTargetEmail.trim()) return;
    const body = watch("body");
    const subject = watch("subject");
    if (!body || !subject) {
      toast.error("Both subject and body are required to send.");
      return;
    }
    const html = marked.parse(body) as string;
    sendMutation.mutate(
      {
        from: sendTargetEmail.trim(),
        fromName: sendTargetEmail.trim(),
        to: sendTargetEmail.trim(),
        subject,
        text: body,
        html,
      },
      {
        onSuccess: () => {
          toast.success(`email sent to ${sendTargetEmail.trim()}`);
          setSendTargetEmail("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to send email");
        },
      },
    );
  };

  const { data: campaigns } = useSuspenseQuery<Campaign[], Error>({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });

  const [sendTiming, setSendTiming] = useState<SendTimingValue>(
    initialData?.send_timing || "immediate",
  );


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "default",
      subject: initialData?.subject || "Re: {subject}",
      body: initialData?.body ?? "",
      campaign_id: initialData?.campaign_id,
      politician_id: initialData?.politician_id ?? profile.id,
      layout_type: (initialData as any)?.layout_type || "standard_header",
      send_timing: initialData?.send_timing || "immediate",
      scheduled_for: initialData?.scheduled_for || "",
      active: initialData?.active ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TemplateFormData) =>
      insertReplyTemplate(buildInsertPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reply-templates"] });
      invalidateCampaignCache(queryClient);
      queryClient.invalidateQueries({ queryKey: ["campaign-templates"] });
      toast.success("Template created successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create template");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: TemplateFormData }) =>
      updateReplyTemplate(vars.id, buildInsertPayload(vars.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reply-templates"] });
      invalidateCampaignCache(queryClient);
      queryClient.invalidateQueries({ queryKey: ["campaign-templates"] });
      toast.success("Template updated successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update template");
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    const politicianId = profile.id;

    if (!politicianId) {
      toast.error(
        "Could not determine Politician ID. Please ensure your profile is complete or try again.",
      );
      return;
    }

    const finalData = {
      ...data,
      politician_id: politicianId,
    };

    try {
      if (isEditMode && initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: finalData,
        });
      } else {
        await createMutation.mutateAsync(finalData);
      }
    } catch (error) {
      // Error is already handled by mutation's onError callback
      // This catch prevents unhandled promise rejection
      console.error("Form submission error:", error);
    }
  };

  const activeValue = watch("active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("politician_id")} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="campaign_id">Campaign *</FieldLabel>
          <Select
            value={watch("campaign_id")?.toString()}
            onValueChange={(value) => {
              const cid = parseInt(value, 10);
              setValue("campaign_id", cid);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns && Array.isArray(campaigns) && campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name || "Unnamed Campaign"}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No campaigns available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.campaign_id && (
            <FieldError>{errors.campaign_id.message}</FieldError>
          )}
        </Field>

        <Input
          label="Template Name *"
          {...register("name")}
          errorMessage={errors.name?.message}
          placeholder="e.g., Standard Reply"
        />
      </div>

      <Input
        label="Subject Line *"
        {...register("subject")}
        errorMessage={errors.subject?.message}
        placeholder="e.g., Thank you for your message"
        description="{subject} = re-use the subject of the email received"
      />

      <Field>
        <FieldLabel htmlFor="body">Message Body (Markdown) *</FieldLabel>
        <div data-color-mode="light" className="rounded-md border border-input">
          <MDEditor
            ref={editorRef}
            value={watch("body") || ""}
            onChange={(value) => setValue("body", value || "", { shouldValidate: true })}
            preview={initialData?.body ? "live" : "edit"}
            height={300}
            commands={[
              commands.bold,
              commands.italic,
              commands.link,
              commands.divider,
              {
                ...commands.title1,
                name: "H1",
                icon: <div style={{ fontSize: 18, textAlign: "left", fontWeight: 700 }}>H1</div>,
                buttonProps: { "aria-label": "H1", title: "Heading 1" },
              },
              {
                ...commands.title2,
                name: "H2",
                icon: <div style={{ fontSize: 16, textAlign: "left", fontWeight: 700 }}>H2</div>,
                buttonProps: { "aria-label": "H2", title: "Heading 2" },
              },
              {
                ...commands.title3,
                name: "H3",
                icon: <div style={{ fontSize: 15, textAlign: "left", fontWeight: 700 }}>H3</div>,
                buttonProps: { "aria-label": "H3", title: "Heading 3" },
              },
              commands.divider,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.divider,
              {
                name: "Send email",
                keyCommand: "sendEmail",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2 11 13" />
                    <path d="m22 2-7 20-4-9-9-4z" />
                  </svg>
                ),
                buttonProps: { "aria-label": "Send email", title: "Send email" },
                execute: () => setSendDialogOpen(true),
              },
            ]}
          />
        </div>
        <FieldDescription>
          Use Markdown syntax for formatting. Minimum 10 characters required.
        </FieldDescription>
        {errors.body && <FieldError>{errors.body.message}</FieldError>}
      </Field>

      {/* Send Email Dialog */}
      <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Email</AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={sendTargetEmail}
              onChange={(e) => setSendTargetEmail(e.target.value)}
              required
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSendDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendMutation.isPending || !sendTargetEmail.trim()}
              >
                {sendMutation.isPending ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SendTimingSelector
            value={sendTiming}
            onValueChange={(value) => {
              setSendTiming(value);
              setValue("send_timing", value, { shouldValidate: true });
            }}
            scheduledDateTime={watch("scheduled_for")}
            onScheduledDateTimeChange={(value) =>
              setValue("scheduled_for", value, { shouldValidate: true })
            }
            error={errors.scheduled_for?.message}
          />
        </div>

        <Field>
          <FieldLabel htmlFor="layout_type">Layout Type *</FieldLabel>
          <Select
            value={watch("layout_type")}
            onValueChange={(value) => {
              setValue(
                "layout_type",
                value as "text_only" | "standard_header" | "EP",
                { shouldValidate: true },
              );
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select layout type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text_only">Text Only</SelectItem>
              <SelectItem value="standard_header">Standard Header</SelectItem>
              <SelectItem value="EP">EP</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            Choose how the email will be formatted.
          </FieldDescription>
          {errors.layout_type && (
            <FieldError>{errors.layout_type.message}</FieldError>
          )}
        </Field>
      </div>

      <Field orientation="horizontal">
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            {...register("active")}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <FieldLabel htmlFor="active" className="mb-0">
            Active
          </FieldLabel>
        </div>
        <FieldDescription>
          {activeValue
            ? "This template is active and can be used"
            : "This template is inactive"}
        </FieldDescription>
      </Field>



      <div className="flex gap-3 justify-end pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={
            !isValid ||
            isSubmitting ||
            createMutation.isPending ||
            updateMutation.isPending
          }
        >
          {isSubmitting || createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : isEditMode
              ? "Update Template"
              : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
