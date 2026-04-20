import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scenarios = [
  // ── 1. EMAIL ────────────────────────────────────────────────────────────────
  {
    module: 'Phishing Detection',
    title: 'Urgent: Your Bank Account Is Locked',
    description: 'An email claiming your bank account has been suspended due to suspicious activity.',
    difficulty: 1,
    environment_type: 'email',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'It\'s Monday morning and you just opened your laptop. You have a new email in your inbox marked URGENT from "Chase Support".',
        urgency: 'high',
      },
      environment: {
        senderName: 'Chase Security Team',
        senderEmail: 'security@chase-alerts-secure.com',
        subject: '⚠️ Action Required: Account Suspended — Verify Now',
        body: `Dear Valued Customer,

We have detected unusual login activity on your Chase account. To protect you, we have temporarily suspended your account.

To restore access, please verify your identity within 24 hours by clicking the link below:

[Verify My Account Now]

Failure to verify will result in permanent account closure.

Chase Bank Security Team
1-800-CHASE-BANK`,
      },
      choices: [
        { id: 'A', text: 'Click the verify link and enter your login details.', isSafe: false, consequence: 'You\'ve entered your credentials on a fake site. Attackers now have full access to your bank account.' },
        { id: 'B', text: 'Reply to the email asking if this is real.', isSafe: false, consequence: 'Replying confirms your email is active. You\'ll now receive more targeted phishing attacks.' },
        { id: 'C', text: 'Delete the email and log into Chase directly by typing the URL yourself.', isSafe: true, consequence: 'Smart move. You avoided the phish by going directly to the real site.' },
      ],
      explanation: {
        bestPractice: 'Never click links in emails claiming to be from your bank. Always open a new browser tab and type the official website address directly.',
        redFlags: [
          'Sender domain is "chase-alerts-secure.com" — NOT "chase.com"',
          'Urgent language threatening account closure within 24 hours',
          'Generic "Dear Valued Customer" instead of your real name',
          'Grammatical inconsistencies and unnecessary "BANK" in the phone number',
        ],
      },
      timerSeconds: 75,
      xpReward: 100,
      hints: ['Carefully read the sender\'s full email address — not just the display name.'],
    },
  },

  // ── 2. SMS / OTP SCAM ──────────────────────────────────────────────────────
  {
    module: 'OTP Scam Protection',
    title: 'The "Wrong Number" OTP Trap',
    description: 'Someone texts you saying they sent an OTP to your number by mistake and asks you to forward it.',
    difficulty: 1,
    environment_type: 'sms',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'You\'re relaxing at home when your phone buzzes. First you receive an OTP from your bank, then a text from an unknown number.',
        urgency: 'medium',
      },
      environment: {
        sender: '+91 98765 43210',
        messages: [
          { from: 'system', text: 'HDFC Bank: Your OTP is 847291. Do NOT share this with anyone. Valid for 5 minutes.' },
          { from: 'them',   text: 'Hi! Sorry to bother you. I accidentally registered my account with your number. Can you please forward me the OTP? I\'ll fix it right after. Really urgent 🙏' },
        ],
      },
      choices: [
        { id: 'A', text: 'Forward the OTP — the person seems genuine and it\'s just an honest mistake.', isSafe: false, consequence: 'The OTP was used to log into YOUR account and transfer funds. This is a classic social engineering attack.' },
        { id: 'B', text: 'Ask them to prove who they are first.', isSafe: false, consequence: 'Engaging gives them time to pressure you further. An OTP for your account can never legitimately be needed by someone else.' },
        { id: 'C', text: 'Ignore the text. No one else can ever legitimately need your OTP.', isSafe: true, consequence: 'Correct. OTPs are one-time and personal. This is a textbook OTP scam.' },
      ],
      explanation: {
        bestPractice: 'Your OTP is exclusively for YOU. It is technically impossible for an OTP sent to your number to be intended for someone else\'s account. Never forward an OTP regardless of the reason given.',
        redFlags: [
          'OTP arrived on YOUR registered number — it\'s for YOUR account',
          '"Accidental registration" is a fabricated story',
          'Urgency and emotional appeal ("Really urgent 🙏")',
          'Unknown number with no verifiable identity',
        ],
      },
      timerSeconds: 60,
      xpReward: 100,
      hints: ['Read the bank SMS again. Whose account is the OTP actually for?'],
    },
  },

  // ── 3. PHONE / VISHING ─────────────────────────────────────────────────────
  {
    module: 'Social Engineering',
    title: 'The IT Department Call',
    description: 'An urgent call from someone claiming to be from your company IT department.',
    difficulty: 2,
    environment_type: 'phone',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'You\'re working late at the office finishing a project when you receive a call from an unknown number.',
        urgency: 'high',
      },
      environment: {
        callerId: 'Internal IT — Unknown',
        voiceText: '"Hi, this is Kevin from IT Security. We detected a breach on the network tonight and your laptop is flagged. I need you to disable your two-factor authentication temporarily so I can push a security patch remotely. It\'ll only take 2 minutes. This is really urgent — we have to fix everyone before midnight."',
      },
      choices: [
        { id: 'A', text: 'Disable MFA as requested to help IT fix the issue quickly.', isSafe: false, consequence: 'The "IT agent" was an attacker. Disabling MFA immediately gave them access to your account and the company network.' },
        { id: 'B', text: 'Ask for Kevin\'s employee ID and call the official IT helpdesk to verify.', isSafe: true, consequence: 'Excellent. You detected the vishing attack by verifying through an official channel. The real IT desk confirmed no such request was made.' },
        { id: 'C', text: 'Give them your current password so they can log in and fix it.', isSafe: false, consequence: 'Sharing credentials with anyone — even apparent IT staff — is a critical mistake. Your credentials were immediately compromised.' },
      ],
      explanation: {
        bestPractice: 'Legitimate IT departments will NEVER ask you to disable MFA or share your password — not even in emergencies. Always hang up and call IT back on a number you look up yourself.',
        redFlags: [
          'Caller ID shows "Internal IT" but from an unknown external number',
          'Extreme urgency ("before midnight") creates panic',
          'Requests to DISABLE security controls is a massive red flag',
          'Real IT patches never require disabling MFA',
        ],
      },
      timerSeconds: 45,
      xpReward: 120,
      hints: ['Would a real IT team ever ask you to make yourself LESS secure?'],
    },
  },

  // ── 4. BROWSER / FAKE SITE ─────────────────────────────────────────────────
  {
    module: 'Fake Website Detection',
    title: 'PayPal Login — Something\'s Off',
    description: 'You clicked a link and ended up on what looks like the PayPal login page.',
    difficulty: 2,
    environment_type: 'browser',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'You received an email about a payment dispute and clicked the link. A login page opened. Before you type anything, examine the page carefully.',
        urgency: 'medium',
      },
      environment: {
        url: 'http://paypa1-secure-login.net/account/verify',
        isSecure: false,
        siteName: 'PayPaI — Secure Login',
        brandLetter: 'P',
        brandColor: '#009cde',
        pageTitle: 'Log in to your account',
        ctaLabel: 'Log In',
        subText: 'Protect your money — verify your identity to continue.',
      },
      choices: [
        { id: 'A', text: 'Enter your PayPal email and password — the page looks legitimate.', isSafe: false, consequence: 'Your PayPal credentials were stolen. The attacker immediately logged into your account and withdrew your balance.' },
        { id: 'B', text: 'Close this tab and navigate to paypal.com manually to check for issues.', isSafe: true, consequence: 'Smart. The real PayPal showed no disputes. You spotted a fake page and avoided a credential theft.' },
        { id: 'C', text: 'Enter a fake password to test if it\'s real.', isSafe: false, consequence: 'Phishing sites often accept any password just to harvest it. Your real password is still at risk if it matches any saved credentials.' },
      ],
      explanation: {
        bestPractice: 'Always check the URL bar before entering any credentials. Look for HTTPS padlock, the exact domain spelling, and no suspicious subdomains.',
        redFlags: [
          'URL is "paypa1-secure-login.net" — the "l" in PayPal is replaced with the number "1"',
          'No HTTPS padlock — connection is not secure (HTTP only)',
          'Domain is .net, not .com (PayPal\'s real domain)',
          'Long suspicious path (/account/verify) on an unrecognized domain',
        ],
      },
      timerSeconds: 60,
      xpReward: 120,
      hints: ['Look very carefully at every character in the URL bar — especially domain name spelling and HTTPS status.'],
    },
  },

  // ── 5. WIFI / EVIL TWIN ────────────────────────────────────────────────────
  {
    module: 'Public WiFi Risks',
    title: 'Coffee Shop Free WiFi',
    description: 'You need internet at a coffee shop and see multiple networks available.',
    difficulty: 2,
    environment_type: 'wifi',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'You\'re at Brew & Co. coffee shop with your laptop, needing to quickly check your work email. You open WiFi settings and see these networks.',
        urgency: 'low',
      },
      environment: {
        networks: [
          { ssid: 'BrewCo_Guest',       signalStrength: 90, isOpen: true,  isMalicious: false },
          { ssid: 'BrewCo_Free WiFi',   signalStrength: 95, isOpen: true,  isMalicious: true  },
          { ssid: 'BT-HomeHub-4F2A',    signalStrength: 30, isOpen: false, isMalicious: false },
          { ssid: 'AndroidAP_7724',     signalStrength: 60, isOpen: true,  isMalicious: false },
        ],
      },
      choices: [
        { id: 'A', text: 'Connect to "BrewCo_Free WiFi" — it has the strongest signal and matches the café name.', isSafe: false, consequence: 'That was an evil twin hotspot set up by an attacker nearby. All your unencrypted traffic including your email was intercepted.' },
        { id: 'B', text: 'Ask the café staff for the correct network name and password, then use a VPN.', isSafe: true, consequence: 'Perfect approach. The staff confirmed "BrewCo_Guest" is their network. Using a VPN encrypts your traffic even on open networks.' },
        { id: 'C', text: 'Connect to any open network — they\'re all basically the same risk anyway.', isSafe: false, consequence: 'Different open networks have very different risk levels. The malicious twin hotspot captured your session cookie and hijacked your email.' },
      ],
      explanation: {
        bestPractice: 'Always verify the exact WiFi network name with staff. Never trust "free" networks with suspiciously strong signals next to an official network. Always use a VPN on public WiFi.',
        redFlags: [
          '"BrewCo_Free WiFi" vs "BrewCo_Guest" — two similar named open networks is a classic evil twin setup',
          'Suspiciously high signal (95%) from a hotspot that isn\'t the business router',
          'Open network with no password has zero encryption',
          'Network name not prominent displayed anywhere in the café',
        ],
      },
      timerSeconds: 75,
      xpReward: 110,
      hints: ['When there are two networks with similar names, one of them is almost certainly malicious.'],
    },
  },

  // ── 6. EMAIL / CEO FRAUD (PREMIUM) ─────────────────────────────────────────
  {
    module: 'Phishing Detection',
    title: 'Urgent Wire Transfer — CEO Request',
    description: 'An email appearing to be from your CEO asking for an immediate wire transfer.',
    difficulty: 3,
    environment_type: 'email',
    is_premium: true,
    content_json: {
      narrative: {
        setting: 'It\'s Friday afternoon. Your CFO is on vacation. You receive an email from what appears to be your CEO\'s address.',
        urgency: 'high',
      },
      environment: {
        senderName: 'Michael Chen (CEO)',
        senderEmail: 'mchen@yourcompany-ltd.com',
        subject: 'Strictly Confidential — Urgent Wire Transfer Needed',
        body: `Hi,

I'm currently in a client meeting and cannot talk — please handle this urgently.

We have a time-sensitive acquisition closing today. Please wire $47,500 to the following account immediately:

Account Name: Meridian Partners LLC
Bank: JPMorgan Chase
Routing: 021000021
Account: 7739201847

Keep this strictly confidential — do not discuss with anyone until Monday. I'll explain everything then.

Thanks,
Michael`,
      },
      choices: [
        { id: 'A', text: 'Process the wire transfer immediately — it\'s from the CEO and marked urgent.', isSafe: false, consequence: 'You processed a fraudulent wire transfer. The money is gone within minutes. This is one of the most costly cybercrimes — Business Email Compromise.' },
        { id: 'B', text: 'Call the CEO\'s personal mobile number (from your company directory, not this email) to verbally confirm.', isSafe: true, consequence: 'Smart. The real CEO knew nothing about this. The email was sent from a lookalike domain. You saved $47,500.' },
        { id: 'C', text: 'Reply to the email asking for written authorization before proceeding.', isSafe: false, consequence: 'Replying to the attacker\'s email gives them a chance to send fake authorization. Always verify via phone using a number you already have.' },
      ],
      explanation: {
        bestPractice: 'Wire transfers requested urgently by email should ALWAYS be verbally confirmed by phone to the requester using a number you already know — never a number provided in the suspicious email.',
        redFlags: [
          'Domain is "yourcompany-ltd.com" not "yourcompany.com" — a lookalike domain',
          '"Do not discuss with anyone" is designed to prevent you from verifying',
          'Unusually large urgent wire transfer on a Friday afternoon when CFO is away',
          'No acquisition was announced internally',
        ],
      },
      timerSeconds: 90,
      xpReward: 180,
      hints: ['Focus on the sender\'s email domain — is it exactly your company\'s domain?'],
    },
  },

  // ── 7. BROWSER / MALWARE DOWNLOAD (PREMIUM) ────────────────────────────────
  {
    module: 'Malware Downloads',
    title: '"Adobe Flash Update Required"',
    description: 'A browser popup tells you your software is out of date and needs an urgent update.',
    difficulty: 3,
    environment_type: 'browser',
    is_premium: true,
    content_json: {
      narrative: {
        setting: 'You\'re browsing a news website when a large popup appears blocking the page content.',
        urgency: 'high',
      },
      environment: {
        url: 'http://news-daily-global.com/article/tech-update',
        isSecure: false,
        siteName: 'Adobe Flash Player — Critical Update',
        brandLetter: '!',
        brandColor: '#e82c0c',
        pageTitle: '⚠️ Critical Security Update Required',
        ctaLabel: 'Download Update Now (Free)',
        subText: 'Your Flash Player is out of date. Hackers may exploit this vulnerability. Update immediately to stay protected.',
      },
      choices: [
        { id: 'A', text: 'Click "Download Update Now" — security updates are important.', isSafe: false, consequence: 'You downloaded a trojan disguised as an update. It silently installed a keylogger that now records everything you type.' },
        { id: 'B', text: 'Close the popup/tab immediately and update software only through official channels.', isSafe: true, consequence: 'Perfect. Adobe Flash was discontinued in 2020. This was pure malware. You closed it before any harm was done.' },
        { id: 'C', text: 'Call the number shown on the page to speak to the support team.', isSafe: false, consequence: 'The phone number connects to a scam call center. They guided you into installing remote-access software, giving them full control of your computer.' },
      ],
      explanation: {
        bestPractice: 'Never install software updates from browser popups on websites. Go directly to the software vendor\'s official site (adobe.com, microsoft.com, etc.) to find legitimate updates.',
        redFlags: [
          'Adobe Flash Player was officially discontinued in December 2020 — it no longer exists',
          'Popup appears on a non-Adobe website (a news site)',
          'Extreme urgency language ("Critical", "Hackers may exploit")',
          'The site itself is HTTP (not secure) and has nothing to do with Adobe',
        ],
      },
      timerSeconds: 60,
      xpReward: 150,
      hints: ['When was Adobe Flash Player officially discontinued? And who should be giving you Adobe updates?'],
    },
  },

  // ── 8. SMS / SMISHING (PREMIUM) ────────────────────────────────────────────
  {
    module: 'OTP Scam Protection',
    title: 'Your Parcel Could Not Be Delivered',
    description: 'An SMS claiming your package delivery failed and requires a small customs fee.',
    difficulty: 2,
    environment_type: 'sms',
    is_premium: true,
    content_json: {
      narrative: {
        setting: 'You\'re expecting an international order. An SMS arrives from what appears to be a courier company.',
        urgency: 'medium',
      },
      environment: {
        sender: 'FEDEX-IN',
        messages: [
          { from: 'them', text: 'FedEx: Your parcel #FX928471 has been held at customs. A fee of ₹49 is required to release it. Pay now: http://fedex-in-customs.com/pay?ref=FX928471' },
          { from: 'them', text: 'Failure to pay within 24hrs will result in your parcel being returned. Time remaining: 23:47:12' },
        ],
      },
      choices: [
        { id: 'A', text: 'Pay the ₹49 fee using the link — it\'s a small amount and I am expecting a package.', isSafe: false, consequence: 'The payment page captured your full card details including CVV. Your card was maxed out within the hour on overseas transactions.' },
        { id: 'B', text: 'Visit FedEx.com directly and track your parcel using the tracking number.', isSafe: true, consequence: 'The tracking number doesn\'t exist in the real FedEx system. This was a smishing attack and you avoided card fraud.' },
        { id: 'C', text: 'Forward the link to a friend to check if it\'s safe for you.', isSafe: false, consequence: 'You exposed your friend to the same malicious link. Forwarding dangerous links puts others at risk.' },
      ],
      explanation: {
        bestPractice: 'Never click payment links in SMS messages from couriers. Always visit the official courier website directly and enter the tracking number manually to check your parcel status.',
        redFlags: [
          'Link domain is "fedex-in-customs.com" — not "fedex.com"',
          'Legitimate couriers never request payment via SMS links',
          'Creating urgency with a countdown timer',
          'Small amount (₹49) is designed to seem harmless to lower your guard',
        ],
      },
      timerSeconds: 60,
      xpReward: 120,
      hints: ['Check the link domain carefully. What is FedEx\'s actual official website?'],
    },
  },

  // ── 9. PASSWORD SECURITY ──────────────────────────────────────────────────
  {
    module: 'Password Security',
    title: 'The Reused Password Breach',
    description: 'You get an alert that a website you use was breached. Your password was in the leak.',
    difficulty: 1,
    environment_type: 'email',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'You receive a notification from HaveIBeenPwned that your email appeared in a data breach from "QuickShop.com." The leaked data included passwords.',
        urgency: 'high',
      },
      environment: {
        senderName: 'HaveIBeenPwned Alert',
        senderEmail: 'noreply@haveibeenpwned.com',
        subject: '⚠️ Your email was found in a data breach',
        body: `Your email address appeared in a data breach from QuickShop.com (breached March 2025).

Compromised data: Email addresses, Passwords (MD5 hashed, easily cracked)

This breach affects your security if you reused the same password on other sites.

Action recommended: Change your password immediately on any site where you used the same or similar password.

— HaveIBeenPwned.com`,
      },
      choices: [
        { id: 'A', text: 'I only used that password on QuickShop, so I\'ll just change it there.', isSafe: false, consequence: 'You used that password on 3 other sites but forgot. Attackers tried credential stuffing and got into your email within hours.' },
        { id: 'B', text: 'Change passwords on ALL my accounts and enable 2FA everywhere.', isSafe: true, consequence: 'Perfect. You changed all passwords to unique ones using a password manager and enabled 2FA. Even if attackers try credential stuffing, they\'re blocked.' },
        { id: 'C', text: 'Ignore it — my password is strong enough that it can\'t be cracked.', isSafe: false, consequence: 'MD5 hashes are trivially crackable. Your "strong" password was cracked in under 2 minutes by automated tools.' },
      ],
      explanation: {
        bestPractice: 'Use a unique password for every site via a password manager (Bitwarden, 1Password). Enable 2FA on all critical accounts. After any breach, change passwords on ALL sites where you reused that password.',
        redFlags: [
          'MD5-hashed passwords can be cracked in seconds with rainbow tables',
          'Password reuse means one breach compromises all accounts',
          'Assuming you remember every site you used a password on is dangerous',
          'Ignoring breach notifications leaves you vulnerable to credential stuffing',
        ],
      },
      timerSeconds: 75,
      xpReward: 100,
      hints: ['How many sites do you actually use the same password on? Are you sure you remember all of them?'],
    },
  },

  // ── 10. SOCIAL ENGINEERING / TAILGATING ─────────────────────────────────────
  {
    module: 'Social Engineering',
    title: 'The Delivery Person at the Door',
    description: 'Someone in a delivery uniform asks you to hold the secure office door open.',
    difficulty: 1,
    environment_type: 'phone',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'You\'re leaving the secure area of your office building. Someone in a FedEx uniform with a large box is struggling at the badge-locked door behind you.',
        urgency: 'low',
      },
      environment: {
        callerId: 'In-Person Encounter',
        voiceText: '"Hey, could you hold the door? I\'ve got this big delivery for the 3rd floor but my badge isn\'t working. Must be a new system update or something. I\'ve been here every Tuesday for months — you might\'ve seen me around. These boxes are really heavy, I just need to get to the loading dock inside."',
      },
      choices: [
        { id: 'A', text: 'Hold the door open — they look legitimate and are clearly struggling.', isSafe: false, consequence: 'The "delivery person" was a social engineer. Once inside, they planted a rogue USB device in a conference room that captured network traffic.' },
        { id: 'B', text: 'Politely decline and direct them to the front desk to get a visitor badge.', isSafe: true, consequence: 'Correct. Legitimate delivery staff can always go through the front desk. You prevented an unauthorized physical intrusion.' },
        { id: 'C', text: 'Ask them which company they\'re delivering for and let them in if they answer correctly.', isSafe: false, consequence: 'Knowing the company name doesn\'t verify identity. Anyone can look up tenant information online. A badge or escort is the only proper verification.' },
      ],
      explanation: {
        bestPractice: 'Never hold secure doors for anyone you don\'t personally know, regardless of how they\'re dressed. Direct all visitors to reception for proper badging and escort.',
        redFlags: [
          'Badge "not working" is the most common tailgating excuse',
          '"I\'ve been here every Tuesday" tries to establish false familiarity',
          'Uniforms can be purchased or fabricated by anyone',
          'Appealing to your helpfulness to bypass security controls',
        ],
      },
      timerSeconds: 45,
      xpReward: 100,
      hints: ['Can you truly verify someone\'s identity just by their uniform?'],
    },
  },

  // ── 11. BROWSER / TYPOSQUATTING ─────────────────────────────────────────────
  {
    module: 'Fake Website Detection',
    title: 'Amazon Prime Day Deal',
    description: 'You searched for Amazon Prime Day deals and clicked a top search result.',
    difficulty: 2,
    environment_type: 'browser',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'You\'re excited about Prime Day deals. You typed "amazon prime day deals" into Google and clicked what looked like the first result.',
        urgency: 'medium',
      },
      environment: {
        url: 'https://arnazon-primeday.com/deals/electronics',
        isSecure: true,
        siteName: 'Amazon — Prime Day Deals',
        brandLetter: 'a',
        brandColor: '#ff9900',
        pageTitle: '🎉 Prime Day Lightning Deals — Up to 90% Off',
        ctaLabel: 'Sign In to Claim Deal',
        subText: 'These deals expire in 2 hours. Sign in with your Amazon account to claim.',
      },
      choices: [
        { id: 'A', text: 'Sign in — it has HTTPS and looks exactly like Amazon.', isSafe: false, consequence: 'The domain is "arnazon" (rn looks like m). Despite HTTPS, it\'s a typosquatting site. Your Amazon credentials and payment info were stolen.' },
        { id: 'B', text: 'Check the URL carefully, then close the tab and go to amazon.com directly.', isSafe: true, consequence: 'You noticed "arnazon" instead of "amazon" — a classic typosquatting attack. Going directly to amazon.com showed you the real deals safely.' },
        { id: 'C', text: 'The deal seems too good to pass up — enter payment details quickly before it expires.', isSafe: false, consequence: 'Urgency is a manipulation tactic. You entered credit card details on a phishing site, and $3,200 was charged before you noticed.' },
      ],
      explanation: {
        bestPractice: 'HTTPS does NOT mean a site is trustworthy — it only means the connection is encrypted. Always manually type trusted URLs or use bookmarks. Be especially careful with "rn" looking like "m".',
        redFlags: [
          '"arnazon" instead of "amazon" — typosquatting using rn to mimic m',
          'HTTPS padlock doesn\'t guarantee legitimacy — anyone can get an SSL certificate',
          '90% off deal is unrealistically generous',
          '"Expires in 2 hours" creates artificial urgency to prevent careful checking',
        ],
      },
      timerSeconds: 60,
      xpReward: 130,
      hints: ['Read the domain name character by character. Does "rn" look like any other letter?'],
    },
  },

  // ── 12. SMS / SIM SWAP ──────────────────────────────────────────────────────
  {
    module: 'OTP Scam Protection',
    title: 'The Telecom Agent Call',
    description: 'Someone calling from your "telecom provider" needs to verify your identity for a SIM upgrade.',
    difficulty: 3,
    environment_type: 'phone',
    is_premium: true,
    content_json: {
      narrative: {
        setting: 'You receive a call from someone claiming to be from Jio/Airtel. They say your SIM is being upgraded to 5G and they need to verify your identity.',
        urgency: 'medium',
      },
      environment: {
        callerId: 'Jio Customer Support',
        voiceText: '"Good afternoon! I\'m calling from Jio regarding your SIM upgrade to our new 5G network. This is completely free for existing customers. To process the upgrade, I just need to verify your identity. You\'ll receive a one-time password — please read it back to me so I can authenticate you in our system. This will only take a moment."',
      },
      choices: [
        { id: 'A', text: 'Read back the OTP when it arrives — it\'s just identity verification.', isSafe: false, consequence: 'That OTP was for a SIM swap request. The attacker now controls your phone number, intercepting all calls, SMS, and OTPs sent to you. They drained your bank account within minutes.' },
        { id: 'B', text: 'Hang up and call the carrier\'s official number yourself to ask about any upgrade.', isSafe: true, consequence: 'The real carrier confirmed no upgrade was in progress and flagged the suspicious activity. You prevented a SIM swap attack.' },
        { id: 'C', text: 'Give them your Aadhaar number to verify your identity faster.', isSafe: false, consequence: 'You gave a scammer your Aadhaar. Combined with other data, they can now impersonate you for various financial frauds.' },
      ],
      explanation: {
        bestPractice: 'Telecom companies never call you to ask for OTPs or identity numbers for "upgrades." Always hang up and call the official carrier number from their website.',
        redFlags: [
          'Unsolicited call about a free upgrade you didn\'t request',
          'Asking you to read back an OTP is ALWAYS a scam — the OTP was generated by an attacker',
          'SIM swap attacks can completely compromise your digital identity',
          'Real 5G upgrades happen at the store or via self-service in the app',
        ],
      },
      timerSeconds: 50,
      xpReward: 160,
      hints: ['Who initiated this OTP? You didn\'t request any change — so who did?'],
    },
  },

  // ── 13. WIFI / CAPTIVE PORTAL ───────────────────────────────────────────────
  {
    module: 'Public WiFi Risks',
    title: 'Airport WiFi Login Page',
    description: 'The airport WiFi asks you to log in with your email and social media account.',
    difficulty: 2,
    environment_type: 'browser',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'You\'re at the airport with a 3-hour layover. You connect to "Airport_Free_WiFi" and a captive portal appears.',
        urgency: 'low',
      },
      environment: {
        url: 'http://airport-wifi-portal.com/login',
        isSecure: false,
        siteName: 'Airport Free WiFi',
        brandLetter: '✈',
        brandColor: '#2196F3',
        pageTitle: 'Welcome! Sign in to access free WiFi',
        ctaLabel: 'Continue with Google',
        subText: 'Or enter your email, password, and date of birth to create a free account.',
      },
      choices: [
        { id: 'A', text: 'Sign in with Google OAuth — it\'s more secure than entering a password.', isSafe: false, consequence: 'The "Continue with Google" button was a fake OAuth page that captured your Google credentials. Your entire Google account is now compromised.' },
        { id: 'B', text: 'Use your mobile data or hotspot instead — the portal is asking for too much info.', isSafe: true, consequence: 'Smart choice. Legitimate airport WiFi portals should never ask for passwords or social logins. Using mobile data keeps you completely safe.' },
        { id: 'C', text: 'Create an account with a throwaway email and password.', isSafe: false, consequence: 'Even a "throwaway" password can reveal your password patterns. The portal harvested data from thousands of travelers this way.' },
      ],
      explanation: {
        bestPractice: 'Real airport WiFi portals use simple email-only signup or carrier integration — they never ask for passwords or social logins. When in doubt, use mobile data or a VPN.',
        redFlags: [
          'Asking for password AND date of birth on a WiFi portal is excessive',
          '"Continue with Google" on a non-Google domain is a credential phishing attempt',
          'Portal domain "airport-wifi-portal.com" is not the airport\'s official domain',
          'HTTP connection means no encryption on the portal itself',
        ],
      },
      timerSeconds: 60,
      xpReward: 110,
      hints: ['Does a real WiFi portal need your social media login or date of birth?'],
    },
  },

  // ── 14. EMAIL / INVOICE SCAM ────────────────────────────────────────────────
  {
    module: 'Phishing Detection',
    title: 'Overdue Invoice — Immediate Payment Required',
    description: 'An email with an attached invoice demands immediate payment for a service you don\'t remember.',
    difficulty: 2,
    environment_type: 'email',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'Monday morning, your inbox has an email with a PDF attachment claiming to be an overdue invoice for $892 from a web hosting company.',
        urgency: 'high',
      },
      environment: {
        senderName: 'HostGator Billing Dept',
        senderEmail: 'billing@h0stgat0r-invoices.com',
        subject: 'OVERDUE INVOICE #HG-29471 — Payment Due Immediately',
        body: `OVERDUE NOTICE

Invoice #HG-29471
Amount: $892.00
Status: PAST DUE (14 days overdue)

Dear Customer,

Your web hosting invoice is now 14 days overdue. Failure to remit payment within 48 hours will result in:
• Service termination
• Data deletion
• Account sent to collections

Please open the attached invoice (PDF) and follow the payment instructions immediately.

Regards,
HostGator Billing Department
billing@hostgator.com`,
      },
      choices: [
        { id: 'A', text: 'Open the PDF attachment to check the invoice details.', isSafe: false, consequence: 'The PDF contained an embedded exploit that installed a backdoor trojan on your system. Your files and credentials are now compromised.' },
        { id: 'B', text: 'Pay immediately to avoid service termination — $892 isn\'t worth the risk.', isSafe: false, consequence: 'You paid a fake invoice. The money went to a scammer\'s account. Your real hosting (if any) was never at risk.' },
        { id: 'C', text: 'Don\'t open the attachment. Log into HostGator directly to check your real billing status.', isSafe: true, consequence: 'You checked your real HostGator account — no unpaid invoices existed. This was a phishing email with a malicious PDF.' },
      ],
      explanation: {
        bestPractice: 'Never open unexpected invoice attachments. Log into the service directly via your browser to verify any billing claims. Report the phishing email.',
        redFlags: [
          'Sender domain "h0stgat0r-invoices.com" uses zero instead of "o" and is not hostgator.com',
          'Footer says "billing@hostgator.com" but the actual FROM address is different — spoofed display name',
          'Threatening data deletion to create panic',
          'You don\'t recall signing up for or using this service',
        ],
      },
      timerSeconds: 60,
      xpReward: 120,
      hints: ['Compare the "From" email address with the one shown in the footer — are they the same?'],
    },
  },

  // ── 15. MALWARE / USB DROP ──────────────────────────────────────────────────
  {
    module: 'Malware Downloads',
    title: 'The USB Stick in the Parking Lot',
    description: 'You find a USB drive labeled "Confidential — Q4 Salary Reviews" in your office parking lot.',
    difficulty: 2,
    environment_type: 'phone',
    is_premium: false,
    content_json: {
      narrative: {
        setting: 'Walking into work, you spot a USB flash drive on the ground near the entrance. It has a sticky label: "Confidential — Q4 Salary Reviews."',
        urgency: 'low',
      },
      environment: {
        callerId: 'Physical Security',
        voiceText: 'You found a USB drive labeled "Confidential — Q4 Salary Reviews" in the parking lot. Your curiosity is piqued — who wouldn\'t want to see what everyone else is earning? You\'re now at your desk deciding what to do.',
      },
      choices: [
        { id: 'A', text: 'Plug it into your work computer to check if it belongs to someone in your department.', isSafe: false, consequence: 'The USB contained auto-running malware that immediately compromised your workstation and spread to the company network. This is a classic "USB drop" attack.' },
        { id: 'B', text: 'Plug it into your personal phone charger to check the contents safely.', isSafe: false, consequence: 'USB attacks work on any device with a USB port, including phones. Some malicious USBs can also fry devices with a power surge ("USB Killer").' },
        { id: 'C', text: 'Don\'t plug it in. Hand it to your IT security team immediately.', isSafe: true, consequence: 'The IT team analyzed it in a sandbox and found it contained a backdoor trojan. You prevented a serious network compromise by following protocol.' },
      ],
      explanation: {
        bestPractice: 'NEVER plug unknown USB devices into any computer or phone. Report found devices to IT security immediately. USB drops are a well-known physical attack vector.',
        redFlags: [
          '"Confidential — Salary Reviews" is engineered to exploit your curiosity',
          'Found in a company parking lot — this is a textbook USB drop attack location',
          'Malicious USBs can auto-execute code the instant they\'re plugged in',
          'Some USB devices are electrical weapons that can destroy your hardware',
        ],
      },
      timerSeconds: 45,
      xpReward: 110,
      hints: ['Why would confidential salary data be on an unencrypted USB in a parking lot?'],
    },
  },

  // ── 16. PASSWORD / SHOULDER SURFING (PREMIUM) ───────────────────────────────
  {
    module: 'Password Security',
    title: 'The Colleague Over Your Shoulder',
    description: 'You\'re logging into your bank at work and notice someone walking behind you.',
    difficulty: 2,
    environment_type: 'phone',
    is_premium: true,
    content_json: {
      narrative: {
        setting: 'During lunch break, you\'re at your desk logging into your online banking. You notice your colleague lingering behind you, and your screen is clearly visible.',
        urgency: 'medium',
      },
      environment: {
        callerId: 'Physical Security',
        voiceText: 'You\'re typing your bank password at your desk. From the corner of your eye, you see your colleague standing behind you looking at your screen. They say: "Oh sorry, I was just waiting to ask you something. Nice wallpaper by the way!"',
      },
      choices: [
        { id: 'A', text: 'Finish logging in — it\'s just a colleague and they probably didn\'t see anything.', isSafe: false, consequence: 'Your colleague memorized 6 of your 8 password characters. Combined with publicly available info, they cracked your banking password that night.' },
        { id: 'B', text: 'Stop typing immediately, lock your screen, and log in later in private.', isSafe: true, consequence: 'Smart. You prevented shoulder surfing by not completing the password entry. Later, you logged in with no one around and changed your password to be safe.' },
        { id: 'C', text: 'Continue but try to type faster so they can\'t read the keys.', isSafe: false, consequence: 'Trained observers can follow rapid typing. Some attackers also use phone cameras to record keystrokes. Speed doesn\'t protect you.' },
      ],
      explanation: {
        bestPractice: 'Always be aware of your surroundings when entering passwords. Use a privacy screen filter, biometric auth, or move to a private space. Lock your screen (Win+L or Cmd+L) whenever you step away.',
        redFlags: [
          'Anyone standing behind you while you type is a shoulder surfing risk',
          '"Nice wallpaper" is a cover story — their real interest was your screen',
          'Even colleagues can be insider threats',
          'Bank credentials should never be entered in public view',
        ],
      },
      timerSeconds: 40,
      xpReward: 100,
      hints: ['If someone can see your screen, what else can they see?'],
    },
  },

  // ── 17. EMAIL / PRIZE SCAM (PREMIUM) ────────────────────────────────────────
  {
    module: 'Phishing Detection',
    title: 'Congratulations! You\'ve Won a MacBook',
    description: 'An email says you\'ve won a prize in a tech company giveaway.',
    difficulty: 1,
    environment_type: 'email',
    is_premium: true,
    content_json: {
      narrative: {
        setting: 'You find an exciting email in your inbox claiming you\'ve won a MacBook Pro in a random draw.',
        urgency: 'medium',
      },
      environment: {
        senderName: 'Apple Rewards Team',
        senderEmail: 'rewards@apple-giveaway-official.org',
        subject: '🎉 Congratulations! You Won a MacBook Pro 16"!',
        body: `Dear Lucky Winner!

Your email was randomly selected from our database of Apple customers. You have won:

🎁 MacBook Pro 16" (M4 Max, 48GB RAM) — Value: $3,499

To claim your prize, please click below and provide your shipping address and a small processing fee of $29.99:

[CLAIM MY MACBOOK NOW]

This offer expires in 48 hours. Only 1 winner per draw.

Apple Customer Rewards
Cupertino, CA`,
      },
      choices: [
        { id: 'A', text: 'Click the link and pay the $29.99 processing fee — a MacBook for $30 is amazing!', isSafe: false, consequence: 'There is no MacBook. Your $29.99 is gone, and the page captured your full credit card details. You\'ll see fraudulent charges within days.' },
        { id: 'B', text: 'Delete the email immediately — Apple doesn\'t run email prize giveaways.', isSafe: true, consequence: 'Correct. Legitimate companies don\'t randomly email prizes with processing fees. You avoided a classic advance-fee scam.' },
        { id: 'C', text: 'Forward it to a friend to get their opinion first.', isSafe: false, consequence: 'Forwarding scam emails exposes others to the same threat. The link is malicious regardless of who clicks it.' },
      ],
      explanation: {
        bestPractice: 'You cannot win a contest you never entered. Legitimate prizes never require upfront "processing fees." Apple does not run random email giveaways.',
        redFlags: [
          'Sender domain "apple-giveaway-official.org" is NOT apple.com',
          'You never entered any Apple contest — you can\'t win one',
          'Small processing fee is designed to seem trivial compared to a $3,499 prize',
          '48-hour countdown creates urgency to prevent rational thinking',
        ],
      },
      timerSeconds: 45,
      xpReward: 80,
      hints: ['Did you ever enter a contest at Apple? And does Apple use "apple-giveaway-official.org"?'],
    },
  },

  // ── 18. WIFI / BLUETOOTH RISK (PREMIUM) ─────────────────────────────────────
  {
    module: 'Public WiFi Risks',
    title: 'Bluetooth File Transfer Request',
    description: 'Your phone receives an unexpected Bluetooth file transfer request at a conference.',
    difficulty: 2,
    environment_type: 'sms',
    is_premium: true,
    content_json: {
      narrative: {
        setting: 'You\'re at a tech conference. Your phone\'s Bluetooth is on for your smartwatch. You receive an unsolicited file transfer request.',
        urgency: 'low',
      },
      environment: {
        sender: 'Bluetooth',
        messages: [
          { from: 'system', text: 'Bluetooth: "ConferenceShare" wants to send you a file: "Speaker_Schedule_v2.pdf" (847 KB). Accept or Decline?' },
          { from: 'system', text: '⚙️ Your Bluetooth is set to "Discoverable" and "Accept All Files"' },
        ],
      },
      choices: [
        { id: 'A', text: 'Accept — it\'s probably the conference organizer sharing the updated schedule.', isSafe: false, consequence: 'The file contained Bluetooth-based malware. Once opened, it exploited a vulnerability to access your contacts, messages, and even your microphone.' },
        { id: 'B', text: 'Decline the transfer and set Bluetooth to "Non-discoverable" immediately.', isSafe: true, consequence: 'Correct. Unsolicited Bluetooth transfers should always be declined. You also disabled discoverability, preventing future attacks at the conference.' },
        { id: 'C', text: 'Accept but don\'t open the file — just saving it is safe.', isSafe: false, consequence: 'Some Bluetooth exploits execute during the transfer itself, not when opened. The malware was already active the moment the transfer completed.' },
      ],
      explanation: {
        bestPractice: 'Keep Bluetooth in "Non-discoverable" mode when not actively pairing. Never accept file transfers from unknown devices. Disable Bluetooth entirely when not needed.',
        redFlags: [
          'Unsolicited file transfer from an unknown device name',
          '"ConferenceShare" could be anyone — it\'s a self-assigned device name',
          'Bluetooth set to "Discoverable" and "Accept All" is extremely insecure',
          'Conference organizers use email or apps to share schedules, not Bluetooth',
        ],
      },
      timerSeconds: 45,
      xpReward: 110,
      hints: ['Do conference organizers typically share files via random Bluetooth transfers?'],
    },
  },

  // ── 19. SOCIAL ENGINEERING / PRETEXTING ──────────────────────────────────────
  {
    module: 'Social Engineering',
    title: 'The Survey From HR',
    description: 'You receive a link to an "anonymous employee satisfaction survey" from HR.',
    difficulty: 3,
    environment_type: 'email',
    is_premium: true,
    content_json: {
      narrative: {
        setting: 'An email from "HR" asks you to complete a mandatory anonymous survey. The link goes to a form asking for your employee credentials to "verify participation."',
        urgency: 'medium',
      },
      environment: {
        senderName: 'HR Department',
        senderEmail: 'hr-survey@yourcompany-forms.com',
        subject: 'Mandatory: Q4 Employee Satisfaction Survey — Complete by Friday',
        body: `Hi Team,

As part of our Q4 review, all employees are required to complete the anonymous Employee Satisfaction Survey.

To ensure only verified employees participate, you'll need to sign in with your company credentials before starting.

The survey takes approximately 5 minutes:
[Start Survey Now]

Please complete by end of day Friday.

Best regards,
Human Resources
Your Company Inc.`,
      },
      choices: [
        { id: 'A', text: 'Click the link and enter your company credentials — HR surveys are normal.', isSafe: false, consequence: 'The "survey" was a credential harvesting page. The attacker now has your company login. They sent this to 200 employees — 47 fell for it.' },
        { id: 'B', text: 'Contact HR directly via Slack or internal chat to verify this survey exists.', isSafe: true, consequence: 'HR confirmed they never sent this survey. You reported it to security, and they immediately warned the rest of the company. You prevented a mass credential theft.' },
        { id: 'C', text: 'Enter your credentials but change your password afterward just in case.', isSafe: false, consequence: 'Attackers use stolen credentials within minutes. By the time you changed your password, they\'d already accessed internal systems and exfiltrated data.' },
      ],
      explanation: {
        bestPractice: 'An "anonymous" survey that requires your login credentials is contradictory. Always verify unexpected HR communications through a separate channel. Report suspicious emails to security.',
        redFlags: [
          '"Anonymous survey" that requires employee credentials — contradictory',
          'Sender domain "yourcompany-forms.com" is not your company\'s real domain',
          '"Mandatory by Friday" creates urgency',
          'Real internal surveys use integrated platforms (Google Forms, SurveyMonkey) without requiring re-authentication',
        ],
      },
      timerSeconds: 60,
      xpReward: 150,
      hints: ['Can a survey be "anonymous" if it first requires you to log in with your credentials?'],
    },
  },

  // ── 20. MALWARE / QR CODE ───────────────────────────────────────────────────
  {
    module: 'Malware Downloads',
    title: 'The Restaurant QR Code Menu',
    description: 'A QR code at a restaurant redirects you to an unexpected page.',
    difficulty: 3,
    environment_type: 'browser',
    is_premium: true,
    content_json: {
      narrative: {
        setting: 'You\'re at a restaurant and scan the QR code on the table for the menu. Instead of a menu, the page asks you to download an app.',
        urgency: 'low',
      },
      environment: {
        url: 'http://restaurantmenu-app.site/download',
        isSecure: false,
        siteName: 'Digital Menu App — Required',
        brandLetter: '🍽',
        brandColor: '#e53935',
        pageTitle: 'Download Our Menu App to Order',
        ctaLabel: 'Download App (.apk)',
        subText: 'You must install our custom app to view the menu and place your order. This app is not on Google Play.',
      },
      choices: [
        { id: 'A', text: 'Download and install the APK — you need to order food.', isSafe: false, consequence: 'The APK was infested with spyware. It requested permissions for camera, microphone, contacts, and SMS — harvesting everything on your phone.' },
        { id: 'B', text: 'Don\'t download anything. Ask the waiter for a physical menu or the correct QR code.', isSafe: true, consequence: 'The waiter showed you the correct QR code — someone had placed a malicious sticker over the original one. You avoided installing malware.' },
        { id: 'C', text: 'Download it but review the permissions before installing.', isSafe: false, consequence: 'While reviewing permissions sounds safe, the mere act of downloading an unsigned APK from an unknown source is dangerous. Some exploits trigger on download, not install.' },
      ],
      explanation: {
        bestPractice: 'Never install APK files from unknown websites. Legitimate restaurant menus are web-based and don\'t require app downloads. If a QR code leads somewhere unexpected, don\'t interact — it may have been tampered with.',
        redFlags: [
          '"Not on Google Play" means it hasn\'t been vetted for malware',
          'A menu should be a webpage, not a downloadable app',
          'APK files can contain any code with any permissions',
          'QR codes on public surfaces can easily be replaced with malicious stickers (quishing)',
        ],
      },
      timerSeconds: 50,
      xpReward: 140,
      hints: ['Why would a restaurant menu require you to install an app that isn\'t on any app store?'],
    },
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data for clean re-seed
  await prisma.user_badges.deleteMany();
  await prisma.user_progress.deleteMany();
  await prisma.daily_challenges.deleteMany();
  await prisma.scenarios.deleteMany();
  await prisma.badges.deleteMany();

  for (const s of scenarios) {
    await prisma.scenarios.create({ data: s as any });
    console.log(`  ✓ ${s.title}`);
  }

  // Seed a daily challenge for today
  const firstScenario = await prisma.scenarios.findFirst({ where: { is_premium: false } });
  if (firstScenario) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.daily_challenges.create({
      data: {
        scenario_id: firstScenario.id,
        challenge_date: today,
        bonus_xp: 50,
      },
    });
    console.log(`  ✓ Daily challenge set: ${firstScenario.title}`);
  }

  console.log(`\n✅ Seeded ${scenarios.length} scenarios successfully.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

