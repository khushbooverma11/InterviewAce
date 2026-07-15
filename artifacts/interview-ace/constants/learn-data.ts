export interface LessonStep {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  codeLanguage?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  steps: LessonStep[];
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Track {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  accentColor: string;
  icon: string;
  chapters: Chapter[];
}

// ─── DSA Track ───────────────────────────────────────────────────────────────

const dsaTrack: Track = {
  id: 'dsa',
  title: 'Data Structures & Algorithms',
  shortTitle: 'DSA',
  description: 'Master the core DSA topics that appear in 90% of coding interviews at top tech companies.',
  color: '#3B82F6',
  accentColor: '#1D4ED8',
  icon: 'cpu',
  chapters: [
    {
      id: 'dsa-arrays',
      title: 'Arrays & Strings',
      lessons: [
        {
          id: 'dsa-arrays-two-sum',
          title: 'Two Sum Problem',
          description: 'The classic entry-point problem that unlocks hash map thinking.',
          difficulty: 'Beginner',
          estimatedMinutes: 12,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The **Two Sum** problem asks: given an array of integers and a target value, return the indices of two numbers that add up to the target.\n\nThe brute-force approach uses two nested loops — O(N²) time. The optimal approach trades space for time using a hash map, achieving O(N) time and O(N) space.\n\nThis pattern — trading space for time using a hash map — appears in hundreds of interview problems.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Two Sum is the canonical test of whether you can recognize when a hash map transforms an O(N²) problem into O(N). Interviewers want to see:\n\n• Can you articulate the brute-force first, then optimize?\n• Do you know the time/space tradeoff?\n• Can you handle edge cases (duplicates, negative numbers, no valid pair)?\n• Do you consider multiple solutions before coding?',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'Imagine scanning a grocery receipt looking for two items that total exactly your budget. Checking every pair is slow. A smarter approach: as you read each item\'s price, immediately check if the "complement" (budget − current price) is already in a lookup table. If yes, you\'re done. If no, add the current price to the table and move on.\n\nThis is exactly the hash map approach.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Optimal O(N) solution using a hash map:',
              codeExample:
`function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }

    seen.set(nums[i], i);
  }

  return []; // no valid pair found
}

// Example
twoSum([2, 7, 11, 15], 9); // → [0, 1]
twoSum([3, 2, 4], 6);       // → [1, 2]`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. What if there are multiple valid pairs — return all of them?\n2. What if the same element can be used twice?\n3. How does your solution handle an empty array or array with one element?\n4. Can you solve it without extra space? (Answer: yes, but it\'s O(N log N) using sorting + two pointers)\n5. Follow-up: Three Sum — can you extend this approach?',
            },
          ],
        },
        {
          id: 'dsa-arrays-sliding-window',
          title: 'Sliding Window Technique',
          description: 'A powerful pattern for substring and subarray problems.',
          difficulty: 'Intermediate',
          estimatedMinutes: 15,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The **Sliding Window** technique maintains a window (a contiguous range) that expands and shrinks over an array or string. It converts O(N²) brute-force approaches into O(N).\n\nTwo variants:\n• **Fixed-size window**: window size is constant (e.g., "max sum of K elements").\n• **Variable-size window**: window grows/shrinks based on a condition (e.g., "longest substring without repeating characters").',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Sliding window demonstrates pattern recognition. Problems like Longest Substring Without Repeating Characters, Minimum Window Substring, and Maximum Sum Subarray of Size K all share the same skeleton. Recognizing that pattern — not memorizing solutions — is what interviewers test.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'Imagine reading a text message and looking for the longest stretch without a repeated letter. Instead of re-checking every possible start and end, you maintain two pointers — a left and right boundary of your "window." Expand right when the condition holds, contract left when it breaks. This single pass is the sliding window.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Longest substring without repeating characters:',
              codeExample:
`function lengthOfLongestSubstring(s: string): number {
  const seen = new Map<string, number>(); // char → last index
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // If char is in window, shrink from left past its last occurrence
    if (seen.has(char) && seen.get(char)! >= left) {
      left = seen.get(char)! + 1;
    }

    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

lengthOfLongestSubstring("abcabcbb"); // → 3 ("abc")
lengthOfLongestSubstring("pwwkew");   // → 3 ("wke")`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Maximum sum subarray of size K (fixed window).\n2. Minimum window substring containing all characters of a pattern.\n3. Longest subarray with sum ≤ K.\n4. Count of subarrays with exactly K distinct characters.\n5. Maximum consecutive ones after flipping at most K zeros.',
            },
          ],
        },
        {
          id: 'dsa-arrays-binary-search',
          title: 'Binary Search',
          description: 'Halving your search space — a fundamental interview pattern.',
          difficulty: 'Beginner',
          estimatedMinutes: 10,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                '**Binary Search** finds a target in a sorted array in O(log N) time by repeatedly halving the search space.\n\nThe key invariant: at every step, the target — if it exists — lies within [left, right]. Each comparison eliminates half the remaining candidates.\n\nBeyond simple array search, the pattern extends to: "find the minimum value satisfying a condition," which is the basis of many hard problems.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Binary search seems simple but is notoriously easy to get wrong with off-by-one errors. Interviewers test your ability to write the loop correctly, handle boundaries (left ≤ right vs left < right), and apply the pattern to non-obvious problems like searching in a rotated array.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'Opening a dictionary to find a word: you open to the middle, check if the word comes before or after, then repeat with the relevant half. After 20 checks you can search a million-word dictionary. That\'s O(log N).',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Classic binary search template:',
              codeExample:
`function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    // Avoids integer overflow vs (left + right) / 2
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1; // not found
}

binarySearch([1, 3, 5, 7, 9, 11], 7); // → 3
binarySearch([1, 3, 5, 7, 9, 11], 6); // → -1`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Search in a rotated sorted array.\n2. Find first and last position of element in sorted array.\n3. Find minimum in rotated sorted array.\n4. Binary search on answer: Koko Eating Bananas, Minimum Days to Make M Bouquets.\n5. Sqrt(x) without using built-in functions.',
            },
          ],
        },
      ],
    },
    {
      id: 'dsa-linked-lists',
      title: 'Linked Lists',
      lessons: [
        {
          id: 'dsa-ll-basics',
          title: 'Linked List Fundamentals',
          description: 'Nodes, pointers, and the building blocks of every linked list problem.',
          difficulty: 'Beginner',
          estimatedMinutes: 10,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'A **Linked List** is a linear data structure where each element (node) holds a value and a pointer to the next node. Unlike arrays, nodes need not be contiguous in memory.\n\n• **Singly Linked List**: each node points to the next.\n• **Doubly Linked List**: each node points to both next and previous.\n• **Circular Linked List**: the tail points back to the head.\n\nKey operations: insertion and deletion are O(1) given a pointer to the node, but access by index is O(N).',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Linked list problems test pointer manipulation, in-place operations without extra memory, and the two-pointer / fast-slow pointer technique. They also test your ability to handle edge cases: empty list, single node, circular references.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A music playlist where each song knows only the next song. Adding a song anywhere is instant — just update two pointers. But finding song #50 requires walking from the beginning.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Reverse a linked list in-place:',
              codeExample:
`class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next; // save next
    curr.next = prev;       // reverse pointer
    prev = curr;            // advance prev
    curr = next;            // advance curr
  }

  return prev; // new head
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Detect a cycle in a linked list (Floyd\'s algorithm).\n2. Find the middle node of a linked list.\n3. Merge two sorted linked lists.\n4. Remove N-th node from the end.\n5. Check if a linked list is a palindrome.',
            },
          ],
        },
        {
          id: 'dsa-ll-fast-slow',
          title: 'Fast & Slow Pointers',
          description: 'Detect cycles, find midpoints, and solve classic linked list problems.',
          difficulty: 'Intermediate',
          estimatedMinutes: 12,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The **Fast & Slow Pointer** (Floyd\'s Tortoise and Hare) technique uses two pointers moving at different speeds through a sequence. The fast pointer moves 2 nodes at a time, the slow pointer 1 node.\n\n• **Cycle detection**: if they meet, a cycle exists.\n• **Find middle**: when fast reaches the end, slow is at the middle.\n• **Find cycle start**: after meeting, reset one pointer to head and advance both one step at a time — they meet at the cycle start.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'This pattern appears in many problems disguised as different questions. Recognizing it demonstrates pattern fluency. It also shows you can reason about relative speeds and pointer arithmetic without visualizing every step.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'Two runners on a circular track: one runs twice as fast. If the track loops (has a cycle), they will eventually meet. If it\'s a straight track (no cycle), the fast runner reaches the end first.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Detect cycle and find its start:',
              codeExample:
`function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true; // cycle detected
  }

  return false;
}

function detectCycleStart(head: ListNode | null): ListNode | null {
  let slow = head, fast = head;

  while (fast?.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) {
      // Reset one pointer to head
      slow = head;
      while (slow !== fast) {
        slow = slow!.next;
        fast = fast!.next;
      }
      return slow; // cycle start
    }
  }
  return null;
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Find the middle of a linked list.\n2. Check if a linked list is a palindrome using fast/slow.\n3. Happy Number (cycle detection on numbers, not nodes).\n4. Find duplicate number in an array using Floyd\'s algorithm.\n5. Reorder List (combine middle-finding + reversal + merge).',
            },
          ],
        },
      ],
    },
    {
      id: 'dsa-trees',
      title: 'Trees & Binary Search Trees',
      lessons: [
        {
          id: 'dsa-trees-basics',
          title: 'Binary Tree Basics',
          description: 'Nodes, traversals, and the recursive mindset for tree problems.',
          difficulty: 'Beginner',
          estimatedMinutes: 12,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'A **Binary Tree** is a hierarchical data structure where each node has at most two children: a left child and a right child.\n\nKey tree traversals:\n• **Inorder** (left → root → right): gives sorted output for a BST.\n• **Preorder** (root → left → right): useful for serialization.\n• **Postorder** (left → right → root): useful for deletion and evaluation.\n• **Level-order** (BFS): processes nodes level by level.\n\nThe recursive nature of trees makes them a natural fit for recursive solutions.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Tree problems test recursive thinking. Most solutions follow a simple template: process current node, recurse left, recurse right. Interviewers want to see you think recursively, handle base cases (null nodes), and choose the right traversal for the problem.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A company org chart is a tree. The CEO is the root, VPs are children, and so on. Finding the depth of the org chart = finding the height of the tree. Counting employees under a VP = counting nodes in a subtree.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Maximum depth and inorder traversal:',
              codeExample:
`class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number) { this.val = val; this.left = this.right = null; }
}

// Maximum depth — classic DFS
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// Inorder traversal — iterative
function inorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];
  const stack: TreeNode[] = [];
  let curr: TreeNode | null = root;

  while (curr !== null || stack.length > 0) {
    while (curr !== null) { stack.push(curr); curr = curr.left; }
    curr = stack.pop()!;
    result.push(curr.val);
    curr = curr.right;
  }
  return result;
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Check if two trees are identical.\n2. Find the lowest common ancestor of two nodes.\n3. Level order traversal (BFS).\n4. Symmetric tree / mirror tree.\n5. Path sum — does a root-to-leaf path sum to a target?',
            },
          ],
        },
        {
          id: 'dsa-trees-bst',
          title: 'Binary Search Trees',
          description: 'Ordered trees that power databases, autocomplete, and range queries.',
          difficulty: 'Intermediate',
          estimatedMinutes: 14,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'A **Binary Search Tree (BST)** is a binary tree with the BST property: for every node, all values in its left subtree are smaller, and all values in its right subtree are larger.\n\nThis property enables O(log N) search, insert, and delete on a balanced BST. An unbalanced BST degrades to O(N) — the reason self-balancing trees (AVL, Red-Black) exist.\n\nInorder traversal of a BST yields a sorted sequence — a key property used in many problems.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'BST questions test your ability to exploit structure. A good candidate doesn\'t just do generic DFS — they use the BST property to prune branches. E.g., searching for a value: no need to visit both subtrees, just follow left or right based on comparison.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A sorted contact list in your phone. Finding "Sarah" doesn\'t scan every contact — it jumps to the middle, goes left if alphabetically before, right if after. That\'s BST search.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'BST search, insert, and validate:',
              codeExample:
`// BST search — O(log N) average
function searchBST(root: TreeNode | null, val: number): TreeNode | null {
  if (root === null || root.val === val) return root;
  return val < root.val
    ? searchBST(root.left, val)
    : searchBST(root.right, val);
}

// Validate BST using min/max bounds
function isValidBST(
  node: TreeNode | null,
  min = -Infinity,
  max = Infinity
): boolean {
  if (node === null) return true;
  if (node.val <= min || node.val >= max) return false;
  return (
    isValidBST(node.left, min, node.val) &&
    isValidBST(node.right, node.val, max)
  );
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Validate that a binary tree is a valid BST.\n2. Kth smallest element in a BST.\n3. Convert sorted array to balanced BST.\n4. Find in-order successor/predecessor.\n5. Delete a node from a BST.',
            },
          ],
        },
      ],
    },
    {
      id: 'dsa-hash-maps',
      title: 'Hash Maps & Sets',
      lessons: [
        {
          id: 'dsa-hashmap-internals',
          title: 'HashMap',
          description: 'How hash maps work internally and why they enable O(1) lookups.',
          difficulty: 'Beginner',
          estimatedMinutes: 12,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'A **HashMap** is a data structure that maps keys to values for highly efficient lookups. It uses a **hash function** to compute an index into an array of buckets.\n\nTime complexity:\n• Average: O(1) for get, put, and delete.\n• Worst case: O(N) when all keys hash to the same bucket (collision).\n\nCollision handling strategies:\n• **Chaining**: each bucket holds a linked list of entries.\n• **Open addressing**: probe for the next empty slot.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'It tests your grasp on time vs. space tradeoffs, hashing algorithms, and collision handling. It\'s the most common data structure used to optimize brute-force O(N²) algorithms to O(N).\n\nInterviewers also probe deeper: What happens when load factor exceeds a threshold? (Rehashing.) What makes a good hash function? (Uniform distribution, deterministic, fast.)',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'Think of a library index card system. Instead of searching every shelf, you look up the card (hash function) that tells you exactly which shelf (bucket) and position (index) the book is on. With a good index (low collisions), finding any book is near-instant regardless of library size.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Common HashMap patterns in interviews:',
              codeExample:
`// 1. Frequency counter
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();

  for (const str of strs) {
    const key = str.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(str);
  }

  return [...map.values()];
}

// 2. Check if two strings are isomorphic
function isIsomorphic(s: string, t: string): boolean {
  const sToT = new Map<string, string>();
  const tToS = new Map<string, string>();

  for (let i = 0; i < s.length; i++) {
    const sc = s[i], tc = t[i];
    if ((sToT.has(sc) && sToT.get(sc) !== tc) ||
        (tToS.has(tc) && tToS.get(tc) !== sc)) {
      return false;
    }
    sToT.set(sc, tc);
    tToS.set(tc, sc);
  }
  return true;
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Group anagrams together.\n2. Top K frequent elements.\n3. LRU Cache (HashMap + Doubly Linked List).\n4. Subarray sum equals K (prefix sum + hash map).\n5. Longest consecutive sequence in an unsorted array.',
            },
          ],
        },
        {
          id: 'dsa-hashset',
          title: 'HashSet & Deduplication',
          description: 'Using sets for O(1) membership checks and deduplication.',
          difficulty: 'Beginner',
          estimatedMinutes: 8,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'A **HashSet** stores unique values with O(1) average add, delete, and contains operations. Internally it\'s a HashMap where the value is ignored — only the key matters.\n\nKey uses in interviews:\n• Detecting duplicates in O(N) time.\n• Checking membership without sorting.\n• Eliminating duplicates from a collection.\n• Building the "complement" lookup in two-pass algorithms.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Set problems test whether you reach for the right tool. Many O(N²) "contains" checks become O(N) by converting to a set first. Interviewers also test your knowledge of set operations: union, intersection, and difference.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A guest list at an event. Checking if a person is invited shouldn\'t require scanning the entire list — you maintain a set. When the person arrives, the bouncer checks in O(1): are they in the set?',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Longest consecutive sequence using a Set:',
              codeExample:
`function longestConsecutive(nums: number[]): number {
  const numSet = new Set(nums);
  let longest = 0;

  for (const num of numSet) {
    // Only start counting from the beginning of a sequence
    if (!numSet.has(num - 1)) {
      let current = num;
      let streak = 1;

      while (numSet.has(current + 1)) {
        current++;
        streak++;
      }

      longest = Math.max(longest, streak);
    }
  }

  return longest;
}

longestConsecutive([100, 4, 200, 1, 3, 2]); // → 4 (1,2,3,4)`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Contains Duplicate — is any value repeated?\n2. Intersection of Two Arrays.\n3. Happy Number (detect cycle using a set).\n4. Single Number — find the element that appears only once.\n5. Valid Sudoku — use sets for row/col/box validation.',
            },
          ],
        },
        {
          id: 'dsa-lru-cache',
          title: 'LRU Cache',
          description: 'Combining a HashMap and Doubly Linked List for O(1) cache operations.',
          difficulty: 'Advanced',
          estimatedMinutes: 20,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'An **LRU (Least Recently Used) Cache** evicts the least recently accessed item when capacity is exceeded. It must support get and put in **O(1)** time.\n\nThe key insight: use a **HashMap** for O(1) key lookup, and a **Doubly Linked List** to maintain access order in O(1). The most recently used item is at the head; the least recently used is at the tail.\n\nOn any access (get or put), move the node to the head. On eviction, remove from the tail.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'LRU Cache is a system design concept translated into a coding problem. It tests:\n• Combining two data structures for complementary strengths.\n• Pointer manipulation in a doubly linked list.\n• Correct handling of edge cases (capacity 1, updating existing keys).\n\nThis problem appears at Google, Meta, Amazon, and Microsoft.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'Your browser history stores recently visited pages. When the history list is full, the oldest-visited page is removed to make room for a new one. Opening a page moves it to the top of "most recent." That\'s LRU.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Full LRU Cache implementation:',
              codeExample:
`class LRUNode {
  key: number; val: number;
  prev: LRUNode | null = null;
  next: LRUNode | null = null;
  constructor(k: number, v: number) { this.key = k; this.val = v; }
}

class LRUCache {
  private cap: number;
  private map = new Map<number, LRUNode>();
  private head = new LRUNode(0, 0); // dummy head (MRU side)
  private tail = new LRUNode(0, 0); // dummy tail (LRU side)

  constructor(capacity: number) {
    this.cap = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key)!;
    this.remove(node);
    this.insertFront(node);
    return node.val;
  }

  put(key: number, value: number): void {
    if (this.map.has(key)) this.remove(this.map.get(key)!);
    const node = new LRUNode(key, value);
    this.insertFront(node);
    this.map.set(key, node);
    if (this.map.size > this.cap) {
      const lru = this.tail.prev!;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }

  private remove(node: LRUNode) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private insertFront(node: LRUNode) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. LFU Cache — evict the least frequently used (harder variant).\n2. Design a time-based key-value store.\n3. All O(1) data structure (insert, delete, getRandom in O(1)).\n4. Design a hit counter (count hits in last 5 minutes).\n5. Snake game simulation.',
            },
          ],
        },
      ],
    },
    {
      id: 'dsa-dp',
      title: 'Dynamic Programming',
      lessons: [
        {
          id: 'dsa-dp-intro',
          title: 'Introduction to DP',
          description: 'Breaking problems into overlapping subproblems with memoization.',
          difficulty: 'Intermediate',
          estimatedMinutes: 18,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                '**Dynamic Programming** solves problems by breaking them into overlapping subproblems and storing results to avoid recomputation.\n\nTwo approaches:\n• **Top-down (Memoization)**: recursive solution with a cache. Natural to write, starts from the full problem.\n• **Bottom-up (Tabulation)**: iterative solution building from base cases upward. Usually faster, no recursion overhead.\n\nDP applies when a problem has **optimal substructure** (optimal solution built from optimal subsolutions) and **overlapping subproblems** (same sub-computations repeat).',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'DP is the hardest category in interviews. It requires recognizing the pattern, defining the state correctly, writing the recurrence, and handling base cases. Interviewers at FAANG frequently use medium/hard DP problems to differentiate strong candidates.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'Climbing stairs: you can take 1 or 2 steps. How many ways to reach step N? The answer for step N depends only on steps N-1 and N-2 — you\'ve already computed those. Store them, don\'t recompute. This is Fibonacci, and it\'s the simplest DP.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Climbing stairs — two approaches:',
              codeExample:
`// Top-down: memoization
function climbStairsMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 2) return n;
  if (memo.has(n)) return memo.get(n)!;
  const result = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Bottom-up: tabulation — O(N) time, O(N) space
