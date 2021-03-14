export class TradingPairPriceData {

	public symbol: string;
	public prices: PriceTimes = {
		now: 0,
		tenSeconds: 0,
		twentySeconds: 0,
		thirtySeconds: 0,
		fortySeconds: 0,
		fiftySeconds: 0,
		sixtySeconds: 0
	};
	public pricePercentageChanges: PriceTimes = {
		now: 0,
		tenSeconds: 0,
		twentySeconds: 0,
		thirtySeconds: 0,
		fortySeconds: 0,
		fiftySeconds: 0,
		sixtySeconds: 0
	};

	public constructor(
		symbol: string,
		price: number
	) {
		this.symbol = symbol;
		this.prices.now = price;
	}

	public updatePrice = (price: number): void => {
		const currentPrices: PriceTimes = this.prices;

		this.prices = {
			now: price,
			tenSeconds: currentPrices.now,
			twentySeconds: currentPrices.tenSeconds,
			thirtySeconds: currentPrices.twentySeconds,
			fortySeconds: currentPrices.thirtySeconds,
			fiftySeconds: currentPrices.fortySeconds,
			sixtySeconds: currentPrices.fiftySeconds
		};

		this.pricePercentageChanges = {
			now: 0,
			tenSeconds: this.calculatePercentageChange(price, this.prices.tenSeconds),
			twentySeconds: this.calculatePercentageChange(price, this.prices.twentySeconds),
			thirtySeconds: this.calculatePercentageChange(price, this.prices.thirtySeconds),
			fortySeconds: this.calculatePercentageChange(price, this.prices.fortySeconds),
			fiftySeconds: this.calculatePercentageChange(price, this.prices.fiftySeconds),
			sixtySeconds: this.calculatePercentageChange(price, this.prices.sixtySeconds)
		};
	}

	private calculatePercentageChange = (currentPrice: number, previousPrice: number): number => {
		if (!previousPrice) return 0;
		return ((currentPrice - previousPrice) / previousPrice) * 100;
	}

}

export interface PriceTimes {
	now: number;
	tenSeconds: number;
	twentySeconds: number;
	thirtySeconds: number;
	fortySeconds: number;
	fiftySeconds: number;
	sixtySeconds: number;
}
