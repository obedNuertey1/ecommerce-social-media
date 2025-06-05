import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useCallback } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from "./components/ErrorFallback";
import PyodideWorker from "./workers/pyodideWorker?worker";
import installDepsWorker from "./workers/installDepsWorker?worker";
import * as Comlink from "comlink";
import { useQuery } from "@tanstack/react-query";
import { textToSpeech } from "./funcs/essentialFuncs"

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
import useQueryStore from "./hooks/useQuery";

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
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import FacebookCallback from "./pages/FacebookAuthCallback";
import HomeRedirectToAuth from "./components/HomeRedirectToAuth";
import { usePasskeyLogsStore } from "./store/usePasskeyLogsStore";

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
  const { fetchNewOrders } = useOrderStore();
  const { settings } = useSettingsStore();
  const query = useQueryStore();
  const code = query.get("code");
  const {bulkAddPasskeyLogs} = usePasskeyLogsStore();

  const { data } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchNewOrders(gapi),
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: true
  });

  const {data: data2} = useQuery({
    queryKey: ['passkey_logs'],
    queryFn: () => bulkAddPasskeyLogs(gapi),
    refetchInterval: 1000 * 60 * 4,
    refetchIntervalInBackground: true,
    enabled: (JSON.parse(localStorage.getItem("passkey_logs"))?.length > 0) && JSON.parse(localStorage.getItem("passkey"))
  })

  const { playNotification } = useNotifications("orders_notification_sound");
  const { playNotification: playNewArrivlsNotification } = useNotifications("new_arrivals_sound");


  const processOrders = async (data) => {
    for (let i = 0; i < data.length; i++) {
      // I don't know if cancel should be called in every iteration.
      // Typically, I might call cancel() if I need to abort the waiting promise.
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
    if (data.length > 0) {
      const { promise, cancel } = cancellableWaiting(1000);
      await promise;
      playNewArrivlsNotification();
      cancel();
      await promise;
      console.log("settings.notifications.volume / 100=", settings.notifications.volume / 100)
      if (data.length === 1) {
        textToSpeech(`You have a new order.`, "en-GB", 1, 1, 5, (settings.notifications.volume / 100));
      } else {
        textToSpeech(`You have ${data.length} new orders.`, "en-GB", 1, 1, 5, (settings.notifications.volume / 100));
      }
      cancel();
    }
    // resetNewOrders()
  };

  const res = useCallback(() => {
    // processOrders(newOrders);
    processOrders(data);
    return data;
  }, [data]);


  useEffect(() => {
    res();
  }, [data]);


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const isLoggedIn = JSON.parse(localStorage.getItem("logged-in"));
  const facebookAuthCallbackActivated = JSON.parse(localStorage.getItem("facebookAuthCallbackActivated"));
  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300">
      <Navbar />
      <div className="fixed top-0 bottom-0 left-0 right-0 inset-0 z-0 transition-all duration-300">
        <BgPatterns />
      </div>
      <div className="min-h-screen mx-auto max-w-6xl backdrop-blur-sm">
        <Routes>
          {code && <Route element={<GoogleAuthCallback />} path="/google/auth/callback/" />}
          {isLoggedIn ? (!localStorage.hasOwnProperty("passkey") ?
            <>
              <Route element={<HomePage />} path="/" />
              <Route element={<ProductPage3 />} path="/product/:id" />
              <Route element={<SettingsPage />} path="/settings" />
              <Route element={<AnalyticsPage />} path="/product/:id/analytics" />
              <Route
                element={
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <ProductComments />
                  </ErrorBoundary>
                }
                path="/product/:id/comments"
              />
              <Route element={<OrdersPage />} path="/orders" />
              <Route element={<PasskeyPage />} path="/passkey" />
              <Route element={<PasskeyLogsPage />} path="/passkey/logs" />
              <Route element={<PasskeyLearnMorePage />} path="/passkeys/learn-more" />
              <Route element={<ConversionFunneBusinessInsight />} path="/info/charts-learn-more" />
            </> :
            <>
              {
                JSON?.parse(localStorage.accessiblePages)?.includes("products") ?
                <>
                  <Route element={<HomePage />} path="/" />
                  <Route element={<ProductPage3 />} path="/product/:id" />
                </>
                :
                <>
                  <Route element={<Navigate to="/404" replace />} path="/" />
                  <Route element={<Navigate to="/404" replace />} path="/product/:id" />
                </>
              }
              {
                JSON?.parse(localStorage.accessiblePages)?.includes("settings") ?
                <>
                  <Route element={<SettingsPage />} path="/settings" />
                </>
                :
                <>
                  <Route element={<Navigate to="/404" replace />} path="/settings" />
                </>
              }
              {
                JSON?.parse(localStorage.accessiblePages)?.includes("analytics") ?
                <>
                  <Route element={<AnalyticsPage />} path="/product/:id/analytics" />
                </>
                :
                <>
                  <Route element={<Navigate to="/404" replace />} path="/product/:id/analytics" />
                </>
              }
              {
                JSON?.parse(localStorage.accessiblePages)?.includes("chat") ?
                <>
                  <Route
                    element={
                      <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <ProductComments />
                      </ErrorBoundary>
                    }
                    path="/product/:id/comments"
                  />
                </>
                :
                <>
                  <Route element={<Navigate to="/404" replace />} path="/product/:id/comments" />
                </>
              }
              {
                JSON?.parse(localStorage.accessiblePages)?.includes("orders") ?
                <>
                  <Route element={<OrdersPage />} path="/orders" />
                </>
                :
                <>
                  <Route element={<Navigate to="/404" replace />} path="/orders" />
                </>
              }
              {
                JSON?.parse(localStorage.accessiblePages)?.includes("passkeys") ?
                <>
                  <Route element={<PasskeyPage />} path="/passkey" />
                </>
                :
                <>
                  <Route element={<Navigate to="/404" replace />} path="/passkey" />
                </>
              }
              {
                JSON?.parse(localStorage.accessiblePages)?.includes("passkey-logs") ?
                <>
                  <Route element={<PasskeyLogsPage />} path="/passkey/logs" />
                </>
                :
                <>
                  <Route element={<Navigate to="/404" replace />} path="/passkey/logs" />
                </>
              }
              <Route element={<PasskeyLearnMorePage />} path="/passkeys/learn-more" />
              <Route element={<ConversionFunneBusinessInsight />} path="/info/charts-learn-more" />
            </>
          ) : (
            <>
              <Route element={<FacebookCallback />} path="/facebook/auth/callback/" />
              <Route element={<AuthPage />} path="/auth" />
              {/* Redirect root path to /auth when not logged in */}
              <Route path="/" element={<Navigate to="/auth" replace />} />
            </>
          )}
          {
            facebookAuthCallbackActivated &&
            <>
              <Route element={<FacebookCallback />} path="/facebook/auth/callback/" />
            </>
          }
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