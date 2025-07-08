import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Badge } from "flowbite-react";
import { HiUsers, HiDownload, HiMusicNote, HiCreditCard } from "lucide-react";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";
import moment from "moment";

function AdminAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.role?.includes("admin")) {
      router.push("/");
    }
  }, [session, status, router]);

  const { data: downloadStats } = useSWR(
    apiRoute("/download-histories?populate=*")
  );

  const { data: userStats } = useSWR(
    apiRoute("/users?populate=*")
  );

  const { data: songStats } = useSWR(
    apiRoute("/songs?populate=*")
  );

  const { data: stemStats } = useSWR(
    apiRoute("/stems?populate=*")
  );

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || !session.user?.role?.includes("admin")) {
    return null;
  }

  const totalDownloads = downloadStats?.data?.length || 0;
  const totalUsers = userStats?.data?.length || 0;
  const totalSongs = songStats?.data?.length || 0;
  const totalStems = stemStats?.data?.length || 0;

  const recentDownloads = downloadStats?.data?.slice(0, 10) || [];

  return (
    <MainLayout>
      <SEO pageTitle="Admin Analytics" />
      <div className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Admin Analytics</h1>
          
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <HiUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <HiDownload className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold">{totalDownloads}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <HiMusicNote className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Songs</p>
                  <p className="text-2xl font-bold">{totalSongs}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <HiCreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Stems</p>
                  <p className="text-2xl font-bold">{totalStems}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Downloads */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Recent Downloads</h2>
            <div className="space-y-3">
              {recentDownloads.map((download) => (
                <div key={download.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">{download.attributes.contentTitle}</p>
                    <p className="text-sm text-gray-600">
                      {download.attributes.user?.data?.attributes?.firstName} {download.attributes.user?.data?.attributes?.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color="gray">
                      {download.attributes.contentType}
                    </Badge>
                    <Badge color="blue">
                      {download.attributes.creditsSpent} credit{download.attributes.creditsSpent !== 1 ? 's' : ''}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {moment(download.attributes.downloadDate).format('MMM DD, YYYY')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminAnalytics; 