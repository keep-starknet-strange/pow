export type Transaction = {
  from: string;
  to: string;
  type: string;
  amount: number;
  fee: number;
};

export const newTransaction = () => {
  return {
    from: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    to: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    type: "Transfer",
    amount: (Math.random() + 1) * 10,
    fee: (Math.random() + 1) * 0.1
  };
}

export const newEmptyTransaction = () => {
  return {
    from: "",
    to: "",
    type: "",
    amount: 0,
    fee: 0
  };
}
