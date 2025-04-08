import { useState } from 'react';
import { PaletteIcon } from 'lucide-react';

const CustomThemeSelect = ({ themes, currentTheme, onThemeChange }) => {
  const [open, setOpen] = useState(false);

  const selectedTheme = themes.find(theme => theme.name === currentTheme);


  return (
    <div className={`relative inline-block w-full ${open? "h-44 overflow-y-scroll": ""}`}>
      {/* Dropdown trigger */}
      <button
        // type="button"
        className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors border select-none border-base-content/30 bg-base-300/50 btn btn-ghost`}
        // border-base-content/30 bg-base-300/50
        onClick={() => setOpen(!open)}
      >
        <PaletteIcon className="w-5 h-5" />
        <span className="text-sm font-medium">{currentTheme}</span>
        <div className="ml-auto flex gap-1">
          {selectedTheme &&
            selectedTheme.colors.map((color, index) => (
              <span
                key={index}
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
        </div>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute z-10 w-full mt-2 bg-base-200 rounded-xl shadow-lg">
          {themes.map(themeOption => (
            <button
              key={themeOption.name}
              type="button"
              className={`btn btn-ghost w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                currentTheme === themeOption.name
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-base-content/5'
              }`}
              onClick={() => {
                onThemeChange(themeOption.name);
                setOpen(false);
              }}
            >
              <PaletteIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{themeOption.name}</span>
              <div className="ml-auto flex gap-1">
                {themeOption.colors.map((color, index) => (
                  <span
                    key={index}
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomThemeSelect;
