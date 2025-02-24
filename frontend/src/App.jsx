import {Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import {Toaster} from "react-hot-toast";
import { useEffect } from "react";

// Pages
import ProductPage from "./pages/ProductPage";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";

// Stores
import { useThemeStore } from "./store/useThemeStore";
import { useSettingsStore } from "./store/useSettingsStore";

// Patterns
import SvgPastel from "./patterns/SvgPastel";
import SvgRetro from "./patterns/SvgRetro";
import SvgCoffee from "./patterns/SvgCoffee";
import SvgForest from "./patterns/SvgForest";
import SvgCyberpunk from "./patterns/SvgCyberpunk";
import SvgSynthwave from "./patterns/SvgSynthwave";
import SvgLuxury from "./patterns/SvgLuxury";
import SvgAutumn from "./patterns/SvgAutumn";
import SvgValentine from "./patterns/SvgValentine";
import SvgAqua from "./patterns/SvgAqua";
import SvgBusiness from "./patterns/SvgBusiness";
import SvgNight from "./patterns/SvgNight";
import SvgDracula from "./patterns/SvgDracula";

const BgPatterns = ()=>{
  switch(useSettingsStore.getState().settings.visualCustomization.themeSelection.theme){
    case "pastel":
      return <SvgPastel />
    case "retro":
      return <SvgRetro />
    case "coffee":
      return <SvgCoffee />
    case "forest":
      return <SvgForest />
    case "cyberpunk":
      return <SvgCyberpunk />
    case "synthwave":
      return <SvgSynthwave />
    case "luxury":
      return <SvgLuxury />
    case "autumn":
      return <SvgAutumn />
    case "valentine":
      return <SvgValentine />
    case "aqua":
      return <SvgAqua />
    case "business":
      return <SvgBusiness />
    case "night":
      return <SvgNight />
    case "dracula":
      return <SvgDracula />
    default:
      return <SvgPastel />
  }
}


function App() {
  const {theme} = useSettingsStore().settings.visualCustomization.themeSelection;
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300">
      <Navbar />
      <div className="fixed top-0 bottom-0 left-0 right-0 inset-0 z-0 transition-all duration-300">
        <BgPatterns />
      </div>
      <div className="min-h-screen mx-auto max-w-6xl backdrop-blur-sm">
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<ProductPage />} path="/product/:id" />
          <Route element={<SettingsPage />} path="/settings" />
          <Route element={<AuthPage />} path="/auth" />
        </Routes>
      </div>
      <Toaster />
    </div>
  )
}

export default App;