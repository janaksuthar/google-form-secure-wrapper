# Google Form Secure Wrapper

A comprehensive web application that creates secure, monitored access to Google Forms with anti-cheating features. Perfect for online exams, quizzes, and assessments.

## 🚀 Features

### For Instructors
- **Simple Interface**: Paste any Google Form URL and generate a secure wrapper link
- **Customizable Security**: Set allowed violations (1-10) and session duration (5-300 minutes)
- **Email Verification**: Optional student email collection before form access
- **Analytics Dashboard**: Monitor student activity, violations, and session data

### Security Features
- **Tab Switch Detection**: Monitors when students switch tabs or lose focus
- **Keyboard Blocking**: Prevents F12, Ctrl+Shift+I, Ctrl+U, and other shortcuts
- **Right-Click Protection**: Disables context menu and text selection
- **Copy/Paste Prevention**: Blocks copying and pasting content
- **Developer Tools Detection**: Basic detection of browser developer tools
- **Session Management**: Prevents multiple attempts via browser session tracking

### Student Experience
- **Clean Interface**: Minimal, distraction-free form access
- **Real-time Monitoring**: Live violation counter and timer display
- **Progressive Warnings**: Warning on first violation, lockout after limit exceeded
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📁 Project Structure

```
/
├── index.html              # Landing page
├── instructor.html         # Instructor panel for creating wrappers
├── wrapper.html           # Student-facing secure wrapper page
├── admin.html             # Analytics dashboard
├── css/
│   └── style.css          # Modern, responsive styling
├── js/
│   ├── instructor.js      # Instructor panel functionality
│   ├── wrapper.js         # Security monitoring and anti-cheating
│   └── admin.js           # Dashboard analytics
└── README.md              # This file
```

## 🛠️ Setup Instructions

### Option 1: Local Development

1. **Clone or Download** this repository to your local machine
2. **Open** the project folder in your preferred code editor
3. **Start a local server**:
   - **Python**: `python -m http.server 8000`
   - **Node.js**: `npx http-server -p 8000`
   - **PHP**: `php -S localhost:8000`
   - **VS Code**: Use the "Live Server" extension
4. **Access** the application at `http://localhost:8000`

### Option 2: Deploy to Vercel

1. **Push** your code to a GitHub repository
2. **Visit** [vercel.com](https://vercel.com) and sign in
3. **Import** your GitHub repository
4. **Deploy** with default settings (no build configuration needed)
5. **Access** your live application at the provided Vercel URL

### Option 3: Deploy to GitHub Pages

1. **Push** your code to a GitHub repository
2. **Go to** repository Settings → Pages
3. **Select** source branch (usually `main` or `master`)
4. **Access** your application at `https://yourusername.github.io/repository-name`

### Option 4: Deploy to Firebase Hosting

1. **Install** Firebase CLI: `npm install -g firebase-tools`
2. **Login**: `firebase login`
3. **Initialize**: `firebase init hosting`
4. **Deploy**: `firebase deploy`

## 📖 How to Use

### For Instructors

1. **Visit** the instructor panel (`instructor.html`)
2. **Paste** your Google Form URL (must be a public form)
3. **Configure** security settings:
   - Set allowed violations (default: 3)
   - Set session duration in minutes (optional)
   - Enable email verification (optional)
4. **Click** "Generate Wrapper Link"
5. **Copy** the generated URL and share with students

### For Students

1. **Click** the wrapper link provided by instructor
2. **Enter email** if required
3. **Complete** the form within the secure environment
4. **Avoid** switching tabs, right-clicking, or using keyboard shortcuts
5. **Submit** the form before time expires (if timer is set)

### For Administrators

1. **Visit** the admin dashboard (`admin.html`)
2. **View** statistics and analytics
3. **Monitor** active sessions and violations
4. **Export** data for further analysis
5. **Manage** wrapper configurations

## 🔧 Configuration Options

### Instructor Settings

| Setting | Description | Default | Range |
|---------|-------------|---------|-------|
| Allowed Violations | Number of violations before session lock | 3 | 1-10 |
| Session Duration | Time limit in minutes | None | 5-300 |
| Email Required | Require student email verification | No | Yes/No |

### Security Features

| Feature | Description | Configurable |
|---------|-------------|--------------|
| Tab Switch Detection | Monitors visibility changes | No |
| Focus Loss Detection | Detects window blur events | No |
| Right-Click Blocking | Prevents context menu | No |
| Keyboard Shortcuts | Blocks F12, Ctrl+Shift+I, etc. | No |
| Copy/Paste Prevention | Disables text operations | No |
| Developer Tools Detection | Basic dev tools detection | No |

## 📊 Analytics & Monitoring

The admin dashboard provides comprehensive analytics:

- **Overview Statistics**: Total wrappers, sessions, violations, and locked sessions
- **Wrapper Management**: View and manage all created wrappers
- **Session Monitoring**: Real-time session tracking with violation counts
- **Violation Logs**: Detailed logs of all security violations
- **Data Export**: Export configurations and session data as JSON

## 🔒 Security Considerations

### What This Tool Prevents
- Tab switching during exams
- Right-clicking and context menus
- Common keyboard shortcuts (F12, Ctrl+C, Ctrl+V, etc.)
- Basic developer tools access
- Multiple session attempts
- Direct form access (URL obfuscation)

### Limitations
- **Client-side only**: All security is browser-based
- **Determined users**: Advanced users may still find workarounds
- **Mobile limitations**: Some features may be less effective on mobile
- **Browser differences**: Security effectiveness varies by browser

### Best Practices
- Use in controlled environments when possible
- Combine with other proctoring methods for high-stakes exams
- Regularly monitor the admin dashboard during exams
- Set appropriate violation limits based on exam importance
- Test the wrapper before distributing to students

## 🌐 Browser Compatibility

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ Full | ✅ Good | Best performance |
| Firefox | ✅ Full | ✅ Good | All features work |
| Safari | ✅ Good | ✅ Good | Some limitations |
| Edge | ✅ Full | ✅ Good | Chromium-based |

## 🚨 Troubleshooting

### Common Issues

**"Configuration not found" error**
- Ensure the wrapper URL is complete and correct
- Check that localStorage is enabled in the browser
- Verify the wrapper was created successfully

**Form not loading**
- Confirm the Google Form URL is public and accessible
- Check internet connection
- Ensure the form hasn't been deleted or made private

**Security features not working**
- Try a different browser
- Disable browser extensions that might interfere
- Ensure JavaScript is enabled

**Timer not displaying**
- Verify session duration was set when creating the wrapper
- Check browser console for JavaScript errors
- Refresh the page and try again

### Data Storage

This application uses browser localStorage for data persistence:
- **Wrapper configurations**: Stored locally in instructor's browser
- **Session events**: Stored locally for analytics
- **Student sessions**: Tracked via sessionStorage

**Important**: Data is stored locally and will be lost if browser data is cleared. For production use, consider implementing a backend database.

## 🔄 Updates & Maintenance

### Regular Maintenance
- Monitor the admin dashboard for unusual activity
- Export and backup analytics data regularly
- Clear old session data to prevent localStorage bloat
- Update security features as needed

### Potential Enhancements
- Backend database integration (Firebase, MongoDB)
- Real-time notifications for violations
- Advanced proctoring features (webcam, screen recording)
- Integration with Learning Management Systems (LMS)
- Mobile app version

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📞 Support

For support or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Test with a different browser or device
4. Create an issue in the project repository

---

**Built for educational integrity and secure online assessments.**
