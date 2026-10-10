# scheduling proof adaptation: three machines to four

> [!WARNING]
> i'm not a mathematician and i dont really know what im doing here. this is for fun, education and exploration. Fable 5.1 and GPT6 Astra helped with the analysis and the changes for four machines. please check the assumptions yourself, my reading of them could be wrong

## what this repo is

this repo takes the three-machine Lean scheduling development and updates it for four machines. the jobs each take one slot, and they can have dependencies - one job has to finish before another can start. we want to get all the jobs done in the fewest slots

the first commit is the upstream source, unchanged. the second has the changes for four machines, all together so you can see what actually depends on the number of machines

for a file by file explanation see [CHANGELOG.md](CHANGELOG.md). or start at `Feasible` in [Model.lean](OAI/Computability/Scheduling/Model.lean). thats the definition of a valid schedule, and the rest of the diff follows it into the slots, the solver, the correctness proofs and the cost estimates

lets take four jobs with no dependencies. with four machines they can all run at once. a solver that gives us two slots has given us a valid schedule, sure, but its missed the one-slot answer. checking that the output is valid doesnt cover that. we also need completeness, so when a schedule fits a deadline the solver can find one

ps: the names `ThreeMachine` and `Triple` are intentional. changing those would add a bunch of naming diffs without helping explain the change to four machines

## upstream and building

there are 53 scheduling files in the baseline, from `openai/math`. this was upstream HEAD when retrieved on 2026-10-08, pinned here to `fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb`

https://github.com/openai/math/tree/fd4aeeb2ee4fc729c18d98444fed42fd0529eeeb/lean/OAI/Computability/Scheduling

the copy drops the `lean/` prefix. toolchain and license are from upstream, as is the Mathlib pin. the Lake config is smaller since we only want to build this library and its Mathlib dependency

```sh
lake exe cache get
lake build OAI.Computability.Scheduling.Main
```

`OAI.ThreeMachine.main_theorem` is still the entry point. the name says three, but `Feasible` in this version allows four jobs in each time slot

## could this work for other machine counts?

maybe? the existing injection argument gives us a bound on surviving entries from the size of a boundary slot. adding the two special entries suggests `m + 2` for the list. enumerating the slots suggests `n^m`. so making capacity a parameter seems worth a look

theres a catch with the budgets though. for four machines we have six entries, with up to 29 description leaves each. `6 * 29 = 174`, so we still fit in the old allowance of 195. we can't assume that stays true as the lists and descriptions grow. this repo only does `m = 4`, the other counts would need the same care with these bounds

note: I used Fable 5.1 and GPT6 Astra for this and am learning as I go. the explanations might be wrong, and so might my understanding of the formal statement. Lean checks the proof against the statements and dependencies in the code, it doesnt check my interpretation of the scheduling problem

also by other counts I mean fixed `m`. if the degree of a polynomial depends on `m`, giving `m` as an input is a different matter. nothing built here establishes that extension. if you know this stuff, a review of the spec and changes would be very welcome
