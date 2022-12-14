import axios from "axios";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetToken, usePushNotif } from "../lib";
import { deleteDashboardGradient, removeDetailDashboardCollectionGradients, removeDetailDashboardProjectGradientsData, removeFromFavorite } from "../slices/dashboardSlice";
import { selectIdDeleteGradient, setDataDeleteGradient } from "../slices/popupSlice";
import ContainerPopup from "./ContainerPopup";
import Spinner from "./Spinner";

export default function PopupDeleteGradient(){
    const dispatch = useDispatch();
    const deleteGradientId = useSelector(selectIdDeleteGradient);
    const Router = useRouter();
    const [loading, setLoading] = useState(false);
    const elementRef = useRef(null);
    const handlePushNotif = usePushNotif();
    const handleDelete = async () => {
        setLoading(true);
        const color = await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/saves-gradients/delete/${deleteGradientId}`,{
            headers: {
                Authorization: `bearer ${GetToken()}`
            }
        })
        const { id } = color.data;
        if (Router.pathname==='/user/gradients') {
            dispatch(deleteDashboardGradient(id));
        }else if (Router.pathname==='/user/projects/[id]/gradients') {
            dispatch(removeDetailDashboardProjectGradientsData(id));
        }else if (Router.pathname==='/user/collections/[id]/gradients') {
            dispatch(removeDetailDashboardCollectionGradients(id));
        }else if (Router.pathname==='/user/favorites/gradients') {
            dispatch(removeFromFavorite({ id, type: 'gradients' }));
        }
        setLoading(false);
        dispatch(setDataDeleteGradient(null));
        handlePushNotif({ text: 'Gradient deleted succesfully!', className: 'bg-black', icon: 'checklist' });
    }
    const removeBox = (time) => {
        elementRef.current.classList.remove('sm:animate-fadeIn');
        elementRef.current.classList.remove('animate-translateY');
        elementRef.current.classList.add('sm:animate-fadeOut');
        elementRef.current.classList.add('animate-translateY-reverse');
        const close = setTimeout(()=>{
            dispatch(setDataDeleteGradient(null));
        },time);
        return ()=> clearTimeout(close);
    }
    return (
    <ContainerPopup remove={removeBox}>
        <div ref={elementRef} className="animate-translateY sm:animate-fadeIn bg-white w-full sm:w-[380px] sm:relative absolute bottom-0 rounded-tl-xl rounded-tr-xl sm:rounded-xl flex flex-col divide-y">
            <div className="p-3 relative">
                <svg onClick={()=>removeBox(100)} xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 absolute left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 transition cursor-pointer p-1.5 rounded-lg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <h1 className="font-semibold text-center">Delete Gradient</h1>
            </div>
            <div className="min-h-[100px] flex items-center justify-center p-6">
                <p className="text-[15px] font-medium">Do you really want to delete this gradient?</p>
            </div>
            <div className="flex p-4 gap-3">
                <button onClick={()=>removeBox(100)} className="h-[46px] text-center font-bold border hover:border-gray-400 bg-white transition w-full block rounded-xl">Cancel</button>
                <button onClick={handleDelete} className="h-[46px] text-center font-bold bg-red-500 hover:bg-red-600 transition text-white w-full block rounded-xl">{loading ? <Spinner/> : 'Delete'}</button>
            </div>
        </div>
    </ContainerPopup>
    )
}