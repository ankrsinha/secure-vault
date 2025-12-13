export const categoryIcons = {
  Bank: '🏦',
  Email: '📧',
  Social: '👥',
  Work: '💼',
  Shopping: '🛒',
  Other: '📝',
};

// For ALL categories - simple password field
export const credentialTypes = {
  PASSWORD: {
    label: 'Password',
    icon: '🔑',
    placeholder: 'Enter password'
  }
};

// Banking credential types - user can choose from these or add custom
export const bankCredentialTypes = [
  { value: 'atm_pin', label: 'ATM PIN', icon: '🔢', maxLength: 4 },
  { value: 'mobile_pin', label: 'Mobile Banking PIN', icon: '📱', maxLength: 6 },
  { value: 'internet_pin', label: 'Internet Banking PIN', icon: '🌐', maxLength: 6 },
  { value: 'transaction_pin', label: 'Transaction PIN', icon: '💸', maxLength: 6 },
  { value: 'card_pin', label: 'Card PIN', icon: '💳', maxLength: 4 },
  { value: 'pattern', label: 'Pattern/Password', icon: '🔷', maxLength: 50 },
  { value: 'custom', label: 'Custom', icon: '➕', maxLength: 50 }
];

// ONLY for Banking category
export const bankSpecificFields = {
  accountNumber: { label: 'Account Number', type: 'text', icon: '🔢' },
  ifscCode: { label: 'IFSC Code', type: 'text', icon: '🏦' },
  branch: { label: 'Branch', type: 'text', icon: '🏢' },
  accountType: { 
    label: 'Account Type', 
    type: 'select', 
    icon: '📊',
    options: ['Savings', 'Current', 'Salary', 'Fixed Deposit', 'Recurring Deposit', 'NRI'] 
  },
  customerId: { label: 'Customer ID', type: 'text', icon: '👤' },
  cardNumber: { label: 'Card Number', type: 'text', icon: '💳', mask: true },
  cardExpiry: { label: 'Card Expiry', type: 'month', icon: '📅' },
  cvv: { label: 'CVV', type: 'text', icon: '🔒', mask: true, maxLength: 3 }
};

// For ALL categories
export const credentialCategories = [
  { value: 'Bank', label: '🏦 Banking & Finance' },
  { value: 'Email', label: '📧 Email' },
  { value: 'Social', label: '👥 Social Media' },
  { value: 'Work', label: '💼 Work & Productivity' },
  { value: 'Shopping', label: '🛒 Shopping & E-commerce' },
  { value: 'Other', label: '📝 Other' }
];