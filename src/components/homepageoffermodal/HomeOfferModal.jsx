import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import Link from 'next/link';
import { IoIosCloseCircle } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { setIsPopupSeen } from '@/redux/slices/settingSlice';

const HomeOfferModal = () => {
    const dispatch = useDispatch();
    const setting = useSelector(state => state.Setting)
    const city = useSelector(state => state.City)
    const [isModalOpen, setIsModalOpen] = useState(false);

    // DEFAULT SETTINGS - Add this if real settings are null
    const defaultSettings = {
        popup_enabled: "1",
        popup_always_show_home: "0",
        popup_image: "/default-offer.jpg", // You can replace with a default image path
        popup_url: "#"
    };

    // Use real settings if available, otherwise use defaults
    const currentSettings = setting?.setting || defaultSettings;

    // console.log("isModalOpen ->", isModalOpen)
    // console.log("City ->", city)

    useEffect(() => {
        if (currentSettings?.popup_enabled === "1" && city?.city !== null) {
            if (currentSettings?.popup_always_show_home === "1") {
                // Always show the modal on every home page visit
                setIsModalOpen(true);
            } else if (currentSettings?.popup_always_show_home === "0") {
                // Show the modal only once
                const hasPopupBeenSeen = setting?.isPopupSeen;
                // console.log("isPopupSeen", setting?.isPopupSeen)
                if (!hasPopupBeenSeen) {
                    setIsModalOpen(true);
                    // console.log("Showing Popup...")
                }
            }
        }
    }, [currentSettings?.popup_enabled, currentSettings?.popup_always_show_home, city?.city, setting?.isPopupSeen]);

    const handleClose = () => {
        setIsModalOpen(false);
        dispatch(setIsPopupSeen({ data: true }));
    };

    return (
        <div>
            <Dialog open={isModalOpen} className="focus-visible:outline-none" >
                <DialogContent className='bg-transparent border-none shadow-none focus-visible:outline-none focus-within:border-none' onInteractOutside={(e) => e.preventDefault()} aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>
                            <div className='flex justify-end'><IoIosCloseCircle className='w-12 h-12 textColor cursor-pointer' onClick={handleClose} /></div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className='bg-transparent'>
                        <div className='h-full w-full'>
                            <Link href={currentSettings?.popup_url || "#"} target="_blank" className="focus-visible:outline-none" onClick={handleClose}>
                                {currentSettings?.popup_image ? (
                                    <Image 
                                        src={currentSettings.popup_image} 
                                        alt='Offer image' 
                                        height={0} 
                                        width={0} 
                                        className='h-full w-full object-contain focus-visible:outline-none' 
                                    />
                                ) : (
                                    <div className="h-64 w-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">Offer Image</span>
                                    </div>
                                )}
                            </Link>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default HomeOfferModal   