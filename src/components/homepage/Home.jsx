import React, { useEffect } from 'react'
import Loader from '../loader/Loader'
import { useSelector } from 'react-redux'
import FeatureSections from '../homepagefaturesection/FeatureSections'
import HomeAllProducts from '../homepagefaturesection/HomeAllProducts'
import HomeOfferModal from '../homepageoffermodal/HomeOfferModal'
import HomeSkeleton from './HomeSkeleton'

const HomePage = () => {

    const setting = useSelector(state => state.Setting)
    const language = useSelector(state => state.Language.selectedLanguage)

    // DEFAULT SETTINGS - Add this if real settings are null
    const defaultSettings = {
        popup_enabled: "1",
        popup_always_show_home: "0",
        popup_image: "/default-offer.jpg",
        popup_url: "#"
    };

    // Use real settings if available, otherwise use defaults
    const currentSettings = setting?.setting || defaultSettings;

    useEffect(() => { }, [language])


    return (
        <>
            <div>
                {/* {setting?.setting == null ? <HomeSkeleton /> : */}
                    <>
                        <FeatureSections />

                        <HomeAllProducts />
                        {currentSettings?.popup_enabled === "1" &&
                            <HomeOfferModal />
                        }
                    </>
                {/* } */}
            </div>
        </>
    )
}

export default HomePage