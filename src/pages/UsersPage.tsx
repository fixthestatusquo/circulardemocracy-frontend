import { useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils'; // Import the new utility
import { PageLayout } from '@/components/PageLayout'; // Import PageLayout
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components

interface PoliticianStaff {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string; // Assuming 'updated_at' for modified_at
  // Add other politician_staff properties as needed
}

async function fetchPoliticianStaff(): Promise<PoliticianStaff[]> {
  const { data, error } = await supabase!.from('politician_staff').select('*');
  if (error) {
    throw error; // Throw error for Suspense ErrorBoundary
  }
  return data;
}

export function UsersPage() {
  const { data: staff } = useSuspenseQuery<PoliticianStaff[], Error>({
    queryKey: ['politician_staff'],
    queryFn: fetchPoliticianStaff,
  });

  return (
    <PageLayout>
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-primary">Team</CardTitle>
        </CardHeader>
        <CardContent>
          {staff && staff.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">First Name</th>
                    <th className="py-2 px-4 border-b text-left">Last Name</th>
                    <th className="py-2 px-4 border-b text-left">Role</th>
                    <th className="py-2 px-4 border-b text-left">Created At</th>
                    <th className="py-2 px-4 border-b text-left">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td className="py-2 px-4 border-b">{member.id}</td>
                      <td className="py-2 px-4 border-b">{member.first_name}</td>
                      <td className="py-2 px-4 border-b">{member.last_name}</td>
                      <td className="py-2 px-4 border-b">{member.role}</td>
                      <td className="py-2 px-4 border-b">{formatDate(member.created_at)}</td>
                      <td className="py-2 px-4 border-b">{formatDate(member.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No politician staff found.</p>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
