"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useTargetNetwork } from "~~/hooks/helper/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/helper";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const { targetNetwork } = useTargetNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="inline-flex h-10 items-center justify-center rounded-full bg-[#ffd208] px-4 text-sm font-semibold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f5c800]"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <div className="flex items-center gap-3">
                  <div className="hidden flex-col items-end leading-none text-slate-700 sm:flex">
                    <Balance address={account.address as Address} className="min-h-0 h-auto text-xs font-semibold" />
                    <span className="text-[11px] text-slate-500">{chain.name}</span>
                  </div>
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
