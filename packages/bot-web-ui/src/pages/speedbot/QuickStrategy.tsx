import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@deriv/stores';
import { Text, Icon, Loading } from '@deriv/components';
import { Localize } from '@deriv/translations';
import { api_base } from '@deriv/bot-skeleton/src/services/api/api-base';
import { AnalysisHeader, ConfigurationPanel, TransactionTable, EvenOddAnalysis, RiseFallAnalysis } from './StrategyComponents';
import { trading_logic, TradeParams } from './TradingLogic';
import './quick-strategy.scss';

// Volatility Markets
const VOLATILITY_MARKETS = [
    { text: 'Volatility 10 (1s) Index', value: '1HZ10V', symbol: 'R_10' },
    { text: 'Volatility 25 (1s) Index', value: '1HZ25V', symbol: 'R_25' },
    { text: 'Volatility 50 (1s) Index', value: '1HZ50V', symbol: 'R_50' },
    { text: 'Volatility 75 (1s) Index', value: '1HZ75V', symbol: 'R_75' },
    { text: 'Volatility 100 (1s) Index', value: '1HZ100V', symbol: 'R_100' },
];

const QuickStrategy = observer(() => {
    const { client } = useStore();
    const [activeTab, setActiveTab] = useState('Over/Under');
    const [stake, setStake] = useState(1);
    const [mode, setMode] = useState<any>('Normal');
    const [stopLoss, setStopLoss] = useState(10);
    const [flashLimit, setFlashLimit] = useState(5);
    const [isRunning, setIsRunning] = useState(false);
    const [trades, setTrades] = useState<any[]>([]);
    const [digitCounts, setDigitCounts] = useState(new Array(10).fill(0));
    const [lastDigit, setLastDigit] = useState<number | null>(null);
    const [selectedMarket, setSelectedMarket] = useState(VOLATILITY_MARKETS[0].value);
    const [riseFallStats, setRiseFallStats] = useState({ rise: 0, fall: 0 });
    const prevQuoteRef = useRef<number | null>(null);

    const tickHistoryRef = useRef<any[]>([]);
    const subscriptionId = useRef<string | null>(null);

    // Subscribe to ticks for analysis
    useEffect(() => {
        const subscribeToTicks = async () => {
            if (!api_base.api) return;

            // Cleanup previous
            if (subscriptionId.current) {
                await api_base.api.send({ forget: subscriptionId.current });
            }

            const res = await api_base.api.send({
                ticks: selectedMarket,
                subscribe: 1
            });

            if (res.error) {
                console.error('Tick subscription failed:', res.error);
                return;
            }

            subscriptionId.current = res.subscription.id;

            api_base.api.onMessage().subscribe(({ data }: { data: any }) => {
                if (data.msg_type === 'tick' && data.tick.symbol === selectedMarket) {
                    const quote: number = data.tick.quote;
                    const pipSize: number = data.tick.pip_size || 2;
                    const digit: number = parseInt(quote.toFixed(pipSize).slice(-1));

                    setLastDigit(digit);

                    // Update Rise/Fall stats
                    if (prevQuoteRef.current !== null) {
                        setRiseFallStats(prev => ({
                            rise: quote > prevQuoteRef.current! ? prev.rise + 1 : prev.rise,
                            fall: quote < prevQuoteRef.current! ? prev.fall + 1 : prev.fall,
                        }));
                    }
                    prevQuoteRef.current = quote;

                    setDigitCounts((prev: number[]) => {
                        const next = [...prev];
                        next[digit] = (next[digit] || 0) + 1;
                        const sum = next.reduce((a, b) => a + b, 0);
                        if (sum > 1000) {
                            return next.map(v => Math.floor((v / sum) * 1000));
                        }
                        return next;
                    });
                }
            });
        };

        subscribeToTicks();
        return () => {
            if (subscriptionId.current && api_base.api) {
                api_base.api.send({ forget: subscriptionId.current });
            }
        };
    }, [selectedMarket]);

    const handleRun = async () => {
        if (!client.is_logged_in) {
            alert('Please login first');
            return;
        }

        setIsRunning(true);
        let contract_type = 'DIGITOVER';
        let prediction: number | undefined = 5;

        if (activeTab === 'Over/Under') {
            contract_type = 'DIGITOVER';
            prediction = 5; // Default for O/U, could be made configurable
        } else if (activeTab === 'Even/Odd') {
            contract_type = 'DIGITEVEN';
            prediction = undefined;
        } else if (activeTab === 'Rise/Fall') {
            contract_type = 'CALL';
            prediction = undefined;
        } else if (activeTab === 'Matches/Differs') {
            contract_type = 'DIGITMATCH';
            prediction = 0; // Default match digit
        }

        const params: TradeParams = {
            amount: stake,
            basis: 'stake',
            contract_type,
            currency: client.currency,
            duration: 1,
            duration_unit: 't',
            symbol: selectedMarket,
            prediction,
        };

        try {
            if (mode === 'Normal') {
                const res = await trading_logic.placeTrade(params);
                setTrades((prev: any[]) => [res, ...prev]);
                setIsRunning(false);
            } else if (mode === 'Bulk') {
                const results = await trading_logic.placeBulkTrades(params, 5); // Example quantity 5
                setTrades((prev: any[]) => [...results, ...prev]);
                setIsRunning(false);
            } else if (mode === 'Flash') {
                trading_logic.startFlashTrades(params, flashLimit, (res: any) => {
                    setTrades((prev: any[]) => [res, ...prev]);
                });
            }
        } catch (err) {
            console.error('Run failed:', err);
            setIsRunning(false);
        }
    };

    const handleStop = () => {
        if (mode === 'Flash') {
            trading_logic.stopFlashTrades();
        }
        setIsRunning(false);
    };

    const TABS = ['Over/Under', 'Even/Odd', 'Rise/Fall', 'Matches/Differs'];

    return (
        <div className="qs-container">
            <div className="qs-tabs">
                {TABS.map(tab => (
                    <div
                        key={tab}
                        className={`qs-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            <AnalysisHeader digit_counts={digitCounts} last_digit={lastDigit} />

            <div className="qs-analysis-row">
                <EvenOddAnalysis digit_counts={digitCounts} />
                <RiseFallAnalysis rise_fall_stats={riseFallStats} />
            </div>

            <div className="qs-main-content">
                <ConfigurationPanel
                    stake={stake}
                    setStake={setStake}
                    mode={mode}
                    setMode={setMode}
                    stopLoss={stopLoss}
                    setStopLoss={setStopLoss}
                    flashLimit={flashLimit}
                    setFlashLimit={setFlashLimit}
                    is_running={isRunning}
                    onRun={handleRun}
                    onStop={handleStop}
                />

                <TransactionTable trades={trades} />
            </div>
        </div>
    );
});

export default QuickStrategy;