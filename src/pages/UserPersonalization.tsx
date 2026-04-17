import React, { useEffect, useRef, useState } from "react";
import { FaCheck, FaEllipsisV} from "react-icons/fa";

/*IMAGES AVATAR */
import avatar1 from '../assets/avatar/avatar1.png'
import avatar2 from '../assets/avatar/avatar2.png'
import avatar3 from '../assets/avatar/avatar3.png'
import avatar4 from '../assets/avatar/avatar4.png'
import avatar5 from '../assets/avatar/avatar5.png'
import avatar6 from '../assets/avatar/avatar6.png'
import avatar7 from '../assets/avatar/avatar7.png'
import avatar8 from '../assets/avatar/avatar8.png'
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { refreshSession } from "../api/auth/auth.refresh.api";
import { updateUserInfo } from "../api/user/user.update.info";
import { setFullSession } from "../feature/auth/authSlice";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../utlis/useIsMobile";



const UserPersonalization : React.FC = () =>{
    const { t } =useTranslation()
    const user = useAppSelector(state => state.auth)
    const dispatch = useAppDispatch()
    //avatar vectors images
    const avatars = [
        avatar1, avatar2, avatar3, avatar4,
        avatar5, avatar6, avatar7, avatar8,
    ];
    const [isEditingUsername, setisEditingUsername] = useState(false);
    const [usernameDraft, setUsernameDraft] = useState(user.displayName ?? "");
    const editUsernameRef = useRef<HTMLSpanElement | null>(null);

    //const [isSelecting,setisSelecting]=useState(true);

    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number | null>(null);

    //const [customImage, setCustomImage] = useState<string | null>(null);

    useEffect(() => {
        if (selectedAvatar || user.profile_pic == null) return
        const index = Math.max(1, user.profile_pic )
        setSelectedAvatarIndex(index)
        setSelectedAvatar(avatars[(index - 1) % avatars.length])
    }, [user.profile_pic, selectedAvatar, avatars])

    useEffect(() => {
        if (isEditingUsername) return
        setUsernameDraft(user.displayName ?? "")
    }, [user.displayName, isEditingUsername])

    useEffect(() => {
        if (!isEditingUsername) return
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (editUsernameRef.current?.contains(target)) return
            setisEditingUsername(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isEditingUsername])

    /*const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };


    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
            setCustomImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenFileDialog = async () => {
        //const base64Image = await window.electronAPI.openImageDialog();

        //if (base64Image) {
        //    setCustomImage(base64Image);
        //}
    };
*/
const handleChangePic = async (profile_pic: number) =>{
    if(profile_pic === user.profile_pic) return
    await updateUserInfo({ profile_pic })
    const response = await refreshSession()
    dispatch(setFullSession(response))
}

const handleChangeUsername = async () => {
    const trimmed = usernameDraft.trim()
    if (!trimmed || trimmed === user.displayName) {
        setisEditingUsername(false)
        return
    }
    await updateUserInfo({ display_name: trimmed })
    const response = await refreshSession()
    dispatch(setFullSession(response))
    setisEditingUsername(false)
}
    const isMobile = useIsMobile(1000)

    return(
        <div className={`bg-white dark:bg-[#2b2b2b] max-h-full ${isMobile ? "w-full " : "w-[calc(100vw-50px)]"}  h-full pt-1 pb-4`}>
            <p className="module-title text-left"> {t("personalization.title")}</p>  
            {/* SETTING EMAIL-USERNAME */}
            <p className=" ml-8  text-[0.85rem] flex flex-row gap-row-[10px]  my-2 text-[darkblue] dark:text-gray-200 ">{t("personalization.profileSection")}</p>
            <div className={`flex flex-col  bg-[#dbecff] dark:bg-[#3B3B3B] ${isMobile ? " max-w-[400px] w-[95vw] mx-auto " : "ml-9 w-[400px]"}  rounded-[5px] p-2 px-4`}>
                {isEditingUsername ? 
                ( 
                    <span ref={editUsernameRef} className="flex flex-row items-end mb-1 text-left">
                        <label className="module-label-input mt-0 text-left mx-2.5 ">
                            <p className="m-0">
                                &nbsp;&nbsp; {t("personalization.usernameLabel")}  
                            </p> 
                            <input 
                                value={usernameDraft}
                                onChange={(e) => setUsernameDraft(e.currentTarget.value)}
                                className="module-input-black bg-[white] w-50 ml-4 mt-[0.2rem] "
                                placeholder={t("personalization.usernamePlaceholder")}                  
                            />
                        </label>
                        <button
                            onClick={handleChangeUsername}
                            className="  bg-blue-600 px-1 py-1 rounded-sm h-max mb-1"
                        >
                            <FaCheck className="text-white" size={12}/>
                        </button>
                    </span>
                ) : (

                          <div
                            onClick={() => setisEditingUsername(true)}
                            className="dark:bg-[#2C2C2C] relative w-auto m-1 text-[#CCC5C5] rounded-lg p-2 px-4 flex flex-row items-center justify-center gap-2 text-[0.85rem] cursor-pointer"
                          >
                            <p className="font-semibold">{t("personalization.usernameLabel")} : {user.displayName}</p>
                            <button  onClick = {()=>setisEditingUsername(true)}className="px-1 py-1"><FaEllipsisV/></button>
                          </div>

                ) }
                        <div className="dark:bg-[#2C2C2C] relative w-auto m-1 text-[#CCC5C5] rounded-lg p-2 px-4 flex flex-row items-center justify-center gap-2 text-[0.85rem]">
                            <p className="font-semibold">{t("personalization.emailLabel")}: {user.email}</p>
                          </div>
                        <span className="flex flex-row justify-center items-center my-2 w-full gap-4 px-3">
                            <p className="text-[0.75rem] dark:text-[#d6d6d6] ">{t("personalization.forgotPassword")}</p> 
                            <button className=" h-8 text-[0.8rem] text-white px-8 font-semibold rounded-sm disabled:bg-blue-500" disabled={true}>{t("personalization.recoverButton")}</button>
                        </span>   
                </div>
                <div className="border-b border-b-[#a4d6ff] dark:border-b-[#444444] my-4 w-[90%] mx-auto"/>

                {/* SETTING PICTURES */}
                <p className=" ml-8  mr-4 text-[0.85rem] flex flex-row gap-row-[10px]  my-2 text-[darkblue] dark:text-gray-200 ">{t("personalization.picturesSection")}</p>
                <div className={`flex ${isMobile ? "flex-col gap-2 " : "flex-row"} mb-6 pb-4`}>
                    <div className={`flex flex-col ${isMobile ? "mx-auto" : " ml-9"} bg-[#dbecff] dark:bg-[#3B3B3B] w-52 rounded-[5px] p-4`}>
                        <p className="text-[0.8rem] dark:text-[#d6d6d6]   mt-[0.6rem] mb-[0.8rem] text-center">{t("personalization.yourProfilePic")}</p>
                       <div className="rounded-[20px] h-[150px] w-[150px] m-auto bg-[white] mt-4 mb-[0.4rem] flex items-center justify-center overflow-hidden">
                        {selectedAvatar && (
                            <img
                            src={selectedAvatar}
                            alt="Avatar selezionato"
                            className="h-full w-full object-cover rounded-[20px]"
                            />
                        )}
                        </div>
                        <button
                            onClick={() => {
                                if (selectedAvatarIndex != null) {
                                    handleChangePic(selectedAvatarIndex)
                                }
                            }}
                            className="module-button-blue h-8 text-[0.8rem] text-white mx-6 rounded-sm">
                            {t("personalization.replaceButton")}
                        </button>
                    </div>

                    {/* drag and drop 
                   <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="flex flex-col items-center justify-center w-[20rem] ml-4 border-4 border-[#559fff] dark:border-[#666666] rounded-[20px] cursor-pointer bg-[#dbecff] dark:bg-[#2c2c2c] hover:border-[#1D4ED8] transition-all duration-300"
                    >
                    {customImage ? (
                    <div className="relative w-full h-full group rounded-2xl overflow-hidden">
                        <img
                        src={customImage}
                        alt="Dropped"
                        className="w-full h-full object-cover"
                        />
 */}
                        {/* Overlay on hover 
                        <div 
                            className="absolute flex flex-col top-0 left-0 w-full h-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300  items-center justify-center"
                            onClick={() => setSelectedAvatar(customImage)} 
                        >
                            <span className="text-white text-sm font-medium">
                                <span className="bg-[#0000009e] p-1 rounded hover:bg-[#112189]">Seleziona</span>
                            </span>
                            <button 
                                    className="flex flex-row bg-[#666666] p-2 mt-2 rounded-[5px] hover:bg-[#1D4ED8]"
                                    onClick={handleOpenFileDialog}
                                >
                                    <FaPlus size={14} className="text-[#ffffff] mr-[0.3rem]" />
                                    <FaFolderOpen size={20} className="text-[#ffffff]" />
                                </button>
                        </div>
                    </div>
                    ) : (
                    <>*/}
                        {/* messaggio + bottone 
                        <p className="text-[0.75rem] w-[50%] text-center font-medium  text-[#559fff] dark:text-[#a5a5a5]">
                            Drop your image here or select one.
                        </p>
                        <button 
                            className="flex flex-row bg-[#559fff] dark:bg-[#666666] p-4 mt-2 rounded-[20px] hover:bg-[#1D4ED8]"
                             onClick={handleOpenFileDialog}
                        >
                            <FaPlus size={14} className="text-[#ffffff] mr-[0.3rem]" />
                            <FaFolderOpen size={20} className="text-[#ffffff]" />
                        </button>
                    </>
                    )}
                    </div>*/}

                  <div className={`flex flex-wrap mx-4 ${isMobile ? "mx-auto justify-center" : ""} bg-[#dbecff] dark:bg-[#3B3B3B] max-w-[560px] rounded-[5px] p-4`}>
                    {avatars.map((avatar, i) => (
                        <div
                        key={i}
                        className="relative w-[130px] h-32 flex items-center justify-center group"
                         onClick={() => {
                            setSelectedAvatar(avatar)
                            setSelectedAvatarIndex(i + 1)
                         }}
                        >
                            {/* Avatar */}
                            <img
                                src={avatar}
                                alt={`Avatar ${i}`}
                                className="w-[120px] h-auto object-cover rounded-full"
                            />

                            {/* Overlay hover */}
                            <div className="absolute top-0 left-0 w-full h-full rounded-[10px] bg-[#0000007a] bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    <span className="bg-[#0000009e] p-1 rounded"> {t("personalization.selectOverlay")}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                  </div>
                </div>

        </div>

    )
}

export default UserPersonalization;
