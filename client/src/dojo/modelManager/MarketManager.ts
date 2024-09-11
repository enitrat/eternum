import { getEntityIdFromKeys } from "@/ui/utils/utils";
import { ContractAddress, EternumGlobalConfig, ID, ResourcesIds } from "@bibliothecadao/eternum";
import { getComponentValue } from "@dojoengine/recs";
import { SetupResult } from "../setup";

export class MarketManager {
  bankEntityId: ID;
  player: ContractAddress;
  resourceId: ResourcesIds;

  constructor(
    private setup: SetupResult,
    bankEntityId: ID,
    player: ContractAddress,
    resourceId: ResourcesIds,
  ) {
    this.bankEntityId = bankEntityId;
    this.resourceId = resourceId;
    this.player = player;
  }

  public canRemoveLiquidity(shares: number) {
    const liquidity = this.getTotalLiquidity();
    return liquidity >= shares;
  }

  public getLiquidity() {
    return getComponentValue(
      this.setup.components.Liquidity,
      getEntityIdFromKeys([BigInt(this.bankEntityId), this.player, BigInt(this.resourceId)]),
    );
  }

  public getMarket() {
    return getComponentValue(
      this.setup.components.Market,
      getEntityIdFromKeys([BigInt(this.bankEntityId), BigInt(this.resourceId)]),
    );
  }

  public getSharesScaled = () => {
    const liquidity = this.getLiquidity();
    if (!liquidity) return 0;
    return Math.floor(Number(liquidity.shares.mag) / 2 ** 64);
  };

  public getMyLpPercentage = () => {
    const myShares = this.getSharesScaled();
    const totalShares = this.getTotalSharesScaled();
    if (totalShares === 0) return 0;
    return myShares / totalShares;
  };

  public getSharesUnscaled = () => {
    const liquidity = this.getLiquidity();
    if (!liquidity) return 0n;
    return liquidity.shares.mag;
  };

  public getMarketPrice = () => {
    const market = this.getMarket();
    if (!market) return 0;
    return Number(market.lords_amount) / Number(market.resource_amount);
  };

  public quoteResource = (lordsAmount: number) => {
    const [reserveLordsAmount, reserveResourceAmount] = this.getReserves();

    let resourceOptimal = (reserveResourceAmount * lordsAmount) / reserveLordsAmount;

    return resourceOptimal;
  };

  public quoteLords = (resourceAmount: number) => {
    const [reserveLordsAmount, reserveResourceAmount] = this.getReserves();

    let lordsOptimal = (reserveLordsAmount * resourceAmount) / reserveResourceAmount;

    return lordsOptimal;
  };

  public getOutputAmount(inputAmount: number, inputReserve: bigint, outputReserve: bigint, feeRateNum: number) {
    // Ensure reserves are not zero and input amount is valid
    if (inputReserve < 0n || outputReserve < 0n) {
      throw new Error("Reserves must be >= zero");
    }
    if (inputAmount < 0) {
      throw new Error("Input amount must be >= zero");
    }

    // Calculate the input amount after fee
    const feeRateDenom = EternumGlobalConfig.banks.lpFeesDenominator;
    const inputAmountWithFee = BigInt(inputAmount) * BigInt(feeRateDenom - feeRateNum);

    // Calculate output amount based on the constant product formula with fee
    // (x + Δx) * (y - Δy) = k, where k = x * y
    // Solving for Δy and including the fee:
    // Δy = y - (x * y) / (x + Δx * (1 - fee))

    const numerator = BigInt(inputAmountWithFee) * BigInt(outputReserve);
    const denominator = BigInt(inputReserve) * BigInt(feeRateDenom) + inputAmountWithFee;

    // Subtract 1 to round down the result, ensuring the exchange rate is maintained
    return numerator / denominator;
  }

  public getInputPrice(inputAmount: number, inputReserve: bigint, outputReserve: bigint, feeRateNum: number) {
    // Ensure reserves are not zero and input amount is valid
    if (inputReserve < 0 || outputReserve < 0) {
      throw new Error("Reserves must be >= zero");
    }
    if (inputAmount < 0) {
      throw new Error("Input amount must be >= zero");
    }

    // Calculate the input amount after fee
    const feeRateDenom = EternumGlobalConfig.banks.lpFeesDenominator;
    const inputAmountWithFee = BigInt(inputAmount) * BigInt(feeRateDenom - feeRateNum);

    // Calculate output amount based on the constant product formula with fee
    // (x + Δx) * (y - Δy) = k, where k = x * y
    // Solving for Δy:
    // Δy = (y * Δx) / (x + Δx)
    const numerator = BigInt(outputReserve) * inputAmountWithFee;
    const denominator = BigInt(inputReserve) * BigInt(feeRateDenom) + inputAmountWithFee;

    // Round down the result
    return numerator / denominator;
  }
  public buyResource = (lordsAmount: number, feeRateNum: number) => {
    const market = this.getMarket();
    if (!market) return 0;

    let outputAmount = this.getOutputAmount(lordsAmount, market.lords_amount, market.resource_amount, feeRateNum);
    return Number(outputAmount);
  };

  public sellResource = (resourceAmount: number, feeRateNum: number) => {
    const market = this.getMarket();
    if (!market) return 0;

    let inputPrice = this.getInputPrice(resourceAmount, market.resource_amount, market.lords_amount, feeRateNum);
    return Number(inputPrice);
  };

  public slippage = (inputAmount: number, isBuyResource: boolean) => {
    const marketPrice = this.getMarketPrice();

    const outputAmount = isBuyResource ? this.buyResource(inputAmount, 0) : this.sellResource(inputAmount, 0);

    const marketPriceAmount = isBuyResource ? inputAmount / marketPrice : inputAmount * marketPrice;

    // Calculate the slippage percentage
    const slippagePercentage = ((marketPriceAmount - outputAmount) / marketPriceAmount) * 100;

    return slippagePercentage;
  };

  public getMyLP() {
    const [reserveLordsAmount, reserveResourceAmount] = this.getReserves();
    const my_shares = this.getSharesUnscaled();
    const total_shares = this.getTotalSharesUnScaled();
    let lords_amount = Number((my_shares * BigInt(reserveLordsAmount)) / BigInt(total_shares));
    let resource_amount = Number((my_shares * BigInt(reserveResourceAmount)) / BigInt(total_shares));

    return [lords_amount, resource_amount];
  }

  public getMyFees(initial_lords_amount: number, initial_resource_amount: number) {
    const [current_lords_amount, current_resource_amount] = this.getMyLP();
    return [current_lords_amount - initial_lords_amount, current_resource_amount - initial_resource_amount];
  }

  public getTotalLiquidity() {
    const [lords_amount, resource_amount] = this.getReserves();
    return Math.floor(Math.sqrt(lords_amount * resource_amount));
  }

  public getTotalLiquidityUnscaled() {
    const liquidity = this.getTotalLiquidity();
    return BigInt(liquidity * 2 ** 64);
  }

  public getTotalSharesUnScaled() {
    const market = this.getMarket();
    if (!market) return 0;
    return market.total_shares.mag;
  }

  public getTotalSharesScaled() {
    const market = this.getMarket();
    if (!market) return 0;
    return Math.floor(Number(market.total_shares.mag) / 2 ** 64);
  }

  public hasLiquidity() {
    return this.getSharesScaled() > 0;
  }

  public getReserves() {
    const market = this.getMarket();
    return [Number(market?.lords_amount || 0n), Number(market?.resource_amount || 0n)];
  }
}
