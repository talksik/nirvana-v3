import { BsApple, BsWindows } from "react-icons/bs";
import { FaPeopleCarry, FaRunning } from "react-icons/fa";

import Footer from "../components/footer";
import Header from "../components/header";
import { MdOutlineNaturePeople } from "react-icons/md";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      {/* header */}
      <Header />

      {/* above fold experience */}
      <div className="container mx-auto max-w-screen-lg px-10">
        <div className="flex md:flex-row flex-col items-center my-10">
          <div className="flex flex-col items-start">
            <span className="text-white text-5xl md:text-6xl leading-[1.2] font-extrabold text-center md:text-left">
              The <span className="text-nirvanaTeal">walkie-talkie</span> <br />{" "}
              for remote teams.
            </span>

            <span className="text-zinc-400 text-lg md:text-xl mt-5 text-center md:text-left">
              The <span className="text-nirvanaTeal">{"'less is more'"}</span>{" "}
              approach. Skip zoom scheduling, <br></br> slack notifications, and
              email threads. <br /> Just talk to your team.
            </span>

            {/* download */}
            <div className="flex flex-col justify-start mt-20 text-center md:text-left w-full items-center md:items-start">
              <span className="text-white text-md mb-2">
                Download the desktop app <br></br> (coming soon)
              </span>

              <span className="flex flex-row space-x-2 justify-center">
                <span className="p-2 rounded bg-zinc-500 cursor-pointer blur-[2px]">
                  <BsWindows className="text-white text-xl" />
                </span>

                <span className="p-2 rounded bg-zinc-500 cursor-pointer blur-[2px]">
                  <BsApple className="text-white text-xl" />
                </span>
              </span>
            </div>
          </div>

          <img
            src="/illustrations/undraw_co-working_re_w93t.svg"
            className="h-[25em] ml-auto md:block hidden"
          />
        </div>
      </div>

      {/* value points */}
      <div className="flex flex-col md:flex-row w-full mx-auto px-20 py-10 bg-zinc-500 my-10 gap-5 justify-center">
        <span className="p-5 bg-zinc-600 max-w-md flex flex-col items-start flex-1 shadow">
          <span className="flex flex-row items-center space-x-2">
            <FaRunning className="text-white text-xl" />
            <span className="text-white font-semibold text-lg">
              Move Faster
            </span>
          </span>

          <span className="text-zinc-300 text-sm">
            No more back and forth chatter. Resolve issues in seconds with
            spontaneous and natural conversations.
          </span>
        </span>

        <span className="p-5 bg-zinc-600 max-w-md flex flex-col items-start flex-1 shadow">
          <span className="flex flex-row items-center space-x-2">
            <MdOutlineNaturePeople className="text-white text-xl" />
            <span className="text-white font-semibold text-lg">Minimal</span>
          </span>

          <span className="text-zinc-300 text-sm">
            All of your team’s converstions in one place. Nirvana’s built for
            flow state. Communication as simple and human as possible.
          </span>
        </span>

        <span className="p-5 bg-zinc-600 max-w-md flex flex-col items-start flex-1 shadow">
          <span className="flex flex-row items-center space-x-2">
            <FaPeopleCarry className="text-white text-lg" />
            <span className="text-white font-semibold text-lg">
              Build Culture
            </span>
          </span>

          <span className="text-zinc-300 text-sm">
            Close-knit culture and increased serendipity by knowing your team’s
            right there with you.
          </span>
        </span>
      </div>

      {/* footer */}

      <Footer />
    </>
  );
};

export default Home;
