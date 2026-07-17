---
title: Mini RISC Processor
date: 2024-11-15
repo: SumitKumar-17/CS39001_Computer_Organization_Laboratory
topics: ["Verilog", "FPGA", "Computer Architecture"]
lead: A pipelined RISC-style processor written in Verilog and run on real FPGA hardware.
---

There's a specific kind of disbelief that hits when a chip you designed on paper actually boots. That's where this project ended up: a Mini RISC Processor, written from scratch in Verilog HDL for the Computer Organization Laboratory course, and tested for real on an Arty S7-100 FPGA board - not just simulated.

The processor implements a basic RISC-style instruction set with its own ALU, register file, instruction memory, and data memory, all wired together into a genuine **pipelined** datapath - instruction decode, execution, memory access, and write-back as cleanly separated stages, handling arithmetic ops, memory load/store, and control-flow instructions like branches and jumps.

## Getting from paper to silicon

None of it works on the first try, obviously. Getting there meant:

- Writing testbenches to independently verify the ALU, control unit, and register file before ever wiring them together
- Simulating and debugging every stage in Xilinx Vivado, one waveform at a time
- Integrating the verified modules into the full pipelined architecture
- Adding hazard detection and basic forwarding once the naive pipeline started producing wrong answers on back-to-back dependent instructions

I wrote my own ALU, my own BRAM setup, and handled the control signals for every pipeline stage myself. For a real stress test, I implemented a **Booth's multiplication** routine and loaded the full program onto the physical FPGA board - not the simulator.

Watching something that had only existed as gates and wires on a schematic actually execute instructions on real hardware is a different kind of understanding than passing a testbench. Every component had to be *exactly* right, or the whole pipeline simply refused to boot - and getting it to boot anyway is what made the internals of a processor finally click.
