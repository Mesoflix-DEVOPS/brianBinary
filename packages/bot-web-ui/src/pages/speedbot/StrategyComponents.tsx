import React, { useState, useEffect } from 'react';
import { Text, Input, Button, Icon, SelectNative } from '@deriv/components';
import { Localize } from '@deriv/translations';
import { observer } from 'mobx-react-lite';
import { MdHistory, MdSettings, MdTrendingUp } from 'react-icons/md';
import { FaBolt, FaLayerGroup } from 'react-icons/fa';
import { formatMoney } from '@deriv/shared';

// Digit Analysis Component (Inspired by Dcircles)
export const AnalysisHeader = observer(({ digit_counts, last_digit }: { digit_counts: number[], last_digit: number | null }) => {
    const total = digit_counts.reduce((a, b) => a + b, 0) || 1;

    // Calculate ranks
    const sortedIndices = digit_counts
        .map((count, index) => ({ index, count }))
        .sort((a, b) => (b.count || 0) - (a.count || 0));

    // Safety check for empty or short arrays
    const rankHighest = sortedIndices.length > 0 ? sortedIndices[0].index : 0;
    const rankSecondHighest = sortedIndices.length > 1 ? sortedIndices[1].index : 1;
    const rankLowest = sortedIndices.length > 9 ? sortedIndices[9].index : (sortedIndices.length > 0 ? sortedIndices[sortedIndices.length - 1].index : 9);
    const rankPreLowest = sortedIndices.length > 8 ? sortedIndices[8].index : (sortedIndices.length > 1 ? sortedIndices[sortedIndices.length - 2].index : 8);

    const highestPercent = sortedIndices.length > 0 ? ((digit_counts[rankHighest] / total) * 100).toFixed(2) : "0.00";
    const lowestPercent = sortedIndices.length > 9 ? ((digit_counts[rankLowest] / total) * 100).toFixed(2) : (sortedIndices.length > 0 ? ((digit_counts[sortedIndices[sortedIndices.length - 1].index] / total) * 100).toFixed(2) : "0.00");

    return (
        <div className="qs-analysis-header">
            <div className="qs-analysis-title">
                <MdTrendingUp className="qs-icon" style={{ marginRight: '10px', fontSize: '20px' }} />
                <Localize i18n_default_text="Digit Distribution (1000 Ticks)" />
            </div>
            <div className="qs-digit-circles">
                {digit_counts.map((count, index) => {
                    const percentage = (count / total) * 100;
                    const dashOffset = 201 - (201 * percentage) / 100;

                    let rankClass = 'rank-default';
                    let tagClass = '';
                    if (index === rankHighest) { rankClass = 'rank-1'; tagClass = 'highlight-high'; }
                    else if (index === rankSecondHighest) rankClass = 'rank-2';
                    else if (index === rankLowest) { rankClass = 'rank-lowest'; tagClass = 'highlight-low'; }
                    else if (index === rankPreLowest) rankClass = 'rank-pre-lowest';

                    return (
                        <div key={index} className={`qs-digit-item ${last_digit === index ? 'active' : ''}`}>
                            <div className={`qs-digit-circle-wrapper ${rankClass}`}>
                                <svg viewBox="0 0 68 68">
                                    <circle className="bg" cx="34" cy="34" r="32" />
                                    <circle
                                        className="progress"
                                        cx="34"
                                        cy="34"
                                        r="32"
                                        style={{ strokeDashoffset: dashOffset }}
                                    />
                                </svg>
                                <span className="qs-digit-value">{index}</span>
                            </div>
                            <div className={`qs-digit-percent-tag ${tagClass}`}>
                                {percentage.toFixed(1)}%
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="qs-stat-summary">
                <span>
                    <Localize i18n_default_text="Highest: " />
                    <b className="high">{highestPercent}%</b>
                </span>
                <span>
                    <Localize i18n_default_text="Lowest: " />
                    <b className="low">{lowestPercent}%</b>
                </span>
            </div>
        </div>
    );
});

// Even/Odd Analysis Component
export const EvenOddAnalysis = observer(({ digit_counts }: { digit_counts: number[] }) => {
    const evenCount = digit_counts.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
    const oddCount = digit_counts.filter((_, i) => i % 2 !== 0).reduce((a, b) => a + b, 0);
    const total = (evenCount + oddCount) || 1;
    const evenPercent = ((evenCount / total) * 100).toFixed(1);
    const oddPercent = ((oddCount / total) * 100).toFixed(1);

    return (
        <div className="qs-eo-analysis">
            <div className="qs-analysis-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <FaLayerGroup style={{ color: 'var(--primary-color)' }} />
                <Text size="s" weight="bold" family="outfit"><Localize i18n_default_text="Even vs Odd Distribution" /></Text>
            </div>
            <div className="qs-analysis-item">
                <Text size="xs" color="less-prominent" weight="bold" family="outfit"><Localize i18n_default_text="EVEN" /></Text>
                <div className="qs-eo-bar-container">
                    <div className="qs-eo-bar even" style={{ width: `${evenPercent}%` }}></div>
                </div>
                <Text size="s" weight="bold" family="outfit">{evenPercent}%</Text>
            </div>
            <div className="qs-analysis-item">
                <Text size="xs" color="less-prominent" weight="bold" family="outfit"><Localize i18n_default_text="ODD" /></Text>
                <div className="qs-eo-bar-container">
                    <div className="qs-eo-bar odd" style={{ width: `${oddPercent}%` }}></div>
                </div>
                <Text size="s" weight="bold" family="outfit">{oddPercent}%</Text>
            </div>
        </div>
    );
});

// Rise/Fall Analysis Component
export const RiseFallAnalysis = observer(({ rise_fall_stats }: { rise_fall_stats: { rise: number, fall: number } }) => {
    const total = (rise_fall_stats.rise + rise_fall_stats.fall) || 1;
    const risePercent = ((rise_fall_stats.rise / total) * 100).toFixed(1);
    const fallPercent = ((rise_fall_stats.fall / total) * 100).toFixed(1);

    return (
        <div className="qs-rf-analysis">
            <div className="qs-analysis-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ffa3' }}>
                    <Icon icon="IcArrowUp" custom_color="#00ffa3" size={24} />
                    <Text size="m" weight="bold" family="outfit" custom_color="#00ffa3">{risePercent}%</Text>
                </div>
                <Text size="xs" color="less-prominent" weight="bold" family="outfit"><Localize i18n_default_text="RISE" /></Text>
            </div>
            <div className="qs-analysis-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d' }}>
                    <Icon icon="IcArrowDown" custom_color="#ff4d4d" size={24} />
                    <Text size="m" weight="bold" family="outfit" custom_color="#ff4d4d">{fallPercent}%</Text>
                </div>
                <Text size="xs" color="less-prominent" weight="bold" family="outfit"><Localize i18n_default_text="FALL" /></Text>
            </div>
        </div>
    );
});

// Configuration Panel Component
export const ConfigurationPanel = observer(({
    stake,
    setStake,
    mode,
    setMode,
    stopLoss,
    setStopLoss,
    flashLimit,
    setFlashLimit,
    is_running,
    onRun,
    onStop
}: any) => {
    return (
        <div className="qs-config-panel">
            <div className="qs-config-section">
                <div className="qs-config-item">
                    <Text size="xs" weight="bold" family="outfit" color="less-prominent">
                        <Localize i18n_default_text="STAKE (USD)" />
                    </Text>
                    <Input
                        className="dc-input"
                        type="number"
                        value={stake}
                        onChange={(e: any) => setStake(e.target.value)}
                        disabled={is_running}
                    />
                </div>
                <div className="qs-config-item">
                    <Text size="xs" weight="bold" family="outfit" color="less-prominent">
                        <Localize i18n_default_text="MODE" />
                    </Text>
                    <div className="qs-mode-selector">
                        <button
                            className={`qs-mode-btn ${mode === 'Normal' ? 'active' : ''}`}
                            onClick={() => setMode('Normal')}
                            disabled={is_running}
                        >
                            <Localize i18n_default_text="Normal" />
                        </button>
                        <button
                            className={`qs-mode-btn ${mode === 'Bulk' ? 'active' : ''}`}
                            onClick={() => setMode('Bulk')}
                            disabled={is_running}
                        >
                            <FaLayerGroup /> <Localize i18n_default_text="Bulk" />
                        </button>
                        <button
                            className={`qs-mode-btn ${mode === 'Flash' ? 'active' : ''}`}
                            onClick={() => setMode('Flash')}
                            disabled={is_running}
                        >
                            <FaBolt /> <Localize i18n_default_text="Flash" />
                        </button>
                    </div>
                </div>
                {mode === 'Flash' && (
                    <div className="qs-config-item">
                        <Text size="xs" weight="bold" family="outfit" color="less-prominent">
                            <Localize i18n_default_text="FLASH LIMIT" />
                        </Text>
                        <Input
                            className="dc-input"
                            type="number"
                            value={flashLimit}
                            onChange={(e: any) => setFlashLimit(e.target.value)}
                            disabled={is_running}
                        />
                    </div>
                )}
                <div className="qs-config-item">
                    <Text size="xs" weight="bold" family="outfit" color="less-prominent">
                        <Localize i18n_default_text="STOP LOSS" />
                    </Text>
                    <Input
                        className="dc-input"
                        type="number"
                        value={stopLoss}
                        onChange={(e: any) => setStopLoss(e.target.value)}
                        disabled={is_running}
                    />
                </div>
            </div>

            <div className="qs-action-buttons">
                {!is_running ? (
                    <button className="qs-run-btn" onClick={onRun}>
                        <Localize i18n_default_text="RUN STRATEGY" />
                    </button>
                ) : (
                    <button className="qs-stop-btn" onClick={onStop}>
                        <Localize i18n_default_text="STOP STRATEGY" />
                    </button>
                )}
            </div>
        </div>
    );
});

// Transaction Table Component
export const TransactionTable = observer(({ trades }: { trades: any[] }) => {
    return (
        <div className="qs-transaction-table">
            <div className="qs-table-header">
                <MdHistory className="qs-icon" />
                <Text size="xs" weight="bold" family="outfit"><Localize i18n_default_text="RECENT TRANSACTIONS" /></Text>
            </div>
            <div className="qs-table-container">
                <table>
                    <thead>
                        <tr>
                            <th><Localize i18n_default_text="REF." /></th>
                            <th><Localize i18n_default_text="TYPE" /></th>
                            <th><Localize i18n_default_text="STAKE" /></th>
                            <th><Localize i18n_default_text="RESULT" /></th>
                            <th><Localize i18n_default_text="PROFIT/LOSS" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="qs-empty-row">
                                    <Localize i18n_default_text="No history yet" />
                                </td>
                            </tr>
                        ) : (
                            trades.map((trade, index) => {
                                const statusClass = trade.status === 'won' ? 'result-won' :
                                    trade.status === 'lost' ? 'result-lost' : 'result-pending';
                                return (
                                    <tr key={index}>
                                        <td>{trade.ref || `#${index}`}</td>
                                        <td>{trade.contract_type}</td>
                                        <td>{formatMoney('USD', trade.buy_price, true)}</td>
                                        <td className={statusClass}>{trade.status.toUpperCase()}</td>
                                        <td className={trade.profit >= 0 ? 'profit' : 'loss'}>
                                            {trade.profit !== undefined ? formatMoney('USD', trade.profit, true) : '-'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
