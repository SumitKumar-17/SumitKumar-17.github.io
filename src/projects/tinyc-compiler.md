---
title: TinyC Compiler
date: 2024-11-15
repo: SumitKumar-17/CS39003_Compilers_Laboratory
topics: ["Compilers", "Flex/Bison", "C"]
lead: A compiler for a simplified subset of C, from lexer to a 3-address IR.
---

For our Compilers Laboratory, we started with the basics — lexical analysis, parsing, tokenizing, writing grammars in LALR, building an AST. Then, for the final project, we built a full compiler for a small subset of C, called **tinyC**: variable declarations, if-else, while, and basic arithmetic and logical expressions.

We used Flex for the lexer and Bison for the parser, then wrote our own logic to build the AST and generate an Intermediate Representation. We didn't go all the way to machine code, stopping at a 3-address IR-style output.

The trickiest part was managing the symbol table and proper scoping — it got messy in nested blocks before we figured it out. Writing all the grammar rules into the Bison file was more tiring than building the AST code itself: missing even a single grammar rule produces an invalid tree, and it's genuinely hard to debug which rule is missing. By the end, my Bison file alone was 2546 lines of rules.
