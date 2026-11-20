import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { channels, formatDay, formatNumber, formatRate, groupByPeriod, sample, summarize } from './data.js';
import './styles.css';

const ranges = [
  { days: 7, interval: 1 },
  { days: 30, interval: 5 },
  { days: 90, interval: 9 },
];

function exportRows(rows) {
  const sourceNames = Object.fromEntries(channels.map(({ id, label }) => [id, label]));
  const lines = ['日期,渠道,访问,注册'];
  for (const row of rows) {
    lines.push([row.date, sourceNames[row.channel], row.visits, row.signups].join(','));
  }
  const file = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'signal-desk-' + rows.at(-1).date + '.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Metric({ label, value, help }) {
  return <article className="metric">
    <h2>{label}</h2>
    <p className="metric-value">{value}</p>
    <p className="muted">{help}</p>
  </article>;
}

function Trend({ periods, selected, setSelected }) {
  const high = Math.ceil(Math.max(...periods.map(period => period.visits)) / 500) * 500;
  const current = periods[selected] ?? periods.at(-1);
  const tick = period => formatDay(period.start);
  const periodLabel = period => period.start === period.end
    ? tick(period)
    : tick(period) + '–' + formatDay(period.end);

  return <section className="panel trend" aria-labelledby="trend-title">
    <div className="panel-header">
      <div>
        <h2 id="trend-title">访问趋势</h2>
        <p className="muted">{periods[0].start} 至 {periods.at(-1).end}</p>
      </div>
      <p className="selection" aria-live="polite"><strong>{formatNumber(current.visits)}</strong> 次访问 <span>{periodLabel(current)}</span></p>
    </div>
    <div className="chart">
      <div className="axis" aria-hidden="true"><span>{formatNumber(high)}</span><span>{formatNumber(high / 2)}</span><span>0</span></div>
      <div className="bars" style={{ '--columns': periods.length }}>
        {periods.map((period, index) => <button
          className="bar"
          key={period.start}
          type="button"
          aria-pressed={current === period}
          aria-label={periodLabel(period) + '，' + formatNumber(period.visits) + ' 次访问'}
          title={periodLabel(period) + ' · ' + formatNumber(period.visits)}
          onClick={() => setSelected(index)}
        >
          <span className="bar-track" aria-hidden="true"><span style={{ height: (period.visits / high * 100) + '%' }} /></span>
          <span className="chart-date" aria-hidden="true">{tick(period)}</span>
        </button>)}
      </div>
    </div>
  </section>;
}

function SourceTable({ rows, activeChannel }) {
  const selectedChannels = channels.filter(channel => !activeChannel || channel.id === activeChannel);
  const totals = selectedChannels.map(channel => ({
    ...channel,
    ...summarize(rows.filter(row => row.channel === channel.id)),
  })).sort((a, b) => b.visits - a.visits);

  return <section className="panel sources" aria-labelledby="sources-title">
    <div className="panel-header"><h2 id="sources-title">来源明细</h2></div>
    <div className="table-wrap">
      <table>
        <thead><tr><th scope="col">流量渠道</th><th scope="col">访问</th><th scope="col">注册</th><th scope="col">转化率</th></tr></thead>
        <tbody>
          {totals.map(({ id, label, color, visits, signups }) => <tr key={id}>
            <th scope="row"><span className="source-mark" style={{ background: color }} />{label}</th>
            <td>{formatNumber(visits)}</td><td>{formatNumber(signups)}</td><td>{formatRate(visits, signups)}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </section>;
}

function App() {
  const [range, setRange] = useState(ranges[0]);
  const [channel, setChannel] = useState('');
  const [selected, setSelected] = useState(null);
  const days = sample.slice(-range.days);
  const rows = days.flat().filter(row => !channel || row.channel === channel);
  const { visits, signups } = summarize(rows);
  const periods = groupByPeriod(days, range.interval, channel);

  return <>
    <header className="topbar">
      <div className="shell topbar-inner">
        <div className="wordmark"><span className="logo" aria-hidden="true"><i /><i /><i /></span>Signal Desk</div>
        <span className="sample-tag">演示数据</span>
      </div>
    </header>
    <main className="shell">
      <div className="heading">
        <h1>流量概览</h1>
        <button type="button" className="download" onClick={() => exportRows(rows)}>导出 CSV</button>
      </div>
      <div className="toolbar">
        <div className="segmented" role="group" aria-label="时间范围">
          {ranges.map(option => <button type="button" key={option.days} aria-pressed={range === option}
            onClick={() => { setRange(option); setSelected(null); }}>近 {option.days} 天</button>)}
        </div>
        <label className="channel">渠道
          <select value={channel} onChange={event => { setChannel(event.target.value); setSelected(null); }}>
            <option value="">全部渠道</option>
            {channels.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
      </div>
      <div className="metrics">
        <Metric label="总访问量" value={formatNumber(visits)} help="筛选范围内的访问次数" />
        <Metric label="注册数" value={formatNumber(signups)} help="完成注册的访问次数" />
        <Metric label="访问转化率" value={formatRate(visits, signups)} help="注册数 ÷ 总访问量" />
      </div>
      <Trend periods={periods} selected={selected ?? periods.length - 1} setSelected={setSelected} />
      <SourceTable rows={rows} activeChannel={channel} />
    </main>
  </>;
}

createRoot(document.querySelector('#root')).render(<App />);
