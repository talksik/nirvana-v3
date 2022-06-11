import { Button, Container, Typography } from '@mui/material';
import FullMottoLogo, { LogoType } from '@nirvana/components/logo/fullMotto';
import React, { useEffect, useState } from 'react';

import { blueGrey } from '@mui/material/colors';

type Quote = {
  content: string;
  author: string;
  length: number;
  dateAdded: Date;
  _id: string;
  tags: string[];
};
export default function FlowState({ handleReconnect }: { handleReconnect: () => void }) {
  const [quote, setQuote] = useState<Quote>(null);

  useEffect(() => {
    fetch('https://api.quotable.io/random')
      .then((res) => res.json())
      .then((data: Quote) => {
        console.warn(data);

        setQuote(data);
      })
      .catch((error) => {
        // do nothing, don't bother user, just don't show the quote
        console.warn(error);
      });
  }, []);

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
      {/* <img src="https://source.unsplash.com/random/?nature" /> */}
      <FullMottoLogo type={LogoType.small} className={'absolute bottom-5 mx-auto'} />

      {quote && (
        <Container
          maxWidth={'sm'}
          sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
        >
          <Typography variant={'h6'} textAlign={'center'}>
            {quote.content}
          </Typography>
          <Typography variant={'overline'} textAlign={'center'}>
            {quote.author}
          </Typography>
        </Container>
      )}

      <Button variant={'text'} onClick={handleReconnect}>
        reconnect
      </Button>
    </Container>
  );
}
