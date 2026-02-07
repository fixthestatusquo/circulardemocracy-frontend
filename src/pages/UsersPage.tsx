import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils'; // Import the new utility
import { PageLayout } from '@/components/PageLayout'; // Import PageLayout

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
    throw new Error(error.message);
  }
  return data;
}

export function UsersPage() {
  const { data: staff, isLoading, error } = useQuery<PoliticianStaff[], Error>({
    queryKey: ['politician_staff'],
    queryFn: fetchPoliticianStaff,
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="text-center">Loading staff...</div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="text-center text-red-500">Error: {error.message}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-4"> {/* Adjusted padding */}
        <h1 className="text-2xl font-bold mb-4">Users (Politician Staff)</h1>
        {staff && staff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">First Name</th>
                  <th className="py-2 px-4 border-b">Last Name</th>
                  <th className="py-2 px-4 border-b">Role</th>
                  <th className="py-2 px-4 border-b">Created At</th> {/* New header */}
                  <th className="py-2 px-4 border-b">Updated At</th> {/* New header */}
                  {/* Add other table headers as needed */}
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td className="py-2 px-4 border-b">{member.id}</td>
                    <td className="py-2 px-4 border-b">{member.first_name}</td>
                    <td className="py-2 px-4 border-b">{member.last_name}</td>
                    <td className="py-2 px-4 border-b">{member.role}</td>
                    <td className="py-2 px-4 border-b">{formatDate(member.created_at)}</td> {/* Display formatted date */}
                    <td className="py-2 px-4 border-b">{formatDate(member.updated_at)}</td> {/* Display formatted date */}
                    {/* Add other table cells as needed */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No politician staff found.</p>
        )}
      </div>
    </PageLayout>
  );
}
