import logo from "../assets/logo.svg";

type AppLogoProps = {
  className?: string;
};

const AppLogo = ({ className = "h-8 w-8" }: AppLogoProps) => (
  <img className={`${className} shrink-0`} src={logo} alt="EnvVault logo" />
);

export default AppLogo;
