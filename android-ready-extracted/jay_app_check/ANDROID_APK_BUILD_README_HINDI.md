JAY AMBE DATA ENTRY APP - Android APK Build

इस प्रोजेक्ट में Capacitor configuration और GitHub Actions workflow जोड़ा गया है।

महत्वपूर्ण:
- यह ZIP स्वयं APK नहीं है। APK GitHub Actions के cloud runner पर compile होगा।
- APK बनाने के लिए GitHub account और इस project को GitHub repository में upload करना आवश्यक है।
- Repository का नाम jay-ambe-data-entry-app रख सकते हैं और branch main रखें।
- GitHub में repository खोलें: Actions tab > Build Android APK > Run workflow.
- Workflow सफल होने पर उसी run के नीचे Artifacts में jay-ambe-data-entry-app-debug-apk डाउनलोड करें।
- डाउनलोड की गई ZIP को Android फोन में extract करें और app-debug.apk इंस्टॉल करें।

पहली बार install करते समय Android आपसे इस स्रोत से apps install करने की अनुमति मांग सकता है। केवल अपनी बनाई हुई APK पर भरोसा होने पर अनुमति दें।

ध्यान दें: Debug APK परीक्षण/सीधे इंस्टॉल के लिए है। सार्वजनिक वितरण के लिए बाद में signed release APK बनाना बेहतर है।
