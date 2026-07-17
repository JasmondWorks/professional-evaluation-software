import { useDispatch, useSelector } from 'react-redux';
import { newGoal } from '@/app/state/goals/goalSlice';
import { notify } from '@/lib/toast';
import { RootState } from '../../state/store';
import { CloseCircle } from 'iconsax-react';
import { useState } from 'react';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/navigation';

export default function Newgoal() {
  const isVisible = useSelector((state: RootState) => state.goal.new);
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormdata] = useState({ 
    goalType: '', 
    description: '', 
    due_date: '',
    evaluation_type: 'appraisal' as 'appraisal' | 'performance' | 'stress'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const goalTypes = [
    "appraisal",
    "non-academic appraisal",
    "motivation",
    "performance",
    "stress",
    "student-teacher ratio",
    "utility-index",
    "redundancy-index",
    "productivity-index",
    "personnnel redundancy",
    "personnnel utilization",
    "number of staff",
    "maintenance models",
    "organizational structure"
  ];

  // Map goal types to evaluation types
  const getEvaluationType = (goalType: string): 'appraisal' | 'performance' | 'stress' => {
    if (goalType.includes('appraisal')) return 'appraisal';
    if (goalType.includes('performance') || goalType.includes('productivity')) return 'performance';
    if (goalType.includes('stress')) return 'stress';
    return 'appraisal'; // default
  };

  function handleChange(event: { target: { name: string; value: string; }; }) {
    const updatedData = { ...formData, [event.target.name]: event.target.value };
    
    // Auto-set evaluation_type when goalType changes
    if (event.target.name === 'goalType') {
      updatedData.evaluation_type = getEvaluationType(event.target.value);
    }
    
    setFormdata(updatedData);
    setError(''); // Clear error on change
  }

  async function handleSubmit(event: { preventDefault: () => void; }) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No access token found. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      const user = jwt.decode(token);
      if (!user || typeof user !== 'object' || !('userID' in user)) {
        setError('Invalid user token. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      // Validate form data
      if (!formData.goalType || !formData.description || !formData.due_date) {
        setError('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/addGoals', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.goalType, 
          description: formData.description, 
          due_date: formData.due_date, 
          user_id: String((user as { userID: string | number }).userID),
          evaluation_type: formData.evaluation_type,
          token
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create goal');
      }

      const result = await response.json();
      
      if (result.status === 200) {
        dispatch(newGoal());
        notify.success('Goal created successfully');
        router.push('/goals');
      } else {
        setError('Failed to create goal. Please try again.');
      }
    } catch (error) {
      console.error('Goal creation error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`notification ${ isVisible ? 'visible' : 'invisible' } rounded-lg shadow-lg p-6 z-30 flex flex-col w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
      <CloseCircle 
        onClick={() => !isSubmitting && dispatch(newGoal())} 
        className={`ms-auto ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:text-red-500 cursor-pointer'}`}
        tabIndex={isVisible ? 0 : -1}
      />
      <form onSubmit={ handleSubmit }>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="formgroup flex flex-col w-full">
          <label htmlFor="goalType" className='font-bold my-2 text-sm'>Goal Type:</label>
          <select
            id="goalType"
            name="goalType"
            value={formData.goalType}
            onChange={ handleChange }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const nextInput = document.getElementById('new-description');
                nextInput?.focus();
              }
            }}
            className='font-light text-sm text-gray-500 placeholder-gray-500 py-4 px-4 outline-0 border focus:border-gray-400 rounded-sm'
            required
            disabled={isSubmitting}
            tabIndex={isVisible ? 1 : -1}
          >
            <option value="" disabled>Select a Goal Type</option>
            { goalTypes.map( (gt) => (
              <option key={gt} value={gt}>{gt}</option>
            )) }
          </select>
        </div>

        <div className="formgroup flex flex-col w-full">
          <label htmlFor="new-description" className='font-bold my-2 text-sm'>Description:</label>
          <input
            onChange={ handleChange }
            name='description'
            id='new-description'
            type="text"
            className='font-light text-sm text-gray-500 placeholder-gray-500 py-4 px-4 outline-0 border focus:border-gray-400 rounded-sm'
            placeholder='Add goal description'
            required
            disabled={isSubmitting}
            tabIndex={isVisible ? 2 : -1}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const nextInput = document.getElementById('new-due_date');
                nextInput?.focus();
              }
            }}
          />
        </div>

        <div className="formgroup flex flex-col w-full">
          <label htmlFor="new-due_date" className='font-bold my-2 text-sm'>Due Date:</label>
          <input
            onChange={ handleChange }
            name='due_date'
            id='new-due_date'
            type="date"
            className='font-light text-sm text-gray-500 placeholder-gray-500 py-4 px-4 outline-0 border focus:border-gray-400 rounded-sm'
            required
            disabled={isSubmitting}
            tabIndex={isVisible ? 3 : -1}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button
          type='submit'
          className='bg-pes rounded-md text-white w-full py-4 mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-900 transition-colors'
          disabled={isSubmitting}
          tabIndex={isVisible ? 4 : -1}
        >
          {isSubmitting ? 'Creating Goal...' : 'Set Goal'}
        </button>
      </form>
    </div>
  );
}
