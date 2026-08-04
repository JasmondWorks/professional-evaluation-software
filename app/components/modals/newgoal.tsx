'use client'

import { useDispatch, useSelector } from 'react-redux';
import { newGoal } from '@/app/state/goals/goalSlice';
import { notify } from '@/lib/toast';
import { RootState } from '../../state/store';
import { useState } from 'react';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';
import { apiFetch } from '@/app/utils/apiFetch';
import { Modal } from '../ui/modal';
import { Field } from '../ui/field';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Alert } from '../ui/alert';
import { DateTimeInput } from '../ui/datetime-input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';

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
  "organizational structure",
];

export default function Newgoal() {
  const isVisible = useSelector((state: RootState) => state.goal.new);
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormdata] = useState({
    goalType: '',
    description: '',
    due_date: '',
    evaluation_type: 'appraisal' as 'appraisal' | 'performance' | 'stress',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const close = () => dispatch(newGoal());

  const getEvaluationType = (goalType: string): 'appraisal' | 'performance' | 'stress' => {
    if (goalType.includes('appraisal')) return 'appraisal';
    if (goalType.includes('performance') || goalType.includes('productivity')) return 'performance';
    if (goalType.includes('stress')) return 'stress';
    return 'appraisal';
  };

  function handleChange(event: { target: { name: string; value: string } }) {
    setFormdata((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError('');
  }

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = getAccessToken();
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

      if (!formData.goalType || !formData.description || !formData.due_date) {
        setError('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      const response = await apiFetch('/api/addGoals', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.goalType,
          description: formData.description,
          due_date: formData.due_date,
          user_id: String((user as { userID: string | number }).userID),
          evaluation_type: formData.evaluation_type,
          token,
        }),
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
    <Modal
      isOpen={isVisible}
      setIsOpen={(open) => { if (!open && !isSubmitting) close(); }}
      title="Set a new goal"
      description="Choose the goal type, describe it, and set a due date."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert tone="danger">{error}</Alert>}

        <Field label="Goal type" required>
          <Select
            value={formData.goalType}
            onValueChange={(v) =>
              setFormdata((prev) => ({ ...prev, goalType: v, evaluation_type: getEvaluationType(v) }))
            }
            disabled={isSubmitting}
          >
            <SelectTrigger className="capitalize">
              <SelectValue placeholder="Select a goal type" />
            </SelectTrigger>
            <SelectContent>
              {goalTypes.map((gt) => (
                <SelectItem key={gt} value={gt} className="capitalize">{gt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Description" required>
          <Input
            name="description"
            placeholder="Add goal description"
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </Field>

        <Field label="Due date" required>
          <DateTimeInput
            type="date"
            name="due_date"
            onChange={handleChange}
            disabled={isSubmitting}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Creating' : 'Set goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
