export const user = {
  name: "Alex Morgan",
  handle: "@alexmorgan",
  avatar: "AM",
  level: "Gold Farmer",
  verified: true,
  balance: 12480.42,
  earnings: 1284.7,
  pending: 312.5,
  referrals: 24,
};

export type Tx = {
  id: string;
  title: string;
  category: "deposit" | "withdraw" | "earn" | "task" | "referral";
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
};

export const transactions: Tx[] = [
  { id: "t1", title: "Farm Yield · Plot #7", category: "earn", amount: 42.18, date: "Today · 09:24", status: "completed" },
  { id: "t2", title: "Task: Survey Bonus", category: "task", amount: 12.5, date: "Today · 08:02", status: "completed" },
  { id: "t3", title: "Withdraw to Bank ••4421", category: "withdraw", amount: -250, date: "Yesterday", status: "pending" },
  { id: "t4", title: "Referral · Sarah K.", category: "referral", amount: 25, date: "Yesterday", status: "completed" },
  { id: "t5", title: "Deposit · Visa ••8821", category: "deposit", amount: 500, date: "May 18", status: "completed" },
  { id: "t6", title: "Farm Yield · Plot #3", category: "earn", amount: 18.04, date: "May 18", status: "completed" },
  { id: "t7", title: "Task: Video Watch", category: "task", amount: 3.2, date: "May 17", status: "completed" },
  { id: "t8", title: "Withdraw to USDT", category: "withdraw", amount: -120, date: "May 16", status: "failed" },
];

export const tasks = [
  { id: 1, title: "Complete daily check-in", reward: 2.5, progress: 1, total: 1, type: "Daily" },
  { id: 2, title: "Invite 3 friends this week", reward: 30, progress: 1, total: 3, type: "Social" },
  { id: 3, title: "Watch sponsored video", reward: 1.2, progress: 0, total: 1, type: "Quick" },
  { id: 4, title: "Complete survey: Spending habits", reward: 8.5, progress: 0, total: 1, type: "Survey" },
  { id: 5, title: "Hold balance > $1,000 for 7 days", reward: 25, progress: 4, total: 7, type: "Hold" },
  { id: 6, title: "Verify identity (KYC)", reward: 15, progress: 0, total: 1, type: "Account" },
];

export const farmPlots = [
  { id: 1, name: "Plot Aurora", apr: 12.4, staked: 2400, yieldDay: 0.82, status: "Growing" },
  { id: 2, name: "Plot Verdant", apr: 9.8, staked: 1800, yieldDay: 0.48, status: "Growing" },
  { id: 3, name: "Plot Nimbus", apr: 18.2, staked: 4200, yieldDay: 2.1, status: "Ready" },
  { id: 4, name: "Plot Solace", apr: 7.5, staked: 900, yieldDay: 0.18, status: "Growing" },
];

export const cards = [
  { id: "c1", label: "Earnings", number: "•••• 4421", balance: 8214.22, gradient: "bg-gradient-card" },
  { id: "c2", label: "Savings", number: "•••• 7790", balance: 3120.18, gradient: "bg-gradient-mint" },
  { id: "c3", label: "Spending", number: "•••• 2210", balance: 1146.02, gradient: "bg-gradient-brand" },
];

export const notifications = [
  { id: 1, title: "Yield harvested", body: "Plot Nimbus paid out $2.10 to your wallet.", time: "2m", type: "earn" },
  { id: 2, title: "Withdrawal pending", body: "$250 to Bank ••4421 is being processed.", time: "1h", type: "withdraw" },
  { id: 3, title: "New task available", body: "Survey: Spending habits · $8.50 reward.", time: "3h", type: "task" },
  { id: 4, title: "Referral joined", body: "Sarah K. signed up using your code.", time: "1d", type: "referral" },
  { id: 5, title: "Verify your identity", body: "Unlock withdrawals up to $10,000 / day.", time: "2d", type: "system" },
];
