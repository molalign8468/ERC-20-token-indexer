import { useState } from "react";
import { Alchemy, Network, Utils } from "alchemy-sdk";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [tokenBalances, setTokenBalances] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getTokenBalancesAndMetadata() {
    if (!userAddress.trim()) {
      setError("Please enter a wallet address.");
      return;
    }
    if (!userAddress.startsWith("0x") || userAddress.length !== 42) {
      setError(
        "Please enter a valid Ethereum address (starts with 0x and is 42 characters long)."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasQueried(false);
    setTokenBalances([]);

    try {
      const config = {
        apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
        network: Network.ETH_MAINNET,
      };
      const alchemy = new Alchemy(config);

      const data = await alchemy.core.getTokenBalances(userAddress);

      const processedTokens = [];
      for (const tokenBalance of data.tokenBalances) {
        const contractAddress = tokenBalance.contractAddress;
        const rawBalance = tokenBalance.tokenBalance;

        const tokenMetadata = await alchemy.core.getTokenMetadata(
          contractAddress
        );

        const decimals =
          tokenMetadata.decimals !== null ? tokenMetadata.decimals : 18;
        const formattedBalance = Utils.formatUnits(rawBalance, decimals);

        if (parseFloat(formattedBalance) === 0) {
          continue;
        }

        processedTokens.push({
          contractAddress: contractAddress,
          rawBalance: rawBalance,
          formattedBalance: formattedBalance,
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          decimals: decimals,
          logo: tokenMetadata.logo,
        });
      }

      setTokenBalances(processedTokens);
      setHasQueried(true);
    } catch (err) {
      console.error("Error fetching token data:", err);
      if (err.message && err.message.includes("invalid address")) {
        setError("Invalid Ethereum address. Please check your input.");
      } else if (err.message && err.message.includes("API key")) {
        setError(
          "Alchemy API Key error. Please ensure your API key is correct and not rate-limited."
        );
      } else {
        setError(
          "An unexpected error occurred while fetching token balances. Please try again."
        );
      }
      setHasQueried(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-purple-900 font-sans text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      <div className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-lighten filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -top-1/4 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-lighten filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-lighten filter blur-3xl opacity-10 animate-blob-slow animation-delay-6000"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 leading-tight drop-shadow-lg animate-pulse-slow">
            Web3 Balance Auditor
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg lg:text-xl text-gray-300">
            Instantly query and visualize all ERC-20 token balances for any
            Ethereum address. Empowering your decentralized financial insights.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-200">
            Enter Ethereum Wallet Address:
          </h2>
          <input
            type="text"
            onChange={(e) => setUserAddress(e.target.value)}
            className="w-full max-w-md p-4 bg-gray-800 bg-opacity-80 text-white placeholder-gray-500 text-lg rounded-xl border border-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-600 focus:border-transparent transition-all duration-300 shadow-xl"
            placeholder="0x..."
            value={userAddress}
          />
          <button
            onClick={getTokenBalancesAndMetadata}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500 p-0.5 font-medium text-white text-lg shadow-lg shadow-blue-500/50 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-800 transition-all duration-300 transform hover:-translate-y-1"
            disabled={isLoading}
          >
            <span className="relative rounded-full bg-gray-900 px-8 py-3 transition-all duration-300 ease-in group-hover:bg-opacity-0 flex items-center space-x-3">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Fetching Balances...</span>
                </>
              ) : (
                <span>Scan Wallet Balances</span>
              )}
            </span>
          </button>
        </div>

        {error && (
          <p className="text-red-400 mt-8 text-center text-base sm:text-lg font-medium animate-pulse-slow">
            {error}
          </p>
        )}

        <h2 className="my-16 text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-100">
          Your Digital Assets:
        </h2>

        {isLoading && !error ? (
          <div className="flex justify-center items-center mt-12">
            <svg
              className="animate-spin h-16 w-16 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : hasQueried && tokenBalances.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {tokenBalances.map((token) => (
              <div
                key={token.contractAddress}
                className="bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-lg border border-purple-600 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-900 opacity-10 rounded-2xl"></div>

                {token.logo ? (
                  <img
                    src={token.logo}
                    alt={`${token.symbol || "Token"} logo`}
                    className="w-16 h-16 sm:w-20 sm:h-20 mb-4 object-contain rounded-full border-4 border-blue-500 p-1 bg-gray-900"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-gray-700 rounded-full flex items-center justify-center border-4 border-blue-500 text-white text-2xl sm:text-3xl font-extrabold">
                    <p>{token.symbol ? token.symbol[0].toUpperCase() : "?"}</p>
                  </div>
                )}
                <p
                  className="font-extrabold text-xl sm:text-2xl mt-2 text-white truncate w-full"
                  title={token.name}
                >
                  {token.name || "Unknown Token"}
                </p>
                <p className="text-base text-gray-400 mt-1 truncate w-full">
                  ({token.symbol || "N/A"})
                </p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-300">
                  {token.formattedBalance}
                </p>
              </div>
            ))}
          </div>
        ) : hasQueried && tokenBalances.length === 0 && !error ? (
          <p className="text-lg sm:text-xl mt-8 text-center text-gray-400">
            No ERC-20 tokens found for this address. Try another one!
          </p>
        ) : (
          <p className="text-lg sm:text-xl mt-8 text-center text-gray-300">
            Enter an Ethereum address above to see its token balances.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
