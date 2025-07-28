import { useAuth0 } from "@auth0/auth0-react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { apiRoute } from "@/lib/utils";

import { Card, Badge, Button } from "flowbite-react";
import { HiDownload, HiMusicNote, HiDocumentText } from "react-icons/hi";
import useSWR from "swr";
import moment from "moment";

function DownloadHistory() {
  const { user, isAuthenticated } = useAuth0();

  const { data: { data: downloadHistory } = {} } = useSWR(
    isAuthenticated ? apiRoute(`/download-histories?populate=*&filters[user][id][$eq]=${user?.sub}&sort=downloadDate:desc`) : null
  );

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case "song":
        return <HiMusicNote className="h-5 w-5 text-blue-600" />;
      case "stem":
        return <HiDownload className="h-5 w-5 text-green-600" />;
      case "lyric":
        return <HiDocumentText className="h-5 w-5 text-purple-600" />;
      default:
        return <HiDownload className="h-5 w-5 text-gray-600" />;
    }
  };

  const getContentTypeBadge = (contentType) => {
    switch (contentType) {
      case "song":
        return <Badge color="blue">Song</Badge>;
      case "stem":
        return <Badge color="success">Stem</Badge>;
      case "lyric":
        return <Badge color="purple">Lyric</Badge>;
      default:
        return <Badge color="gray">{contentType}</Badge>;
    }
  };

  return (
    <MainLayout>
      <SEO pageTitle="Download History" />
      <div className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Download History</h1>
          
          {downloadHistory?.length > 0 ? (
            <div className="space-y-4">
              {downloadHistory.map((download) => (
                <Card key={download.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getContentTypeIcon(download.attributes.contentType)}
                      <div>
                        <h3 className="font-semibold">
                          {download.attributes.contentTitle}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Downloaded {moment(download.attributes.downloadDate).format('MMM DD, YYYY [at] h:mm A')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getContentTypeBadge(download.attributes.contentType)}
                      <Badge color="gray">
                        {download.attributes.creditsSpent} credit{download.attributes.creditsSpent !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <HiDownload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No downloads yet</h3>
                <p className="text-gray-600 mb-4">
                  Your download history will appear here once you start downloading content.
                </p>
                <Button href="/songs">
                  Browse Songs
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default DownloadHistory; 