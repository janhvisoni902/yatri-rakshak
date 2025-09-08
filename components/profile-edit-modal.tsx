'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from '@/components/dialog';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Users,
  AlertTriangle
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isLocal: boolean;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: {
    name: string;
    email: string;
    phone?: string;
    currentLocation: string;
    emergencyContacts: EmergencyContact[];
  };
}

export default function ProfileEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: ProfileEditModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'contacts'>('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    currentLocation: initialData?.currentLocation || ''
  });

  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    initialData?.emergencyContacts || []
  );
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    isEditing: false,
    editingId: '',
    name: '',
    phone: '',
    relationship: '',
    isLocal: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setProfileData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        currentLocation: initialData.currentLocation || ''
      });
      setEmergencyContacts(initialData.emergencyContacts || []);
    }
  }, [initialData]);

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (profileData.phone && !/^\+?[\d\s\-\(\)]+$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContact = () => {
    const newErrors: Record<string, string> = {};
    
    if (!contactForm.name.trim()) {
      newErrors.contactName = 'Contact name is required';
    }
    
    if (!contactForm.phone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(contactForm.phone)) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }
    
    if (!contactForm.relationship.trim()) {
      newErrors.contactRelationship = 'Relationship is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    
    setIsLoading(true);
    try {
      await onSave({
        ...profileData,
        emergencyContacts
      });
      onClose();
    } catch (error) {
      console.error('Save profile error:', error);
      setErrors({ general: 'Failed to save profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = () => {
    if (!validateContact()) return;
    
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: contactForm.name.trim(),
      phone: contactForm.phone.trim(),
      relationship: contactForm.relationship.trim(),
      isLocal: contactForm.isLocal
    };
    
    setEmergencyContacts([...emergencyContacts, newContact]);
    setContactForm({
      isEditing: false,
      editingId: '',
      name: '',
      phone: '',
      relationship: '',
      isLocal: false
    });
    setErrors({});
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setContactForm({
      isEditing: true,
      editingId: contact.id,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isLocal: contact.isLocal
    });
  };

  const handleUpdateContact = () => {
    if (!validateContact()) return;
    
    setEmergencyContacts(contacts =>
      contacts.map(contact =>
        contact.id === contactForm.editingId
          ? {
              ...contact,
              name: contactForm.name.trim(),
              phone: contactForm.phone.trim(),
              relationship: contactForm.relationship.trim(),
              isLocal: contactForm.isLocal
            }
          : contact
      )
    );
    
    setContactForm({
      isEditing: false,
      editingId: '',
      name: '',
      phone: '',
      relationship: '',
      isLocal: false
    });
    setErrors({});
  };

  const handleDeleteContact = (contactId: string) => {
    if (confirm('Are you sure you want to delete this emergency contact?')) {
      setEmergencyContacts(contacts => 
        contacts.filter(contact => contact.id !== contactId)
      );
    }
  };

  const cancelContactForm = () => {
    setContactForm({
      isEditing: false,
      editingId: '',
      name: '',
      phone: '',
      relationship: '',
      isLocal: false
    });
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Edit Profile</span>
          </DialogTitle>
          <DialogDescription>
            Update your personal information and emergency contacts
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('contacts')}
          >
            Emergency Contacts ({emergencyContacts.length})
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={initialData?.email || session?.user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Current Location</Label>
              <Input
                id="location"
                value={profileData.currentLocation}
                onChange={(e) => setProfileData({ ...profileData, currentLocation: e.target.value })}
                placeholder="Enter your current location"
              />
            </div>
          </div>
        )}

        {/* Emergency Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {/* Add/Edit Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {contactForm.isEditing ? 'Edit Contact' : 'Add Emergency Contact'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contactName">Name *</Label>
                    <Input
                      id="contactName"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Contact name"
                    />
                    {errors.contactName && (
                      <p className="text-xs text-red-500">{errors.contactName}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone">Phone *</Label>
                    <Input
                      id="contactPhone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.contactPhone && (
                      <p className="text-xs text-red-500">{errors.contactPhone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="contactRelationship">Relationship *</Label>
                  <Input
                    id="contactRelationship"
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                  {errors.contactRelationship && (
                    <p className="text-xs text-red-500">{errors.contactRelationship}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isLocal"
                    checked={contactForm.isLocal}
                    onChange={(e) => setContactForm({ ...contactForm, isLocal: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isLocal">This is a local contact</Label>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={contactForm.isEditing ? handleUpdateContact : handleAddContact}
                  >
                    {contactForm.isEditing ? (
                      <>
                        <Save className="w-3 h-3 mr-1" />
                        Update
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Add Contact
                      </>
                    )}
                  </Button>
                  
                  {(contactForm.isEditing || contactForm.name || contactForm.phone || contactForm.relationship) && (
                    <Button size="sm" variant="outline" onClick={cancelContactForm}>
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contacts List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {emergencyContacts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No emergency contacts added yet</p>
                      <p className="text-sm">Add contacts above to ensure help can reach you</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                emergencyContacts.map((contact) => (
                  <Card key={contact.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{contact.name}</h4>
                          {contact.isLocal && (
                            <Badge variant="outline" className="text-xs">Local</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditContact(contact)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {emergencyContacts.length < 3 && (
              <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded">
                <AlertTriangle className="w-4 h-4" />
                <span>Consider adding at least 3 emergency contacts for better safety coverage</span>
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {errors.general && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
            {errors.general}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
