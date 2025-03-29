import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useCallback } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from "./components/ErrorFallback";
import PyodideWorker from "./workers/pyodideWorker?worker";
import installDepsWorker from "./workers/installDepsWorker?worker";
import * as Comlink from "comlink";
import { useQuery } from "@tanstack/react-query";

// Pages
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
import { useGoogleAuthContext } from "./contexts/GoogleAuthContext";
import { cancellableWaiting } from "./hooks/waiting";
import { useNotifications } from './hooks/useNotifications';

// Components
import ScrollToTopButton from "./components/ScrollToTopButton";
import NavigateTo404 from "./components/NavigateTo404";

// Stores
import { useThemeStore } from "./store/useThemeStore";
import { useSettingsStore } from "./store/useSettingsStore";
import { useOrderStore } from "./store/useOrderStore";


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

const BgPatterns = () => {
  switch (useSettingsStore.getState().settings.visualCustomization.themeSelection.theme) {
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

const truncateText = (text, maxLength) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};


function App() {
  const { theme } = useSettingsStore().settings.visualCustomization.themeSelection;
  const { gapi } = useGoogleAuthContext()
  const { fetchNewOrders, newOrders, resetNewOrders, fetchOrders } = useOrderStore();

  const { data, error, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ()=>fetchNewOrders(gapi),
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: true
  });

  const {playNotification} = useNotifications();

  const processOrders = async (data) => {
    for (let i = 0; i < data.length; i++) {
      // It's unclear if cancel should be called in every iteration.
      // Typically, you might call cancel() if you need to abort the waiting promise.
      const { promise, cancel } = cancellableWaiting(1000);
      await promise;
      let newOrder = data[i];
      playNotification();
      toast.custom(
        (t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                      bg-base-100 border border-base-300 rounded-box p-4 shadow-lg`}>
            <div className="flex items-center gap-3">
              <div className="flex-none">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-8">
                    <span className="text-xs">🛒</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">New Order!</h3>
                <p className="text-sm">
                  {newOrder.phone} ordered{' '}
                  {newOrder.items.map((item, idx) => (
                    <span key={idx}>
                      {truncateText(`${item.name} (x${item.quantity})`, 30)}
                      {idx < newOrder.items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
      cancel();
      // Wait for 1 second delay before processing next order.
    }
    // cancel();
    // resetNewOrders()
  };

  const res = useCallback(() => {
    // processOrders(newOrders);
    processOrders(data);
    return data;
  }, [data]);


  useEffect(()=>{
    res();
  },[data]);

  // const res = useCallback(() => {
  //   (async () => {
  //     const { promise, cancel } = cancellableWaiting(1000);
  //     for (let i = 0; i < data.length; i++) {
  //       cancel();
  //       let newOrder = data[i];
  //       playNotification();
  //       toast.custom((t) => (
  //         <>
  //           <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
  //                   bg-base-100 border border-base-300 rounded-box p-4 shadow-lg`}>
  //             <div className="flex items-center gap-3">
  //               <div className="flex-none">
  //                 <div className="avatar placeholder">
  //                   <div className="bg-neutral text-neutral-content rounded-full w-8">
  //                     <span className="text-xs">🛒</span>
  //                   </div>
  //                 </div>
  //               </div>
  //               <div className="flex-1">
  //                 <h3 className="font-semibold">New Order!</h3>
  //                 <p className="text-sm">
  //                   {newOrder.phone} ordered{' '}
  //                   {newOrder.items.map((item, idx) => (
  //                     <span key={idx}>
  //                       {truncateText(`${item.name} (x${item.quantity})`, 30)}
  //                       {idx < newOrder.items.length - 1 ? ', ' : ''}
  //                     </span>
  //                   ))}
  //                 </p>
  //               </div>
  //             </div>
  //           </div>
  //         </>
  //       ), { duration: 5000 });
  //       await promise;
  //     }
  //   })();
  //   return data;
  // }, [data])

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