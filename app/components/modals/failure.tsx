import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/state/store'
import { Check, CloseCircle } from 'iconsax-react'
import { failureView } from '@/app/state/failure/failureSlice';
import LoadingButton from '../ui/LoadingButton';


export default function Failure(){
    const isVisible = useSelector( (state: RootState) => state.failure.visible )
    const dispatch = useDispatch()


    return (
        <div className={`notification ${ isVisible? 'visible': 'invisible' } rounded-sm shadow-lg p-12 z-30 flex flex-col w-4/12 bg-white absolute top-1/2 -translate-y-1/2`}>
            <div className='flex justify-between mb-4'>
                <CloseCircle onClick={ () => dispatch( failureView()) } className='ms-auto hover:text-red-500'/>
            </div>

            <div className='flex flex-col'>
                  <p className='mx-auto mt-4'>Failed</p>
                  <Check className='mx-auto mt-4 text-red-400 text-3xl'/>
               <LoadingButton className='flex bg-pes rounded-md text-white w-fit px-8 py-3 mx-auto mt-4' onClick={ () => dispatch(failureView()) } >Done</LoadingButton>
            </div>
        </div>
    )
}