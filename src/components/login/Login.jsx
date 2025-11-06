"use client";
import react, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import Image from "next/image";
import { t } from "@/utils/translation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import GoogleLogo from "@/assets/googleLogin.svg";
import OtpInput from "react-otp-input";
import { useDispatch, useSelector } from "react-redux";
import {
  addtoGuestCart,
  setCart,
  setCartProducts,
  setCartSubTotal,
  setGuestCartTotal,
  setIsGuest,
} from "@/redux/slices/cartSlice";
import {
  setAuthId,
  setAuthType,
  setCurrentUser,
  setJWTToken,
} from "@/redux/slices/userSlice";
import { FaRegEye, FaRegEyeSlash, FaRegEnvelope } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
} from "firebase/auth";
import FirebaseData from "@/utils/firebase";
import * as api from "@/api/apiRoutes";
import { setTokenThunk } from "@/redux/thunk/loginthunk";
import NewUserModal from "../newusermodal/NewUserModal";
import { IoIosCloseCircle } from "react-icons/io";
import Register from "../register/Register";
import { setSetting } from "@/redux/slices/settingSlice";
import ForgetPasswordModal from "../forgetpasswordmodal/ForgetPasswordModal";

export function Login({ showLogin, setShowLogin, setMobileActiveKey }) {
  const city = useSelector((state) => state.City.city);
  const cart = useSelector((state) => state.Cart);
  const reduxSetting = useSelector((state) => state.Setting.setting);
  const language = useSelector(state => state.Language.selectedLanguage);
  const fcmToken = useSelector((state) => state.User?.fcm_token);
  const { auth, app, messaging } = FirebaseData();
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE || "in";

  const [userName, setUserName] = useState("");
  const [showNewUser, setShowNewUser] = useState(false);
  const [isOTP, setIsOTP] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [otp, setOtp] = useState(null);
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState(null);
  const [inputValue, setInputValue] = useState(null);
  const [inputType, setInputType] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState("");
  const [phoneNumberWithoutCountryCode, setPhoneNumberWithoutCountryCode] =
    useState("");
  const [Uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(90);
  const [otpDisabled, setOtpDisabled] = useState(true);
  const [error, setError] = useState("");
  const [userAuthType, setUserAuthType] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [phonePassword, setPhonePassword] = useState("")
  const [forgotPasswordType, setForgotPasswordType] = useState("");
  const [isErrorMessage, setIsErrorMessage] = useState(false)

  // Default settings fallback
  const defaultSettings = {
    phone_login: 1,
    email_login: 1,
    google_login: 1,
    firebase_authentication: 0,
    custom_sms_gateway_otp_based: 1,
    phone_auth_password: 0,
    web_settings: {
      web_logo: "/default-logo.png",
      site_title: process.env.NEXT_PUBLIC_WEB_NAME || "Pravesh Trade"
    },
    default_city: {
      latitude: 28.6139,
      longitude: 77.2090
    }
  };
  const setting = reduxSetting || defaultSettings;

// ==================== FIXED MOCK LOGIN IMPLEMENTATION ====================
const mockLogin = async (type, identifier) => {
  setLoading(true);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Use Khushi's data for ALL login types
  const khushiUserData = {
    user: {
      _id: "690a1f61bedd526bc6f88366",
      name: "Khushi Pal",
      phone: "7778889999", 
      email: "khushipal1470@gmail.com",
      role: "user",
      status: "active",
      isDeleted: false,
      createdAt: "4/11/2025, 9:14:33 pm",
      updatedAt: "4/11/2025, 9:15:55 pm",
      __v: 0,
      id: "690a1f61bedd526bc6f88366",
      // Add any additional fields your app might need
      profile: "/default-avatar.png", // Add profile image field
      balance: 1000.00, // Add wallet balance
      address: [] // Add empty addresses array
    },
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTBhMWY2MWJlZGQ1MjZiYzZmODgzNjYiLCJuYW1lIjoiS2h1c2hpIFBhbCIsInBob25lIjoiNzc3ODg4OTk5OSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYyNDE5NDU2LCJleHAiOjE3NjI0MjAzNTZ9.TKFx4RYDAYw9RcvdCpiY1JV-488ciFqLgjB3FXDqMaY",
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTBhMWY2MWJlZGQ1MjZiYzZmODgzNjYiLCJuYW1lIjoiS2h1c2hpIFBhbCIsInBob25lIjoiNzc3ODg4OTk5OSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYyNDE5NDU2LCJleHAiOjE3NjMwMjQyNTZ9.v3rNMkhrs8uDD5TW2KoPaeXFX88JVzVb8PvI89-ddwY"
  };

  // For different login types, update specific fields while keeping Khushi's core data
  let finalUserData = { ...khushiUserData };
  
  switch(type) {
    case "phone":
      // Keep Khushi's data but update phone if provided
      finalUserData.user.phone = identifier || khushiUserData.user.phone;
      break;
      
    case "email":
      // Keep Khushi's data but update email if provided
      finalUserData.user.email = identifier || khushiUserData.user.email;
      break;
      
    case "google":
      // Keep Khushi's data but update email for Google login
      finalUserData.user.email = identifier || "khushipal1470@gmail.com";
      break;
      
    default:
      // Use Khushi's data as-is
      break;
  }

  const mockResponse = {
    status: 1,
    message: "User logged in successfully (Demo Mode)",
    data: finalUserData
  };

  try {
    console.log("🔍 MOCK LOGIN: Setting Khushi's data for", type, "login");
    console.log("🔍 MOCK LOGIN: User data:", mockResponse.data.user);
    
    // Set token in Redux
    await dispatch(setTokenThunk(mockResponse.data.accessToken));
    dispatch(setJWTToken({ data: mockResponse.data.accessToken }));
    
    // Set user data
    dispatch(setCurrentUser({ data: mockResponse.data.user }));
    dispatch(setAuthType({ data: type }));
    dispatch(setAuthId({ data: mockResponse.data.user._id }));
    dispatch(setIsGuest({ data: false }));
    
    // Show success message
    toast.success(`Welcome back, ${mockResponse.data.user.name}!`);
    
    // Reset form states
    setError("");
    setOtp("");
    setPhoneNumber("");
    setEmail("");
    setPassword("");
    setLoading(false);
    setIsOTP(false);
    setShowLogin(false);
    setShowRegister(false);
    
    // Handle guest cart migration if needed
    if (cart?.isGuest === true && cart?.guestCart?.length !== 0) {
      console.log("🔍 Guest cart items preserved");
      toast.info("Your cart items have been preserved");
    }
    
    // Fetch settings and cart data for the new user
    await handleFetchSetting();
    await fetchCart();
    
  } catch (error) {
    console.error("Mock login error:", error);
    setLoading(false);
    toast.error("Demo login failed. Please try again.");
  }
};
  // ==================== ORIGINAL FUNCTIONS WITH MOCK INTEGRATION ====================

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputType]);

  useEffect(() => {
    setCountryCode(process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE);
  }, []);

  useEffect(() => {
    if (showLogin === true && showRegister === false) {
      if (process.env.NEXT_PUBLIC_DEMO_MODE == "true") {
        setInputType("number");
        dispatch(setAuthType({ data: "number" }))
        setPhoneNumber(`+919876543210`);
        setCountryCode(defaultCountry);
        setPhoneNumberWithoutCountryCode("9876543210");
        setOtp("123456");
      }
    }
    if (setting?.phone_login == 1) {
      setInputType("number");
    }
    else if (setting?.email_login == 1) {
      setInputType("email");
    }
  }, [showLogin]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setOtpDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (showLogin) {
      generateRecaptcha();
    }
    return () => {
      recaptchaClear();
    };
  }, [showLogin]);

  const recaptchaClear = async () => {
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      } catch (error) {
        console.error("Error clearing ReCAPTCHA verifier:", error);
      }
    }
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = "";
    }
  };

  const generateRecaptcha = async () => {
    await recaptchaClear();
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (!recaptchaContainer) {
      console.error("Container element 'recaptcha-container' not found.");
      return null;
    }
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, { size: "invisible" });
      return window.recaptchaVerifier;
    } catch (error) {
      console.error("Error initializing RecaptchaVerifier:", error.message);
      return null;
    }
  };

  const handleShowRegister = (type) => {
    setShowRegister(true);
    setInputType(type);
    setError("")
  };

  const handleEmailChange = (value, data) => {
    setInputType("email");
    setEmail(value);
    setOtp("");
    setPhoneNumber("");
    setCountryCode("");
  };

  const handlePhoneNoChange = (value, data) => {
    setInputValue(value);
    setInputType("number");
    dispatch(setAuthType({ data: "phone" }));
    const dialCode = data?.dialCode || "";
    const phoneWithoutDialCode = value.startsWith(dialCode) ? value.slice(dialCode.length) : value;
    setPhoneNumber(`+${value}`);
    setPhoneNumberWithoutCountryCode(phoneWithoutDialCode);
    setCountryCode("+" + dialCode);
    setOtp("");
  };

  // ==================== MOCK LOGIN HANDLERS ====================

  const handleSendOTP = async (e) => {
    setLoading(true);
    setOtpDisabled(true);
    e.preventDefault();

    // MOCK: Always show OTP screen
    setTimer(90);
    setIsOTP(true);
    setLoading(false);
    toast.success("OTP sent successfully (Demo Mode)");
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    // MOCK: Login with phone
    await mockLogin("phone", phoneNumberWithoutCountryCode || "9876543210");
  };

  const handleGoogleLogin = async () => {
    // MOCK: Login with Google
    await mockLogin("google", email || "googleuser@example.com");
  };

  const handleEmailLogin = async (e) => {
    if (e != undefined) e.preventDefault();
    
    if (!email || !password) {
      setError(t("email_password_mandatory"))
      setLoading(false);
      return;
    }
    
    // MOCK: Login with email
    await mockLogin("email", email);
  };

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    // MOCK: Login with email verification
    await mockLogin("email", email);
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    
    if (setting?.phone_auth_password == 1) {
      if (phoneNumber?.length < countryCode.length || phoneNumber?.slice(1) === countryCode) {
        setError(t("please_enter_phone_number"));
        setLoading(false);
        return;
      } else if (!phonePassword) {
        setError(t("please_enter_password"));
        return;
      } else {
        // MOCK: Login with phone password
        await mockLogin("phone", phoneNumberWithoutCountryCode);
      }
    } else {
      // For OTP-based phone login
      await handleSendOTP(e);
    }
  };

  // ==================== ORIGINAL UTILITY FUNCTIONS ====================

  const handleFetchSetting = async () => {
    try {
      const res = await api.getSetting();
      const parsedSetting = JSON.parse(atob(res.data))
      dispatch(setSetting({ data: parsedSetting }));
    } catch (error) {
      console.log("error", error);
    }
  };

  const getProductData = (cartData) => {
    const cartProducts = cartData?.cart?.map((product) => {
      return {
        product_id: product?.product_id,
        product_variant_id: product?.product_variant_id,
        qty: product?.qty,
      };
    });
    return cartProducts;
  };

  const fetchCart = async () => {
    const latitude = city?.latitude || setting?.default_city?.latitude;
    const longitude = city?.longitude || setting?.default_city?.longitude;
    try {
      const response = await api.getCart({ latitude: latitude, longitude: longitude });
      if (response.status === 1) {
        dispatch(setCart({ data: response.data }));
        const productsData = getProductData(response.data);
        dispatch(setCartProducts({ data: productsData }));
        dispatch(setCartSubTotal({ data: response?.data?.sub_total }));
      } else {
        dispatch(setCart({ data: null }));
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await api.getUser();
      dispatch(setCurrentUser({ data: response.user }));
      toast.success("You're successfully Logged In");
    } catch (error) {
      console.log("error", error);
    }
  };

  const handlePasswordShow = () => {
    setShowPassword(!showPassword);
  };

  const handleShowForgotPassword = (type) => {
    setPhonePassword("")
    setForgotPasswordType(type);
    setShowForgetPassword(true);
  };

  const handleHideLogin = async () => {
    await recaptchaClear();
    setIsOTP(false);
    setShowLogin(false);
    setError("");
    setInputValue("");
    setInputType("");
    setLoading(false);
    setMobileActiveKey(1);
    setEmail("");
    setPassword("");
  };

  const addToBulkCart = async () => {
    try {
      const variantIds = cart?.guestCart?.map((p) => p.product_variant_id);
      const quantities = cart?.guestCart?.map((p) => p.qty);
      const response = await api.addToBulkCart({
        variant_ids: variantIds.join(","),
        quantities: quantities.join(","),
      });
      if (response.status == 1) {
        dispatch(setGuestCartTotal({ data: 0 }));
        dispatch(addtoGuestCart({ data: [] }));
        dispatch(setCartSubTotal({ data: response.sub_total }));
      } else {
        console.log("Error while adding bulk products");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderPhoneInput = () => (
    <>
      {error && <p className="text-center text-xs text-red-500 my-2 font-semibold">{error}</p>}
      <form onSubmit={handlePhoneLogin}>
        <div className="flex flex-col gap-4">
          <PhoneInput
            inputStyle={{ direction: language?.type }}
            country={defaultCountry}
            value={phoneNumber}
            onChange={(phone, data) => handlePhoneNoChange(phone, data)}
            onCountryChange={(code) => setCountryCode(code)}
            inputProps={{ name: "phone", required: true, autoFocus: true }}
          />
          {setting?.phone_auth_password == 1 && (
            <form className="flex flex-col relative">
              <input
                type={showPassword ? "text" : "password"}
                value={phonePassword}
                onChange={(e) => setPhonePassword(e.target.value)}
                className="border-[#CACACA] border-[1px] py-2 px-4 rounded-sm w-full"
                placeholder={t("passwordMessage")}
              />
              <div className="absolute right-[10px] top-[12px]" onClick={handlePasswordShow}>
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </div>
              <div className="text-base font-medium leading-6 mt-2 text-right">
                <p className="cursor-pointer" onClick={(e) => handleShowForgotPassword("phone")}>
                  {t("forget_password_?")}
                </p>
              </div>
            </form>
          )}
        </div>
        <button
          disabled={loading}
          type="submit"
          className="bg-[#29363F] disabled:bg-[#29363A] w-full px-4 py-2 text-white rounded-sm text-xl font-normal mt-4"
        >
          {loading ? t("loading") : t("continue")}
        </button>
        {setting?.phone_auth_password == 1 && (
          <h2 className="mt-1 block md:flex justify-start md:justify-center gap-0 md:gap-1 text-base font-medium text-center">
            {t("registerMsg")}
            <p onClick={() => handleShowRegister('number')} className="primaryColor text-base font-medium underline ml-[2px] cursor-pointer">
              {t("registerNow")}
            </p>
          </h2>
        )}
      </form>
    </>
  );

  const renderEmailInput = () => (
    <>
      {error && <p className="text-center text-xs text-red-500 my-2 font-semibold">{error}</p>}
      <form className="relative" onSubmit={handleEmailLogin}>
        <input
          value={email}
          onChange={(e) => handleEmailChange(e.target.value, {})}
          className="border-black border-[1px] py-2 px-4 rounded-sm w-full"
          placeholder={t("email_placeholder")}
          ref={inputRef}
        />
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-black border-[1px] py-2 px-4 rounded-sm w-full mt-4"
          placeholder={t("passwordMessage")}
        />
        <div className="absolute right-[10px] top-[72px]" onClick={handlePasswordShow}>
          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
        </div>
        <div className="text-base font-medium leading-6 mt-2 text-right">
          <p className="cursor-pointer" onClick={(e) => handleShowForgotPassword("email")}>
            {t("forget_password_?")}
          </p>
        </div>
        <button
          disabled={loading}
          type="submit"
          className="bg-[#29363F] disabled:bg-[#29363A] w-full px-4 py-2 text-white rounded-sm text-xl font-normal mt-4"
        >
          {loading ? t("loading") : t("continue")}
        </button>
        <h2 className="mt-1 block md:flex justify-start md:justify-center gap-0 md:gap-1 text-base font-medium text-center">
          {t("registerMsg")}
          <p onClick={() => handleShowRegister('email')} className="primaryColor text-base font-medium underline ml-[2px] cursor-pointer">
            {t("registerNow")}
          </p>
        </h2>
      </form>
    </>
  );

  // ==================== MAIN RENDER ====================

  return (
    <>
      <Dialog open={showLogin}>
        <DialogContent className="overflow-y-auto overflow-x-hidden">
          <DialogHeader className="flex justify-between items-center flex-row">
            <div>
              <h1 className='text-3xl font-bold'>{t("login")}</h1>
            </div>
            <div>
              <IoIosCloseCircle size={32} onClick={() => handleHideLogin()} />
            </div>
          </DialogHeader>
          <div className="">
            <div className="my-6">
              {isOTP ? (
                <>
                  <div className="flex flex-col ">
                    <h5 className="text-[22px] text-wrap font-bold textColor">
                      {t("enter_verification_code")}
                    </h5>
                    <span className="flex flex-col text-start item-start ">
                      {t("otp_send_message")}
                      <p className="font-weight-bold py-2">
                        {inputType == "email" ? (
                          <div className="flex gap-2">{t('email')}: {email}</div>
                        ) : (
                          <div className="flex gap-2">{t("phone")}: {phoneNumber}</div>
                        )}
                      </p>
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col ">
                  <h5 className="text-[40px] font-bold textColor">
                    {t("welcome")}
                  </h5>
                  {(setting?.email_login == 1 || setting?.phone_login == 1) && (
                    <span className="textColor text-xs">
                      {t("login_message")}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div>
              {isOTP ? (
                <form onSubmit={inputType == "email" ? handleEmailVerify : handleOtpVerification}>
                  <div className="overflow-auto p-0 flex items-center justify-center flex-col ">
                    {error && <p className="text-center text-xs text-red-500">{error}</p>}
                    <OtpInput
                      className="mx-auto items-center flex flex-wrap justify-center p-0"
                      value={otp}
                      onChange={setOtp}
                      numInputs={6}
                      inputType="number"
                      renderInput={(props) => (
                        <input
                          {...props}
                          className="border border-gray-300 mx-1 md:mx-2 rounded-sm bg text-center p-2 w-10 md:w-[62px] mt-6"
                          style={{ fontSize: "16px" }}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-8 flex justify-center ">
                    <button className="w-full bg-[#29363F] text-white text-xl py-2 rounded-sm" type="submit">
                      {loading == true ? t("loading") : t("login")}
                    </button>
                  </div>
                  {inputType == "number" && (
                    <div className="mt-2 text-center">
                      <div className="text-base font-medium flex gap-1 justify-center my-2">
                        <button onClick={handleSendOTP} disabled={otpDisabled}>
                          {timer === 0 ? `Resend OTP` : <>{t("resetOtpIn")} <strong> {formatTime(timer)} </strong></>}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <>
                  <div className="my-4 flex flex-col gap-2">
                    {setting?.email_login == 1 && setting?.phone_login == 1 ? (
                      inputType == "number" ? renderPhoneInput() : renderEmailInput()
                    ) : setting?.phone_login == 1 ? (
                      renderPhoneInput()
                    ) : setting?.email_login == 1 ? (
                      renderEmailInput()
                    ) : (
                      <></>
                    )}
                  </div>

                  {setting?.google_login == 1 && (setting?.email_login == 1 || setting?.phone_login == 1) ? (
                    <div className="flex items-center justify-between my-4 gap-2">
                      <hr className="flex-grow border-t-2 border-dashed border-gray-300" />
                      <span className=" text-[#4B6272] font-bold text-base">{t("or")}</span>
                      <hr className="flex-grow border-t-2 border-dashed border-gray-300" />
                    </div>
                  ) : (
                    <></>
                  )}
                  {setting?.google_login == 1 && (
                    <div className="my-4">
                      <button onClick={handleGoogleLogin} className="w-full border-[1px] py-2 px-4 rounded-sm gap-2 flex items-center justify-center text-base font-normal">
                        <Image src={GoogleLogo} alt="Google logo" height={30} width={30} className="h-[30px] w-[30px] object-cover" />
                        {t("continue_with_google")}
                      </button>
                    </div>
                  )}
                  {setting?.email_login == 1 && inputType == "number" && (
                    <div className="my-4">
                      <button onClick={() => { setError(""); setInputType("email") }} className="w-full border-[1px] py-2 px-4 rounded-sm gap-2 flex items-center justify-center text-base font-normal">
                        <FaRegEnvelope size={30} className="h-[30px] w-[30px]" />
                        {t("continue_with_email")}
                      </button>
                    </div>
                  )}
                  {setting?.phone_login == 1 && inputType == "email" && (
                    <div className="my-4">
                      <button onClick={() => { setInputType("number"); setEmail(""); setPassword(""); setError(""); }} className="w-full border-[1px] py-2 px-4 rounded-sm gap-2 flex items-center justify-center text-base font-normal">
                        <FiPhone size={30} className="h-[30px] w-[30px]" />
                        {t("continue_with_phone")}
                      </button>
                    </div>
                  )}
                  <div className="py-6 flex items-center justify-center">
                    <p className="text-center">
                      {t("agreement_updated_message")} {setting?.web_setting?.site_title} {t("terms_of_service")} {t("and")} {t("privacy_policy")}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          <div id="recaptcha-container" style={{ visibility: "hidden", position: "absolute", height: "1px", overflow: "hidden" }}></div>
        </DialogContent>
      </Dialog>
      <NewUserModal
        showNewUser={showNewUser}
        setShowNewUser={setShowNewUser}
        setPhoneNumberWithoutCountryCode={setPhoneNumberWithoutCountryCode}
        setEmail={setEmail}
        setUserName={setUserName}
        userName={userName}
        email={email}
        phoneNumberWithoutCountryCode={phoneNumberWithoutCountryCode}
        countryCode={countryCode}
        setIsOTP={setIsOTP}
      />
      <Register
        setShowRegister={setShowRegister}
        showRegister={showRegister}
        setIsOTP={setIsOTP}
        email={email}
        setEmail={setEmail}
        setOtp={setOtp}
        inputType={inputType}
        setTimer={setTimer}
        setShowLogin={setShowLogin}
      />
      <ForgetPasswordModal
        showForgetPassword={showForgetPassword}
        setShowForgetPassword={setShowForgetPassword}
        forgotPasswordType={forgotPasswordType}
        isErrorMessage={isErrorMessage}
      />
    </>
  );
}

export default Login;