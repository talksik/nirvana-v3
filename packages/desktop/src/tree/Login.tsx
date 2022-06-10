import { Button, CircularProgress, Container, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';

import Channels from '../electron/constants';
import { FcGoogle } from 'react-icons/fc';
import NirvanaLogo from '../subcomponents/NirvanaLogo';
import { blueGrey } from '@mui/material/colors';
// import Logo from '../../components/Logo';
import { login } from '../api/NirvanaApi';
import { useAsyncFn } from 'react-use';
import useAuth from '../providers/AuthProvider';

export default function Login() {
  const { setJwtToken } = useAuth();

  const [loginState, loginApiHandler] = useAsyncFn(login);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    window.electronAPI.once(
      Channels.GOOGLE_AUTH_TOKENS,
      async (tokens: { access_token: string; id_token: string; refresh_token: string }) => {
        console.log('got tokens', tokens);

        setIsLoading(true);
        const loginResponse = await loginApiHandler({
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
        });

        const { jwtToken, userDetails } = loginResponse;

        setJwtToken(jwtToken);

        setIsLoading(false);
      },
    );

    // todo: figure out how to clean up with the preload api
    // return () => {
    //   window.electronAPI.removeAllListeners(Channels.GOOGLE_AUTH_TOKENS);
    // };
  }, [loginApiHandler, setJwtToken]);

  // take user to browser to complete authentication
  const continueAuth = () => {
    setIsLoading(true);

    // send to main process
    window.electronAPI.auth.initiateLogin();
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        background: blueGrey[50],
      }}
    >
      <NirvanaLogo />

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Button onClick={continueAuth} variant="outlined" color="primary" startIcon={<FcGoogle />}>
          Continue with Google
        </Button>
      )}

      {/* ! TESTING PURPOSES */}
      <Stack direction={'column'}>
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
      </Stack>
    </Container>
  );
}
