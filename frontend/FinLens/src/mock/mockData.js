// src/mock/mockData.js

export const dashboardMockData = {
    totalBalance: 105000,
    totalIncome: 50000,
    totalExpense: 45000,
    RecentTransactions: [
      {
        _id: "1",
        type: "income",
        source: "Salary",
        icon: null,
        date: "2025-04-10T00:00:00Z",
        amount: 5000,
      },
      {
        _id: "2",
        type: "expense",
        category: "Groceries",
        icon: null,
        date: "2025-04-12T00:00:00Z",
        amount: 800,
      },
      {
        _id: "3",
        type: "expense",
        category: "Transport",
        icon: null,
        date: "2025-04-11T00:00:00Z",
        amount: 150,
      },
    ],
    last30DaysExpenses: {
      transactions: [
        {
          _id: "4",
          type: "expense",
          category: "Dining",
          icon: null,
          date: "2025-04-09T00:00:00Z",
          amount: 1200,
        },
        {
          _id: "5",
          type: "expense",
          category: "Internet",
          icon: null,
          date: "2025-04-08T00:00:00Z",
          amount: 500,
        },
      ],
    },
    last60DaysIncome: {
      transactions: [
        {
          _id: "6",
          source: "Freelance",
          amount: 15000,
          date: "2025-03-15T00:00:00Z",
        },
        {
          _id: "7",
          source: "Salary",
          amount: 30000,
          date: "2025-04-01T00:00:00Z",
        },
        {
          _id: "8",
          source: "Investments",
          amount: 3000,
          date: "2025-03-28T00:00:00Z",
        },
        {
          _id: "9",
          source: "Selling Crafts",
          amount: 2000,
          date: "2025-04-03T00:00:00Z",
        },
      ],
    },
  };
  
  export const incomeMockData = [
    {
      _id: "1",
      source: "Salary",
      icon: null,
      date: "2025-04-01T00:00:00Z",
      amount: 30000,
    },
    {
      _id: "2",
      source: "Freelance",
      icon: null,
      date: "2025-04-10T00:00:00Z",
      amount: 10000,
    },
    {
      _id: "3",
      source: "Selling Art",
      icon: null,
      date: "2025-04-13T00:00:00Z",
      amount: 4000,
    },
  ];
  
  export const expenseMockData = [
    {
      _id: "1",
      category: "Groceries",
      icon: null,
      date: "2025-04-02T00:00:00Z",
      amount: 2500,
    },
    {
      _id: "2",
      category: "Utilities",
      icon: null,
      date: "2025-04-03T00:00:00Z",
      amount: 1200,
    },
    {
      _id: "3",
      category: "Dining",
      icon: null,
      date: "2025-04-04T00:00:00Z",
      amount: 600,
    },
  ];
  
  