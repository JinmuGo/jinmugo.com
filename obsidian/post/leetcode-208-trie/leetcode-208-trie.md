---
title: 트라이(Trie) - feat 208. Implement Trie
summary: re"trie"val
date: 2026-07-02T06:16:59.135Z
tags:
  - trie
category: algorithm
draft: false
lastmod: 2026-07-03T16:07:39+09:00
series: leetcode
seriesOrder: 1
---
leetcode 208. Implement Trie 문제를 푸는김에 정리해보는 Trie

트라이(Trie)는 **문자열 탐색에 특화된 트리 기반의 자료구조**다. "re**trie**val(검색)"에서 이름을 따왔으며, 접두사(prefix) 검색이 필요한 문제에서 자주 사용된다.
문자열을 저장하는 가장 단순한 방법은 배열이나 해시맵을 사용하는 것이다.

예를 들어, 자동완성 기능이 있겠다.

```
"알고리"  →  알고리즘, 알고리즘 문제, 알고리즘 공부법 ...
```
이 기능을 구현하기 위해서 가장 단순한 접근은 모든 단어를 배열에 담아두고, 하나하나 비교하는 선형 탐색이다.

```
["apple", "app", "april", "apply", ...] 중에서
"app"으로 시작하는 단어만 골라내기 → 전부 순회하면서 확인
```

단어가 10개만 있다면 문제 없겠지만, 사전에 등록된 단어가 수십만 개라면? 검색어를 입력할 때마다 전체 목록을 훑는 건 너무 느리다.

**해시맵(HashMap)** 은 어떨까? 해시맵에 단어를 통째로 저장하면 O(1)의 시간복잡도에 해결된다. 하지만 해시맵은 정확히 일치하는 단어만 찾을 수 있다. "app"이라는 접두사로 시작하는 모든 단어를 찾으려한다면? 다시 전체 순회를 할 수 밖에 없다.

이때 등장하는 아이디어가 트라이(Trie)이다.

| 방식         | 검색(Search) | 접두사 검색(Prefix Search) |
| ---------- | ---------- | --------------------- |
| 배열 + 선형 탐색 | O(N * L)   | O(N * L)              |
| 해시맵        | O(L) (평균)  | O(N * L)              |
| **Trie**   | **O(L)**   | **O(L)**              |
> N = 저장된 단어의 수, L = 문자열의 길이

**Trie는 접두사 검색에서도 O(L)을 유지한다**는 점이 핵심이다.

---

트라이는 노드(Node)들의 연결로 이루어진 트리 구조다. 일반 트리와의 결정적인 차이는 다음과 같다.

- **일반 트리**: 하나의 노드에 데이터 전체(단어 하나)를 저장한다.
- **트라이**: 하나의 노드에 **문자 한 글자**만 저장한다.

트라이의 노드는 일반적으로 두 가지 정보를 가진다.

| 필드         | 역할                         |
| ---------- | -------------------------- |
| `Children` | 다음 문자로 연결되는 자식 노드들에 대한 참조  |
| `IsEnd`    | 이 노드가 하나의 단어 끝인지를 나타내는 플래그 |

예를 들어 `"app"`과 `"apple"` 두 단어를 트라이에 저장하면 아래와 같은 구조가 된다.

```
        (루트)
          |
          a
          |
          p
          |
          p  ← IsEnd = true  ("app" 완성)
          |
          l
          |
          e  ← IsEnd = true  ("apple" 완성)
```
`"app"`과 `"apple"`은 접두사 `"app"`을 공유하므로, 해당 구간의 노드는 중복되지 않는다. 이것이 트라이의 핵심적인 특징이다.

트라이(Trie)의 가장 기본적인 세가지 동작은 아래와 같다. 

**Insert (삽입)**
1. 루트 노드에서 시작한다.
2. 단어의 첫 글자부터 순서대로 자식 노드가 있는지 확인한다.
    - 없으면: 새 노드를 만들어 추가한다.
    - 있으면: 해당 노드로 이동한다.
