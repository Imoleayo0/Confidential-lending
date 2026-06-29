"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import * as ZamaSdk from "@zama-fhe/sdk";
import type { ZamaSDKEvent } from "@zama-fhe/sdk";
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

const { IndexedDBStorage, RelayerWeb, SepoliaConfig, HardhatConfig } = ZamaSdk;

// Module-scoped - the signer is chain-agnostic and does not need to be rebuilt.
const signer = new WagmiSigner({ config: wagmiConfig });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Swap RelayerCleartext for local anvil (31337), RelayerWeb for real networks.
// Create the relayer and storage only after mount so Next's server prerender
// never touches browser-only APIs.
const ZamaRuntimeProvider = ({ children }: { children: React.ReactNode }) => {
  const chainId = useChainId();
  const [runtime, setRuntime] = useState<{
    relayer: InstanceType<typeof RelayerWeb>;
    storage: InstanceType<typeof IndexedDBStorage>;
    sessionStorage: InstanceType<typeof IndexedDBStorage>;
  } | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    let nextRelayer: InstanceType<typeof RelayerWeb> | null = null;

    try {
      const nextStorage = new IndexedDBStorage("KeypairStore", 1);
      const nextSessionStorage = new IndexedDBStorage("SignatureStore", 1);
      nextRelayer =
        chainId === 31337
          ? new ZamaSdk.RelayerWeb(HardhatConfig)
          : new RelayerWeb({
              getChainId: () => signer.getChainId(),
              transports: {
                [SepoliaConfig.chainId]: SepoliaConfig,
              },
            });

      setRuntime({
        relayer: nextRelayer,
        storage: nextStorage,
        sessionStorage: nextSessionStorage,
      });
      setRuntimeError(null);
    } catch (error) {
      setRuntime(null);
      setRuntimeError(error instanceof Error ? error.message : "Failed to initialize Zama runtime.");
      console.error("Failed to initialize Zama runtime:", error);
    }

    return () => {
      nextRelayer?.terminate();
    };
  }, [chainId]);

  function dispatchEvent(event: ZamaSDKEvent) {
    window.dispatchEvent(new CustomEvent(event.type, { detail: event }));
  }

  if (runtimeError) {
    return (
      <div className="min-h-screen bg-[#faf7f1] px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">App failed to initialize</h1>
          <p className="mt-2 text-sm text-slate-600">{runtimeError}</p>
        </div>
      </div>
    );
  }

  if (!runtime) {
    return <div className="min-h-screen bg-[#faf7f1]" />;
  }

  return (
    <ZamaProvider
      relayer={runtime.relayer}
      signer={signer}
      storage={runtime.storage}
      sessionStorage={runtime.sessionStorage}
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
