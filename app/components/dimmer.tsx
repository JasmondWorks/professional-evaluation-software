import { useSelector } from 'react-redux';
import { RootState } from '../state/store'

export default function Dimmer(){
    const isVisible = useSelector( (state: RootState) => state.logged.value || state.goal.edit || state.goal.new || state.goal.view || state.goal.delete )
    return <div className = { `notification ${ isVisible? 'visible': 'invisible' } rounded-sm shadow-lg p-12 z-30 flex flex-col fixed w-screen h-screen bg-black opacity-10 my-auto` }></div>
}