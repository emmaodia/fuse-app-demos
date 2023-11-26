"use client";

import Image from "next/image";
// import process.env from "../process.env.json";
import { ethers } from "ethers";
import { FuseSDK } from "../sdk";
import { parseEther } from "ethers/lib/utils";
import { AddressZero } from "@etherspot/prime-sdk/dist/sdk/common";

import toast, { Toaster } from "react-hot-toast";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  let toastId;
  const notify = () => toast("Here is your toast.");

  const main = async () => {
    const check = process.env.NEXT_PUBLIC_PRIVATE_KEY;
    console.log(check);
    const credentials = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY);
    const publicApiKey = process.env.NEXT_PUBLIC_PUBLIC_API_KEY;
    const fuseSDK = await FuseSDK.init(publicApiKey, credentials);
    const walletAddress = await fuseSDK.wallet.getSender();
    console.log(`Sender Address is ${fuseSDK.wallet.getSender()}`);
    console.log(walletAddress);
    setAddress(walletAddress);
  };

  const transfer = async () => {
    //You can use ethers.Wallet.createRandom to create a new Wallet.

    const credentials = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY);
    const publicApiKey = process.env.NEXT_PUBLIC_PUBLIC_API_KEY;
    const fuseSDK = await FuseSDK.init(publicApiKey, credentials, {
      withPaymaster: true,
    });
    // You can use any other "to" address and any other "value"
    const to = AddressZero;
    const value = parseEther("0");
    const data = Uint8Array.from([]);
    const res = await fuseSDK.callContract(to, value, data);
    toastId = toast.loading("processing..");

    console.log(`UserOpHash: ${res?.userOpHash}`);
    console.log("Waiting for transaction...");

    const receipt = await res?.wait();
    console.log("Transaction Hash:", receipt?.transactionHash);
    toast.dismiss(toastId);
    toast.success(
      `UserOp Successful 🔥 
      ${receipt?.transactionHash}`,
      {
        id: toastId,
        duration: 8000,
      }
    );
  };

  const mintTokens = async () => {
    const credentials = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY);
    const publicApiKey = process.env.NEXT_PUBLIC_PUBLIC_API_KEY;
    const fuseSDK = await FuseSDK.init(publicApiKey, credentials, {
      withPaymaster: true,
    });

    // You can use any other "to" address and any other "value"
    const contractAddress = "0xb8D4BD32d0c8C9012cF5E90D2acF37091a73B6F6"; // MTK Token Contract
    const amount = parseEther("0");

    // const provider = new ethers.providers.JsonRpcProvider("https://rpc.fuse.io/")

    const contractCall = new ethers.utils.Interface([
      "function mint(uint256 amount)",
    ]);

    const data = contractCall.encodeFunctionData("mint", [1]);

    const res = await fuseSDK.callContract(contractAddress, amount, data);
    toastId = toast.loading("processing..");

    console.log(`UserOpHash: ${res?.userOpHash}`);
    console.log("Waiting for transaction...");

    const receipt = await res?.wait();
    console.log("Transaction Hash:", receipt?.transactionHash);
    toast.dismiss(toastId);
    toast.success(
      `Token Mint Successful 🔥 
      ${receipt?.transactionHash}`,
      {
        id: toastId,
        duration: 8000,
      }
    );
  };

  useEffect(() => {}, [address]);

  return (
    // const { address, isConnected } = useAccount();
    <>
      <Toaster />
      <div
        className={`flex w-screen flex-row justify-end space-x-4 p-4 border-b-2`}
      >
        {address ? (
          <>
            <div>
              {address.slice(0, 5)}...{address.slice(-5)}
            </div>
            <Link href="/dashboard">
              <p className="block text-sm font-medium leading-6 text-gray-900">
                Sign Out
              </p>
            </Link>
          </>
        ) : (
          <div className={`flex space-x-4 mr-12 items-center`}>
            <button
              type="button"
              onClick={main}
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>

      <div className={`flex min-h-screen flex-col items-center p-24`}>
        {address ? (
          <>
            <div>{address}</div>
            <div className="mt-6 mb-6 gap-x-6">
              <button
                type="submit"
                onClick={transfer}
                className="rounded-md w-40 bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Send Txn
              </button>
            </div>

            <div className="w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-600 sm:max-w-md">
              <input
                type="text"
                name="amount"
                id="amount"
                autoComplete="amount"
                // onChange={handleAmount}
                className="block border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-700 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="$"
              />
            </div>

            <div className="mt-6 gap-x-6">
              <button
                type="submit"
                onClick={mintTokens}
                className="rounded-md w-40 bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Mint
              </button>
            </div>
            <p className="mt-4 block text-lg font-medium leading-6 text-gray-900">
              Mint FREE Tokens without paying any Gas fees!
            </p>
          </>
        ) : (
          <p> Click the Button to Log in </p>
        )}
      </div>
    </>
  );
}
