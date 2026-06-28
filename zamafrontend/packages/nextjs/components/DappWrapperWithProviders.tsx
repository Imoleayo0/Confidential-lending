"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { IndexedDBStorage, RelayerWeb, SepoliaConfig, type ZamaSDKEvent } from "@zama-fhe/sdk";
import { RelayerCleartext, hardhatCleartextConfig } from "@zama-fhe/sdk/cleartext";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider, useChainId } from "wagmi";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/helper";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
// Swap to `@zama-fhe/react-sdk/wagmi` once a patched stable ships - the fix
// is already in the alpha track (>= 3.0.0-alpha.16). See wagmiSigner.ts.
import { WagmiSigner } from "~~/services/web3/wagmiSigner";

// Module-scoped - the signer, keypair store and session store are chain-agnostic
// and there is no reason to rebuild them on chain change. IndexedDBStorage lets
// the keypair + EIP-712 session survive page reloads, matching Zama's hosted
// app patterns.
const signer = new WagmiSigner({ config: wagmiConfig });
const storage = new IndexedDBStorage("KeypairStore", 1);
const sessionStorage = new IndexedDBStorage("SignatureStore", 1);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Swap RelayerCleartext for local anvil (31337), RelayerWeb for real networks.
// Create the relayer only after mount so Next's server prerender never tries to
// spin up browser-only workers.
const ZamaRuntimeProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId();
  const [relayer, setRelayer] = useState<RelayerWeb | RelayerCleartext | null>(null);

  useEffect(() => {
    const nextRelayer =
      chainId === 31337
        ? new RelayerCleartext(hardhatCleartextConfig)
        : new RelayerWeb({
            getChainId: () => signer.getChainId(),
            transports: {
              [SepoliaConfig.chainId]: SepoliaConfig,
            },
          });

    setRelayer(nextRelayer);

    return () => {
      nextRelayer.terminate();
    };
  }, [chainId]);

  function dispatchEvent(event: ZamaSDKEvent) {
    window.dispatchEvent(new CustomEvent(event.type, { detail: event }));
  }

  if (!relayer) {
    return <div className="min-h-screen bg-[#faf7f1]" />;
  }

  return (
    <ZamaProvider
      relayer={relayer}
      signer={signer}
      storage={storage}
      sessionStorage={sessionStorage}
      onEvent={dispatchEvent}
    >
      {children}
    </ZamaProvider>
  );
};

export const DappWrapperWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ZamaRuntimeProvider>
            <ProgressBar height="3px" color="#2299dd" />
            <div className={`flex flex-col min-h-screen`}>
              <Header />
              <main className="relative flex flex-col flex-1">{children}</main>
            </div>
            <Toaster />
          </ZamaRuntimeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
