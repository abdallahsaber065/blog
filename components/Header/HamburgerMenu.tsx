import { useState } from "react";

const HamburgerMenu = ({ toggle }: { toggle: () => void }) => {
  const [click, setClick] = useState(false);

  return (
    <button className="inline-block sm:hidden z-50" onClick={() => { setClick(!click); toggle(); }} aria-label="Hamburger Menu">
      <div className="w-6 cursor-pointer transition-all ease duration-300">
        <div className="relative">
          <span
            className="absolute top-0 inline-block w-full h-0.5 bg-dark dark:bg-light rounded transition-all ease duration-200"
            style={{
              transform: click ? "rotate(-45deg) translateY(0)" : "rotate(0deg) translateY(6px)",
            }}
          >
            &nbsp;
          </span>
          <span
            className="absolute top-0 inline-block w-full h-0.5 bg-dark dark:bg-light rounded transition-all ease duration-200"
            style={{
              opacity: click ? 0 : 1,
            }}
          >
            &nbsp;
          </span>
          <span
            className="absolute top-0 inline-block w-full h-0.5 bg-dark dark:bg-light rounded transition-all ease duration-200"
            style={{
              transform: click ? "rotate(45deg) translateY(0)" : "rotate(0deg) translateY(-6px)",
            }}
          >
            &nbsp;
          </span>
        </div>
      </div>
    </button>
  );
};

export default HamburgerMenu;