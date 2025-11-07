/**
 * Patient Registration Form Component
 * Captures patient demographic and medical information
 */

'use client';

import React, { useState } from 'react';
import { Patient } from '@/types';
import { User, Phone, MapPin, Droplet, AlertCircle } from 'lucide-react';

interface PatientFormProps {
  onSubmit: (patient: Patient) => void;
  initialData?: Patient;
}

export default function PatientForm({ onSubmit, initialData }: PatientFormProps) {
  const [formData, setFormData] = useState<Patient>(
    initialData || {
      name: '',
      age: 0,
      gender: 'Male',
      contact: '',
      address: '',
      bloodGroup: '',
      allergies: '',
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof Patient, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof Patient]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Patient, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required';
    }
    if (!formData.age || formData.age <= 0) {
      newErrors.age = 'Valid age is required';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contact.replace(/\D/g, ''))) {
      newErrors.contact = 'Please enter a valid 10-digit contact number';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <User className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-800">Patient Registration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Name */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="form-label">
            Patient Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter full name"
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className="form-label">
            Age *
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter age"
            min="0"
            max="150"
          />
          {errors.age && <p className="form-error">{errors.age}</p>}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="form-label">
            Gender *
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="form-input"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Contact */}
        <div>
          <label htmlFor="contact" className="form-label">
            <Phone className="w-4 h-4 inline mr-1" />
            Contact Number *
          </label>
          <input
            type="tel"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter 10-digit number"
          />
          {errors.contact && <p className="form-error">{errors.contact}</p>}
        </div>

        {/* Blood Group */}
        <div>
          <label htmlFor="bloodGroup" className="form-label">
            <Droplet className="w-4 h-4 inline mr-1" />
            Blood Group
          </label>
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="form-label">
            <MapPin className="w-4 h-4 inline mr-1" />
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter complete address"
            rows={3}
          />
          {errors.address && <p className="form-error">{errors.address}</p>}
        </div>

        {/* Allergies */}
        <div className="md:col-span-2">
          <label htmlFor="allergies" className="form-label">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Known Allergies
          </label>
          <textarea
            id="allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            className="form-input"
            placeholder="List any known allergies (optional)"
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="btn-primary">
          Continue to Prescription
        </button>
      </div>
    </form>
  );
}
