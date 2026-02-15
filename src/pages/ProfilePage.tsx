import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const profileSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  job_title: z.string().min(1, "Job title is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileRow {
  id: string;
  firstname: string | null;
  lastname: string | null;
  job_title: string | null;
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase!
    .from("profiles")
    .select("id, firstname, lastname, job_title")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export function ProfilePage() {
  const { data: currentUser } = useUser();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: profile, isLoading } = useQuery<ProfileRow | null, Error>({
    queryKey: ["profile", currentUser?.id],
    queryFn: () => fetchProfile(currentUser!.id),
    enabled: !!currentUser,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      job_title: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstname: profile.firstname ?? "",
        lastname: profile.lastname ?? "",
        job_title: profile.job_title ?? "",
      });
    }
  }, [profile, reset]);

  useEffect(() => {
    if (!showSuccess) return;
    const timeoutId = window.setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [showSuccess]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!currentUser) return;
    setSaveError(null);
    setShowSuccess(false);

    const { error } = await supabase!.from("profiles").upsert(
      {
        id: currentUser.id,
        firstname: values.firstname,
        lastname: values.lastname,
        job_title: values.job_title,
      },
      { onConflict: "id" },
    );

    if (error) {
      setSaveError(error.message ?? "Failed to save profile");
      return;
    }

    setShowSuccess(true);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <PageLayout>
      <div className="relative">
        {showSuccess && (
          <div className="fixed right-4 top-20 z-50 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
            Profile saved successfully.
          </div>
        )}
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle className="text-primary">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="mb-4 text-sm text-gray-600">Loading profile...</p>
            )}
            {saveError && (
              <p className="mb-4 text-sm text-red-500">{saveError}</p>
            )}
            {!isLoading && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="First name"
                  {...register("firstname")}
                  errorMessage={errors.firstname?.message}
                  disabled={isSubmitting}
                />
                <Input
                  label="Last name"
                  {...register("lastname")}
                  errorMessage={errors.lastname?.message}
                  disabled={isSubmitting}
                />
                <Input
                  label="Job title"
                  {...register("job_title")}
                  errorMessage={errors.job_title?.message}
                  disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save profile"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
