import FullMottoLogo from "../../../components/logo/fullMotto";
export default function Footer() {
  return (
    <div className="container mx-auto flex md:flex-row flex-col justify-between mt-auto items-center">
      <span className="ml-20">
        <span className="text-zinc-400 text-sm">Wanna chat? </span>
        <span className="font-bold text-white">arjunpatel@berkeley.edu</span>
      </span>
      <FullMottoLogo className="text-center scale-50" />
    </div>
  );
}
