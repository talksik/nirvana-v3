import { BsApple, BsWindows } from "react-icons/bs";
import { FaPeopleCarry, FaRunning } from "react-icons/fa";

import Footer from "../components/footer";
import FullMottoLogo from "../../components/logo/fullMotto";
import Head from "next/head";
import Header from "../components/header";
import HorizontalLogo from "../../components/logo/horizontal";
import Image from "next/image";
import { LogoType } from "../../components/logo/full";
import { MdOutlineNaturePeople } from "react-icons/md";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <>
      {/* header */}
      <Header />

      <div className="container mx-auto px-20">
        {/* above fold experience */}
        <div className="flex flex-row items-center my-10">
          <div className="flex flex-col items-start">
            <span className="text-white text-6xl leading-[1.2] font-extrabold">
              The <span className="text-nirvanaTeal">walkie-talkie</span> <br />{" "}
              for remote teams.
            </span>

            <span className="text-zinc-400 text-xl mt-5">
              The <span className="text-nirvanaTeal">{"'less is more'"}</span>{" "}
              approach. Skip zoom scheduling, <br></br> slack notifications, and
              email threads. <br /> Just talk to your team.
            </span>

            {/* download */}
            <span className="flex flex-col justify-start mt-20">
              <span className="text-white text-md mb-2">
                Download the desktop app (coming soon)
              </span>

              <span className="flex flex-row space-x-2">
                <span className="p-2 rounded bg-zinc-500 cursor-pointer blur-[2px]">
                  <BsWindows className="text-white text-xl" />
                </span>

                <span className="p-2 rounded bg-zinc-500 cursor-pointer blur-[2px]">
                  <BsApple className="text-white text-xl" />
                </span>
              </span>
            </span>
          </div>

          <img
            src="/illustrations/undraw_co-working_re_w93t.svg"
            className="h-[30em] ml-auto"
          />
        </div>
      </div>

      {/* value points */}
      <div className="flex flex-row w-full mx-auto px-20 py-10 bg-zinc-500 my-10 space-x-5 justify-center">
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
