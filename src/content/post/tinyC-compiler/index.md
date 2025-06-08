---
title: "TinyC Compiler Making"
description: "Making your own TinyC compiler from scratch,using it to compiler your code"
publishDate: "15 November 2024"
draft: false
tags: ["compiler", "lexer", "parser","intermediate-representation","IR","AST","bison"]
---

## TinyC Compiler - Group Project
(Source Code: [TinyC Compiler](https://github.com/SumitKumar-17/CS39003_Compilers_Laboratory/tree/main/tinyC3))

So for our Compilers Laboratory , we started off with the basics — lexical analysis, parsing, and all that. At first, we did a few small assignments just to get the hang of things like tokenizing, writing grammars in LALR, making a AST,etc.

And finally, for the project, we had to build a full compiler (not for full C though). It was for a small subset of C, called tinyC.

## About Project
Basically, we wrote a compiler that could handle variable declarations, if-else, while, basic arithmetic and logical expressions, all in a simplified version of C.

## Implementation Details
We used Flex for the lexer, Bison for the parser, and then wrote our own logic to build the AST and generate Intermediate Representation (IR). We didn’t go all the way to machine code, but stopped at a 3-address IR style output.

## Complexity
What was tricky was managing the symbol table and proper scoping. Got a bit messy in nested blocks, but eventually we figured it out.

The writing of all the grammar rules into the Bison file felt more tiring than making the Abstract Syntax Tree code, as even missing a single rule of the grammar , produced a invalid tree which was hard to debug which rule is missed.

At the end my Bison file was alone of 2546 lines of rules!!

---

