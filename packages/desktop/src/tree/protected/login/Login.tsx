import Channels, { STORE_ITEMS } from '../../electron/constants';
import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { $jwtToken } from '../../controller/recoil';
import { FcGoogle } from 'react-icons/fc';
import Logo from '../../components/Logo';
import { useLogin } from '../../controller/index';

export default function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setJwtToken = useSetRecoilState($jwtToken);

  useEffect(() => {
    window.electronAPI.once(
      Channels.GOOGLE_AUTH_TOKENS,
      async (tokens: { access_token: string; id_token: string; refresh_token: string }) => {
        console.log('got tokens', tokens);

        setIsLoading(true);
        // todo: implement refresh token procedure in api layer by sending refresh_token and such

        const loginResponse = await mutateAsync({
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
        });

        const { jwtToken, userDetails } = loginResponse;
        setJwtToken(jwtToken);
      },
    );

    // todo: figure out how to clean up with the preload api
    // return () => {
    //   window.electronAPI.removeAllListeners(Channels.GOOGLE_AUTH_TOKENS);
    // };
  }, []);

  const continueAuth = () => {
    setIsLoading(true);

    // send to main process
    window.electronAPI.auth.initiateLogin();
  };

  return (
    <div
      className="flex flex-col space-y-5 justify-center items-center 
    h-screen w-screen
     bg-zinc-700"
    >
      <Logo className="scale-50" />

      {/* ! TESTING PURPOSES */}
      <div className={'text-white flex flex-col gap-5'}>
        <button
          onClick={() =>
            setJwtToken(
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjczYTNjZGVmYzc3MDNhZDg1NWYzMjYiLCJnb29nbGVVc2VySWQiOiIxMTM0NzA3ODY2OTAzNTMxMDkwODYiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2ptMjlTZDFXbm04TnZaYlhrb3N2ZjZTb0lENmtCUDVPSFJMVklPQlE9czk2LWMiLCJlbWFpbCI6InBhdGVsLmFyanVuNTBAZ21haWwuY29tIiwibmFtZSI6IkFyanVuIFBhdGVsIiwiaWF0IjoxNjUxOTY2MDg2fQ.bGK4DaUyuHCIRFhX5g3xQxI5SVMKR7hmte1UpmTZaVc',
            )
          }
        >
          Personal Account
        </button>

        <button
          onClick={() =>
            setJwtToken(
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjczYTZmYmVmYzc3MDNhZDg1NWYzMjciLCJnb29nbGVVc2VySWQiOiIxMTE2NzEzNTI4MDkwMTg3NjM4MjYiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2dUUmFNaVVUZkNaX1ZOM2M3SFJyYUlZUmpmN1BNSUZjVThJdlZiPXM5Ni1jIiwiZW1haWwiOiJhcmp1bnBhdGVsQGJlcmtlbGV5LmVkdSIsIm5hbWUiOiJBcmp1biBQYXRlbCIsImlhdCI6MTY1MTk2NjA5OH0.53TbuXaHDTivEpqVr-TP5A1vVIFznT3q_HoVxOReZKc',
            )
          }
        >
          Berkeley Email
        </button>

        <button
          onClick={() =>
            setJwtToken(
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjczZTAxNTM1OTg3YWZhMGZjOTA5NzYiLCJnb29nbGVVc2VySWQiOiIxMTQyMTgxMjM0Mzk1OTA4OTU4MjAiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL29ndy9BRGVhNEk0RUhmY08ycVc1blEtelJXdzdRdTVOMWVQdnU5cHkyQzFPbUVxbj1zNjQtYy1tbyIsImVtYWlsIjoidXNlbmlydmFuYUBnbWFpbC5jb20iLCJuYW1lIjoiTmlydmFuYSBTdXBwb3J0IiwiaWF0IjoxNjUxOTY3MDA2fQ.9AgmMW2LYv4QNqibvopiKAaV0GWNbChujWiY6t0OZeQ',
            )
          }
        >
          Nirvana Support
        </button>
      </div>

      {isLoading ? (
        <>
          <span className="text-white">Attempting to log you in</span>
        </>
      ) : (
        <button
          onClick={continueAuth}
          className=" text-md text-zinc-200 py-2 px-5 border border-gray-200 transition-all hover:bg-gray-200 hover:text-teal-500 rounded flex flex-row items-center space-x-2"
        >
          <FcGoogle className="text-lg" />
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
}
