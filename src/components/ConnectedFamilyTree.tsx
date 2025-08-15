
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Heart, Users, Crown, Plus, GitBranch } from "lucide-react";
import { useFamilyContext } from "@/contexts/FamilyContext";
import { MobileFamilyMemberForm } from "./MobileFamilyMemberForm";

export const ConnectedFamilyTree = () => {
  const { familyMembers, isLoading } = useFamilyContext();
  const [showForm, setShowForm] = useState(false);
  const [connections, setConnections] = useState<{[key: string]: string[]}>({});

  // Organize members into family connections
  useEffect(() => {
    const newConnections: {[key: string]: string[]} = {};
    
    familyMembers.forEach(member => {
      if (member.spouse_id) {
        const key = [member.id, member.spouse_id].sort().join('-');
        if (!newConnections[key]) {
          newConnections[key] = [member.id!, member.spouse_id];
        }
      }
      
      if (member.parent_id) {
        const parentKey = `parent-${member.parent_id}`;
        if (!newConnections[parentKey]) {
          newConnections[parentKey] = [member.parent_id];
        }
        newConnections[parentKey].push(member.id!);
      }
    });
    
    setConnections(newConnections);
  }, [familyMembers]);

  const getMemberById = (id: string) => familyMembers.find(m => m.id === id);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getRelationIcon = (relation?: string) => {
    if (relation?.includes('head')) return Crown;
    if (relation?.includes('spouse')) return Heart;
    return User;
  };

  const getRelationColor = (relation?: string) => {
    if (relation?.includes('head')) return 'bg-primary/20 text-primary border-primary/30';
    if (relation?.includes('spouse')) return 'bg-pink-100 text-pink-700 border-pink-300';
    if (relation?.includes('son') || relation?.includes('daughter')) return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Connected Tree</h2>
            <p className="text-sm text-slate-600">
              {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''} connected
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="gradient-bg hover:opacity-90 transition-opacity shadow-elegant gap-2 h-10"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {familyMembers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <GitBranch className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Family Members</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Start building your family tree by adding your first family member.
          </p>
          <Button 
            onClick={() => setShowForm(true)}
            className="gradient-bg hover:opacity-90 transition-opacity shadow-elegant gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Member
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Family Heads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Family Heads
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {familyMembers
                .filter(member => member.is_head || member.relation?.includes('head'))
                .map((member) => {
                  const IconComponent = getRelationIcon(member.relation);
                  return (
                    <Card key={member.id} className={`border transition-all hover:shadow-md ${getRelationColor(member.relation)}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-4 h-4" />
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {member.gender}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm text-slate-900 truncate">{member.name}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {formatDate(member.birth_date)}
                        </p>
                        <p className="text-xs text-slate-500 capitalize mt-1">
                          {member.relation}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Spouses */}
          {Object.keys(connections).filter(key => key.includes('-') && !key.includes('parent')).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                Marriages
              </h3>
              <div className="space-y-3">
                {Object.keys(connections)
                  .filter(key => key.includes('-') && !key.includes('parent'))
                  .map((connectionKey) => {
                    const [member1Id, member2Id] = connections[connectionKey];
                    const member1 = getMemberById(member1Id);
                    const member2 = getMemberById(member2Id);
                    
                    if (!member1 || !member2) return null;
                    
                    return (
                      <div key={connectionKey} className="flex items-center gap-2">
                        <Card className="flex-1 bg-pink-50 border-pink-200">
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm text-slate-900 truncate">{member1.name}</h4>
                            <p className="text-xs text-slate-600">{formatDate(member1.birth_date)}</p>
                          </CardContent>
                        </Card>
                        <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                        <Card className="flex-1 bg-pink-50 border-pink-200">
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm text-slate-900 truncate">{member2.name}</h4>
                            <p className="text-xs text-slate-600">{formatDate(member2.birth_date)}</p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Children */}
          {Object.keys(connections).filter(key => key.includes('parent')).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Families
              </h3>
              <div className="space-y-4">
                {Object.keys(connections)
                  .filter(key => key.includes('parent'))
                  .map((connectionKey) => {
                    const memberIds = connections[connectionKey];
                    const parentId = memberIds[0];
                    const childrenIds = memberIds.slice(1);
                    const parent = getMemberById(parentId);
                    
                    if (!parent) return null;
                    
                    return (
                      <div key={connectionKey} className="space-y-2">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Crown className="w-3 h-3 text-blue-600" />
                              <span className="text-xs font-medium text-blue-800">Parent</span>
                            </div>
                            <h4 className="font-medium text-sm text-slate-900">{parent.name}</h4>
                            <p className="text-xs text-slate-600">{formatDate(parent.birth_date)}</p>
                          </CardContent>
                        </Card>
                        <div className="grid grid-cols-2 gap-2 ml-4">
                          {childrenIds.map(childId => {
                            const child = getMemberById(childId);
                            if (!child) return null;
                            
                            return (
                              <Card key={childId} className="bg-blue-25 border-blue-100">
                                <CardContent className="p-2">
                                  <h4 className="font-medium text-xs text-slate-900 truncate">{child.name}</h4>
                                  <p className="text-xs text-slate-600">{formatDate(child.birth_date)}</p>
                                  <p className="text-xs text-slate-500 capitalize">{child.relation}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* All Other Members */}
          {familyMembers.filter(member => 
            !member.is_head && 
            !member.relation?.includes('head') && 
            !member.spouse_id && 
            !member.parent_id
          ).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Other Members
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {familyMembers
                  .filter(member => 
                    !member.is_head && 
                    !member.relation?.includes('head') && 
                    !member.spouse_id && 
                    !member.parent_id
                  )
                  .map((member) => {
                    const IconComponent = getRelationIcon(member.relation);
                    return (
                      <Card key={member.id} className={`border transition-all hover:shadow-md ${getRelationColor(member.relation)}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="w-4 h-4" />
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {member.gender}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm text-slate-900 truncate">{member.name}</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            {formatDate(member.birth_date)}
                          </p>
                          <p className="text-xs text-slate-500 capitalize mt-1">
                            {member.relation}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      <MobileFamilyMemberForm
        onSave={async (member) => {
          // This will be handled by the context
          return Promise.resolve();
        }}
        onCancel={() => setShowForm(false)}
        isVisible={showForm}
        existingMembers={familyMembers}
      />
    </div>
  );
};
