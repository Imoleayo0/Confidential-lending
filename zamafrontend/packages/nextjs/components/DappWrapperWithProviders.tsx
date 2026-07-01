"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { IndexedDBStorage, createConfig, sepolia as zamaSepolia } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { getBlock, getChainId, readContract, waitForTransactionReceipt } from "wagmi/actions";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/helper";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { WagmiSigner } from "~~/services/web3/wagmiSigner";

const signer = new WagmiSigner({ config: wagmiConfig });

const zamaConfig = createConfig({
  chains: [zamaSepolia],
  relayers: {
    [zamaSepolia.id]: web(),
  },
  signer,
  provider: {
    async getChainId() {
      return getChainId(wagmiConfig);
    },
    async readContract(config: any) {
      return readContract(wagmiConfig, config);
    },
    async waitForTransactionReceipt(hash: any) {
      return (await waitForTransactionReceipt(wagmiConfig, { hash })) as any;
    },
    async getBlockTimestamp() {
      const block = await getBlock(wagmiConfig);
      return block.timestamp;
    },
  },
  storage: new IndexedDBStorage("KeypairStore", 1),
  permitStorage: new IndexedDBStorage("SignatureStore", 1),
});

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
          <ZamaProvider config={zamaConfig}>
            <ProgressBar height="3px" color="#2299dd" />
            <div className={`flex flex-col min-h-screen`}>
              <Header />
              <main className="relative flex flex-col flex-1">{children}</main>
            </div>
            <Toaster />
          </ZamaProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
