import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FormInput } from '../components/form/FormInput';
import { FormSelect } from '../components/form/FormSelect';
import { FormTextarea } from '../components/form/FormTextarea';

const jobTypeOptions = [
  { value: 'Full-Time', label: 'Full-Time' },
  { value: 'Part-Time', label: 'Part-Time' },
  { value: 'Remote', label: 'Remote' },
];

const levelOptions = [
  { value: 'Entry Level', label: 'Entry Level' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Expert', label: 'Expert' },
];

export function PostJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from('jobs').insert({
        title: formData.get('title') as string,
        company: formData.get('company') as string,
        location: formData.get('location') as string,
        description: formData.get('description') as string,
        type: formData.get('type') as string,
        level: formData.get('level') as string,
        external_link: formData.get('external_link') as string,
        employer_id: user.id,
        requirements: (formData.get('requirements') as string).split(',').map(r => r.trim()),
      });

      if (error) throw error;
      
      toast.success('Job posted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormInput
          label="Job Title"
          name="title"
          required
        />

        <FormInput
          label="Company"
          name="company"
          required
        />

        <FormInput
          label="Location"
          name="location"
          required
        />

        <FormTextarea
          label="Description"
          name="description"
          required
        />

        <FormInput
          label="Requirements (comma-separated)"
          name="requirements"
          required
          placeholder="React, TypeScript, UI/UX..."
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Type"
            name="type"
            options={jobTypeOptions}
            required
          />

          <FormSelect
            label="Level"
            name="level"
            options={levelOptions}
            required
          />
        </div>

        <FormInput
          label="External Job Link (optional)"
          name="external_link"
          type="url"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}