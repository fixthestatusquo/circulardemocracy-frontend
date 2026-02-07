import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils'; // Import the new utility
import { PageLayout } from '@/components/PageLayout'; // Import PageLayout

interface Campaign {
  id: string;
  name: string;
  created_at: string;
  updated_at: string; // Assuming 'updated_at' for modified_at
  // Add other campaign properties as needed
}

async function fetchCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase!.from('campaigns').select('*');
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function CampaignsPage() {
  const { data: campaigns, isLoading, error } = useQuery<Campaign[], Error>({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="text-center">Loading campaigns...</div>
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
        <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
        {campaigns && campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Created At</th> {/* New header */}
                  <th className="py-2 px-4 border-b">Updated At</th> {/* New header */}
                  {/* Add other table headers as needed */}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="py-2 px-4 border-b">{campaign.id}</td>
                    <td className="py-2 px-4 border-b">{campaign.name}</td>
                    <td className="py-2 px-4 border-b">{formatDate(campaign.created_at)}</td> {/* Display formatted date */}
                    <td className="py-2 px-4 border-b">{formatDate(campaign.updated_at)}</td> {/* Display formatted date */}
                    {/* Add other table cells as needed */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No campaigns found.</p>
        )}
      </div>
    </PageLayout>
  );
}
