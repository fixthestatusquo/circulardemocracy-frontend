import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ProfileInfo {
  firstname: string | null;
  lastname: string | null;
  job_title: string | null;
}

interface PoliticianStaffWithProfile {
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
  profile: ProfileInfo | null;
}

async function fetchPoliticianStaff(): Promise<PoliticianStaffWithProfile[]> {
  const { data: staff, error: staffError } = await supabase!
    .from("politician_staff")
    .select("user_id, role, created_at, updated_at");

  if (staffError) {
    throw staffError;
  }

  if (!staff || staff.length === 0) {
    return [];
  }

  const userIds = staff.map((member) => member.user_id);

  const { data: profiles, error: profilesError } = await supabase!
    .from("profiles")
    .select("id, firstname, lastname, job_title")
    .in("id", userIds);

  if (profilesError) {
    throw profilesError;
  }

  const profileMap = new Map<string, ProfileInfo>();
  (profiles ?? []).forEach((p) => {
    profileMap.set(p.id as string, {
      firstname: p.firstname ?? null,
      lastname: p.lastname ?? null,
      job_title: p.job_title ?? null,
    });
  });

  return staff.map((member) => ({
    user_id: member.user_id,
    role: member.role,
    created_at: member.created_at,
    updated_at: member.updated_at,
    profile: profileMap.get(member.user_id) ?? null,
  }));
}

export function UsersPage() {
  const {
    data: staff,
    isLoading,
    error,
  } = useQuery<PoliticianStaffWithProfile[], Error>({
    queryKey: ["politician_staff_with_profiles"],
    queryFn: fetchPoliticianStaff,
  });

  return (
    <PageLayout>
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-primary">Team</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading team...</p>}
          {error && (
            <p className="text-red-500">Failed to load team: {error.message}</p>
          )}
          {!isLoading && !error && staff && staff.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">First Name</th>
                    <th className="py-2 px-4 border-b text-left">Last Name</th>
                    <th className="py-2 px-4 border-b text-left">Job Title</th>
                    <th className="py-2 px-4 border-b text-left">Role</th>
                    <th className="py-2 px-4 border-b text-left">Created At</th>
                    <th className="py-2 px-4 border-b text-left">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => {
                    const profile = member.profile;

                    let firstName = "Profile not completed";
                    let lastName = "Profile not completed";
                    let jobTitle = "Profile not completed";

                    if (profile) {
                      if (
                        profile.firstname &&
                        profile.firstname.trim().length > 0
                      ) {
                        firstName = profile.firstname;
                      }
                      if (
                        profile.lastname &&
                        profile.lastname.trim().length > 0
                      ) {
                        lastName = profile.lastname;
                      }
                      if (
                        profile.job_title &&
                        profile.job_title.trim().length > 0
                      ) {
                        jobTitle = profile.job_title;
                      }
                    }

                    return (
                      <tr key={member.user_id}>
                        <td className="py-2 px-4 border-b">{member.user_id}</td>
                        <td className="py-2 px-4 border-b">{firstName}</td>
                        <td className="py-2 px-4 border-b">{lastName}</td>
                        <td className="py-2 px-4 border-b">{jobTitle}</td>
                        <td className="py-2 px-4 border-b">{member.role}</td>
                        <td className="py-2 px-4 border-b">
                          {formatDate(member.created_at)}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {formatDate(member.updated_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && !error && (!staff || staff.length === 0) && (
            <p>No team members found.</p>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
