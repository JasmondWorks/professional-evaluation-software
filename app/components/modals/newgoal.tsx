import { useDispatch, useSelector } from 'react-redux';
import { successView } from '@/app/state/success/successSlice';
import { newGoal } from '@/app/state/goals/goalSlice';
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
    due_date: '' 
  });

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

  function handleChange(event: { target: { name: string; value: string; }; }) {
    setFormdata({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event: { preventDefault: () => void; }) {
    event.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }
    const user = jwt.decode(token);

    if (!user || typeof user !== 'object' || !('name' in user)) {
      throw new Error('Invalid user token');
    }

    try {
      const data = await fetch('/api/addGoals', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.goalType, 
          description: formData.description, 
          due_date: formData.due_date, 
          user_id: (user as { name: string }).name 
        })
      });

      // maybe check response.ok / parse json
      // const result = await data.json();

      dispatch(newGoal());
      dispatch(successView());
      router.push('/goals');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={`notification ${ isVisible ? 'visible' : 'invisible' } rounded-sm shadow-lg p-12 z-30 flex flex-col w-4/12 bg-white absolute top-1/2 -translate-y-1/2`}>
      <CloseCircle onClick={() => dispatch(newGoal())} className='ms-auto hover:text-red-500'/>
      <form onSubmit={ handleSubmit }>
        <div className="formgroup flex flex-col w-full">
          <label htmlFor="goalType" className='font-bold my-2 text-sm'>Goal Type:</label>
          <select
            id="goalType"
            name="goalType"
            value={formData.goalType}
            onChange={ handleChange }
            className='font-light text-sm text-gray-500 placeholder-gray-500 py-4 px-4 outline-0 border focus:border-gray-400 rounded-sm'
            required
          >
            <option value="" disabled>Select a Goal Type</option>
            { goalTypes.map( (gt) => (
              <option key={gt} value={gt}>{gt}</option>
            )) }
          </select>
        </div>

        <div className="formgroup flex flex-col w-full">
          <label htmlFor="description" className='font-bold my-2 text-sm'>Description:</label>
          <input
            onChange={ handleChange }
            name='description'
            id='description'
            type="text"
            className='font-light text-sm text-gray-500 placeholder-gray-500 py-4 px-4 outline-0 border focus:border-gray-400 rounded-sm'
            placeholder='Add goal description'
          />
        </div>

        <div className="formgroup flex flex-col w-1/2">
          <label htmlFor="due_date" className='font-bold my-2 text-sm'>Due Date:</label>
          <input
            onChange={ handleChange }
            name='due_date'
            id='due_date'
            type="date"
            className='font-light text-sm text-gray-500 placeholder-gray-500 py-4 px-4 outline-0 border focus:border-gray-400 rounded-sm'
          />
        </div>

        <input
          type='submit'
          className='bg-pes rounded-md text-white w-full py-4 mt-6'
          value='Set Goal'
        />
      </form>
    </div>
  );
}
