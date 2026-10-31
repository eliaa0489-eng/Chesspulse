## ChessPulse

Your games, ratings and tactical patterns in one clean place — powered by real-time public match data and zero tracking.

**English** · [Deutsch](README.de.md)

ChessPulse brings your Rapid, Blitz and Bullet performance, win/loss ratios, accuracy trends and blunder patterns together in a calm, distraction-free interface. Enter any Chess.com username to analyze real match archives on demand — with no account registration, no passwords and no clutter.

## Highlights

<table>
  <tr>
    <td>📊 <b>Live profile stats</b><br>Click your player avatar for an instant breakdown of Rapid, Blitz and Bullet ratings, total games played and win/loss/draw ratios — pulled live without fake placeholders.</td>
    <td>📈 <b>Visual accuracy trends</b><br>Minimalist progress bars, tabular numerals and clean performance charts instead of dense text blocks.</td>
  </tr>
  <tr>
    <td>👑 <b>Apple / Stripe aesthetic</b><br>Pure alabaster surfaces, 1px hairline borders (<code>#E2E8F0</code>), custom Staunton King vector branding and emerald-green (<code>#059669</code>) highlights.</td>
    <td>📱 <b>Interactive showcase</b><br>Smooth Framer Motion transitions and an iPhone 16 Pro depth preview that flows directly into the 3-step workflow.</td>
  </tr>
  <tr>
    <td>⚡ <b>Zero-login lookup</b><br>Query any public Chess.com handle instantly. Switch profiles at any time with a single click.</td>
    <td>🛡️ <b>Proxy-guarded requests</b><br>All upstream API calls run through a server-side proxy with polite headers and automatic rate-limit protection.</td>
  </tr>
  <tr>
    <td>📲 <b>Mobile & PWA ready</b><br>Fully responsive on iPhone, iPad and desktop. Add it to your iOS home screen via Safari for a full-screen app experience.</td>
    <td>🧪 <b>Free public beta</b><br>All Pro analysis views and visual workflows are unlocked by default during the beta phase — no Stripe checkouts or paywalls.</td>
  </tr>
</table>

## Privacy by design

- **Zero credentials.** ChessPulse never asks for passwords, OAuth tokens or private account logins. It only reads public match archives.
- **Server proxy guard.** Browser requests never hit third-party servers directly. Our backend masks your client IP and attaches the required `User-Agent: ChessPulse-App/1.0` header.
- **Ephemeral RAM caching.** Upstream responses are cached in volatile server memory for 60 seconds strictly to prevent rate-limit blocks, then purged automatically. No permanent player database exists.
- **Local first preferences.** Your active handle and UI state live strictly in your browser's `localStorage` (`chesspulse_user`). One click on *Sign Out* clears everything.
- **Zero payment data.** No payment SDKs, credit card forms or tracking cookies are active.

## Two ways to run it

| | Local / Private (Mac, PC, iPad) | Cloud Deployment (Vercel) |
| :--- | :--- | :--- |
| **For** | Personal use on your own machine or home Wi-Fi | Accessing your instance from anywhere via HTTPS |
| **Install** | `npm install && npm run dev` | Connect your GitHub repo to Vercel (private or public) |
| **Sign-in** | None (enter any public Chess.com handle) | None (optional Vercel Password Protection) |
| **Data** | Volatile RAM cache + browser `localStorage` | Serverless functions + ephemeral edge cache |

### Local development & iPad / iPhone access

Clone the repository and start the development server (requires Node 20+):

```bash
git clone [https://github.com/DeinBenutzername/chesspulse.git](https://github.com/DeinBenutzername/chesspulse.git)
cd chesspulse
npm install
npm run dev
## License

ChessPulse is free software under the [GNU Affero General Public License v3.0 or later](LICENSE). You may use, study, change and share it. If you distribute a modified version or offer it as a network service, you must publish your source code under the same license.
