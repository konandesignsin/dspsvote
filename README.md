# Lumina Vote

Create a premium, luxury, futuristic House Election Voting Web App for our school. The UI should feel alive, immersive, vibrant and elegant, not like a static poster. Use advanced glassmorphism throughout the entire website with smooth transitions, floating particles, ambient glow effects, depth, and cinematic animations.

══════════════════════════════ SCHOOL HOUSE SYSTEM ══════════════════════════════

There are 4 houses:

🟡 Minotaur House (Yellow) 🔵 Kraken House (Blue) 🟢 Thunderbird House (Green) 🟠 Dragon House (Orange)

Voting roles:

COMMON ROLES (all students from every house can vote): • SPL (School Pupil Leader) • ASPL (Assistant School Pupil Leader)

HOUSE-SPECIFIC ROLES: • Captain (C) • Vice Captain (VC)

Example:

If a student belongs to Kraken House:

They can vote for:

• SPL candidates (common) • ASPL candidates (common) • Kraken Captain candidates only • Kraken Vice Captain candidates only

Captain and Vice Captain categories must automatically change according to the selected house.

══════════════════════════════ HOME PAGE ══════════════════════════════

Create a luxurious dark landing page with advanced glassmorphism.

Background should never be plain.

Use:

• Dark black and navy gradients • Aurora lighting effects • Blurred colored blobs • Slow moving gradient waves • Floating glow particles • Dynamic reflections • Ambient lighting • Cinematic depth

Add glowing house colors around the screen edges:

Top-left → Yellow glow (Minotaur) Top-right → Blue glow (Kraken) Bottom-left → Green glow (Thunderbird) Bottom-right → Orange glow (Dragon)

Center section should display four beautiful glass cards:

🟡 Minotaur 🔵 Kraken 🟢 Thunderbird 🟠 Dragon

Cards should:

• Float slightly • Lift on hover • Scale smoothly • Have reflections • Glow using their house color • Feel alive and interactive

Selecting a house redirects to its voting page.

══════════════════════════════ HOUSE LOCK SYSTEM ══════════════════════════════

After selecting a house, show a premium glass popup:

"Lock this computer to this house for the next students?"

Options:

✓ Enable Lock ✓ Continue Without Lock

Example:

Computer 1 → Kraken Computer 2 → Minotaur Computer 3 → Thunderbird Computer 4 → Dragon

IMPORTANT:

House locking must be LOCAL TO EACH DEVICE ONLY.

Use localStorage.

Never synchronize lock settings between browsers or computers.

A house lock on one computer should NEVER affect another computer.

Each computer must work independently.

When a vote is submitted:

If lock mode is ON:

• Automatically refresh • Return directly to that house page • Skip home page • Prepare for next voter

Add a small unlock button on the top-right corner.

══════════════════════════════ NO LOGIN SYSTEM ══════════════════════════════

Remove all authentication.

No login.

No account creation.

No sign in.

Students should directly access the voting system.

══════════════════════════════ VOTING PAGE ══════════════════════════════

Luxury dark glassmorphism theme.

Sections:

SPL

ASPL

Captain

Vice Captain

════════ SPL SECTION ════════

Theme:

Soft gold.

Features:

• Elegant gold glow • Premium atmosphere • Soft particles • Luxury card layout

Selected candidate:

• Enlarges smoothly • Golden glow intensifies • Checkmark appears • Pulse animation

════════ ASPL SECTION ════════

Theme:

Royal Purple.

Features:

• Purple glow • Smooth scale animation • Premium appearance

════════ CAPTAIN SECTION ════════

Theme uses house color.

Minotaur → Yellow

Kraken → Blue

Thunderbird → Green

Dragon → Orange

════════ VICE CAPTAIN SECTION ════════

Same as Captain section.

══════════════════════════════ CANDIDATE CARDS ══════════════════════════════

Each card should include:

• Candidate photo • Candidate name • House • Role • Symbol image • Glass card • Reflection effect • Dynamic shadow

Hover:

• Lift upwards • Glow increases • Smooth transition

Selected:

• Scale up • Border glow • Pulse effect • Selection indicator

Only one candidate can be selected per role.

══════════════════════════════ SUBMIT EXPERIENCE ══════════════════════════════

After pressing Submit:

Blur the background.

Show a luxurious glass popup.

Add:

• Floating spark particles • Dreamy atmosphere • Light trails • Magical glow

An animated glowing bird should slowly fly around the popup leaving soft glowing trails.

Display:

"Vote Submitted Successfully"

with smooth fade animation.

After a few seconds:

If lock mode is ON:

Return directly to that house.

Otherwise:

Return to home page.

══════════════════════════════ ADMIN PANEL ══════════════════════════════

No password.

No authentication.

Button located at bottom of page.

Theme:

Luxury black glassmorphism.

════════ ADD CANDIDATE ════════

Fields:

• Candidate Name • Role (SPL / ASPL / Captain / Vice Captain) • House • Candidate Photo • Symbol Image

════════ CANDIDATE MANAGEMENT ════════

Allow:

• Add candidate • Edit candidate • Delete candidate • Search candidate • Filter by role • Filter by house

════════ LIVE RESULTS ════════

Show:

• Total votes • Votes per house • Votes per role

════════ RESET ELECTION ════════

Reset button should show:

"Are you sure? This will erase all vote data."

Then clear all votes.

════════ EXPORT RESULTS ════════

Export as:

• Excel • CSV • PDF

════════ DASHBOARD ════════

Show:

• Total voters • Candidate count • House-wise vote count • Animated charts

══════════════════════════════ INTERACTIVE EFFECTS ══════════════════════════════

The website should constantly feel alive.

Add:

• Floating particles • Mouse parallax effects • Dynamic shadows • Glass reflections • Soft glow pulses • Breathing animations • Ripple click effects • Smooth page transitions • 60fps animations • Floating glass layers • Ambient color movements

Nothing should feel static.

══════════════════════════════ TECHNICAL REQUIREMENTS ══════════════════════════════

• Responsive design • Dark luxury theme • Advanced glassmorphism • Fast loading • Local storage support • Independent house lock per device • No login system • No admin password • Premium typography • Smooth animations • Professional UI/UX

The overall experience should feel like a futuristic premium operating system with cinematic depth and vibrant glassmorphism, creating a breathtaking election experience that students will remember, rather than a simple voting website.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://dspsvote.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/79a740d3-feaf-4b1f-83f2-38f682ce96b9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
