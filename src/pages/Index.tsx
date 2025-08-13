import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FamilyTreeView } from "@/components/FamilyTreeView";
import { MobileManageFamilyTab } from "@/components/MobileManageFamilyTab";
import { ConnectedFamilyTree } from "@/components/ConnectedFamilyTree";
import { GrandparentsTab } from "@/components/GrandparentsTab";
import { FamilyTree } from "@/types/family";
import { useAuth } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { TreePine, Users, GitBranch, LogOut, User } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/50 to-primary/10">
        <div className="text-center space-y-4">
          <TreePine className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading your family tree...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }


  return (
    <FamilyProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
        <div className="safe-area-inset">
          {/* Mobile Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-20 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TreePine className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Family Tree
                  </h1>
                  <p className="text-xs text-muted-foreground">Welcome back!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
              <TabsTrigger value="manage" className="gap-2 text-xs">
                <Users className="w-4 h-4" />
                All Family
              </TabsTrigger>
              <TabsTrigger value="tree" className="gap-2 text-xs">
                <TreePine className="w-4 h-4" />
                Heads
              </TabsTrigger>
              <TabsTrigger value="connected" className="gap-2 text-xs">
                <GitBranch className="w-4 h-4" />
                Connected
              </TabsTrigger>
              <TabsTrigger value="grandparents" className="gap-2 text-xs">
                <Users className="w-4 h-4" />
                Families
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tree" className="animate-fade-in px-4 pt-4">
              <FamilyTreeView
                familyTrees={familyTrees}
                onUpdateFamilyTrees={setFamilyTrees}
              />
            </TabsContent>

            <TabsContent value="manage" className="animate-fade-in px-4 pt-4">
              <MobileManageFamilyTab />
            </TabsContent>

            <TabsContent value="connected" className="animate-fade-in px-4 pt-4">
              <ConnectedFamilyTree />
            </TabsContent>

            <TabsContent value="grandparents" className="animate-fade-in px-4 pt-4">
              <GrandparentsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </FamilyProvider>
  );
};

export default Index;
