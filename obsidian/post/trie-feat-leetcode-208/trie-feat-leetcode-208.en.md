---
title: Trie - feat. LeetCode 208. Implement Trie
summary: re"trie"val
date: 2026-07-02T06:16:59.135Z
tags:
  - trie
category: algorithm
draft: false
lastmod: 2026-07-03T17:20:37+09:00
---
A summary of Tries, written while solving the LeetCode 208: Implement Trie problem. 

A Trie is a **tree-based data structure specialized for string search**. The name is derived from “re**trie**val (search),” and it is frequently used in problems requiring prefix search.
The simplest way to store strings is to use an array or a hash map.

For example, consider an autocomplete feature.

```
"algori"  →  algorithm, algorithm problems, how to study algorithms ...
```
The simplest approach to implementing this feature is linear search, where all words are stored in an array and compared one by one.

```
From ["apple", "app", "april", "apply", ...],
select only words starting with "app" → check them all by iterating through the list
```

This wouldn’t be a problem if there were only 10 words, but what if there are hundreds of thousands of words registered in the dictionary? Scanning the entire list every time a search term is entered would be too slow.

**What about a HashMap?** If you store the entire word in a HashMap, the problem can be solved in O(1) time complexity. However, a HashMap can only find exact matches. What if you want to find all words that start with the prefix “app”? You’d have no choice but to iterate through the entire list again.

This is where the idea of a **Trie** comes in.

| Method | Search | Prefix Search |
| ---------- | ---------- | --------------------- |
| Array + Linear Search | O(N * L)   | O(N * L) |
| Hash Map | O(L) (average) | O(N * L) |
| **Trie**   | **O(L)**   | **O(L)** |
> N = number of stored words, L = string length

The key point is that **a Trie maintains O(L) complexity even for prefix searches**.

---

A Trie is a tree structure composed of interconnected nodes. The key differences from a regular tree are as follows.

- **Regular Tree**: Stores the entire data (a single word) in a single node.
- **Trie**: Stores only **one character** per node.

A trie node typically contains two types of information.

| Field | Role |
| ---------- | -------------------------- |
| `Children` | References to child nodes linked to the next character  |
| `IsEnd`    | A flag indicating whether this node is the end of a word |

For example, if the two words `"app"` and `"apple"` are stored in a trie, the structure looks like this:

```
 (Root)
 |
 a
 |
 p
 |
 p  ← IsEnd = true  ("app" completed)
          |
 l
 |
 e  ← IsEnd = true  ("apple" complete)
```
Since `"app"` and `"apple"` share the prefix `"app"`, there are no duplicate nodes for that segment. This is a key feature of a trie.

The three most basic operations of a trie are as follows. 

**Insert**
1. Start at the root node.
2. Check for child nodes in order, starting with the first letter of the word.
    - If none exist: Create and add a new node.
    - If there is one: Move to that node.
3. When you reach the last character of the word, set the node’s `IsEnd` to `true`.

**Search**

1. Start at the root node.
2. Traverse the tree following the characters of the word.
    - If there are no child nodes along the way → return `false`.
3. When you reach the end of the word, return the value of `IsEnd`.

**StartsWith (Prefix Search)**

1. Traverse down the word (prefix) in the same way as Search.
2. Check only whether the end of the word has been reached. Do not check `IsEnd`.
    - In other words, if even one word begins with the given prefix, return `true`.

The existence of `StartsWith` is the key feature that distinguishes a trie from an array or a hash map. It allows us to determine whether a word exists in O(L) time based solely on the prefix.

Below is my Go implementation of [LeetCode Problem 208](https://leetcode.com/problems/implement-trie-prefix-tree/description/). 

```go
type TrieNode struct {
    Children map[rune] *TrieNode
    IsEnd bool
}

func NewTrieNode() *TrieNode {
    return &TrieNode {
 Children: make(map[rune]*TrieNode),
 IsEnd: false,
    }
}

type Trie struct {
    Root *TrieNode
}

func Constructor() Trie {
    return Trie{
    Root: NewTrieNode(),
    }
}

func (this *Trie) Insert(word string) {
    current := this.Root

 for _, char := range word {
 if _, exists := current.Children[char]; !exists {
 current.Children[char] = NewTrieNode()
 }

 current = current.Children[char]
    }

    current.IsEnd = true
}

func (this *Trie) Search(word string) bool {
    current := this.Root

 for _, char := range word {
 if nextNode, exists := current.Children[char]; exists {
            current = nextNode
 } else {
 return false
 }
    }

 return current.IsEnd
}

func (this *Trie) StartsWith(prefix string) bool {
    current := this.Root

    for _, char := range prefix {
 if nextNode, exists := current.Children[char]; exists {
 current = nextNode
 } else {
 return false
 }
    }

 return true
}


/**
 * Your Trie object will be instantiated and called as follows:
 * obj := Constructor();
 * obj.Insert(word);
 * param_2 := obj.Search(word);
 * param_3 := obj.StartsWith(prefix);
 */
```

Since a Trie can perform prefix searches in O(L) time, it is useful in situations such as the following.

**Autocomplete**

It must find and suggest all words that begin with the prefix entered by the user. A trie uses `StartsWith` to check for the presence of a prefix, then traverses all `IsEnd` nodes under that node to return a list of candidates. While a hash map must iterate through the entire list of words, a trie only needs to search the subtree corresponding to the prefix.

**Spell Checker**

Used to quickly verify whether a given word exists in a dictionary. The `Search` operation can be performed in O(L) time, and the more words registered in the dictionary, the more efficient it becomes compared to arrays or hash maps. Trie traversal is also often used when implementing recommendations for similar words (based on Levenshtein distance).

**IP Routing (Longest Prefix Match)**

When routing IP addresses in a network, the longest matching prefix with the destination IP must be found. Tries are used in the form of binary trie or Patricia trie and are optimized for prefix-based longest match searches.

Tries are data structures that shine brightest in string search scenarios, particularly when **prefix search** must be solved in O(L) time. They store only one character per node and sacrifice space in exchange for search efficiency by sharing common prefixes. To summarize the differences from the data structures discussed earlier:

| Data Structure | Search | Prefix Search | Major Drawbacks |
| ---------- | ---------- | -------- | ------------ |
| Array + Linear Search | O(N·L)     | O(N·L)   | Slow search |
| Hash Map | O(L) | O(N·L)   | Cannot perform prefix search |
| **Trie**   | **O(L)**   | **O(L)** | High memory usage    |

- **Is prefix search required?** → Trie
- **Is only an exact match required?** → HashMap
- **Is the dataset small?** → An array is sufficient

If you have time, I recommend trying the problems below as well. 

LeetCode 208. [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/)
LeetCode 1268. [Search Suggestions System](https://leetcode.com/problems/search-suggestions-system/)
