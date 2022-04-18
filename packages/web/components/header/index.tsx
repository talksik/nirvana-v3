import HorizontalLogo from "../../../components/logo/horizontal";
import { LogoType } from "@nirvana/components/logo/full";

export default function Header() {
  return (
    <div className="container mx-auto md:px-20 px-10 pt-5 flex flex-row justify-center md:justify-start">
      <HorizontalLogo type={LogoType.small} />
    </div>
  );
}
