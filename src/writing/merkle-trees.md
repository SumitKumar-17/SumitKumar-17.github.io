---
title: "Merkle Trees, or How to Diff Two Trees Without Looking at Most of Them"
date: 2026-11-25
topic: Technology
lead:
  Cursor's writeup on secure codebase indexing sent me down a rabbit hole - one
  data structure turns "did anything change" from an O(n) question into an O(log
  n) one, and I'd been quietly relying on a version of it in my own project
  without ever naming it.
---

I was reading Cursor's blog post on
[secure codebase indexing](https://cursor.com/blog/secure-codebase-indexing).
They build a searchable index of your codebase so the agent can actually find
things, and a repo with tens of thousands of files can take hours to index from
scratch. Their fix for the common case - you already indexed this codebase
yesterday, or a teammate already indexed the one you just cloned - comes down to
one line: "The Merkle tree features a cryptographic hash of every file, along
with hashes of each folder that are based on the hashes of its children." That's
the whole trick. I'd used the shape of this idea before without ever calling it
by name, so I actually sat down and worked through why it's the right shape.

## The idea

A Merkle tree is a hash tree: hash every piece of data at the bottom (a file, a
chunk, a record), then hash _those hashes_ together in pairs going up, and keep
going until there's a single hash left at the top - the root. The root is a
fingerprint of everything underneath it. Change one byte in one file fifty
thousand files deep, and the root changes. Don't change anything, and the root
doesn't.

That alone isn't interesting - a single SHA-256 over the whole repo would also
change if anything changed. The interesting part is what happens when two roots
_don't_ match and you need to find out what's different:

![A Merkle tree over 8 files. Editing one file (c.go) only recomputes its own hash and the three ancestors on its path to the root, shown in orange. Verifying that edit against the root only needs the three sibling hashes marked in blue - not the other five files.](/assets/images/writing/merkle-tree.svg)

Editing `c.go` changes exactly one leaf hash, and exactly the hashes of its
ancestors on the way to the root - in an 8-file tree, that's 3 recomputed hashes
out of 11 total, not all 11. Cursor's post puts the general version of this
plainly: "Small client-side edits change only the hashes of the edited file
itself and the hashes of the parent directories up to the root of the codebase."
For a tree over N leaves, that's O(log N) hashes touched per edit, no matter how
large N gets. Compare two roots, see they differ, then walk down only into the
subtrees whose hashes disagree - you find every changed file while touching a
number of nodes proportional to the number of _changes_, not the number of
_files_. Their post calls this walking "only the branches where hashes differ,"
which is the whole payoff in one phrase.

## What that buys you in practice

Cursor's numbers, specifically for the case of a new teammate reusing someone
else's existing index instead of building one from scratch: median
time-to-first-query drops from 7.87 seconds to 525 milliseconds, p90 goes from
2.82 minutes to 1.87 seconds, and p99 goes from 4.03 hours down to 21 seconds.
The tree itself isn't what makes that reuse possible - a separate similarity
hash is what finds which teammate's index to borrow - but the tree is what lets
the client prove, after borrowing it, exactly which files its copy agrees with
and which it doesn't, without re-sending file contents to find out.

The bandwidth argument is the more intuitive one: "In a workspace with fifty
thousand files, just the filenames and SHA-256 hashes add up to roughly 3.2
MB" - and that's the cost of listing everything flatly, which is what you'd
otherwise resend on every sync to let the server figure out what changed. The
tree replaces "resend the full listing, every time" with "resend the parts of
the tree that actually moved."

## Proving you have a file, without sending it

The part of Cursor's design I found genuinely clever is the one for privacy, not
performance. When your client wants to borrow a teammate's index as a starting
point, the server can't just hand over search results for files you don't
actually have - that would leak code you have no business seeing. Their fix:
"Each node in the tree is a cryptographic hash of the content beneath it. You
can only compute that hash if you have the file." Your client uploads its Merkle
tree (just hashes, not contents), and the server checks every search result's
path against your tree before returning it: "If the client can't prove it has a
file, the result is dropped." You get a tree of hashes in, a provable subset of
results out, and the server never needed your actual file contents to make that
call. That's a Merkle proof doing access control, not just change detection -
same data structure, different job.

The post doesn't spell out the hash function for internal nodes or the exact
byte layout, so I won't pretend I know Cursor's implementation precisely. What's
below is my own version of the same idea, built to understand it, not a
reproduction of theirs.

## You've probably already met this idea

If you've ever run `git status` and wondered why it's fast even on a huge repo:
a Git commit is a hash of a tree object, which is a hash of blob hashes and
other tree hashes, all the way down. Two commits with an identical subdirectory
point at the literal same tree hash, so Git never has to look inside it to know
nothing changed there. It's a Merkle tree wearing different clothes.

I'd actually leaned on the same idea already, before reading Cursor's post,
without putting a name to it: [TimeFS](/projects/timefs), the versioned
filesystem I built, stores every object - blob, file, tree, commit - named by
its BLAKE3 hash, with only the tiny mutable refs pointing into that immutable
graph. A snapshot there is cheap for exactly the same reason Cursor's sync is
cheap: unchanged subtrees share a hash with the previous commit, so nothing
underneath them needs to be touched, read, or resent. Same shape, two unrelated
reasons to want it - one for not re-uploading a codebase, one for not re-copying
a filesystem.

Past that, it's the same primitive behind Certificate Transparency logs (prove a
certificate is in a public log without downloading the whole log), BitTorrent
and IPFS (address content by its hash and verify each chunk as it arrives),
DynamoDB-style anti-entropy repair between replicas (compare subtree hashes
instead of every key), and the block headers in Bitcoin (an SPV client verifies
one transaction against a block without downloading the whole block).

