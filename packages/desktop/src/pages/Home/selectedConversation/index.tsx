import { $selectedConversation } from "../../../controller/recoil";
import { Dimensions } from "../../../electron/constants";
import { useEffect } from "react";
import { useRecoilState } from "recoil";

export default function SelectedConversation() {
  const [selectedConvo, setSelectedConvo] = useRecoilState(
    $selectedConversation
  );

  // want to grab the right data based on the selected contact

  /** Data we need:
   * user details of the selected person...should be in the search results client side, but just do another fetch?
   * websocket for the status only if there exists a relationship?
   * ability to see my relationship with this user...whether null, pending, active, etc.
   * all messages between me and them
   */

  useEffect(() => {
    // if selected, then change the bounds of this window as well
    if (selectedConvo) {
      window.electronAPI.window.resizeWindow(Dimensions.selectedConvo);
    } else {
      // change bounds back
      window.electronAPI.window.resizeWindow(Dimensions.default);
    }
  }, [selectedConvo]);

  // if no convo selected, don't show this
  if (!selectedConvo) {
    return <></>;
  }

  return (
    <div className="bg-slate-800 flex-1">this is the selected conversation</div>
  );
}
