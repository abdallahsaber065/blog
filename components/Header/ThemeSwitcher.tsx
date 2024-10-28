
import { useThemeSwitch } from "../Hooks/useThemeSwitch";
import { cx } from "@/lib";
import { MoonIcon, SunIcon } from "../Icons";

const ThemeSwitcher = () => {
  const [mode, setMode] = useThemeSwitch();

  return (
    <button
      onClick={() => setMode(mode === "light" ? "dark" : "light")}
      className={cx(
        "w-6 h-6  ml-2 flex items-center justify-center rounded-full p-1",
        mode === "light" ? "bg-dark text-light" : "bg-light text-dark"
      )}
      aria-label="theme-switcher"
    >
      {mode === "light" ? <MoonIcon className={"fill-dark"} /> : <SunIcon className={"fill-dark"} />}
    </button>
  );
};

export default ThemeSwitcher;