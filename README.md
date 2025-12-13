# 🔐 Secure Vault - Password Manager

A secure, modern password manager built with React and Vite that stores all your credentials locally with military-grade encryption.

![Secure Vault Screenshot](https://img.shields.io/badge/Secure-Encrypted-brightgreen) ![React](https://img.shields.io/badge/React-19.2-blue) ![Vite](https://img.shields.io/badge/Vite-7.2-purple) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌐 Live Demo

🔗 **[Try Secure Vault Live on Vercel](https://secure-vault-roan.vercel.app/)**

## ✨ Features

### 🔒 Security First
- **AES-256 Encryption** - All data encrypted locally using military-grade encryption
- **Zero Knowledge** - Your master password never leaves your device
- **Local Storage** - All data stays on your machine, no cloud storage
- **PBKDF2 Key Derivation** - 10,000 iterations for secure key generation

### 🏦 Smart Banking Support
- **Banking-Specific Credentials** - Store ATM PINs, Mobile Banking PINs, Transaction PINs separately
- **Custom Credential Types** - Add any banking credential with custom labels
- **Bank Account Details** - Store account numbers, IFSC codes, card details securely
- **Masked Display** - Sensitive data automatically masked when viewing

### 🎯 Core Features
- **Multi-Category Support** - Banking, Email, Social Media, Work, Shopping, and more
- **Smart Search** - Instantly find credentials by service, username, or category
- **Password Generator** - Create strong, random passwords with one click
- **Copy & Show** - View and copy passwords with auto-hide security
- **Status Notifications** - Real-time feedback for all actions

### 💾 Backup & Restore
- **Encrypted Backups** - Export all data with your master password protection
- **Safe JSON Export** - Export credentials without passwords for safe viewing
- **Intelligent Restore** - Merge backups without creating duplicates
- **Cross-Device** - Restore your vault on any device with the same master password

### 🎨 Modern UI/UX
- **Dark Theme** - Easy on the eyes with dark mode interface
- **Responsive Design** - Works perfectly on desktop and mobile
- **Intuitive Interface** - Clean, user-friendly design
- **Real-time Stats** - See credential counts and categories at a glance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/secure-vault.git
cd secure-vault
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
```
http://localhost:5173
```

### Build for Production
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

## 📁 Project Structure

```
secure-vault/
├── src/
│   ├── components/
│   │   ├── CredentialModal.jsx     # Add/edit credentials modal
│   │   ├── DeleteConfirmationModal.jsx  # Delete confirmation modal
│   │   ├── StatusMessage.jsx       # Status notifications
│   │   ├── ViewModal.jsx           # View credential details modal
│   │   └── VaultApp.jsx            # Main application component
│   ├── utils/
│   │   ├── encryption.js           # Encryption/decryption utilities
│   │   └── types.js                # Type definitions and constants
│   └── main.jsx                    # Application entry point
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

## 🔧 Technical Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Encryption**: CryptoJS (AES-256, PBKDF2)
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Package Manager**: npm/yarn

## 🔐 Security Architecture

### Encryption Flow
```
Master Password + Salt → PBKDF2 (10,000 iterations) → AES-256 Key → Encrypt Data
```

### Data Storage
- All credentials encrypted with AES-256 in CBC mode
- Master password never stored or transmitted
- Data persists in browser's local storage
- Automatic decryption on unlock with correct password

### Key Features
- **Salt Generation**: Unique salt for each encryption
- **Password Verification**: Master password verified during decryption
- **Corruption Protection**: Automatic cleanup of corrupted data
- **No Backdoors**: Complete zero-knowledge architecture

## 🏦 Banking Features Guide

### Adding Banking Credentials
1. Select "Banking & Finance" category
2. Add multiple credential types:
   - ATM PIN (4-digit)
   - Mobile Banking PIN (6-digit)
   - Transaction PIN
   - Card PIN
   - Custom credentials
3. Optional bank details:
   - Account number
   - IFSC code
   - Branch details
   - Card information (masked)

### Security Features
- **PIN Masking**: All PINs automatically masked
- **Auto-hide**: Revealed credentials hide after 3 seconds
- **Copy Protection**: One-click copy with auto-clear clipboard
- **No Defaults**: No pre-filled banking fields for security

## 💾 Backup & Restore Guide

### Creating Backups
1. **Encrypted Backup** (Recommended)
   - Includes all passwords
   - Requires master password to restore
   - Use for complete backups

2. **JSON Export** (Safe Sharing)
   - Excludes passwords for security
   - Use for safe viewing or sharing
   - Passwords need to be re-entered

### Restoring Backups
1. **Merge Mode** (Default)
   - Adds new credentials only
   - Prevents duplicates
   - Keeps existing credentials

2. **Replace Mode**
   - Replaces all credentials
   - Use with caution
   - Requires confirmation

## 📱 Usage Instructions

### Adding Credentials
1. Click "Add Credential"
2. Fill in service details
3. Select category
4. Add username/password
5. For banking: Add PINs and account details
6. Save securely

### Managing Credentials
- **View**: Click any credential card
- **Edit**: Click edit in view modal
- **Delete**: Click delete (requires confirmation)
- **Search**: Use search bar for quick access

### Security Best Practices
1. Use a strong, unique master password
2. Enable browser auto-updates
3. Create regular encrypted backups
4. Never share your master password
5. Use the password generator for strong passwords

## 🛠️ Development

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Adding New Features
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Environment Variables
No environment variables needed - all encryption happens locally!

## 🐛 Troubleshooting

### Common Issues

**"Invalid master password" on restore**
- Ensure you're using the same password used during backup
- Check for typos or caps lock
- Try original backup file

**Browser storage issues**
- Clear browser cache and reload
- Ensure local storage is not disabled
- Try incognito/private mode

**Encryption errors**
- Update browser to latest version
- Clear site data and restore from backup
- Check console for specific error messages

### Performance Tips
- Keep credential list under 1000 items
- Use search instead of scrolling
- Regular backups prevent data loss
- Close unused browser tabs

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow React best practices
- Maintain security standards
- Add comments for complex logic
- Test encryption/decryption flows
- Update documentation as needed

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Bundled with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Encrypted with [CryptoJS](https://cryptojs.gitbook.io/docs/)
- Deployed on [Vercel](https://vercel.com/)

## ⚠️ Security Disclaimer

This is a personal project for educational purposes. While it uses strong encryption, always:
- Use unique passwords for important accounts
- Enable 2FA where available
- Keep backups in multiple secure locations
- Consider professional password managers for critical use

## 📞 Support

For issues, questions, or suggestions:
1. Check the [Issues](https://github.com/yourusername/secure-vault/issues) page
2. Review the documentation above
3. Submit a new issue with details

---

**Remember**: Your security is your responsibility. Use strong passwords and keep backups!

⭐ **If you find this project useful, please give it a star!** ⭐