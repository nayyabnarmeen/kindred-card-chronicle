import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Users, Calendar, HeartCrack, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FamilyMember {
  id?: string;
  name: string;
  gender?: 'male' | 'female';
  birth_date: string;
  is_deceased: boolean;
  death_date?: string;
  relation?: string;
  parent_id?: string;
  spouse_id?: string;
  is_head: boolean;
  photo_url?: string;
  marriage_date?: string;
  picture_url?: string;
}

export const GrandparentsTab = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFamilyMembers((data as any[])?.map(item => ({
        ...item,
        gender: item.gender as 'male' | 'female'
      })) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load family members.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGrandparents = () => {
    return familyMembers.filter(member => 
      member.relation?.includes('father') || member.relation?.includes('mother')
    );
  };

  const getChildren = (parentId: string) => {
    return familyMembers.filter(member => member.parent_id === parentId);
  };

  const getFamilyMembers = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (!member) return [];

    const family: FamilyMember[] = [];
    
    // Add spouse
    if (member.spouse_id) {
      const spouse = familyMembers.find(m => m.id === member.spouse_id);
      if (spouse) family.push(spouse);
    }
    
    // Add children
    const children = familyMembers.filter(m => m.parent_id === memberId);
    family.push(...children);
    
    return family;
  };

  const handleChildClick = (child: FamilyMember) => {
    const family = getFamilyMembers(child.id!);
    setSelectedFamily(family);
    setSelectedMember(child);
    setIsDialogOpen(true);
  };

  const grandparents = getGrandparents();

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Families</h2>
          <p className="text-sm text-slate-600">
            {grandparents.length} grandparent{grandparents.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {grandparents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-soft-bg flex items-center justify-center">
            <Heart className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Grandparents Found</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Add family members with father or mother relations to see them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {grandparents.map((grandparent) => (
            <Card key={grandparent.id} className="shadow-card border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    grandparent.is_deceased 
                      ? 'bg-slate-100 border-2 border-slate-300' 
                      : 'gradient-bg'
                  }`}>
                    {grandparent.is_deceased ? (
                      <HeartCrack className="w-8 h-8 text-slate-600" />
                    ) : (
                      <Heart className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">{grandparent.name}</h3>
                      <Badge 
                        variant="default"
                        className="gradient-bg text-white"
                      >
                        {grandparent.gender === 'male' ? 'Grandfather' : 'Grandmother'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Born: {new Date(grandparent.birth_date).toLocaleDateString()}</span>
                    </div>
                    {grandparent.is_deceased && grandparent.death_date && (
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <HeartCrack className="w-4 h-4" />
                        <span>Died: {new Date(grandparent.death_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Children:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {getChildren(grandparent.id!).map((child) => (
                      <Button
                        key={child.id}
                        variant="outline"
                        className="h-auto p-3 text-left justify-start hover:bg-blue-50 hover:border-blue-200"
                        onClick={() => handleChildClick(child)}
                      >
                        <div>
                          <div className="font-medium text-slate-900">{child.name}</div>
                          <div className="text-xs text-slate-500 capitalize">{child.relation}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  {getChildren(grandparent.id!).length === 0 && (
                    <p className="text-sm text-slate-500 italic">No children added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                {selectedMember?.name}'s Family
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedFamily.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No family members found</p>
            ) : (
              selectedFamily.map((member) => (
                <Card key={member.id} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        member.is_deceased 
                          ? 'bg-slate-100 border-2 border-slate-300' 
                          : 'gradient-bg'
                      }`}>
                        {member.is_deceased ? (
                          <HeartCrack className="w-5 h-5 text-slate-600" />
                        ) : (
                          <Heart className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{member.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {member.relation}
                          </Badge>
                          {member.gender && (
                            <Badge variant="outline" className="text-xs">
                              {member.gender}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};