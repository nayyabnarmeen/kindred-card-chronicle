import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { X, Save, Heart, HeartCrack, UserPlus, Upload, Camera, Info, Contact, Heart as HeartIcon, MapPin } from "lucide-react";

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
  marriage_date?: string;
  picture_url?: string;
  profession?: string;
  residence?: string;
  hometown?: string;
  ethnic?: string;
  nationality?: string;
  note?: string;
}

interface MobileFamilyMemberFormProps {
  member?: FamilyMember;
  onSave: (member: FamilyMember) => Promise<void>;
  onCancel: () => void;
  isVisible: boolean;
  existingMembers?: FamilyMember[];
  onMemberAdded?: (member: FamilyMember) => void;
}

export const MobileFamilyMemberForm = ({ 
  member, 
  onSave, 
  onCancel, 
  isVisible,
  existingMembers = [],
  onMemberAdded
}: MobileFamilyMemberFormProps) => {
  const [formData, setFormData] = useState<FamilyMember>({
    id: member?.id || '',
    name: member?.name || '',
    gender: member?.gender || 'male',
    birth_date: member?.birth_date || '',
    is_deceased: member?.is_deceased || false,
    death_date: member?.death_date || '',
    relation: member?.relation || 'head',
    parent_id: member?.parent_id || '',
    spouse_id: member?.spouse_id || '',
    is_head: member?.is_head || false,
    photo_url: member?.photo_url || '',
    marriage_date: member?.marriage_date || '',
    picture_url: member?.picture_url || '',
    profession: member?.profession || '',
    residence: member?.residence || '',
    hometown: member?.hometown || '',
    ethnic: member?.ethnic || '',
    nationality: member?.nationality || '',
    note: member?.note || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [relationStep, setRelationStep] = useState<'relation' | 'selection'>('relation');
  const [selectedRelationType, setSelectedRelationType] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState('information');
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset relation step when form opens/closes
  useEffect(() => {
    if (isVisible) {
      setRelationStep('relation');
      setSelectedRelationType('');
      setActiveTab('information');
    }
  }, [isVisible]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('family-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('family-photos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, picture_url: publicUrl }));
      
      toast({
        title: "Photo uploaded",
        description: "Profile photo has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the family member.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.birth_date) {
      toast({
        title: "Birth Date Required", 
        description: "Please select a birth date.",
        variant: "destructive"
      });
      return;
    }

    if (formData.is_deceased && !formData.death_date) {
      toast({
        title: "Death Date Required",
        description: "Please provide death date for deceased members.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Clean the data before saving
      const cleanedData: FamilyMember = {
        name: formData.name.trim(),
        gender: formData.gender,
        birth_date: formData.birth_date,
        is_deceased: Boolean(formData.is_deceased),
        death_date: formData.is_deceased && formData.death_date ? formData.death_date : undefined,
        relation: formData.relation || 'head',
        parent_id: formData.parent_id && formData.parent_id !== '' && formData.parent_id !== 'new' ? formData.parent_id : undefined,
        spouse_id: formData.spouse_id && formData.spouse_id !== '' && formData.spouse_id !== 'new' ? formData.spouse_id : undefined,
        is_head: formData.relation === 'head' || formData.relation?.includes('head'),
        photo_url: formData.photo_url || undefined,
        marriage_date: formData.marriage_date && formData.marriage_date !== '' ? formData.marriage_date : undefined,
        picture_url: formData.picture_url && formData.picture_url !== '' ? formData.picture_url : undefined,
        profession: formData.profession && formData.profession.trim() !== '' ? formData.profession.trim() : undefined,
        residence: formData.residence && formData.residence.trim() !== '' ? formData.residence.trim() : undefined,
        hometown: formData.hometown && formData.hometown.trim() !== '' ? formData.hometown.trim() : undefined,
        ethnic: formData.ethnic && formData.ethnic.trim() !== '' ? formData.ethnic.trim() : undefined,
        nationality: formData.nationality && formData.nationality.trim() !== '' ? formData.nationality.trim() : undefined,
        note: formData.note && formData.note.trim() !== '' ? formData.note.trim() : undefined
      };

      // Include ID only for existing members
      if (member?.id) {
        cleanedData.id = member.id;
      }

      console.log('Submitting cleaned data:', cleanedData);
      
      // Call onSave and await it properly
      await onSave(cleanedData);
      
      // Notify other tabs about the new member
      if (onMemberAdded && !member) {
        onMemberAdded(cleanedData);
      }
      
      // Reset form state only if it's a new member
      if (!member) {
        setFormData({
          id: '',
          name: '',
          gender: 'male',
          birth_date: '',
          is_deceased: false,
          death_date: '',
          relation: 'head',
          parent_id: '',
          spouse_id: '',
          is_head: false,
          photo_url: '',
          marriage_date: '',
          picture_url: '',
          profession: '',
          residence: '',
          hometown: '',
          ethnic: '',
          nationality: '',
          note: ''
        });
        setRelationStep('relation');
        setSelectedRelationType('');
        setActiveTab('information');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save family member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 safe-area-inset">
      <Card className="w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] shadow-elegant border-0 bg-gradient-to-br from-white to-slate-50 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              {member ? 'Edit Information' : 'Add Family Member'}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col min-h-0">
          <form onSubmit={handleSubmit} className="h-full flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3 h-12 mx-4 sm:mx-6 mt-4">
                <TabsTrigger value="information" className="flex items-center gap-1 text-xs">
                  <Info className="w-3 h-3" />
                  Information
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-1 text-xs">
                  <Contact className="w-3 h-3" />
                  Contact
                </TabsTrigger>
                <TabsTrigger value="marriage" className="flex items-center gap-1 text-xs">
                  <HeartIcon className="w-3 h-3" />
                  Marriage
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                <TabsContent value="information" className="space-y-5 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium text-slate-700">
                        Gender
                      </Label>
                      <Select value={formData.gender} onValueChange={(value: "male" | "female") => 
                        setFormData(prev => ({ ...prev, gender: value }))
                      }>
                        <SelectTrigger className="h-12 text-base border-slate-200">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

              <div className="space-y-2">
                <Label htmlFor="relation" className="text-sm font-medium text-slate-700">
                  Relation
                </Label>
                {relationStep === 'relation' ? (
                  <Select value={formData.relation} onValueChange={(value: any) => {
                    setFormData(prev => ({ ...prev, relation: value }));
                    if (['spouse', 'son', 'daughter', 'father', 'mother'].includes(value)) {
                      setSelectedRelationType(value);
                      setRelationStep('selection');
                    }
                  }}>
                    <SelectTrigger className="h-12 text-base border-slate-200">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head">Head</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="son">Son</SelectItem>
                      <SelectItem value="daughter">Daughter</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="head,father,spouse">Head & Father & Husband</SelectItem>
                      <SelectItem value="head,mother,spouse">Head & Mother & Wife</SelectItem>
                      <SelectItem value="father,spouse">Father & Husband</SelectItem>
                      <SelectItem value="mother,spouse">Mother & Wife</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm font-medium text-blue-900 capitalize">
                        {selectedRelationType} relationship
                      </span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => setRelationStep('relation')}
                        className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-100"
                      >
                        Change
                      </Button>
                    </div>
                    
                    <Select value={formData.parent_id || formData.spouse_id || ''} onValueChange={(value) => {
                      if (selectedRelationType === 'spouse') {
                        setFormData(prev => ({ ...prev, spouse_id: value, parent_id: '' }));
                      } else {
                        setFormData(prev => ({ ...prev, parent_id: value, spouse_id: '' }));
                      }
                    }}>
                      <SelectTrigger className="h-12 text-base border-slate-200">
                        <SelectValue placeholder={`Select ${selectedRelationType === 'spouse' ? 'spouse' : 'parent'} or create new`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Create new member
                          </div>
                        </SelectItem>
                        {existingMembers
                          .filter(m => {
                            if (selectedRelationType === 'spouse') {
                              return m.gender !== formData.gender; // Different gender for spouse
                            }
                            if (selectedRelationType === 'son' || selectedRelationType === 'daughter') {
                              return m.relation === 'head' || m.relation === 'father' || m.relation === 'mother';
                            }
                            if (selectedRelationType === 'father') {
                              return m.gender === 'male' && (m.relation === 'head' || m.relation === 'father');
                            }
                            if (selectedRelationType === 'mother') {
                              return m.gender === 'female' && (m.relation === 'head' || m.relation === 'mother');
                            }
                            return true;
                          })
                          .map(member => (
                            <SelectItem key={member.id} value={member.id || ''}>
                              {member.name} ({member.relation})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date" className="text-sm font-medium text-slate-700">
                      Birth Date *
                    </Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profession" className="text-sm font-medium text-slate-700">
                        Profession
                      </Label>
                      <Input
                        id="profession"
                        value={formData.profession}
                        onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                        placeholder="Please fill in the information"
                        className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ethnic" className="text-sm font-medium text-slate-700">
                        Ethnic
                      </Label>
                      <Input
                        id="ethnic"
                        value={formData.ethnic}
                        onChange={(e) => setFormData(prev => ({ ...prev, ethnic: e.target.value }))}
                        placeholder="Please fill in the information"
                        className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-sm font-medium text-slate-700">
                      Nationality
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                        placeholder="Please fill in the information"
                        className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200 flex-1"
                      />
                      <Button type="button" variant="ghost" size="sm" className="h-12 w-12 p-0">
                        <span className="text-xl">→</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HeartCrack className="w-4 h-4 text-slate-600" />
                        <Label htmlFor="is_deceased" className="text-sm font-medium text-slate-700">
                          Status
                        </Label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={!formData.is_deceased ? "default" : "outline"}
                        className={`h-12 ${!formData.is_deceased ? 'bg-white text-slate-900 border border-slate-200' : 'text-slate-600'}`}
                        onClick={() => setFormData(prev => ({ ...prev, is_deceased: false, death_date: '' }))}
                      >
                        Alive
                      </Button>
                      <Button
                        type="button"
                        variant={formData.is_deceased ? "default" : "outline"}
                        className={`h-12 ${formData.is_deceased ? 'bg-slate-200 text-slate-600' : 'text-slate-600'}`}
                        onClick={() => setFormData(prev => ({ ...prev, is_deceased: true }))}
                      >
                        Dead
                      </Button>
                    </div>
                    
                    {formData.is_deceased && (
                      <div className="space-y-2">
                        <Label htmlFor="death_date" className="text-sm font-medium text-slate-700">
                          Date of Death *
                        </Label>
                        <Input
                          id="death_date"
                          type="date"
                          value={formData.death_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, death_date: e.target.value }))}
                          className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                          required={formData.is_deceased}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note" className="text-sm font-medium text-slate-700">
                      Note
                    </Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Please fill in the information"
                      className="min-h-[80px] text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-5 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="residence" className="text-sm font-medium text-slate-700">
                      Residence
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="residence"
                        value={formData.residence}
                        onChange={(e) => setFormData(prev => ({ ...prev, residence: e.target.value }))}
                        placeholder="Please fill in the information"
                        className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200 flex-1"
                      />
                      <Button type="button" variant="ghost" size="sm" className="h-12 w-12 p-0">
                        <MapPin className="w-4 h-4 text-orange-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hometown" className="text-sm font-medium text-slate-700">
                      Hometown
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="hometown"
                        value={formData.hometown}
                        onChange={(e) => setFormData(prev => ({ ...prev, hometown: e.target.value }))}
                        placeholder="Please fill in the information"
                        className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200 flex-1"
                      />
                      <Button type="button" variant="ghost" size="sm" className="h-12 w-12 p-0">
                        <MapPin className="w-4 h-4 text-orange-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Photo
                    </Label>
                    <div className="flex items-center gap-4">
                      {formData.picture_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200">
                          <img 
                            src={formData.picture_url} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <Label htmlFor="photo-upload" className="cursor-pointer">
                          <div className="flex items-center gap-2 h-12 px-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-400 transition-colors">
                            <Camera className="w-4 h-4 text-slate-600" />
                            <span className="text-sm text-slate-600">
                              {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                            </span>
                          </div>
                        </Label>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="marriage" className="space-y-5 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="marriage_date" className="text-sm font-medium text-slate-700">
                      Marriage Date
                    </Label>
                    <Input
                      id="marriage_date"
                      type="date"
                      value={formData.marriage_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, marriage_date: e.target.value }))}
                      className="h-12 text-base border-slate-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                </TabsContent>
              </div>

              <div className="border-t px-6 py-4 bg-white">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 gradient-bg hover:opacity-90 transition-opacity text-white font-medium"
                    disabled={isLoading || uploadingPhoto}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </Tabs>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
