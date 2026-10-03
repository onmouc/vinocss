# Error

How to respond when something fails while working.
Read when a command, a test, or a build reports an error.

## Diagnose

1. Read the message before changing anything, and treat it as a fact.
2. Trace it to the cause, not to the line that reported it.
3. Check the earlier code first, including the code just written;
   a failure often exposes a wrong assumption behind it.
4. When the failed step came from a guide, check that guide too;
   the path, flag, or command it named may not exist.
5. Say what the cause is before you fix it or suggest a fix.

An error is evidence about the code, not an obstacle to silence.
A fix that only hides the message can leave the real fault in place,
so find the cause before you reach for a change.

## Fix

1. Fix an obvious error directly, without asking.
2. Obvious means the cause is clear, the fix is narrow, and it stays inside the current task.
3. Keep the fix minimal, and change only what the error requires.
4. Re-run the failing command, then the gate in [review](./review.md), once the fix lands.

## Suggest

1. Suggest a fix, and leave the decision to the user, when it may have a side effect.
2. A fix that touches code outside the task, changes shared behavior,
   or trades one error for another is a suggestion, not a change.
3. Flag earlier code that looks wrong, even when it is not the current task,
   instead of working around it.
4. Name the guide a flawed approach conflicts with, as [question](./question.md) says.
5. Follow the user's choice once it is made.

## Guides

1. A failure usually points at the code, but it can instead come from the guide a step followed.
2. A guide that names a path, flag, or command that does not exist is a real bug, not a dead end.
3. Name the guide and the broken step before changing either, and trace what led the step to run.
4. Fix the guide with the code once the user agrees, as [question](./question.md) says.
5. Do not force a broken step to work; correct the source of the error.

A wrong guide sends every later step down a false path.
The missing file or flag is then the guide's bug to fix,
not an obstacle to route around, so correct the guide along with the task.

## Report

1. State the cause, the fix or suggestion, and what you verified.
2. Report a failure even when the current task's own output looks fine.
3. A fix that is really a guess: say so, and let the user decide.