3. 단어의 마지막 글자까지 도달하면 해당 노드의 `IsEnd`를 `true`로 설정한다.

**Search (탐색)**

1. 루트 노드에서 시작한다.
2. 단어의 글자를 따라 노드를 이동한다.
    - 도중에 자식 노드가 없으면 → `false` 반환.
3. 단어 끝까지 도달하면 `IsEnd` 값을 반환한다.

**StartsWith (접두사 검색)**

1. Search와 동일하게 단어(접두사)를 따라 내려간다.
2. 단어 끝까지 도달했는지만 확인한다. `IsEnd`는 확인하지 않는다.
    - 즉, 해당 접두사로 시작하는 단어가 하나라도 존재하면 `true`.

`StartsWith`의 존재가 트라이를 배열이나 해시맵과 구분 짓는 핵심이다. 접두사만으로도 O(L)에 존재 여부를 판단할 수 있다.

아래는 golang으로  풀어본 [208번 leetcode문제](https://leetcode.com/problems/implement-trie-prefix-tree/description/)이다. 

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

func (this *Trie) Insert(word string)  {
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
 * Your Trie object will be instantiated and called as such:
 * obj := Constructor();
 * obj.Insert(word);
 * param_2 := obj.Search(word);
 * param_3 := obj.StartsWith(prefix);
 */
```

트라이는 접두사 검색을 O(L)에 처리할 수 있다는 점에서 다음 같은 상황에서 유용하게 사용된다.

**자동완성 (Autocomplete)**

사용자가 입력한 접두사로 시작하는 모든 단어를 찾아 제안해야 한다. 트라이는 `StartsWith`으로 접두사 존재 여부를 확인한 뒤, 해당 노드 아래의 모든 `IsEnd` 노드를 탐색하여 후보 목록을 반환한다. 해시맵으로는 전체 단어 목록을 순회해야 하지만, 트라이는 접두사에 해당하는 하위 트리(subtree)만 탐색하면 된다.

**맞춤법 검사 (Spell Checker)**

주어진 단어가 사전에 존재하는지 빠르게 확인하는 데 사용된다. `Search` 연산을 O(L)에 처리할 수 있으며, 사전에 등록된 단어가 많을수록 배열이나 해시맵 대비 효율이 좋아진다. 또한 유사한 단어 추천(Levenshtein distance 기반)을 구현할 때도 트라이 탐색을 함께 사용하기도 한다.

**IP 라우팅 (Longest Prefix Match)**

네트워크에서 IP 주소를 라우팅할 때, 목적지 IP와 가장 길게 일치하는 prefix를 찾아야 한다. 트라이는 이진 트라이(binary trie) 또는 Patricia trie 형태로 변형되어 사용되며, prefix 기반의 최장 일치 검색에 최적화되어 있다.

트라이는 문자열 탐색, 특히 **접두사 검색(prefix search)** 을 O(L)에 해결해야 하는 상황에서 가장 빛을 발하는 자료구조다. 노드 하나에 문자 한 글자만 저장하고, 공통 접두사를 공유함으로써 탐색 효율을 얻는 대신 공간을 소비한다. 앞서 살펴본 자료구조들과의 차이를 다시 정리하면 다음과 같다.

| 자료구조       | 검색(Search) | 접두사 검색   | 주요 단점        |
| ---------- | ---------- | -------- | ------------ |
| 배열 + 선형 탐색 | O(N·L)     | O(N·L)   | 느린 탐색        |
| 해시맵        | O(L)       | O(N·L)   | prefix 검색 불가 |
| **Trie**   | **O(L)**   | **O(L)** | 많은 메모리 사용    |

- **접두사 검색이 필요한가?** → Trie
- **정확한 일치(Exact Match)만 필요한가?** → 해시맵
- **데이터가 적은가?** → 배열로도 충분하다

시간이 된다면 아래 문제들도 풀어보길 권한다. 

LeetCode 208. [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/)
LeetCode 1268. [Search Suggestions System](https://leetcode.com/problems/search-suggestions-system/)
