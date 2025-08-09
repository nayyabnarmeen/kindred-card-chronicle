import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, HeartCrack, Calendar, GitBranch } from "lucide-react";

interface FamilyMember {
  id?: string;
  name: string;
  gender?: 'male' | 'female';
  birth_date: string;
  is_deceased: boolean;
  death_date?: string;
  relation?: string; // Allow multiple relations like "head,father,husband"
  parent_id?: string;
  spouse_id?: string;
  is_head: boolean;
  photo_url?: string;
}

export const ConnectedFamilyTree = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
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
        description: "Failed to load family members. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRelationshipColor = (relation?: string) => {
    switch (relation) {
      case 'head':
      case 'father':
        return 'border-blue-500 bg-blue-50';
      case 'mother':
        return 'border-pink-500 bg-pink-50';
      case 'spouse':
        return 'border-purple-500 bg-purple-50';
      case 'son':
      case 'daughter':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getConnectionLineColor = (relation?: string) => {
    switch (relation) {
      case 'head':
      case 'father':
        return 'border-blue-500';
      case 'mother':
        return 'border-pink-500';
      case 'spouse':
        return 'border-purple-500';
      case 'son':
      case 'daughter':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  const renderMemberCard = (member: FamilyMember, level: number = 0) => {
    const children = familyMembers.filter(m => m.parent_id === member.id);
    const spouse = familyMembers.find(m => m.spouse_id === member.id || member.spouse_id === m.id);
    
    return (
      <div key={member.id} className={`relative ${level > 0 ? 'ml-8' : ''}`}>
        {/* Connection line for children */}
        {level > 0 && (
          <div className={`absolute -left-4 top-1/2 w-4 h-px border-t-2 ${getConnectionLineColor(member.relation)}`}></div>
        )}
        
        <div className="flex items-start gap-4 mb-6">
          {/* Member Card */}
          <Card className={`min-w-[280px] shadow-card border-2 transition-all duration-200 hover:shadow-lg ${getRelationshipColor(member.relation)}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  member.is_deceased 
                    ? 'bg-slate-100 border-2 border-slate-300' 
                    : 'gradient-bg'
                }`}>
                  {member.is_deceased ? (
                    <HeartCrack className="w-6 h-6 text-slate-600" />
                  ) : (
                    <Heart className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900">{member.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={member.is_head ? "default" : "secondary"}
                      className={member.is_head 
                        ? "gradient-bg text-white" 
                        : "bg-slate-100 text-slate-700"
                      }
                    >
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
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Born: {new Date(member.birth_date).toLocaleDateString()}</span>
                </div>
                
                {member.is_deceased && member.death_date && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <HeartCrack className="w-4 h-4" />
                    <span>Died: {new Date(member.death_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Spouse Card */}
          {spouse && (
            <>
              {/* Marriage connection line */}
              <div className="flex items-center">
                <div className={`w-8 h-px border-t-2 ${getConnectionLineColor('spouse')}`}></div>
                <div className="w-2 h-2 rounded-full bg-purple-500 mx-1"></div>
                <div className={`w-8 h-px border-t-2 ${getConnectionLineColor('spouse')}`}></div>
              </div>
              
              <Card className={`min-w-[280px] shadow-card border-2 transition-all duration-200 hover:shadow-lg ${getRelationshipColor('spouse')}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      spouse.is_deceased 
                        ? 'bg-slate-100 border-2 border-slate-300' 
                        : 'gradient-bg'
                    }`}>
                      {spouse.is_deceased ? (
                        <HeartCrack className="w-6 h-6 text-slate-600" />
                      ) : (
                        <Heart className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900">{spouse.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          spouse
                        </Badge>
                        {spouse.gender && (
                          <Badge variant="outline" className="text-xs">
                            {spouse.gender}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Born: {new Date(spouse.birth_date).toLocaleDateString()}</span>
                    </div>
                    
                    {spouse.is_deceased && spouse.death_date && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <HeartCrack className="w-4 h-4" />
                        <span>Died: {new Date(spouse.death_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Children */}
        {children.length > 0 && (
          <div className="ml-4">
            {/* Vertical line down from parent */}
            <div className={`w-px h-6 border-l-2 ${getConnectionLineColor(member.relation)} ml-6`}></div>
            
            {children.map((child, index) => (
              <div key={child.id} className="relative">
                {/* Vertical line to child */}
                {index < children.length - 1 && (
                  <div className={`absolute left-6 top-0 w-px h-full border-l-2 ${getConnectionLineColor(member.relation)}`}></div>
                )}
                {renderMemberCard(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const heads = familyMembers.filter(member => member.is_head);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Connected Family Tree</h2>
          <p className="text-sm text-slate-600">
            Visual relationships with color-coded connections
          </p>
        </div>
      </div>

      {/* Color Legend */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px border-t-2 border-blue-500"></div>
          <span className="text-xs text-slate-600">Father/Head</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-px border-t-2 border-pink-500"></div>
          <span className="text-xs text-slate-600">Mother</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-px border-t-2 border-purple-500"></div>
          <span className="text-xs text-slate-600">Spouse</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-px border-t-2 border-green-500"></div>
          <span className="text-xs text-slate-600">Children</span>
        </div>
      </div>

      {familyMembers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-soft-bg flex items-center justify-center">
            <GitBranch className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Family Tree Yet</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Add family members in the "All Family" tab to see the connected tree view.
          </p>
        </div>
      ) : heads.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-soft-bg flex items-center justify-center">
            <GitBranch className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Family Head Found</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Set at least one family member as "Head" to start building the tree structure.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {heads.map(head => renderMemberCard(head))}
        </div>
      )}
    </div>
  );
};