## Building one

Here's a small, complete version in Go: build a tree over a list of byte slices,
get the root, generate a proof that one leaf belongs under that root, and verify
that proof using only the leaf, the proof, and the root - no access to the rest
of the tree required.

```go
package main

import (
	"bytes"
	"crypto/sha256"
)

type Tree struct {
	levels [][][]byte // levels[0] = leaves, last level = [root]
}

func leafHash(data []byte) []byte {
	h := sha256.Sum256(append([]byte{0x00}, data...))
	return h[:]
}

func nodeHash(left, right []byte) []byte {
	buf := append([]byte{0x01}, left...)
	buf = append(buf, right...)
	h := sha256.Sum256(buf)
	return h[:]
}

func Build(leaves [][]byte) *Tree {
	level := make([][]byte, len(leaves))
	for i, d := range leaves {
		level[i] = leafHash(d)
	}
	levels := [][][]byte{level}
	for len(level) > 1 {
		var next [][]byte
		for i := 0; i < len(level); i += 2 {
			if i+1 == len(level) {
				next = append(next, level[i]) // odd one out: promote, don't duplicate
			} else {
				next = append(next, nodeHash(level[i], level[i+1]))
			}
		}
		levels = append(levels, next)
		level = next
	}
	return &Tree{levels: levels}
}

func (t *Tree) Root() []byte { return t.levels[len(t.levels)-1][0] }

type ProofStep struct {
	Hash    []byte
	IsRight bool // sibling sits to the right of our running hash
}

func (t *Tree) Proof(index int) []ProofStep {
	var proof []ProofStep
	for _, level := range t.levels[:len(t.levels)-1] {
		if index%2 == 0 {
			if index+1 < len(level) {
				proof = append(proof, ProofStep{Hash: level[index+1], IsRight: true})
			}
		} else {
			proof = append(proof, ProofStep{Hash: level[index-1], IsRight: false})
		}
		index /= 2
	}
	return proof
}

func VerifyProof(leaf []byte, proof []ProofStep, root []byte) bool {
	running := leafHash(leaf)
	for _, step := range proof {
		if step.IsRight {
			running = nodeHash(running, step.Hash)
		} else {
			running = nodeHash(step.Hash, running)
		}
	}
	return bytes.Equal(running, root)
}
```

I ran this against a 5-file tree before trusting it enough to write about it.
Every real leaf verifies against the root; a tampered leaf doesn't; and editing
one of the five files changes exactly 4 of the 11 total node hashes in the
tree - one per level, the edited leaf's ancestor chain, nothing else. That last
check is the whole blog post, reduced to one assertion.

## Two ways to get this wrong

**Hashing leaves and internal nodes the same way is a real vulnerability, not
just untidy code.** If `hash(leaf)` and `hash(left + right)` can collide -
meaning some pair of child hashes happens to equal some single leaf's raw
bytes - an attacker can forge a leaf that verifies as an internal node, or vice
versa. This is exactly why my `leafHash` and `nodeHash` above prefix their input
with a different constant byte (`0x00` vs `0x01`) before hashing: it's the fix
RFC 6962 (Certificate Transparency) uses for the same reason, and it's cheap
enough that there's no excuse to skip it. Bitcoin's original tree didn't do this
consistently for its odd-leaf duplication case, which is exactly the class of
bug behind CVE-2012-2459.

**The two sides have to agree on leaf order, or they'll compute different roots
for identical content.** A Merkle tree has no notion of "the file called `c.go`"
baked into it - it only knows "leaf index 2." If the client sorts files one way
and the server sorts them another, their roots will never match even when every
file is byte-identical, and you'll spend a while debugging a "diff" that's
actually just a canonicalization bug. File paths give you a natural, stable sort
key for exactly this reason.

Merkle trees aren't a clever trick so much as a direct consequence of one fact:
a hash is cheap to produce and nearly free to compare, and if you nest them the
cheapness and the free comparison both carry up every level, all the way to a
single number that stands in for everything beneath it.

Sources: Cursor's
[secure codebase indexing](https://cursor.com/blog/secure-codebase-indexing)
post, which started this; Ralph Merkle's original 1979 patent,
["Method of providing digital signatures"](https://patents.google.com/patent/US4309569A/en),
where the tree comes from; and
[RFC 6962](https://datatracker.ietf.org/doc/html/rfc6962) (Certificate
Transparency), which is where the leaf/node domain-separation fix above comes
from.
