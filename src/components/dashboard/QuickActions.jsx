import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Layers, UserPlus, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from "@/components/ui/drawer";
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";

const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const handleCreateAnnouncement = (data, onClose) => {
    // Here you would normally handle the API call to create an announcement
    toast({
      title: "Announcement created",
      description: "Your announcement has been published successfully",
    });
    onClose?.();
  };
  
  const handleAddSupervisor = (data, onClose) => {
    // Here you would normally handle the API call to add a supervisor
    toast({
      title: "Invitation sent",
      description: "An invitation email has been sent to the supervisor",
    });
    onClose?.();
  };

  // Create Announcement Action Component
  const CreateAnnouncementAction = () => {
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    
    if (!isMobile) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-blue-50 border-blue-200">
              <Bell className="h-6 w-6 text-blue-600" />
              <span>Create Announcement</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement to notify students and supervisors.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title">Title</label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="content">Content</label>
                <textarea 
                  id="content" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={(e) => {
                e.preventDefault();
                handleCreateAnnouncement({ title, content }, () => {
                  setTitle("");
                  setContent("");
                });
              }}>Publish Announcement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-blue-50 border-blue-200">
            <Bell className="h-6 w-6 text-blue-600" />
            <span>Create Announcement</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Create New Announcement</DrawerTitle>
            <DrawerDescription>
              Create a new announcement to notify students and supervisors.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="title">Title</label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="content">Content</label>
              <textarea 
                id="content" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DrawerFooter className="pt-2">
            <Button onClick={(e) => {
              e.preventDefault();
              handleCreateAnnouncement({ title, content }, () => {
                setTitle("");
                setContent("");
              });
            }}>Publish Announcement</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };
  
  // Add Supervisor Action Component
  const AddSupervisorAction = () => {
    const [email, setEmail] = React.useState("");
    const [name, setName] = React.useState("");
    
    if (!isMobile) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-purple-50 border-purple-200">
              <UserPlus className="h-6 w-6 text-purple-600" />
              <span>Add Supervisor</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supervisor</DialogTitle>
              <DialogDescription>
                Invite a new supervisor to join the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Full Name</label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={(e) => {
                e.preventDefault();
                handleAddSupervisor({ name, email }, () => {
                  setName("");
                  setEmail("");
                });
              }}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-purple-50 border-purple-200">
            <UserPlus className="h-6 w-6 text-purple-600" />
            <span>Add Supervisor</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Add New Supervisor</DrawerTitle>
            <DrawerDescription>
              Invite a new supervisor to join the platform.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name">Full Name</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <DrawerFooter className="pt-2">
            <Button onClick={(e) => {
              e.preventDefault();
              handleAddSupervisor({ name, email }, () => {
                setName("");
                setEmail("");
              });
            }}>Send Invitation</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <CardTitle>Admin Quick Actions</CardTitle>
        </div>
        <CardDescription>Frequently used admin operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CreateAnnouncementAction />
          <Link to="/tracks">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-amber-50 border-amber-200">
              <Layers className="h-6 w-6 text-amber-600" />
              <span>Manage Tracks</span>
            </Button>
          </Link>
          <AddSupervisorAction />
          <Link to="/attendance-insights">
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-emerald-50 border-emerald-200">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
              <span>Attendance Reports</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;