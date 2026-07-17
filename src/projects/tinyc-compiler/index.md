---
title: TinyC Compiler
date: 2024-11-15
repo: SumitKumar-17/CS39003_Compilers_Laboratory
topics: ["Compilers", "Flex/Bison", "C"]
lead: A compiler for a simplified subset of C, from lexer to a 3-address IR.
---

Compilers Laboratory started innocently enough - lexical analysis, parsing, tokenizing, writing grammars in LALR, building a first tiny AST as a warm-up assignment. Then came the real project: build a full compiler, front to (almost) back, for a simplified subset of C we called **tinyC** - variable declarations, if-else, while loops, and arithmetic/logical expressions.

The pipeline: **Flex** for the lexer, **Bison** for the parser, then hand-written logic to walk the parse tree into an AST and lower that into a proper **3-address Intermediate Representation**. We stopped short of generating actual machine code, but by the time you have clean 3-address IR, you're most of the way to understanding how a real compiler thinks.

## Where it actually got hard

Two things ate almost all the time:

**Scoping.** Managing the symbol table correctly across nested blocks turned into a genuine mess before it clicked. Variable shadowing, scope entry/exit, lookup order - all the stuff that's invisible when you're *using* a language and very visible when you're *implementing* one.

**The grammar file, not the AST.** Counter to what I expected going in, writing the Bison grammar rules was more exhausting than writing the AST-construction code. Miss a single rule, and Bison doesn't fail loudly - it just produces a subtly wrong parse tree, and tracking down *which* rule is missing from a silently-malformed tree is genuinely brutal debugging. By the time the project was done, my `.y` grammar file alone had grown to **2,546 lines of rules**.

Watching a chunk of actual C-like source go in one end and come out the other as clean 3-address IR - variables resolved, scopes correct, control flow lowered - is one of those moments where a compilers course stops being abstract and starts being real.
