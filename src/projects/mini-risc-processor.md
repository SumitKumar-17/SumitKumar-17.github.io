---
title: Mini RISC Processor
date: 2024-11-15
repo: SumitKumar-17/CS39001_Computer_Organization_Laboratory
topics: ["Verilog", "FPGA", "Computer Architecture"]
lead: A pipelined RISC-style processor written in Verilog and run on real FPGA hardware.
---

As part of the Computer Organization Laboratory course, we implemented a Mini RISC Processor from scratch using Verilog HDL, tested on an Arty S7-100 FPGA board. The processor supports a basic RISC-style instruction set with an ALU, register file, instruction memory, and data memory.

We designed the datapath and control path with a modular approach, cleanly separating instruction decode, execution, memory access, and write-back stages, and handling arithmetic operations, memory load/store, and control-flow instructions like branches and jumps. That meant writing testbenches to verify individual modules, simulating and debugging in Xilinx Vivado, integrating everything into a pipelined architecture, and handling hazard detection with basic forwarding.

After finally getting it to work, I wrote my own ALU, my own BRAM setup, handled control signals and pipeline stages — and it all ran. I even wrote a Booth's multiplication routine and loaded the full program onto the FPGA board. Watching it execute on real hardware, after everything had only existed as gates and wires on paper, was something else — this project made the inner workings of a processor click for me in a way no course ever had.
