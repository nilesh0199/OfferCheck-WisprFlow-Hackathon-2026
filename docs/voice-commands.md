# Voice and Typed Commands Reference

OfferClara is built for students, graduates, and job seekers who prefer to type or dictate. OfferClara **never** requests microphone permissions or executes speech-to-text algorithms inside the browser. Instead, it accepts text delivered by any operating system dictation tool or speech application (such as Wispr Flow, Apple Dictation, Windows Voice Typing, or mobile dictation), as well as standard keyboard input.

The docked Command Box provides hands-free navigation across the site without cluttering the screen or requiring complex interaction modes.

---

## Command Box Behavior

- **Optional Toggle:** Positioned immediately left of the theme toggle in the top bar (`Commands` label at $\ge 1100$px; prompt-style `>_` icon below 1100px) and in the mobile sidebar below 640px (`Command bar: on/off`). The toggle state lives in volatile tab memory only (default ON at $\ge 768$px, OFF below 768px). When toggled OFF, the command bar, dock offset, and shortcuts are completely unmounted and inert. Turning ON displays the bar and focuses the input.
- **Docked Input:** Positioned at the bottom of the viewport (`max-w-[min(480px,94vw)]`). Contains a decorative microphone icon, an input box with the placeholder `Dictate a command`, a decorative `Press / to start` shortcut badge, and a button labelled `What can I say?`.
- **Dock Offset:** Sets `--dock-offset` dynamically on `:root` to (bar height + 16px) when rendered (72px) and `0px` when toggled off. All main containers apply `padding-bottom: calc(var(--dock-offset) + env(safe-area-inset-bottom) + 1rem)` and bottom-fixed controls position themselves via `bottom: calc(var(--dock-offset) + env(safe-area-inset-bottom))` so the bar never overlaps content.
- **Recognised Command:** When a command is recognised, a status line displays above the input: `Running <label>... (press space bar to cancel)`.
  - The 1-second countdown counts down in seconds.
  - Pressing `Space` or clicking `Cancel` cancels execution, clears the text, and returns a clean, focused input.
  - Pressing `Enter` runs the command immediately without waiting for the timer.
  - After executing a recognised navigation command, the input keeps focus and the text is cleared so dictation can continue.
- **Unrecognised or Long Text:** If the input does not match a command or exceeds 80 characters, OfferClara immediately clears the input, reads out via `aria-live="polite"`: `"That command isn't recognised. Try again, or open the list of commands."`, and visually highlights the `What can I say?` button.
- **Page Context Checks:** If a command designed for the check page (such as `next`, `back`, or `step 3`) is uttered while on another route (such as `/` or `/about`), the input is cleared and the notice displays: `"That command works on the check page."`
- **Help Panel:** Clicking `What can I say?` opens an accessible dialog categorised into Anywhere and On check page commands, closing with the guidance:
  *"OfferClara does not use your microphone. Use Wispr Flow or any dictation tool to type into this box. To enter your offer or your question, click that text box and dictate there."*

---

## Supported Commands

### 1. Anywhere Commands

Available from any page in the application:

| Command Phrase | Natural Synonyms / Dictation Examples | Action |
| :--- | :--- | :--- |
| **Open sidebar** | `open sidebar`, `open menu`, `show sidebar`, `show menu` | Opens the slide-over navigation dialog |
| **Close sidebar** | `close sidebar`, `close menu`, `hide sidebar`, `hide menu` | Closes the slide-over navigation dialog |
| **Home** | `home`, `homepage`, `landing`, `welcome` | Navigates to `/` |
| **Check an offer** | `check an offer`, `check offer`, `check`, `start check`, `check tool` | Navigates to `/check` |
| **Clear doubt with AI** | `ask`, `ask a doubt`, `clear doubt`, `clear my doubt`, `ask ai`, `doubt` | Navigates to `/ask` |
| **Help and reporting** | `help and reporting`, `resources`, `help`, `reporting`, `official resources` | Navigates to `/resources` |
| **About** | `about`, `who made this`, `about offerclara`, `about tool` | Navigates to `/about` |
| **Privacy** | `privacy`, `privacy policy`, `data privacy`, `data policy` | Navigates to `/privacy` |
| **How it works** | `how it works` | Navigates to landing section `/#how-it-works` |
| **What you get** | `what you get` | Navigates to landing section `/#what-you-get` |
| **FAQ** | `faq`, `frequently asked questions`, `questions and answers` | Navigates to landing section `/#faq` |
| **I already paid** | `i paid`, `i already paid`, `already paid`, `i have paid`, `i paid money` | Navigates directly to `/resources#already-paid` |

---

### 2. On Check Page Commands (`/check`)

Available when using the review intake wizard or viewing review findings:

| Command Phrase | Natural Synonyms / Dictation Examples | Action |
| :--- | :--- | :--- |
| **Next** | `next`, `next step`, `continue`, `proceed`, `go next` | Advances to next intake step |
| **Back** | `back`, `previous`, `previous step`, `go back` | Returns to previous intake step |
| **Skip** | `skip`, `skip step`, `skip this step` | Skips optional intake step (Steps 2–4) |
| **Step 1** | `step 1`, `step one`, `offer`, `offer step`, `offer text`, `first step` | Jumps to Step 1: Offer |
| **Step 2** | `step 2`, `step two`, `source`, `source step`, `channel`, `second step` | Jumps to Step 2: Source |
| **Step 3** | `step 3`, `step three`, `conversation`, `conversation step`, `what was said` | Jumps to Step 3: Conversation |
| **Step 4** | `step 4`, `step four`, `money and documents`, `money`, `payment`, `documents` | Jumps to Step 4: Money and documents |
| **Step 5** | `step 5`, `step five`, `review step`, `final step`, `last step` | Jumps to Step 5: Review |
| **Analyse** | `analyse`, `analyze`, `run review`, `review offer`, `start review`, `check it` | Starts review if input exists; otherwise notifies *"Add your offer first."* |
| **Overview** | `overview` | Scrolls to review findings summary |
| **Observations** | `observations`, `flags`, `concerns`, `findings` | Scrolls to Observations section |
| **Missing details** | `missing details`, `what's missing`, `whats missing`, `missing info`, `gaps` | Scrolls to Missing details checklist |
| **Questions** | `questions`, `checks`, `questions and checks`, `verification questions` | Scrolls to Questions and checks |
| **Company research** | `company research`, `company check`, `research`, `research the company` | Scrolls to Company research card |
| **Resources** | `resources`, `advisories`, `official advisories` | Scrolls to Resources section |
| **Your text** | `your text`, `my text`, `original text`, `offer snapshot` | Scrolls to Your text section |
| **Edit my answers** | `edit my answers`, `edit answers`, `edit text`, `edit offer` | Opens editing mode for previously submitted text |

---

## Spoken Filler Stripping

OfferClara's matcher normalizes spoken dictation by stripping leading conversational phrases (`please`, `can you please`, `could you please`, `hey`, `just`, `take me to`, `go to`, `show me`, `open`) and trailing filler words (`please`, `now`, `for me`, `page`, `section`) before evaluating targets. Punctuation and letter case are normalized automatically.
