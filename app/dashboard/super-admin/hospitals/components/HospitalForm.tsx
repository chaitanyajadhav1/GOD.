// app/dashboard/super-admin/hospitals/components/HospitalForm.tsx
'use client';

import { useState } from 'react';
import { authenticatedFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  contact_number: string;
  email: string;
  adminEmail?: string;
}

interface HospitalFormProps {
  hospital?: Hospital | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HospitalForm({ hospital, onClose, onSuccess }: HospitalFormProps) {
  const [formData, setFormData] = useState({
    name: hospital?.name || '',
    address: hospital?.address || '',
    contact_number: hospital?.contact_number || '',
    email: hospital?.email || '',
    adminEmail: hospital?.adminEmail || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.adminEmail) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      const url = hospital
        ? `/api/super-admin/hospitals/${hospital.id}` 
        : '/api/super-admin/hospitals';
      
      const method = hospital ? 'PUT' : 'POST';

      // Prepare data
      const { name, address, contact_number, email, adminEmail } = formData;
      const requestData = {
        name,
        address: address || undefined,
        contact_number: contact_number || undefined,
        email: email || undefined,
        adminEmail,
      };

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save hospital');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {hospital ? 'Edit Hospital' : 'Create New Hospital'}
          </DialogTitle>
          <DialogDescription>
            {hospital 
              ? 'Update the hospital information below' 
              : 'Add a new hospital to the system. An invitation will be sent to the admin email.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hospital Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter hospital name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Enter hospital address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number</Label>
            <Input
              id="contact_number"
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter hospital email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">Admin Email *</Label>
            <Input
              id="adminEmail"
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              placeholder="admin@hospital.com"
            />
            <p className="text-xs text-muted-foreground">
              An invitation will be sent to this email address
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : (hospital ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}