export type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
  user_id: string;
  created_at: string;
};

export type ExpenseInsert = {
  amount: number;
  category: string;
  description: string | null;
  expense_date?: string;
};
