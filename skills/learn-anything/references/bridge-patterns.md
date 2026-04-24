# Bridge Patterns

How to build bridges between the learner's prior knowledge and new
material, and how to handle gaps without losing the main thread.

## Analogy anchors

- During `learner_assessment`, capture adjacent domains the learner
  already understands well. These are analogy anchors.
- When introducing a new concept, map it to the nearest anchor first,
  then refine.
- Prefer **structural** analogies (shared shape or causal pattern) over
  vague metaphors. "A queue is like a line at a bakery" is weak;
  "a queue preserves FIFO order the way an assembly line does" is
  structural.
- Declare when an analogy breaks down. Every analogy has a boundary
  (I6).

## Gap repair (governed by I2 and I4)

When a learner is blocked by a missing prerequisite:

1. Name the missing prerequisite explicitly. Do not repeat the blocked
   explanation with more words.
2. Push the current `{bundle, branch, return_point}` onto `resume_stack`.
   `return_point` is a short textual pointer: "resume at step 3",
   "continue with the boundary discussion".
3. Decide the exit mode **before** teaching the gap:

   - **Ordinary** — the gap is small (a paragraph or two). Teach the
     smallest unit that unblocks the main branch. Record bidirectional
     edges per I3. Pop the frame. Resume.
   - **Scaffold-only promotion** (I4) — the gap is large but the
     learner wants to stay on the main thread. Create the sibling
     bundle with `README.md` and an initial map. Record the `expansion`
     edge and inbound dependency. Pop the frame. Resume the original
     branch. The new bundle can be taught later.
   - **Teach-now promotion** (I4) — the gap is large and the learner
     wants to dive in. Create the sibling bundle. Keep the frame on
     `resume_stack`. Move `current_branch` to the new bundle. Continue
     teaching there. The frame stays until the learner returns.

4. Disclose the exit mode in the response body so the learner knows
   what just happened.

## What gap repair MUST NOT do

- Turn into a parallel course. A gap is a bridge, not a detour.
- Drift into the gap topic without either popping or promoting. This
  violates I2.
- Teach the gap topic deeply inside the main branch's file. Teach it
  in its own file or bundle, then link.
- Leave a one-way link. I3 requires bidirectional edges for every gap
  repair.

## When to promote (I4)

Promote the gap to a sibling bundle when any of:

- The gap has more than one internal main thread of its own.
- The gap will be referenced by more than one main topic.
- The gap cannot be explained in a few paragraphs.

Otherwise, handle as an ordinary gap inside the current bundle.

## Return discipline

- Every ordinary and scaffold-only gap repair ends with a pop and an
  explicit "returning to <bundle>/<branch> at <return_point>" statement
  in the response body.
- Every teach-now promotion ends with the frame still on
  `resume_stack`, shown in the Output Contract block, so both the
  learner and the model can see the pending return target.

See `invariants.md` for I2, I3, I4 in full.
