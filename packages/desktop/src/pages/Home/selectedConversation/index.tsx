import { $selectedConversation } from "../../../controller/recoil";
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

  return <span>this is the selected conversation</span>;
}
