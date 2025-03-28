
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import Layout from "@/components/layout/Layout";
import PageTitle from "@/components/ui/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Megaphone, BookOpen } from "lucide-react";
import AnnouncementCreator from "@/components/announcements/AnnouncementCreator";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";

const Announcements = () => {
  const { userRole } = useUser();

  // Mock data for tracks
  const tracks = [
    { id: "all", name: "All Tracks" },
    { id: "frontend", name: "Frontend Development" },
    { id: "backend", name: "Backend Development" },
    { id: "fullstack", name: "Full Stack" },
    { id: "mobile", name: "Mobile Development" },
  ];

  // Mock data for announcements
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Important Schedule Change",
      content: "All backend classes will be moved to Room 305 starting next week due to renovations.",
      createdAt: "2023-08-10T14:30:00",
      author: "Admin User",
      track: "backend",
      isPinned: true,
      isActive: true,
      views: 124
    },
    {
      id: 2,
      title: "New Resources Available",
      content: "We've added new learning resources for React and Node.js in the student portal. Check them out!",
      createdAt: "2023-08-08T09:15:00",
      author: "Admin User",
      track: "all",
      isPinned: false,
      isActive: true,
      views: 97
    },
    {
      id: 3,
      title: "Upcoming Workshop",
      content: "Join us for a special workshop on Docker fundamentals this Friday at 3PM in the main auditorium.",
      createdAt: "2023-08-05T11:45:00",
      author: "Admin User",
      track: "fullstack",
      isPinned: false,
      isActive: true,
      views: 156
    }
  ]);

  const handleCreateAnnouncement = (newAnnouncement) => {
    setAnnouncements([newAnnouncement, ...announcements]);
  };

  const handleTogglePin = (id) => {
    setAnnouncements(announcements.map(announcement => 
      announcement.id === id 
        ? { ...announcement, isPinned: !announcement.isPinned }
        : announcement
    ));
  };

  const handleDelete = (id) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  // Access control - only admin can create announcements
  if (userRole !== "admin") {
    return (
      <Layout>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTitle
        title="Announcements"
        subtitle="Create and manage announcements for students and supervisors"
        icon={<Megaphone />}
      />

      <div className="grid gap-6">
        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">
              <Megaphone className="h-4 w-4 mr-2" />
              Create Announcement
            </TabsTrigger>
            <TabsTrigger value="manage">
              <BookOpen className="h-4 w-4 mr-2" />
              Manage Announcements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <AnnouncementCreator 
              tracks={tracks}
              onAnnouncementCreate={handleCreateAnnouncement}
            />
          </TabsContent>
          
          <TabsContent value="manage">
            <AnnouncementsList 
              announcements={announcements}
              tracks={tracks}
              onTogglePin={handleTogglePin}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Announcements;
