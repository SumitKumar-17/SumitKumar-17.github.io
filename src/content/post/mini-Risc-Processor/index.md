---
title: "Mini RISC Processor"
description: "Making your own Processor module using Verilog, Testing it on a FPGA"
publishDate: "15 November 2024"
draft: false
tags: ["processor","RISC"]
---

## Mini RISC Processor - Group Project  
(Source Code: [Mini RISC Processor](https://github.com/SumitKumar-17/CS39001_Computer_Organization_Laboratory/tree/main/lab_17))

As part of the Computer Organization Laboratory course (CS39001), we implemented a Mini RISC Processor from scratch using Verilog HDL,even tested on Arty S7-100 FPGA board.
The processor supports a basic RISC-style instruction set with essential components like an ALU, register file, instruction memory, and data memory.

## Implementation Details

We designed the datapath and control path following a modular approach, allowing clear separation between instruction decode, execution, memory access, and write-back stages. Our processor handles arithmetic operations, memory load/store, and control flow instructions like branches and jumps.

The project involved:
- Writing testbenches to verify individual modules (ALU, Control Unit, Register File)
- Simulating and debugging using Xilinx Vivado
- Integrating modules into a pipelined architecture
- Handling hazard detection and adding basic forwarding to improve execution

## My Experience

After finally getting this project to work, I was like — **Damn, we actually made a working processor**.

I wrote my own ALU, my own BRAM setup, handled control signals, pipelined stages — and it all ran. For testing, I even wrote Booth's multiplication and loaded the full program into an Arty S7-100 FPGA board. Watching it work on hardware felt awesome.

It was such a cool learning curve — figuring out how these complex systems actually run at the signal level. Every small component had to be just right or the whole thing wouldn’t boot.

This project really made the inner workings of a processor click for me. Writing code that maps to gates and wires, and then running it on silicon, was something else.

---

