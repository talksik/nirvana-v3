import React, { useEffect, useState } from 'react';
import FullMottoLogo, { LogoType } from '@nirvana/components/logo/fullMotto';

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
    <div className="flex flex-col flex-1 justify-center items-center relative">
      {/* <img src="https://source.unsplash.com/random/?nature" /> */}
      <FullMottoLogo type={LogoType.small} className={'absolute bottom-2 mx-auto'} />

      {quote && (
        <span className="flex flex-col justify-center items-center max-w-screen-sm">
          <span className="text-xl text-gray-800 font-semibold text-center">{`"${quote.content}"`}</span>
          <span className="tex-md italic text-gray-400">{quote.author}</span>
        </span>
      )}

      <button
        onClick={handleReconnect}
        className="text-gray-300 text-xs p-3 transition-all hover:bg-gray-200 fixed top-5 right-5"
      >
        reconnect
      </button>
    </div>
  );
}
