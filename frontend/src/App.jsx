import {Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import {Toaster} from "react-hot-toast";
import { useEffect } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from "./components/ErrorFallback";
import PyodideWorker from "./workers/pyodideWorker?worker";
import installDepsWorker from "./workers/installDepsWorker?worker";
import * as Comlink from "comlink";

// Pages
import ProductPage from "./pages/ProductPage";
import ProductPage2 from "./pages/ProductPage2";
import ProductPage3 from "./pages/ProductPage3";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ConversionFunneBusinessInsight from "./pages/ConversionFunneBusinessInsight";
import OrdersPage from "./pages/OrdersPage";
import PasskeyPage from "./pages/PasskeyPage";
import PasskeyLearnMorePage from "./pages/PasskeyLearnMorePage";
import PasskeyLogsPage from "./pages/PasskeyLogsPage";
import ProductComments from "./pages/ProductComments";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicyPage";
import NotFoundPage from "./pages/NotFoundPage";

// Components
import ScrollToTopButton from "./components/ScrollToTopButton";
import NavigateTo404 from "./components/NavigateTo404";

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

  useEffect(()=>{
    async function runWorker(){
      const worker1 = new installDepsWorker();
      const api1 = Comlink.wrap(worker1);

      const result1 = await api1.installDeps();
      // Create a new instance of the worker.
      const worker = new PyodideWorker();
      // Wrap the worker in a Comlink proxy.
      const api = Comlink.wrap(worker);

      // Run some Python code in the worker.
      // For example, run a simple addition.
      const result = await api.runPython("Me Me Me Obed");
      console.log({result1: JSON.parse(result1)});
      console.log({result});
    }
    runWorker();
  }, [])

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300">
      <Navbar />
      <div className="fixed top-0 bottom-0 left-0 right-0 inset-0 z-0 transition-all duration-300">
        <BgPatterns />
      </div>
      <div className="min-h-screen mx-auto max-w-6xl backdrop-blur-sm">
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<ProductPage3 />} path="/product/:id" />
          <Route element={<SettingsPage />} path="/settings" />
          <Route element={<AuthPage />} path="/auth" />
          <Route element={<AnalyticsPage />} path="/product/:id/analytics" />
          <Route element={
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ProductComments />
            </ErrorBoundary>
        } path="/product/:id/comments" />
          <Route element={<OrdersPage />} path="/orders" />
          <Route element={<PasskeyPage />} path="/passkey" />
          <Route element={<PasskeyLogsPage />} path="/passkey/logs" />
          <Route element={<PasskeyLearnMorePage />} path="/passkeys/learn-more" />
          <Route element={<ConversionFunneBusinessInsight />} path="/info/charts-learn-more" />
          <Route element={<TermsOfService />} path="/info/terms-of-service" />
          <Route element={<PrivacyPolicy />} path="/info/privacy-policy" />
          <Route element={<NotFoundPage />} path="/404" />
          <Route element={<NavigateTo404 />} path="*" />
        </Routes>
      </div>
      <Toaster />
      <ScrollToTopButton />
    </div>
  )
}

export default App;