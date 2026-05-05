export const QUERY_KEYS = {
  USER_ME: ["user", "me"],
  USER_TDEE: ["user", "tdee"],
  MEALS: "meals",
  MEAL: (id: string) => ["meals", id],
  MEALS_LIST: (date?: string) => ["meals", "list", date],
  DAILY_STATS: (date: string) => ["meals", "stats", "daily", date],
  WEEKLY_STATS: (startDate: string) => ["meals", "stats", "weekly", startDate],
  WATER: (date: string) => ["water", date],
  CHAT_HISTORY: ["chat", "history"],
} as const;
