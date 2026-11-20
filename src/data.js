export const channels = [
  { id: 'search', label: '自然搜索', color: '#514bd4', baseline: 480, conversion: .042 },
  { id: 'direct', label: '直接访问', color: '#367e73', baseline: 260, conversion: .06 },
  { id: 'social', label: '社交媒体', color: '#ab6419', baseline: 170, conversion: .027 },
  { id: 'referral', label: '推荐链接', color: '#a84273', baseline: 95, conversion: .049 },
];

const number = new Intl.NumberFormat('zh-CN');
const dateLabel = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
const referenceDay = Date.UTC(2026, 9, 31);
const millisecondsPerDay = 86_400_000;

export const formatNumber = value => number.format(value);
export const formatDay = date => dateLabel.format(new Date(date));
export const formatRate = (visits, signups) => visits ? (signups / visits * 100).toFixed(1) + '%' : '0.0%';

export const sample = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(referenceDay - (89 - i) * millisecondsPerDay).toISOString().slice(0, 10);
  return channels.map((channel, j) => {
    const cycle = Math.sin(i * .83 + j) * .15 + Math.cos(i * .27 + j) * .10;
    const visits = Math.round(channel.baseline * (.70 + i * .005 + cycle));
    const signups = Math.round(visits * (channel.conversion + Math.sin(i + j) * .006));
    return { date, channel: channel.id, visits, signups };
  });
});

export function summarize(rows) {
  return rows.reduce(
    (total, row) => ({ visits: total.visits + row.visits, signups: total.signups + row.signups }),
    { visits: 0, signups: 0 },
  );
}

export function groupByPeriod(days, interval, channel) {
  const periods = [];
  for (let index = 0; index < days.length; index += interval) {
    const group = days.slice(index, index + interval);
    const rows = group.flat().filter(row => !channel || row.channel === channel);
    periods.push({
      start: group[0][0].date,
      end: group.at(-1)[0].date,
      ...summarize(rows),
    });
  }
  return periods;
}
