import React, { useState } from 'react';
import bgImage from '../assets/bg/bg-geometric.png'
import bg from '../assets/bg/bg-login.png'
import logo from '../assets/logo/nameAppText.png';
import { FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import {
  validateRegister,
  prepareRegisterData,
} from "../controls/LoginControl";
import { registerUser } from '../api/auth/register.auth.api';
import { loginUser } from '../api/auth/login.auth.api';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import { useIsMobile } from '../utlis/useIsMobile';


const LoginModal: React.FC = ({  }) => {
  //UI HOOKS
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false);
  const isMobile = useIsMobile(1200);
  //USES
  const { login } = useAuth();

  //REGISTRAZIONE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error,setError] = useState("");

  //LOGIN
  const [emailLog, setEmailLog] = useState("");
  const [passwordLog, setPasswordLog] = useState("");
  const [errorLog, setErrorLog] = useState("");

  const handleRegistration = async () => {
    const data = prepareRegisterData(
      email,
      password,
      confirmPassword,
    )

    //console.log("Registrazione OK, dati pronti:", data);

    const errors = await validateRegister(data);

    if(errors.length>0){
      //console.log(errors)
      setError(errors[0]);
      return;
    }

    try {
      const response = await registerUser({ email, password , confirmPassword});
      //console.log("Registrazione Avvenuta", response);

      //dati nel context
      login(response);
    
    } catch (err) {
        if (axios.isAxiosError(err)) {

          //console.log("DEBUG AXIOS ERROR:", err);

          if (err.response) {
            if (err.response.status === 409) {
              setError("Email già registrata");
              return;
            }
          }

          setError("Errore dal server");
          return;
        }

        // Non è axios error → errore ignoto
        setError("Errore imprevisto");
    }
  };

  const handleLogin = async () =>{
    try {
      const response = await loginUser({ email : emailLog, password : passwordLog});
      //console.log("Login Avvenuta", response);

      //dati nel context
      login(response);

    } catch (err) {
      console.error("ERROR: " + err)
      setErrorLog("Email o password errate")
    }
  }

  return (
    <div 
    className={`flex items-center justify-center z-50 
    ${isMobile ? "w-screen min-h-screen px-4 py-6" : "absolute top-[-47px] w-full h-[calc(100%+47px)]"} 
    bg-[#0b0b0bba]`}
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}

    >
      <div
        className={`
        ${isMobile
          ? "w-full max-w-[420px] flex flex-col"
          : "w-[900px] h-[600px] min-w-[700px] min-h-[500px] flex flex-row"}
        m-auto overflow-hidden relative shadow-md`}
      >
        {/* Container animato con logo e registrazione sovrapposti */}
        <div className={`${isMobile ? "w-full" : "w-[50%]"} h-full relative`}>
          {/* Logo Slide */}
          <div
            className={`${isMobile ? "hidden" : "absolute flex"} w-full h-full inset-0 z-10 bg-cover bg-center items-center justify-center transition-transform duration-700 ease-in-out ${isRegistering ? 'translate-x-full' : 'translate-x-0'} ${isRegistering&&'rounded-r-[20px] rounder-l-[0px]'}`}
            style={{ backgroundImage: `url(${bgImage})` }}
          >
            <img src={logo} alt="Your Best security tool!" className='w-[70%]' />
          </div>

          {/* Registrazione Slide */}
          {(isRegistering || !isMobile) && (
         <div
            className={`${isMobile ? "relative w-full py-10" : "absolute w-full h-full"} inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-r dark:from-[#0B0B0B] from-[#93affd] dark:to-[#02142b] to-[#5580f8] rounded-l-[20px] transition-transform duration-700 ease-in-out ${!isMobile && (isRegistering ? 'translate-x-0' : '-translate-x-full')} ${isRegistering && 'rounded-r-[0px] rounder-l-[20px]'}`}
          >

            <h1 className='text-[1.5rem] m-[0px] fzen  text-center text-[darkblue] dark:text-[#2563EB] mt-4'>Registrazione</h1>
            <h2 className='text-[0.7rem] font-[100] text-[#0e0e42] dark:text-[#82aaff] text-center mt-[0.6rem]'>Crea un account con noi! </h2>

        
            <label className='text-[0.7rem] text-[#4f69a2] font-bold flex flex-col mt-[20px] mb-[20px]'>
              Email 
              <input
                className="bg-transparent dark:bg-transparent border-b-[2px] text-[0.85rem] font-[200] pl-[10px] border-none text-white focus:outline-none w-[250px] h-[30px] focus:border-b-[#2196f3]"
                style={{
                  borderImage: "linear-gradient(to right, #618DEB, #1D4ED8)",
                  borderImageSlice: 1,
                  borderWidth: "0 0 2px 0",
                  borderStyle: "solid",
                }}
                placeholder="Example.123@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </label>
             <div className="flex items-center w-[50%] mx-auto my-2 text-white text-sm gap-2 mb-[10px]">
              <div className="flex-grow border-t border-[#42557e]" />
              <span className="text-xs text-[#ffffffad] px-[10px] text-[0.8rem]">Password</span>
              <div className="flex-grow border-t border-[#42557e]" />
            </div>
             <label className='text-[0.6rem] font-[100] text-[#4f69a2] flex flex-col mt-[10px]'>
                Password
                <input
                  className="bg-transparent border-b-[2px] text-[0.9rem] pl-[10px] border-none text-white focus:outline-none w-[250px] h-[30px] focus:border-b-[#2196f3]"
                  style={{
                    borderImage: "linear-gradient(to right, #618DEB, #1D4ED8)",
                    borderImageSlice: 1,
                    borderWidth: "0 0 2px 0",
                    borderStyle: "solid",
                  }}
                  placeholder="SomeRobustPassword4938!"
                  type='text'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
               <label className='text-[0.6rem] font-[100] text-[#4f69a2] flex flex-col mt-[10px]'>
                Repeat
                <input
                  className="bg-transparent border-b-[2px] text-[0.90rem] pl-[10px] border-none text-white focus:outline-none w-[250px] h-[30px] focus:border-b-[#2196f3]"
                  style={{
                    borderImage: "linear-gradient(to right, #618DEB, #1D4ED8)",
                    borderImageSlice: 1,
                    borderWidth: "0 0 2px 0",
                    borderStyle: "solid",
                  }}
                  placeholder="Repeat password"
                  type='text'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
              <div className='mt-4'>
              {error.length === 0 && (
                <>
                  <p className="text-[0.7rem] font-[100] text-white">
                    Password must contain:
                  </p>

                  <ul className="mt-2 space-y-1 text-[0.7rem] text-white">
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      1 number and 1 special character
                    </li>


                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      1 uppercase letter
                    </li>

                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      At least 8 characters
                    </li>
                  </ul>
                </>
              )}
            </div>

              <button 
                onClick={handleRegistration}
                className='bg-gradient-to-r from-[#FFFFFF] to-[#BFC9E6] text-[0.8rem] w-[180px] mt-[20px] mb-[0.5rem] text-[#000E67] focus:outline-none focus-ring-0'
              >Registrati</button>
              <p className='text-[0.8rem] font-[100] text-[#DF5555]'>
                {error.length > 0 && (
                  <>
                    <b>Error: </b>{error}
                  </>
                )}
              </p>
              <div className="flex items-center w-[50%] mx-auto my-4 text-white text-sm gap-2 mb-[20px]">
                <div className="flex-grow border-t border-[#42557e]" />
                <span className="text-xs text-[#ffffffad] px-[10px] text-[0.8rem]">Oppure</span>
                <div className="flex-grow border-t border-[#42557e]" />
              </div>
                <button 
                  className='bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-[0.8rem] text-[white] w-[180px] mb-[30px] focus:outline-none'
                  onClick={() => setIsRegistering(false)}>
                    Return to Login
                </button>
          </div>)}
        </div>

        {/* Login */}
       {(!isRegistering || !isMobile) && (
         <div className={`flex flex-col items-center justify-center ${isMobile ? "w-full py-10" : "w-[50%] h-full"} bg-gradient-to-r dark:from-[#0B0B0B]  from-[#6d8be0]  to-[#071831] dark:to-[#02142b] rounded-r-[20px]`}>
          
            <h1 className='text-[1.5rem] m-[0px] fzen  text-center text-[darkblue] dark:text-[#2563EB] mt-4'>Login</h1>
            <h2 className='text-[0.7rem] font-[100] text-[#82aaff] text-center mt-[0.8rem]'>Accedi per iniziare a monitorare la tua rete.</h2>

            <label className='text-[0.7rem] text-[#4f69a2] font-bold flex flex-col my-4'>
              Email or Username
              <input
                className="bg-transparent border-b-[2px] text-[0.85rem] font-[200] pl-[10px] border-none text-white focus:outline-none w-[250px] h-[30px] focus:border-b-[#2196f3]"
                style={{
                  borderImage: "linear-gradient(to right, #618DEB, #1D4ED8)",
                  borderImageSlice: 1,
                  borderWidth: "0 0 2px 0",
                  borderStyle: "solid",
                }}
                placeholder="Example.123@example.com"
                value={emailLog}
                onChange={(e) => setEmailLog(e.target.value)}
              />
            </label>

            <div className='flex flex-row pl-[20px]'>
              <label className='text-[0.7rem] text-[#4f69a2] font-bold flex flex-col my-3'>
                Password
                <input
                  className="bg-transparent border-b-[2px] text-[0.85rem] font-[200] pl-[10px] border-none text-white focus:outline-none w-[250px] h-[30px] focus:border-b-[#2196f3]"
                  style={{
                    borderImage: "linear-gradient(to right, #618DEB, #1D4ED8)",
                    borderImageSlice: 1,
                    borderWidth: "0 0 2px 0",
                    borderStyle: "solid",
                  }}
                  placeholder="SomeRobustPassword4938!"
                  value={passwordLog}
                  onChange={(e) => setPasswordLog(e.target.value)}
                  type={isPasswordVisible ? 'text' : 'password'}
                />
              </label>
              {isPasswordVisible ? (
                <FaEye
                  size={16}
                  className='relative right-[20px] top-[30px] text-[#618DEB] cursor-pointer z-0'
                  onClick={() => setPasswordVisible(false)}
                />
              ) : (
                <FaEyeSlash
                  size={16}
                  className='relative right-[20px] top-[30px] text-[#618DEB] cursor-pointer z-0'
                  onClick={() => setPasswordVisible(true)}
                />
              )}
            </div>

            <button 
              onClick={handleLogin}
              className='bg-gradient-to-r text-[white] mb-[1rem] from-[#1D4ED8] to-[#1D4ED8] text-[0.8rem] w-[180px] mt-[20px] focus:outline-none focus-ring-0'
              >
                Accedi
            </button>
              <p className='text-[0.8rem] font-[100]  text-[#DF5555]'>
                {
                errorLog.length>0 && (
                  <>
                  <b>Error:</b> {errorLog}
                  </>
                )}
            </p>
            <div className="flex items-center w-[50%] mx-auto my-4 text-white text-sm gap-2 mb-[20px]">
              <div className="flex-grow border-t border-[#42557e]" />
              <span className="text-xs text-[#ffffffad] px-[10px] text-[0.8rem]">Oppure</span>
              <div className="flex-grow border-t border-[#42557e]" />
            </div>

            {/**<GoogleLogin
              onSuccess={async credentialResponse => {
                const idToken = credentialResponse.credential;
                try {
                  const res = await fetch('/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ token: idToken })
                  });

                  if (res.ok) {
                    const data = await res.json();
                    console.log("Login Google ok", data);
                    
                  } else {
                    console.error('Login fallito', res.status);
                  }
                } catch (err) {
                  console.error("Errore durante login Google:", err);
                }
              }}
              onError={() => {
                console.log('Login con Google fallito');
              }}
              theme="outline"
              size="medium"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              locale="it"
              width="200"
            /> */}
            <button className='px-2 py-1 rounded-sm flex flex-row items-center bg-white gap-2' disabled={true}> 
              <span className='flex flex-col text-[0.6rem]'><span>Cooming</span> <span>Soon!</span></span> 
              <span> Accedi con Google </span>
            </button>

            <p className='text-[0.7rem] mt-[40px] mb-[0.4rem] text-[#ffffff]'>Non sei ancora registrato?</p>
            <button
              className='bg-gradient-to-r from-[#1D4ED8] to-[#1D4ED8] text-[#ffffff] text-[0.8rem] w-[180px] mb-[20px] focus:outline-none'
              onClick={() => setIsRegistering(true)}
            >
              Crea un account
            </button>
            <p className='text-[0.7rem] mt-[20px] hover:cursor-pointer mb-[20px] text-[#ffffff]'><u>Password dimenticata?</u></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;