# Signal Desk · 流量分析看板

查看近 7、30 或 90 天的访问量、注册数和转化率。按来源筛选后，指标、趋势图、明细表和 CSV 都使用同一份数据。点击柱状图可查看对应时段的访问量。

## 运行

需要 Node.js 22.12+ 及 npm。请在当前目录执行以下命令。

```sh
npm ci
npm run dev
```

生产构建运行 `npm run build`，产物位于 `dist/`。使用 `npm run preview` 预览产物。

- `src/data.js` 生成固定的 90 天样例并提供汇总逻辑。
- `src/main.jsx` 包含 React 组件、筛选状态和 CSV 导出。
- `src/styles.css` 定义布局和可用键盘操作的 CSS 柱状图。

数据是可复现的演示样本，日期截至 2026-10-31。
