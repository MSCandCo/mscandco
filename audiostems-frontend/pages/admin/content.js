import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Button, Badge, Modal, TextInput, Label, Select } from "flowbite-react";
import { HiPlus, HiPencil, HiTrash, HiEye } from "react-icons/hi2";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";
import { resourceUrl } from "@/lib/utils";

function AdminContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("songs");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.role?.includes("admin")) {
      router.push("/");
    }
  }, [session, status, router]);

  const { data: songs } = useSWR(
    apiRoute("/songs?populate=*")
  );

  const { data: stems } = useSWR(
    apiRoute("/stems?populate=*")
  );

  const { data: artists } = useSWR(
    apiRoute("/artists?populate=*")
  );

  const { data: genres } = useSWR(
    apiRoute("/genres?populate=*")
  );

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || !session.user?.role?.includes("admin")) {
    return null;
  }

  const renderContentList = () => {
    const items = activeTab === "songs" ? songs?.data : stems?.data;
    
    return (
      <div className="space-y-4">
        {items?.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={resourceUrl(item.attributes.cover?.data?.attributes?.url)}
                  alt={item.attributes.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{item.attributes.title}</h3>
                  <p className="text-sm text-gray-600">
                    {item.attributes.artists?.data?.map(a => a.attributes.name).join(", ") ||
                     item.attributes.singers?.data?.map(a => a.attributes.name).join(", ")}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge color="gray">{activeTab.slice(0, -1)}</Badge>
                    {item.attributes.credit && (
                      <Badge color="blue">{item.attributes.credit} credit{item.attributes.credit !== 1 ? 's' : ''}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" color="gray">
                  <HiEye className="h-4 w-4" />
                </Button>
                <Button size="sm" color="gray">
                  <HiPencil className="h-4 w-4" />
                </Button>
                <Button size="sm" color="failure">
                  <HiTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <SEO pageTitle="Admin Content Management" />
      <div className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Content Management</h1>
            <Button onClick={() => setShowModal(true)}>
              <HiPlus className="h-4 w-4 mr-2" />
              Add {activeTab.slice(0, -1)}
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <Button
              color={activeTab === "songs" ? "blue" : "gray"}
              onClick={() => setActiveTab("songs")}
            >
              Songs ({songs?.data?.length || 0})
            </Button>
            <Button
              color={activeTab === "stems" ? "blue" : "gray"}
              onClick={() => setActiveTab("stems")}
            >
              Stems ({stems?.data?.length || 0})
            </Button>
            <Button
              color={activeTab === "artists" ? "blue" : "gray"}
              onClick={() => setActiveTab("artists")}
            >
              Artists ({artists?.data?.length || 0})
            </Button>
            <Button
              color={activeTab === "genres" ? "blue" : "gray"}
              onClick={() => setActiveTab("genres")}
            >
              Genres ({genres?.data?.length || 0})
            </Button>
          </div>

          {/* Content List */}
          {renderContentList()}

          {/* Add/Edit Modal */}
          <Modal show={showModal} onClose={() => setShowModal(false)}>
            <Modal.Header>
              {editingItem ? "Edit" : "Add"} {activeTab.slice(0, -1)}
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <TextInput id="title" placeholder="Enter title" />
                </div>
                <div>
                  <Label htmlFor="credit">Credits Required</Label>
                  <TextInput id="credit" type="number" placeholder="1" />
                </div>
                <div>
                  <Label htmlFor="artist">Artist</Label>
                  <Select id="artist">
                    <option>Select artist</option>
                    {artists?.data?.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.attributes.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select id="genre">
                    <option>Select genre</option>
                    {genres?.data?.map(genre => (
                      <option key={genre.id} value={genre.id}>
                        {genre.attributes.title}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setShowModal(false)}>
                {editingItem ? "Update" : "Create"}
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminContent; 