function climbStairsDP(n: number): number {
  if (n <= 2) return n;
  const dp = new Array(n + 1);
  dp[1] = 1; dp[2] = 2;
  for (let i = 3; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}

// Space-optimized: O(1) space
function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) [prev2, prev1] = [prev1, prev1 + prev2];
  return prev1;
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. House Robber — max sum with no two adjacent elements.\n2. Coin Change — minimum coins to reach a target.\n3. Longest Common Subsequence.\n4. 0/1 Knapsack problem.\n5. Longest Increasing Subsequence.',
            },
          ],
        },
        {
          id: 'dsa-dp-2d',
          title: 'Grid DP Problems',
          description: 'Unique paths, minimum path sum, and 2D state machines.',
          difficulty: 'Intermediate',
          estimatedMinutes: 15,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'Grid DP problems involve a 2D table where each cell\'s value depends on adjacent cells. State is (row, col).\n\nCommon pattern:\n• `dp[i][j]` = optimal result to reach cell (i, j).\n• Base cases: first row and first column (only reachable one way).\n• Recurrence: `dp[i][j] = f(dp[i-1][j], dp[i][j-1])`.\n\nThis pattern covers: unique paths, minimum path sum, maximal square, and edit distance.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                '2D DP tests your ability to generalize the 1D DP template to two dimensions. It also tests state definition: is dp[i][j] the cost of being at (i,j), or the cost of the path ending at (i,j)? Getting this wrong leads to wrong answers.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A robot in a warehouse grid moving only right or down. How many paths exist from top-left to bottom-right? Each cell\'s count equals the paths from above plus paths from the left.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Unique paths and minimum path sum:',
              codeExample:
`// Unique Paths — count all paths (right/down only)
function uniquePaths(m: number, n: number): number {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }
  return dp[m - 1][n - 1];
}

// Minimum Path Sum — find path with smallest sum
function minPathSum(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));
  dp[0][0] = grid[0][0];

  for (let i = 1; i < m; i++) dp[i][0] = dp[i - 1][0] + grid[i][0];
  for (let j = 1; j < n; j++) dp[0][j] = dp[0][j - 1] + grid[0][j];

  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];

  return dp[m - 1][n - 1];
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Unique Paths II — grid with obstacles.\n2. Maximal Square — largest square of 1s in a binary matrix.\n3. Edit Distance — minimum operations to convert one string to another.\n4. Longest Common Subsequence — 2D DP on two strings.\n5. Dungeon Game — start from bottom-right and work backwards.',
            },
          ],
        },
      ],
    },
  ],
};

// ─── LLD Track ────────────────────────────────────────────────────────────────

const lldTrack: Track = {
  id: 'lld',
  title: 'Low-Level Design',
  shortTitle: 'LLD',
  description: 'Design clean, maintainable systems using SOLID principles, design patterns, and proven OOP practices.',
  color: '#8B5CF6',
  accentColor: '#6D28D9',
  icon: 'layers',
  chapters: [
    {
      id: 'lld-solid',
      title: 'SOLID Principles',
      lessons: [
        {
          id: 'lld-solid-srp',
          title: 'Single Responsibility Principle',
          description: 'A class should have only one reason to change.',
          difficulty: 'Beginner',
          estimatedMinutes: 10,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The **Single Responsibility Principle (SRP)** states that a class should have only one reason to change — meaning it should have only one job.\n\nA class that handles data persistence AND sends email notifications AND formats output violates SRP. Each concern should live in its own class.\n\nThis makes code easier to test, maintain, and understand. Changes to email logic won\'t touch database logic.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'SRP is the most fundamental of the SOLID principles. Interviewers use it to assess whether you write maintainable code or tangled "god classes." They\'ll show you a bloated class and ask you to refactor it — knowing SRP is the first step.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A chef who also manages reservations, does the accounting, and handles deliveries is spread too thin — and if one process changes, it affects everything. A restaurant separates concerns: chef, host, accountant, delivery driver. Each has one job. That\'s SRP.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Violating SRP vs. applying it:',
              codeExample:
`// ❌ Violates SRP — one class doing three things
class UserService {
  getUser(id: string) { /* fetch from DB */ }
  formatUserAsJSON(user: User) { /* formatting */ }
  sendWelcomeEmail(user: User) { /* email */ }
}

// ✅ Applies SRP — each class has one reason to change
class UserRepository {
  getUser(id: string): User { /* fetch from DB */ }
  saveUser(user: User): void { /* persist */ }
}

class UserSerializer {
  toJSON(user: User): string { return JSON.stringify(user); }
}

class UserNotifier {
  sendWelcomeEmail(user: User): void { /* email */ }
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Identify SRP violations in a given class and refactor it.\n2. When is it okay for a class to have multiple methods — are all methods one "responsibility"?\n3. How does SRP relate to the concept of cohesion?\n4. What\'s the difference between SRP and "separation of concerns"?\n5. Design a UserService that satisfies SRP.',
            },
          ],
        },
        {
          id: 'lld-solid-ocp',
          title: 'Open/Closed Principle',
          description: 'Open for extension, closed for modification.',
          difficulty: 'Intermediate',
          estimatedMinutes: 12,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The **Open/Closed Principle (OCP)** states that software entities should be **open for extension** but **closed for modification**.\n\nAdding new behavior should not require changing existing, tested code. Instead, extend through inheritance, composition, or interfaces.\n\nWhen you add a new payment type, you shouldn\'t modify the existing `PaymentProcessor` class — you should extend it through an interface.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'OCP is tested in design interviews with "add a new X without touching existing code" scenarios. It assesses whether you design for extensibility from the start or create brittle, if-else-heavy code that must be modified for every new case.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A power strip with standard outlets is "closed" (its internals don\'t change) but "open" (you can plug in any device with the right interface). You don\'t rewire the strip for each new device — you design devices to the standard interface.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Payment processor extensible via OCP:',
              codeExample:
`// ❌ Violates OCP — must modify class for each new payment type
class PaymentProcessor {
  process(type: string, amount: number) {
    if (type === 'credit') { /* ... */ }
    else if (type === 'paypal') { /* ... */ }
    // Adding crypto? Must modify this class.
  }
}

// ✅ Applies OCP — extend by adding new classes, not modifying old ones
interface PaymentMethod {
  charge(amount: number): void;
}

class CreditCardPayment implements PaymentMethod {
  charge(amount: number) { console.log(\`Credit: \$\${amount}\`); }
}

class PaypalPayment implements PaymentMethod {
  charge(amount: number) { console.log(\`PayPal: \$\${amount}\`); }
}

class CryptoPayment implements PaymentMethod {
  charge(amount: number) { console.log(\`Crypto: \$\${amount}\`); }
}

// PaymentProcessor never changes — only new methods are added
class PaymentProcessor {
  process(method: PaymentMethod, amount: number) {
    method.charge(amount);
  }
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Design a discount calculation system that\'s extensible for new discount types.\n2. How would you add a new report format without modifying the ReportGenerator class?\n3. What design patterns help enforce OCP? (Strategy, Decorator, Factory)\n4. Is OCP always achievable? When is it impractical?\n5. Refactor a switch/if-else chain using OCP.',
            },
          ],
        },
        {
          id: 'lld-solid-dip',
          title: 'Dependency Inversion Principle',
          description: 'Depend on abstractions, not concretions.',
          difficulty: 'Intermediate',
          estimatedMinutes: 12,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The **Dependency Inversion Principle (DIP)** states:\n1. High-level modules should not depend on low-level modules — both should depend on abstractions.\n2. Abstractions should not depend on details — details should depend on abstractions.\n\nInstead of `UserService` directly instantiating `MySQLDatabase`, it should accept a `Database` interface. Now you can swap MySQL for PostgreSQL or a test mock without changing `UserService`.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'DIP is fundamental to testable code. If high-level modules depend on concrete implementations, unit testing requires real databases and external services. Depending on abstractions enables dependency injection and mocking. Interviewers look for this in system design discussions.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A lamp doesn\'t depend on a specific power company — it depends on the "outlet interface" (standard voltage/plug shape). The power company provides the outlet interface. You can switch power companies without changing the lamp.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Inverting dependencies via interface:',
              codeExample:
`// ❌ Violates DIP — high-level depends on low-level detail
class UserService {
  private db = new MySQLDatabase(); // tightly coupled
  getUser(id: string) { return this.db.query(\`SELECT * FROM users WHERE id=\${id}\`); }
}

// ✅ Applies DIP — both depend on the abstraction
interface Database {
  query(sql: string): any;
}

class MySQLDatabase implements Database {
  query(sql: string) { /* MySQL implementation */ }
}

class PostgresDatabase implements Database {
  query(sql: string) { /* Postgres implementation */ }
}

// UserService depends on the interface, not the implementation
class UserService {
  constructor(private db: Database) {}
  getUser(id: string) { return this.db.query(\`SELECT * FROM users WHERE id='\${id}'\`); }
}

// Production
const service = new UserService(new MySQLDatabase());

// Testing — inject a mock
const mockDb: Database = { query: () => ({ id: '1', name: 'Alice' }) };
const testService = new UserService(mockDb);`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. How does dependency injection implement DIP?\n2. What is Inversion of Control (IoC) and how does it relate?\n3. Design a notification service using DIP (email, SMS, push).\n4. How does DIP make unit testing easier?\n5. What\'s the difference between DIP and the Dependency Injection pattern?',
            },
          ],
        },
      ],
    },
    {
      id: 'lld-patterns',
      title: 'Design Patterns',
      lessons: [
        {
          id: 'lld-singleton',
          title: 'Singleton Pattern',
          description: 'Ensure only one instance of a class exists throughout the application.',
          difficulty: 'Beginner',
          estimatedMinutes: 10,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The **Singleton** pattern ensures a class has only one instance and provides a global access point to it.\n\nUse cases: database connection pools, logger instances, configuration managers, caches.\n\nKey implementation points:\n• Private constructor — prevents direct instantiation.\n• Static instance variable — holds the single instance.\n• Static `getInstance()` method — creates on first call, returns existing on subsequent calls.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Singleton is the most commonly asked design pattern. Interviewers test: Can you implement it? Can you make it thread-safe? Do you know when NOT to use it (global state is a code smell, makes testing hard)? Do you know alternatives (dependency injection)?',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A country has only one President at a time. No matter how many times someone asks "who is the President?", there\'s always one single instance. Creating a second President doesn\'t happen.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Thread-safe Singleton implementations:',
              codeExample:
`// Basic Singleton
class Logger {
  private static instance: Logger | null = null;
  private logs: string[] = [];

  private constructor() {} // prevent direct instantiation

  static getInstance(): Logger {
    if (Logger.instance === null) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message: string): void {
    this.logs.push(\`[\${new Date().toISOString()}] \${message}\`);
    console.log(message);
  }

  getLogs(): string[] {
    return [...this.logs];
  }
}

// Usage — always the same instance
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();
console.log(logger1 === logger2); // true

logger1.log("App started");
console.log(logger2.getLogs()); // includes "App started"`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. What are the drawbacks of Singleton? (Global state, tight coupling, testing difficulty)\n2. How do you make Singleton thread-safe in Java?\n3. What\'s the difference between Singleton and Static class?\n4. When would you avoid Singleton? What\'s the alternative?\n5. Design a configuration manager using Singleton.',
            },
          ],
        },
        {
          id: 'lld-observer',
          title: 'Observer Pattern',
          description: 'A one-to-many dependency where changes notify all dependents automatically.',
          difficulty: 'Intermediate',
          estimatedMinutes: 14,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The **Observer** pattern defines a one-to-many dependency: when the **Subject** (Observable) changes state, all registered **Observers** are notified and updated automatically.\n\nComponents:\n• **Subject**: maintains a list of observers, notifies them on state change.\n• **Observer**: interface with an `update()` method.\n• **Concrete Observers**: implement `update()` to react to changes.\n\nThis is the foundation of event systems, reactive programming (RxJS), and MVC architectures.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Observer is fundamental to event-driven systems. Interviewers ask about it in the context of real systems: "Design a stock price alert system," "Design a notification service," or "How would you implement an event bus?" Knowing Observer demonstrates understanding of loose coupling between components.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'YouTube subscriptions: you (observer) subscribe to a channel (subject). When the channel uploads (state change), you get notified. You can unsubscribe any time. The channel doesn\'t know who you are — it just notifies all subscribers. Multiple people can subscribe independently.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Stock price alert system using Observer:',
              codeExample:
`interface Observer {
  update(event: string, data: unknown): void;
}

class EventEmitter {
  private listeners = new Map<string, Set<Observer>>();

  subscribe(event: string, observer: Observer): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(observer);
    // Return unsubscribe function
    return () => this.listeners.get(event)?.delete(observer);
  }

  emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(obs => obs.update(event, data));
  }
}

class StockMarket extends EventEmitter {
  private prices = new Map<string, number>();

  setPrice(symbol: string, price: number): void {
    this.prices.set(symbol, price);
    this.emit('price-change', { symbol, price });
  }
}

class PriceAlert implements Observer {
  constructor(private symbol: string, private threshold: number) {}

  update(_: string, data: { symbol: string; price: number }): void {
    if (data.symbol === this.symbol && data.price > this.threshold) {
      console.log(\`ALERT: \${this.symbol} exceeded \$\${this.threshold}!\`);
    }
  }
}

const market = new StockMarket();
market.subscribe('price-change', new PriceAlert('AAPL', 200));
market.setPrice('AAPL', 215); // → ALERT: AAPL exceeded $200!`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Design a notification system (email, SMS, push) using Observer.\n2. What\'s the difference between Observer and Pub/Sub?\n3. How do you prevent memory leaks with Observer? (Weak references, unsubscribe)\n4. How is Observer implemented in RxJS / Redux?\n5. Design an event-driven order fulfillment system.',
            },
          ],
        },
        {
          id: 'lld-strategy',
          title: 'Strategy Pattern',
          description: 'Define a family of algorithms, encapsulate each, and make them interchangeable.',
          difficulty: 'Intermediate',
          estimatedMinutes: 12,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The **Strategy** pattern defines a family of algorithms, encapsulates each in its own class, and makes them interchangeable at runtime.\n\nThe context class delegates the behavior to a strategy object. The strategy can be swapped without changing the context.\n\nThis directly implements the Open/Closed Principle: adding a new algorithm means adding a new strategy class, not modifying the context.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Strategy is asked in the context of replacing complex if-else or switch chains with polymorphism. It\'s also a gateway to discussing OCP and composition over inheritance. Common interview prompt: "Design a sorting system that can switch algorithms at runtime."',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'Navigation apps (Google Maps, Waze): you choose a route strategy — fastest, shortest, avoid tolls, bike-friendly. The app (context) uses whichever strategy you select, switching on demand without reimplementing the entire navigation system.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Sorting with interchangeable strategies:',
              codeExample:
`interface SortStrategy {
  sort(data: number[]): number[];
}

class BubbleSortStrategy implements SortStrategy {
  sort(data: number[]): number[] {
    const arr = [...data];
    for (let i = 0; i < arr.length; i++)
      for (let j = 0; j < arr.length - i - 1; j++)
        if (arr[j] > arr[j + 1]) [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
    return arr;
  }
}

class QuickSortStrategy implements SortStrategy {
  sort(data: number[]): number[] {
    if (data.length <= 1) return data;
    const pivot = data[Math.floor(data.length / 2)];
    const left = data.filter(x => x < pivot);
    const right = data.filter(x => x > pivot);
    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

class Sorter {
  constructor(private strategy: SortStrategy) {}

  setStrategy(strategy: SortStrategy): void {
    this.strategy = strategy;
  }

  sort(data: number[]): number[] {
    return this.strategy.sort(data);
  }
}

const sorter = new Sorter(new QuickSortStrategy());
sorter.sort([5, 3, 8, 1]); // → [1, 3, 5, 8]

// Switch algorithm at runtime
sorter.setStrategy(new BubbleSortStrategy());
sorter.sort([5, 3, 8, 1]); // same result, different algorithm`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. Design a payment system using Strategy (credit, PayPal, crypto).\n2. How is Strategy different from State pattern?\n3. How does Strategy enable testing — can you inject a mock strategy?\n4. What\'s the difference between Strategy and Template Method?\n5. Design a compression library with pluggable compression strategies (zip, gzip, lz4).',
            },
          ],
        },
      ],
    },
    {
      id: 'lld-classic',
      title: 'Classic LLD Problems',
      lessons: [
        {
          id: 'lld-parking-lot',
          title: 'Design a Parking Lot',
          description: 'A foundational OOP design question asked at every top company.',
          difficulty: 'Intermediate',
          estimatedMinutes: 25,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The Parking Lot is the most common LLD interview question. It tests OOP design, class hierarchy, and handling of real-world complexity.\n\nKey entities to model:\n• **ParkingLot**: manages floors, entry/exit.\n• **ParkingFloor**: a floor with spots.\n• **ParkingSpot**: a single spot (type: compact, large, handicapped).\n• **Vehicle**: base class (Car, Motorcycle, Truck).\n• **Ticket**: records entry time, spot assigned.\n• **ParkingRates**: calculates fees.\n\nKey behaviors: park vehicle, free spot, calculate fee, find available spot.',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'Parking Lot tests:\n• Class design and relationships (inheritance, composition).\n• Encapsulation of state (spot availability).\n• Enum usage for types (VehicleType, SpotType).\n• Threading concerns: concurrent spot allocation.\n• Extensibility: adding electric charging spots later.\n\nInterviewers look for OOP thinking, not a working implementation in 45 minutes.',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'A real multi-floor parking structure: you enter, get a ticket, the system assigns a spot. When you leave, the system calculates your fee (hourly, first hour free, overnight cap). If no spots of the right size, you\'re told at entry.\n\nStart with requirements clarification: number of floors? Vehicle types? Pricing model? Multiple entry/exit points? That\'s what interviewers want to see first.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Core class structure:',
              codeExample:
`enum VehicleType { Motorcycle, Car, Truck }
enum SpotType { Motorcycle, Compact, Large }
enum SpotStatus { Available, Occupied }

class Vehicle {
  constructor(public plate: string, public type: VehicleType) {}
}

class ParkingSpot {
  public status = SpotStatus.Available;
  public vehicle: Vehicle | null = null;

  constructor(
    public id: string,
    public type: SpotType,
    public floorNumber: number
  ) {}

  canFit(vehicle: Vehicle): boolean {
    if (vehicle.type === VehicleType.Motorcycle)
      return this.type === SpotType.Motorcycle;
    if (vehicle.type === VehicleType.Car)
      return this.type === SpotType.Compact || this.type === SpotType.Large;
    return this.type === SpotType.Large; // Truck
  }

  park(vehicle: Vehicle): void {
    this.vehicle = vehicle;
    this.status = SpotStatus.Occupied;
  }

  free(): void {
    this.vehicle = null;
    this.status = SpotStatus.Available;
  }
}

class Ticket {
  public entryTime = Date.now();
  constructor(public spot: ParkingSpot, public vehicle: Vehicle) {}

  calculateFee(hourlyRate = 2): number {
    const hours = (Date.now() - this.entryTime) / 3_600_000;
    return Math.ceil(hours) * hourlyRate;
  }
}

class ParkingLot {
  private spots: ParkingSpot[] = [];

  addSpot(spot: ParkingSpot): void { this.spots.push(spot); }

  park(vehicle: Vehicle): Ticket | null {
    const spot = this.spots.find(
      s => s.status === SpotStatus.Available && s.canFit(vehicle)
    );
    if (!spot) return null;
    spot.park(vehicle);
    return new Ticket(spot, vehicle);
  }

  exit(ticket: Ticket): number {
    const fee = ticket.calculateFee();
    ticket.spot.free();
    return fee;
  }
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. How would you handle concurrent parking requests (two cars targeting the same spot)?\n2. Add an electric vehicle charging spot type.\n3. Add a monthly pass / subscription system.\n4. Design the pricing engine for complex rules (first hour free, max daily cap).\n5. How would you scale this to a chain of parking lots?',
            },
          ],
        },
        {
          id: 'lld-elevator',
          title: 'Design an Elevator System',
          description: 'State machines, scheduling algorithms, and concurrent control systems.',
          difficulty: 'Advanced',
          estimatedMinutes: 30,
          steps: [
            {
              id: 'intro',
              title: 'Introduction',
              content:
                'The Elevator System is an advanced LLD question testing state machines and scheduling.\n\nKey entities:\n• **Elevator**: current floor, direction (UP/DOWN/IDLE), list of requested floors.\n• **ElevatorController**: receives requests, dispatches to elevators.\n• **Request**: (source floor, destination floor, direction).\n\nKey design decisions:\n• **Scheduling algorithm**: SCAN (elevator direction), LOOK, nearest car.\n• **State machine per elevator**: IDLE → MOVING_UP / MOVING_DOWN → IDLE.\n• **Request types**: internal (button inside) and external (button on floor).',
            },
            {
              id: 'why',
              title: 'Why Interviewers Ask This',
              content:
                'This question tests:\n• State machine design.\n• Scheduling algorithm selection and tradeoffs.\n• Concurrency: multiple elevators, multiple simultaneous requests.\n• OOP principles under real-world complexity.\n\nAsk clarifying questions upfront: number of elevators? Floors? Priority passengers (emergency, maintenance)?',
            },
            {
              id: 'example',
              title: 'Real-Life Example',
              content:
                'Otis elevator systems use the SCAN algorithm: the elevator moves in one direction, picking up all requests in that direction before reversing — like a hard drive read head. This minimizes average wait time while preventing starvation.',
            },
            {
              id: 'code',
              title: 'Code Example',
              content: 'Elevator state machine:',
              codeExample:
`enum Direction { UP, DOWN, IDLE }

class Elevator {
  public currentFloor = 0;
  public direction = Direction.IDLE;
  private upQueue = new Set<number>();   // floors to stop going up
  private downQueue = new Set<number>(); // floors to stop going down

  addRequest(floor: number): void {
    if (floor > this.currentFloor) this.upQueue.add(floor);
    else if (floor < this.currentFloor) this.downQueue.add(floor);
  }

  step(): void {
    if (this.direction === Direction.UP) {
      this.currentFloor++;
      if (this.upQueue.has(this.currentFloor)) {
        this.upQueue.delete(this.currentFloor);
        console.log(\`Stop at floor \${this.currentFloor} (going up)\`);
      }
      if (this.upQueue.size === 0) {
        this.direction = this.downQueue.size > 0 ? Direction.DOWN : Direction.IDLE;
      }
    } else if (this.direction === Direction.DOWN) {
      this.currentFloor--;
      if (this.downQueue.has(this.currentFloor)) {
        this.downQueue.delete(this.currentFloor);
        console.log(\`Stop at floor \${this.currentFloor} (going down)\`);
      }
      if (this.downQueue.size === 0) {
        this.direction = this.upQueue.size > 0 ? Direction.UP : Direction.IDLE;
      }
    }
  }
}`,
              codeLanguage: 'typescript',
            },
            {
              id: 'questions',
              title: 'Common Interview Questions',
              content:
                '1. How do you dispatch a request to the optimal elevator?\n2. Compare SCAN vs. LOOK vs. Nearest Car scheduling.\n3. How do you handle a VIP / emergency override?\n4. How would you model the door-open/door-close state?\n5. How would you test this system (unit + integration)?',
            },
          ],
        },
      ],
    },
  ],
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const TRACKS: Track[] = [dsaTrack, lldTrack];

export function getTrackById(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function getLessonById(lessonId: string): {
  lesson: Lesson;
  chapter: Chapter;
  track: Track;
} | undefined {
  for (const track of TRACKS) {
    for (const chapter of track.chapters) {
      const lesson = chapter.lessons.find((l) => l.id === lessonId);
      if (lesson) return { lesson, chapter, track };
    }
  }
  return undefined;
}

export function getTotalLessons(track: Track): number {
  return track.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
}
