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

// ─── HLD Track ────────────────────────────────────────────────────────────────

const hldTrack: Track = {
  id: 'hld',
  title: 'High Level Design',
  shortTitle: 'HLD',
  description: 'Design scalable, reliable, and fault-tolerant distributed systems. The concepts behind every FAANG system design round.',
  color: '#F59E0B',
  accentColor: '#D97706',
  icon: 'server',
  chapters: [
    // ── Chapter 1: Fundamentals ───────────────────────────────────────────────
    {
      id: 'hld-fundamentals',
      title: 'System Design Fundamentals',
      lessons: [
        // ── Lesson 1: Scalability ─────────────────────────────────────────────
        {
          id: 'hld-scalability',
          title: 'Scalability & Performance',
          description: 'Vertical vs. horizontal scaling, throughput, latency, and capacity planning.',
          difficulty: 'Beginner',
          estimatedMinutes: 18,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                '**Scalability** is a system\'s ability to handle growing amounts of work by adding resources.\n\nTwo dimensions matter:\n• **Throughput**: how many requests per second the system can handle.\n• **Latency**: how long a single request takes from start to finish.\n\nA scalable system maintains acceptable latency even as throughput demands grow. These two goals often conflict — designing around their tradeoffs is the core challenge of HLD.',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                'A single server handling all traffic is a **single point of failure** and a **performance ceiling**. As users grow from 1,000 to 10 million:\n\n• CPU saturates → requests queue up → latency spikes.\n• RAM fills → the OS starts swapping → throughput collapses.\n• Disk I/O becomes the bottleneck for database-heavy workloads.\n• The server goes down for maintenance → the entire product goes down.\n\nScalability design answers: **how do we grow capacity without rebuilding the system?**',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                'Imagine a restaurant that gets overwhelmed on weekends.\n\n**Vertical scaling** = hiring a superchef who works faster. There\'s a limit to how fast one person can cook.\n\n**Horizontal scaling** = opening more kitchens in parallel, each chef handling a subset of orders. A coordinator (load balancer) assigns incoming orders to whichever kitchen is free.\n\nThe horizontal approach can grow indefinitely — you just keep opening kitchens.',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**Vertical Scaling (Scale Up)**\nAdd more CPU, RAM, or faster disk to an existing machine. Simple — no code changes needed. But it has a hard ceiling (the largest machine available) and creates a single point of failure.\n\n**Horizontal Scaling (Scale Out)**\nAdd more machines and distribute load across them using a **load balancer**. Each machine (instance) handles a subset of traffic.\n\nKey concepts that enable horizontal scaling:\n• **Statelessness**: instances don\'t store session data locally — sessions live in a shared cache (Redis).\n• **Shared storage**: databases and file stores live outside the app servers.\n• **Service discovery**: instances register themselves so the load balancer finds them.\n• **Auto-scaling**: cloud platforms automatically add/remove instances based on CPU or request rate metrics.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'Auto-scaling group configuration (AWS-style pseudocode in Java):',
              codeExample:
`// Stateless API server — all state lives in Redis, not in-memory
@RestController
public class UserController {

    private final RedisTemplate<String, User> cache;
    private final UserRepository repo;

    // Session stored in Redis, NOT in server memory
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable String id,
                        HttpSession session) {
        // Works identically on any instance — no local state
        return cache.opsForValue().getIfPresent(id,
            () -> repo.findById(id).orElseThrow());
    }
}

// Capacity planning formula
//
//   Required instances = ceil(peak_rps / rps_per_instance)
//   Safety buffer:      add 30–50% headroom above peak
//   Example:
//     Peak = 10,000 rps
//     Each instance handles 500 rps
//     Base instances = ceil(10,000 / 500) = 20
//     With 40% buffer = ceil(20 * 1.4) = 28 instances`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                '• **Fault tolerance**: losing one instance does not take down the system.\n• **Elastic cost**: scale in during off-peak hours to reduce cloud spend.\n• **Zero-downtime deployments**: roll out new versions one instance at a time (rolling deploy).\n• **Geographic distribution**: place instances in multiple regions to reduce latency for global users.\n• **No ceiling**: add instances indefinitely (bounded only by budget and coordination overhead).',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '• **Statefulness is hard**: sessions, in-memory caches, and WebSocket connections must be externalized.\n• **Data consistency**: multiple instances reading/writing the same database create race conditions and stale cache issues.\n• **Operational complexity**: you now manage fleets of servers, load balancers, and health checks.\n• **Network latency**: inter-service calls add overhead that doesn\'t exist in a single-process architecture.\n• **Vertical scaling is still needed for databases**: horizontal scaling of databases (sharding) is significantly harder than for stateless app servers.',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. When would you choose vertical scaling over horizontal scaling?\n2. What makes an application "stateless," and why does it matter for horizontal scaling?\n3. How does auto-scaling decide when to add or remove instances?\n4. What is the difference between latency and throughput? Can you improve one without impacting the other?\n5. Design a system that can scale from 1,000 to 10 million users. What changes at each order of magnitude?\n6. What is the "thundering herd" problem and how do you prevent it during a scale-out event?\n7. Explain the N+1 server rule. Why do you always run more instances than you need at peak?',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Premature over-engineering**: designing for 100M users when you have 100. Start simple; scale when the bottleneck actually appears.\n• **Ignoring the database**: scaling app servers while leaving a single database is like widening a highway but keeping a one-lane bridge at the end.\n• **Storing state in memory**: sessions, rate limit counters, and caches stored in app-server RAM break when a second instance is added.\n• **Not measuring before optimizing**: add monitoring (CPU, memory, request rate, p99 latency) before deciding where to scale.\n• **Confusing horizontal scaling with microservices**: you can horizontally scale a monolith. Microservices are a separate architectural concern.',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• **Design for statelessness from day one** — it\'s cheap to add and expensive to remove later.\n• **Use the 80/20 rule for capacity**: target 80% utilization at peak; the remaining 20% absorbs traffic spikes.\n• **Monitor p99 latency, not just average** — averages hide tail latencies that affect a meaningful fraction of users.\n• **Load test before launch** — use tools like k6, Gatling, or Locust to find the breaking point before users do.\n• **Set auto-scaling cooldown periods** — prevent rapid scale-in right after a spike that could recur within seconds.\n• **Use read replicas** to offload read-heavy workloads from the primary database.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                '**Scalability** is achieved through vertical scaling (bigger machines, simpler but capped) and horizontal scaling (more machines, complex but unlimited).\n\nHorizontal scaling requires **stateless services**, **shared storage**, and a **load balancer**.\n\nDesign for the bottleneck that exists today, not the one you imagine for the future. Measure first, scale second.\n\nKey numbers to remember:\n• A single commodity server handles ~1,000–5,000 req/s for typical CRUD APIs.\n• Adding a CDN can reduce origin traffic by 80–95% for static content.\n• A well-tuned PostgreSQL instance handles ~10,000 reads/s; writes are ~10x harder to scale.',
            },
          ],
        },

        // ── Lesson 2: Load Balancing ──────────────────────────────────────────
        {
          id: 'hld-load-balancing',
          title: 'Load Balancing',
          description: 'Distributing traffic across servers to maximize availability and throughput.',
          difficulty: 'Beginner',
          estimatedMinutes: 15,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                'A **Load Balancer (LB)** sits in front of a pool of servers and distributes incoming requests across them. It acts as the traffic cop of distributed systems.\n\nTwo layers:\n• **L4 Load Balancer** (Transport layer): routes based on IP address and TCP port. Fast, but cannot inspect HTTP content.\n• **L7 Load Balancer** (Application layer): routes based on HTTP headers, URL paths, cookies, and body content. Slower but enables advanced routing (e.g., route `/api/*` to API servers, `/static/*` to CDN).\n\nExamples: AWS ALB (L7), AWS NLB (L4), Nginx, HAProxy, Envoy.',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                'Without a load balancer:\n• All traffic hits one server — it becomes a performance bottleneck and a single point of failure.\n• Deploying a new version requires downtime.\n• You cannot scale out: you have nowhere to "spread" the additional instances.\n• A crashed server means all users experience an outage.\n\nWith a load balancer:\n• Traffic is spread evenly across healthy instances.\n• Unhealthy instances are automatically removed from the pool (health checks).\n• Rolling deployments become possible — drain traffic from one instance, update it, bring it back.',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                'A supermarket with 10 checkout lanes. The greeter at the entrance (load balancer) directs you to the shortest queue.\n\n• **Round Robin**: directs customers 1-2-3-4...-10-1-2-... in strict rotation.\n• **Least Connections**: always directs the next customer to whichever lane has the fewest people.\n• **IP Hash**: the same customer always goes to the same lane (sticky sessions).\n\nIf a cashier calls in sick (server failure), the greeter stops directing customers to that lane immediately.',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**Common Algorithms**\n\n• **Round Robin**: request 1 → server A, request 2 → server B, request 3 → server C, repeat. Simple and stateless. Best when servers have equal capacity.\n• **Weighted Round Robin**: server A gets 60% of traffic, server B gets 40%. Use when servers have different hardware specs.\n• **Least Connections**: route to the server with the fewest active connections. Best for long-lived connections (uploads, WebSockets).\n• **IP Hash**: hash the client IP to always route the same client to the same server. Enables "sticky sessions" without shared session storage.\n• **Random**: pick a random server. Statistically approaches Round Robin at scale.\n\n**Health Checks**\nThe LB periodically pings each server (e.g., `GET /health` every 5 seconds). If a server fails 3 consecutive checks, it\'s removed from the pool. Once healthy again, it\'s re-added.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'Nginx L7 load balancer configuration + Spring Boot health endpoint:',
              codeExample:
`# nginx.conf — L7 load balancer with upstream pool
upstream api_servers {
    least_conn;                    # Least-connections algorithm
    server 10.0.1.1:8080 weight=3; # Gets 3x traffic (faster machine)
    server 10.0.1.2:8080 weight=1;
    server 10.0.1.3:8080 weight=1;
    keepalive 32;                  # Reuse connections for performance
}

server {
    listen 80;

    location /api/ {
        proxy_pass http://api_servers;
        proxy_next_upstream error timeout http_500; # Retry on failure
        health_check interval=5s fails=3 passes=2;  # Health check config
    }

    location /static/ {
        proxy_pass http://cdn_servers;              # Route static to CDN
    }
}

# ──────────────────────────────────────────────────
# Spring Boot — health check endpoint (auto-provided by Actuator)

@SpringBootApplication
public class ApiServer {
    public static void main(String[] args) {
        SpringApplication.run(ApiServer.class, args);
    }
}

# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: never  # Return 200 OK only — no internals exposed`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                '• **High availability**: traffic is automatically routed away from failed instances.\n• **Horizontal scaling**: add servers to the pool without any downtime.\n• **SSL termination**: the LB handles TLS decryption, reducing CPU load on app servers.\n• **Centralized rate limiting and authentication**: inspect and enforce at one place.\n• **Zero-downtime deployments**: drain connections from one instance at a time during updates.',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '• **Single point of failure** if the load balancer itself is not redundant (use active-passive or active-active LB pairs).\n• **Sticky sessions** (IP hash) defeat the purpose of horizontal scaling — a crashed server loses all sessions for those IPs.\n• **Additional latency**: every request has an extra network hop.\n• **L7 LB is CPU-intensive**: inspecting HTTP content consumes significant resources under high traffic.\n• **Cost**: managed load balancers (AWS ALB) add per-request cost.',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. What is the difference between L4 and L7 load balancing? When would you use each?\n2. How do health checks work, and what happens when a server fails a health check?\n3. What is sticky session routing, and what problem does it solve? What does it break?\n4. How does the load balancer itself avoid being a single point of failure?\n5. Design a blue-green deployment using a load balancer.\n6. What is the difference between a load balancer and a reverse proxy?\n7. How would you route WebSocket connections through a load balancer?',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Not making the LB itself redundant**: an HA pair of load balancers (active-passive) with failover is required in production.\n• **Using Round Robin for long requests**: a 30-second file upload holding a connection on one server while other connections are sent there makes that server overloaded.\n• **Relying on IP-based sticky sessions**: NAT and mobile networks change client IPs frequently, breaking the routing guarantee.\n• **Too-long health check intervals**: if health checks run every 60 seconds, a failed server handles traffic for up to 60 seconds before being removed.',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• Use **Least Connections** as your default algorithm — it handles heterogeneous request durations better than Round Robin.\n• Set health check interval to **5–10 seconds** with a threshold of **2–3 failures** before marking unhealthy.\n• Enable **connection draining** (deregistration delay): when removing a server, give existing connections 30–60 seconds to complete before forcing them closed.\n• **Separate LBs by traffic type**: put WebSocket connections on a separate LB from HTTP API traffic to avoid tuning conflicts.\n• Use **weighted routing** during canary deployments: route 5% of traffic to the new version, validate, then gradually increase to 100%.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                'A **Load Balancer** distributes incoming requests across a pool of servers using algorithms like Round Robin, Least Connections, or IP Hash.\n\nL4 (network layer) balancers are fast and simple. L7 (application layer) balancers are powerful and enable content-based routing.\n\nHealth checks automatically remove failed servers; connection draining ensures graceful shutdowns. The LB itself must be made redundant to avoid becoming the single point of failure it was designed to eliminate.',
            },
          ],
        },

        // ── Lesson 3: Caching ─────────────────────────────────────────────────
        {
          id: 'hld-caching',
          title: 'Caching Strategies',
          description: 'Cache-aside, write-through, TTL, eviction policies, and Redis patterns.',
          difficulty: 'Intermediate',
          estimatedMinutes: 20,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                '**Caching** stores the result of an expensive computation or data fetch in fast memory so future requests can be served without repeating the work.\n\nCache hierarchy (fastest to slowest):\n1. **CPU L1/L2/L3 cache** — nanoseconds\n2. **Application in-memory cache** — microseconds\n3. **Distributed cache (Redis, Memcached)** — <1ms\n4. **Database** — 1–10ms (in-memory), 10–100ms (disk)\n5. **Remote API / disk** — 50ms–seconds\n\nIn system design, caching usually refers to a **distributed cache** like Redis sitting between the application servers and the database.',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                'Databases are the most common bottleneck in web systems. Consider a social media feed:\n• 1 million users view their feed every hour.\n• Each feed query joins 5 tables and takes 50ms.\n• That\'s **1M × 50ms = 50,000 seconds of DB compute per hour**.\n\nWith caching:\n• The first user who requests a feed causes the 50ms DB query.\n• The result is stored in Redis for 60 seconds.\n• The next 999 users in that minute get the result from Redis in <1ms.\n• Database load drops by 99%+.',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                'A reference librarian keeps a stack of frequently-requested books on their desk rather than walking to the stacks every time.\n\n• **Cache hit**: the librarian finds the book on their desk — fast.\n• **Cache miss**: the book isn\'t on the desk — they walk to the stacks, get it, and add it to the desk for next time.\n• **Eviction**: when the desk is full, they return the least recently used book to the stacks to make room.\n• **TTL (Time to Live)**: books stay on the desk for at most one day; after that, they assume the information may be outdated and fetch a fresh copy.',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**Cache-Aside (Lazy Loading)**\nApp checks cache → cache miss → app fetches from DB → app writes result to cache → return.\nPros: only requested data is cached. Cons: first request after a miss is slow (cold start).\n\n**Write-Through**\nOn every write, the app updates the DB AND the cache in one operation.\nPros: cache is always fresh. Cons: writes are slower; cache fills with data that may never be read.\n\n**Write-Behind (Write-Back)**\nApp writes to cache only; the cache asynchronously flushes to the DB.\nPros: extremely fast writes. Cons: risk of data loss if the cache crashes before flush.\n\n**Eviction Policies**\n• **LRU (Least Recently Used)**: evict the item not accessed for the longest time.\n• **LFU (Least Frequently Used)**: evict the item accessed the fewest times.\n• **TTL-based**: all items expire after a fixed time regardless of access.\n\n**Cache Stampede / Thundering Herd**\nWhen a popular key expires, hundreds of requests simultaneously miss the cache and hammer the DB. Solutions: lock + single-flight (only one request fetches; others wait), or probabilistic early expiration.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'Cache-aside with Redis + Spring Boot, including stampede protection:',
              codeExample:
`@Service
public class UserService {

    private final StringRedisTemplate redis;
    private final UserRepository db;
    private final ObjectMapper mapper;

    private static final Duration TTL = Duration.ofMinutes(5);
    private static final String KEY_PREFIX = "user:";

    // ── Cache-Aside Pattern ───────────────────────────────────────────────────
    public User getUser(String userId) throws Exception {
        String key = KEY_PREFIX + userId;

        // 1. Check cache first
        String cached = redis.opsForValue().get(key);
        if (cached != null) {
            return mapper.readValue(cached, User.class); // cache hit
        }

        // 2. Cache miss — fetch from DB
        User user = db.findById(userId)
                      .orElseThrow(UserNotFoundException::new);

        // 3. Populate cache (TTL prevents stale data forever)
        redis.opsForValue().set(key, mapper.writeValueAsString(user), TTL);
        return user;
    }

    // ── Write-Through: update DB + invalidate cache atomically ────────────────
    public User updateUser(String userId, UpdateUserRequest req) throws Exception {
        User updated = db.save(buildUpdate(userId, req)); // write to DB first

        // Invalidate (not update) cache — avoid writing stale data
        redis.delete(KEY_PREFIX + userId);
        return updated;
    }

    // ── Stampede protection: Redis SET NX (only one thread populates cache) ───
    public User getUserSafe(String userId) throws Exception {
        String key = KEY_PREFIX + userId;
        String lockKey = "lock:" + key;

        String cached = redis.opsForValue().get(key);
        if (cached != null) return mapper.readValue(cached, User.class);

        // Acquire lock — only one request fetches from DB
        Boolean acquired = redis.opsForValue()
            .setIfAbsent(lockKey, "1", Duration.ofSeconds(10));

        if (Boolean.TRUE.equals(acquired)) {
            try {
                User user = db.findById(userId).orElseThrow();
                redis.opsForValue().set(key, mapper.writeValueAsString(user), TTL);
                return user;
            } finally {
                redis.delete(lockKey);
            }
        }

        // Another thread is fetching — wait and retry
        Thread.sleep(50);
        return getUser(userId);
    }
}`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                '• **Drastic latency reduction**: Redis serves responses in <1ms vs 10–100ms for database queries.\n• **Database offload**: 90–99% of read traffic can be served from cache, protecting the database at scale.\n• **Cost reduction**: fewer database queries means smaller database instances, lower cloud spend.\n• **Resilience**: a cache can continue serving reads even during brief database outages.\n• **Throughput multiplication**: a single Redis cluster can handle millions of requests per second.',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '• **Stale data**: cached data can become inconsistent with the database during the TTL window.\n• **Cache invalidation is hard**: Phil Karlton famously called it one of the two hard problems in CS.\n• **Cold start**: after a restart or cache flush, all requests miss the cache and hit the database simultaneously.\n• **Memory is limited**: you cannot cache everything — you must choose which data to cache.\n• **Operational complexity**: running Redis adds another component to monitor, back up, and secure.\n• **Cache stampede**: popular keys expiring simultaneously causes a thundering herd on the database.',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. What is the difference between cache-aside and write-through caching?\n2. How do you handle cache invalidation when data is updated? Delete the key, or update it?\n3. What is a cache stampede and how do you prevent it?\n4. How would you cache a user\'s social media feed that changes frequently?\n5. What eviction policy would you choose for a news website? A gaming leaderboard?\n6. How does CDN caching differ from application-level caching?\n7. How do you warm up a cache after a deployment to prevent a cold-start surge?',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Caching mutable, user-specific data globally**: caching user A\'s private data where user B can access it is a serious security bug.\n• **Setting TTL too long**: stale data shown to users (e.g., wrong prices, deleted posts).\n• **Setting TTL too short**: cache becomes ineffective; all requests still go to the database.\n• **Forgetting to invalidate on write**: users see outdated data after updating their profile, for example.\n• **Not handling cache misses gracefully**: if Redis is down, the application should fall back to the database, not crash.\n• **Caching computed aggregates without invalidation logic**: caching "total post count" but forgetting to update it when a post is deleted.',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• **Prefer cache invalidation (delete) over cache update**: deleting the key on write is simpler and avoids race conditions.\n• **Use namespace prefixes**: `user:123`, `post:456` — prevents key collisions in a shared Redis cluster.\n• **Set a TTL on every key** — no TTL means the cache grows forever until it runs out of memory.\n• **Use Redis Cluster for production** — single Redis is a single point of failure; cluster provides sharding and replication.\n• **Monitor cache hit rate** — a hit rate below 80% usually means something is wrong with the caching strategy.\n• **Cache at the right layer**: cache DB query results (fine-grained) or full HTTP responses (coarse-grained, simpler); choose based on how often the data changes.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                '**Caching** is the single highest-ROI optimization in most web systems. A distributed cache like **Redis** sits between app servers and the database, serving repeated reads from memory.\n\nThe three patterns are **cache-aside** (read-lazy, most common), **write-through** (always fresh, slower writes), and **write-behind** (fastest writes, risk of loss).\n\nThe two hard problems: **stale data** (mitigated by short TTLs and invalidation on write) and **cache stampede** (mitigated by locking or probabilistic early expiration).\n\nAlways monitor your **cache hit rate** — it is the single most important metric for a caching layer.',
            },
          ],
        },
      ],
    },

    // ── Chapter 2: Data Management ────────────────────────────────────────────
    {
      id: 'hld-data',
      title: 'Data Management at Scale',
      lessons: [
        // ── Lesson 4: SQL vs NoSQL ────────────────────────────────────────────
        {
          id: 'hld-sql-nosql',
          title: 'SQL vs NoSQL',
          description: 'When to use relational databases, document stores, wide-column stores, and graph databases.',
          difficulty: 'Intermediate',
          estimatedMinutes: 18,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                'The database is almost always the hardest component to scale. The first architectural decision is **SQL vs NoSQL**.\n\n**SQL (Relational)** databases (PostgreSQL, MySQL, Aurora) store data in tables with fixed schemas. They enforce ACID transactions and support powerful multi-table joins.\n\n**NoSQL** databases trade some of those guarantees for **flexibility and horizontal scalability**:\n• **Document** (MongoDB, Firestore): JSON documents, flexible schema.\n• **Key-Value** (Redis, DynamoDB): simple get/set by key, extremely fast.\n• **Wide-Column** (Cassandra, HBase): optimized for massive write throughput and time-series data.\n• **Graph** (Neo4j): first-class relationships, social networks, recommendation engines.',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                'SQL databases are excellent but face two limits at internet scale:\n\n1. **Vertical scaling ceiling**: a single relational DB can handle ~10,000–100,000 reads/s. Beyond that, you must either shard (extremely complex) or choose a DB designed for horizontal scale from day one.\n\n2. **Schema rigidity**: changing the schema of a table with 100 million rows requires a careful migration that may lock the table for hours.\n\nNoSQL databases were designed by companies (Google, Amazon, Facebook) that hit these ceilings and needed databases that could scale horizontally without manual sharding.',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                '**SQL is like a spreadsheet** with strict column headers. Every row must have the same columns. If you want to add a column, you must modify the entire spreadsheet.\n\n**NoSQL document store is like a filing cabinet** with folders. Each folder (document) can contain different fields. One folder might have a phone number; another might not. You can change what\'s inside each folder without touching the others.\n\n**Wide-column stores are like a combination**: rows are identified by a key, but each row can have a different set of columns — optimized for writing millions of rows per second.',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**SQL: ACID Transactions**\nAtomicity, Consistency, Isolation, Durability. All-or-nothing multi-row operations. Perfect for financial transactions, inventory, and anything requiring strict consistency.\n\n**NoSQL: BASE**\nBasically Available, Soft state, Eventually consistent. Prioritizes availability and partition tolerance over strict consistency. A write may not be immediately visible on all replicas (milliseconds of lag).\n\n**When to use SQL**:\n• Complex relationships requiring JOINs across multiple tables.\n• Financial data, inventory, reservations — anywhere money or correctness is critical.\n• OLAP/analytics queries that aggregate data in complex ways.\n• Your data fits on one machine (start here — premature optimization is real).\n\n**When to use NoSQL**:\n• Massive write throughput (Cassandra: millions of writes/second).\n• Schema changes are frequent and unpredictable (product catalogs, user profiles).\n• Simple access patterns: always access by primary key or a fixed set of indexes.\n• Horizontal scaling is required from day one.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'Same "user posts" data modeled in SQL (JPA) vs NoSQL (MongoDB):',
              codeExample:
`// ── SQL (PostgreSQL via JPA) — normalized, relational ────────────────────────

@Entity
@Table(name = "posts")
public class Post {
    @Id @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")  // Foreign key — JOIN to users table
    private User author;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Comment> comments;  // JOIN to comments table

    private Instant createdAt;
}

// Query: get top 10 posts with comment counts (multi-table JOIN)
// SELECT p.*, COUNT(c.id) AS comment_count
//   FROM posts p LEFT JOIN comments c ON p.id = c.post_id
//  GROUP BY p.id ORDER BY p.created_at DESC LIMIT 10;


// ── NoSQL (MongoDB) — denormalized document ───────────────────────────────────

// Document stored in MongoDB (schemaless — no migration needed)
{
  "_id": "post-uuid-123",
  "content": "Hello world",
  "author": {
    "id": "user-uuid-456",
    "name": "Alice",             // Denormalized — no JOIN needed
    "avatarUrl": "..."
  },
  "commentCount": 42,            // Precomputed — updated on each comment write
  "tags": ["java", "system-design"],  // Flexible array field
  "createdAt": "2025-01-15T10:00:00Z"
}

// Query: top 10 posts — no JOIN, no GROUP BY, single document read
// db.posts.find().sort({ createdAt: -1 }).limit(10)`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                '**SQL advantages**: ACID compliance, powerful query language (JOINs, aggregations), well-understood tooling, mature ecosystem, schema enforces data integrity.\n\n**NoSQL advantages**: horizontal scaling built-in, flexible schema (iterate fast without migrations), optimized for specific access patterns, can handle massive write throughput, multi-region replication built-in.',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '**SQL disadvantages**: vertical scaling ceiling, expensive JOINs at scale, schema migrations are risky on large tables, single-leader replication limits write throughput.\n\n**NoSQL disadvantages**: eventual consistency can cause users to see stale data, no standard query language (each DB is different), denormalization causes data duplication and update complexity, limited or no JOIN support, transactions are limited (many NoSQL DBs have added them, but not universally).',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. You are designing a banking system. Would you use SQL or NoSQL? Why?\n2. You are designing Twitter. Users have timelines with billions of tweets. What database would you use for the tweet store?\n3. What is eventual consistency? How would you explain it to a non-technical stakeholder?\n4. What is a document database and when would you choose MongoDB over PostgreSQL?\n5. How does Cassandra achieve high write throughput? What does it sacrifice?\n6. Can you use both SQL and NoSQL in the same system? Give an example.\n7. What is a wide-column database and what workloads is it designed for?',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Defaulting to NoSQL because it "scales"**: start with PostgreSQL. It scales further than most applications ever reach, and you get ACID for free.\n• **Using a document DB and then needing JOINs**: if you find yourself reconstructing JOINs in application code, you chose the wrong DB.\n• **Ignoring the access pattern**: the access pattern drives the database choice. Cassandra is optimized for "write once, read by time range." Using it as a general-purpose DB produces terrible performance.\n• **Over-normalizing in MongoDB**: embedding related data in the same document (denormalization) is the correct MongoDB pattern — not creating "virtual foreign keys."',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• **Define your access patterns before choosing a database** — the access pattern is the primary constraint.\n• **Use PostgreSQL as your default** until you hit a measurable bottleneck.\n• **Polyglot persistence is fine**: use PostgreSQL for transactional data, Redis for caching, Elasticsearch for full-text search, Cassandra for time-series events.\n• **Design around the primary key in NoSQL**: all queries must go through the primary key (or a secondary index). If your access pattern doesn\'t fit, the DB choice is wrong.\n• **Never use MongoDB because you think your schema will change a lot** — PostgreSQL supports JSON columns; you can have both schema flexibility and ACID.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                '**SQL** = ACID, powerful queries, normalization, vertical scaling. Use for anything requiring strict consistency or complex queries.\n\n**NoSQL** = BASE, horizontal scaling, flexible schema, optimized for specific access patterns. Use when SQL genuinely becomes the bottleneck.\n\nThe golden rule: **match the database to the access pattern**, not the other way around. Most systems benefit from **polyglot persistence** — SQL for core transactional data, Redis for caching, Elasticsearch for search, Cassandra for time-series.',
            },
          ],
        },

        // ── Lesson 5: Database Sharding & Replication ─────────────────────────
        {
          id: 'hld-sharding',
          title: 'Database Sharding & Replication',
          description: 'Horizontally partition data and replicate across nodes for fault tolerance.',
          difficulty: 'Advanced',
          estimatedMinutes: 22,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                '**Replication** copies data across multiple servers (replicas). Reads can be served from any replica; writes go to the primary.\n\n**Sharding** horizontally partitions data across multiple servers (shards). Each shard holds a different subset of data.\n\nThese are complementary strategies:\n• Replication improves **read throughput** and **fault tolerance**.\n• Sharding improves **write throughput** and allows data to exceed a single machine\'s storage.\n\nA production system at scale typically combines both: multiple shards, each with its own primary-replica cluster.',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                'A single database eventually hits limits:\n• **Storage ceiling**: one machine can hold ~10–100TB. Instagram\'s photos alone exceed petabytes.\n• **Write throughput ceiling**: a single PostgreSQL primary handles ~10,000 writes/second. At 100M users, peak write rate far exceeds this.\n• **Single point of failure**: if the primary crashes, writes are unavailable until failover completes.\n\nReplication solves the fault tolerance and read scale problems. Sharding solves the write scale and storage problems.',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                '**Replication** = photocopying a textbook so 30 students can each read a copy simultaneously. Changes to the book (writes) must be made to the master copy first, then photocopied to all student copies.\n\n**Sharding** = splitting a massive encyclopedia into volumes A-F, G-M, N-Z, each stored on a different shelf. To find "Python," you go directly to the N-Z shelf. No single shelf needs to hold the entire encyclopedia.',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**Replication**\n• **Primary (Master)**: receives all writes. Replicates to replicas via a write-ahead log (WAL) or binlog.\n• **Replicas (Read Replicas)**: receive replicated data asynchronously (usually <1s lag). Serve read queries.\n• **Failover**: if the primary fails, a replica is promoted to primary (automatic in managed services like RDS Multi-AZ).\n\n**Sharding Strategies**\n\n• **Range sharding**: shard by a range of key values. Shard 1: user IDs 1–1M, Shard 2: 1M–2M. Problem: hot spots if recent IDs are most active.\n• **Hash sharding**: shard_index = hash(key) % num_shards. Distributes evenly but makes range queries expensive.\n• **Directory sharding**: a lookup table maps each key to a shard. Most flexible, but the lookup table itself becomes a bottleneck.\n• **Consistent hashing**: places keys and shards on a virtual ring. Adding a shard only remaps keys adjacent to it — no full data reshuffle. Used by DynamoDB, Cassandra, Redis Cluster.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'Consistent hashing shard router in Java:',
              codeExample:
`import java.util.SortedMap;
import java.util.TreeMap;

/**
 * Consistent Hash Ring for database shard routing.
 * Adding/removing a shard only remaps O(keys/shards) keys.
 */
public class ConsistentHashRing {

    private final SortedMap<Integer, String> ring = new TreeMap<>();
    private final int virtualNodes; // replicas per shard for even distribution

    public ConsistentHashRing(int virtualNodes) {
        this.virtualNodes = virtualNodes;
    }

    public void addShard(String shardId) {
        for (int i = 0; i < virtualNodes; i++) {
            int hash = hash(shardId + "-vnode-" + i);
            ring.put(hash, shardId);
        }
    }

    public void removeShard(String shardId) {
        for (int i = 0; i < virtualNodes; i++) {
            int hash = hash(shardId + "-vnode-" + i);
            ring.remove(hash);
        }
    }

    /** Returns the shard responsible for a given key. */
    public String getShardFor(String key) {
        if (ring.isEmpty()) throw new IllegalStateException("No shards available");
        int hash = hash(key);
        // Find the first shard clockwise on the ring
        SortedMap<Integer, String> tail = ring.tailMap(hash);
        int nodeHash = tail.isEmpty() ? ring.firstKey() : tail.firstKey();
        return ring.get(nodeHash);
    }

    private int hash(String key) {
        return key.hashCode() & 0x7fffffff; // ensure positive
    }

    // Usage:
    // ConsistentHashRing ring = new ConsistentHashRing(150); // 150 vnodes each
    // ring.addShard("shard-1"); ring.addShard("shard-2"); ring.addShard("shard-3");
    // String shard = ring.getShardFor("user-id-abc123"); // → "shard-2"
}`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                '**Replication advantages**: read throughput scales linearly with replicas, automatic failover, cross-region reads for global low-latency.\n\n**Sharding advantages**: write throughput scales linearly with shards, unlimited storage growth, fault isolation (one shard failing only affects its key range).',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '• **Cross-shard queries are slow**: JOINs across shards require scatter-gather (query all shards, merge results in application code).\n• **Rebalancing**: adding a new shard requires moving data — expensive and risky if not handled carefully (consistent hashing minimizes this).\n• **Hot spots**: if data access is skewed (celebrity user accounts, viral posts), one shard gets all the traffic.\n• **Transaction complexity**: ACID transactions that span multiple shards require distributed transaction protocols (2-Phase Commit), which are slow and complex.\n• **Increased operational burden**: more nodes = more hardware, monitoring, and potential failure points.',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. What is the difference between sharding and replication? Which solves which problem?\n2. What is a hot spot in a sharded database, and how do you mitigate it?\n3. Explain consistent hashing. Why is it preferred over simple hash-modulo sharding?\n4. How would you shard the users table of a social network with 1 billion users?\n5. What is replication lag and how does it affect application behavior?\n6. How do you handle a cross-shard JOIN query?\n7. What happens to sharding when you add a new shard to a modulo-hash ring?',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Sharding too early**: sharding adds enormous complexity. Exhaust vertical scaling, read replicas, and caching first.\n• **Choosing a poor shard key**: a shard key that creates hot spots (e.g., timestamp-based for time-series data where all current writes go to the latest shard) defeats the purpose.\n• **Forgetting cross-shard implications**: application-level JOINs are complex. Design your sharding strategy around your query patterns.\n• **Not planning for rebalancing**: adding a shard requires data migration. Design the migration strategy before launch, not during a crisis.',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• **Shard key selection is critical**: choose a high-cardinality key with uniform distribution. User ID (UUID or hash of username) is typically good.\n• **Use virtual nodes (vnodes)** in consistent hashing to prevent uneven distribution when shards have different capacities.\n• **Proxy the sharding logic**: use a dedicated shard proxy layer (Vitess for MySQL, Citus for PostgreSQL) rather than embedding shard routing in every service.\n• **Keep shard count low at first**: start with 2–4 shards. Each shard can be promoted to a new cluster as it fills.\n• **Never shard the session table**: sessions are small and read frequently. They belong in Redis.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                '**Replication** (primary + replicas) scales reads and provides fault tolerance. **Sharding** splits data across multiple nodes, scaling writes and storage.\n\nShard key choice is the most critical decision: pick a key with high cardinality and uniform distribution. **Consistent hashing** minimizes data movement when adding/removing shards.\n\nThe operational cost is high — exhaust all simpler options before sharding. Most applications scale to tens of millions of users without needing to shard their primary database.',
            },
          ],
        },

        // ── Lesson 6: CAP Theorem ─────────────────────────────────────────────
        {
          id: 'hld-cap',
          title: 'CAP Theorem',
          description: 'Consistency, Availability, and Partition Tolerance — why you can only guarantee two.',
          difficulty: 'Intermediate',
          estimatedMinutes: 14,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                'The **CAP Theorem** (Brewer, 2000) states that a distributed data store can provide at most **two** of these three guarantees simultaneously:\n\n• **C — Consistency**: every read receives the most recent write (or an error).\n• **A — Availability**: every request receives a (non-error) response — not necessarily the most recent data.\n• **P — Partition Tolerance**: the system continues operating even when network messages between nodes are lost or delayed.\n\nIn practice, **network partitions always happen** (cables fail, packets drop, data centers lose connectivity). Therefore, the real design choice is always **CP vs AP** — Consistency vs Availability when a partition occurs.',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                'When two database nodes (primary and replica) lose network connectivity:\n• **CP choice**: stop accepting writes (or return errors) to prevent stale reads. Users see errors but data is always correct.\n• **AP choice**: keep accepting reads and writes on both sides. Users always get a response, but the two nodes diverge — they must be reconciled when the partition heals.\n\nThe CAP Theorem forces architects to make an **explicit business decision**: is correctness or availability more important for this specific data?',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                'Two branches of a bank lose phone connectivity (network partition).\n\n**CP (Consistency over Availability)**: Branch B refuses to process transactions ("our systems are down — please visit Branch A"). Customers are frustrated, but there is no risk of double-spending.\n\n**AP (Availability over Consistency)**: Both branches keep processing. Customer John withdraws from Branch A and Branch B simultaneously. When connectivity is restored, the bank discovers an overdraft and must reconcile the conflict.\n\nDifferent accounts have different requirements: savings account (CP — correctness critical), basic informational lookup (AP — stale data is acceptable).',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**CP Systems** (ZooKeeper, etcd, HBase, strong-consistency PostgreSQL)\nDuring a partition: the minority partition (the side that can\'t reach a quorum of nodes) stops serving requests. Clients on the minority partition get errors.\nUse for: distributed locks, configuration management, financial transactions — anything where correctness is non-negotiable.\n\n**AP Systems** (Cassandra, DynamoDB, CouchDB)\nDuring a partition: all nodes continue serving reads and writes. Nodes reconcile when the partition heals using **conflict resolution** (last-write-wins, vector clocks, or application-level merge).\nUse for: shopping carts, user sessions, social media feeds — anything where a stale response is better than an error.\n\n**PACELC Extension**\nCAP only describes behavior during a partition. PACELC adds: even without a partition, there is a tradeoff between **latency** (L) and **consistency** (C). Waiting for all replicas to confirm a write is consistent but slow; acknowledging before all replicas confirm is fast but potentially inconsistent.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'Cassandra tunable consistency (AP → CP by adjusting quorum level):',
              codeExample:
`// Cassandra allows per-query tuning of the CP/AP tradeoff
// via ConsistencyLevel — a real implementation of PACELC

// ── AP: Available but potentially stale (ONE = fastest, least consistent) ────
Statement readFast = QueryBuilder
    .selectFrom("users").column("profile")
    .whereColumn("user_id").isEqualTo(userId)
    .build()
    .setConsistencyLevel(ConsistencyLevel.ONE);  // Ask only 1 replica

// ── CP: Consistent but slower (QUORUM = majority must agree) ─────────────────
Statement readStrong = QueryBuilder
    .selectFrom("account_balances").all()
    .whereColumn("account_id").isEqualTo(accountId)
    .build()
    .setConsistencyLevel(ConsistencyLevel.QUORUM); // Majority must respond

// For writes, QUORUM write + QUORUM read = strong consistency
// because: writeQuorum + readQuorum > replication_factor
// Example: RF=3, QUORUM=2 → 2+2=4 > 3 → guaranteed to see latest write

// ── PostgreSQL: CP by default, with read replicas as AP reads ────────────────
// Primary write (CP — durably committed)
jdbcPrimary.update("UPDATE accounts SET balance = ? WHERE id = ?", newBalance, accountId);

// Replica read (AP — may be milliseconds stale due to replication lag)
Account account = jdbcReplica.queryForObject(
    "SELECT * FROM accounts WHERE id = ?",
    Account.class, accountId
);`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                'Understanding CAP provides a **principled framework** for architectural decisions:\n• You can explicitly choose the tradeoff per data type (financial data = CP, user preferences = AP).\n• It prevents over-engineering (trying to achieve all three simultaneously).\n• It guides failure mode planning: CP systems fail with errors; AP systems fail with stale data.',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '• CAP is often **misapplied** — it describes behavior only during network partitions, not during normal operation.\n• The model is **binary and simplified** — real systems have tunable consistency (Cassandra\'s quorum) rather than an absolute choice.\n• **PACELC is more practical** for modern systems that must also reason about latency, but it\'s more complex to explain.',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. Explain CAP theorem in plain English. Why can\'t you have all three?\n2. Is Amazon DynamoDB CP or AP? How does its "Eventually Consistent" read option fit?\n3. Is a traditional PostgreSQL database CP or AP?\n4. If you were designing a shopping cart, would you choose CP or AP? Why?\n5. What is eventual consistency? How do you handle conflicts when two nodes diverge?\n6. What is PACELC and how does it extend the CAP theorem?\n7. You have a social media "like count" feature. Is it acceptable for this to be AP? Why?',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Saying "CA" databases exist**: CA (consistent + available, no partition tolerance) is only possible in a single-node system. Any distributed system must tolerate partitions.\n• **Treating CAP as a one-time choice**: you can have CP for some operations and AP for others in the same system (different tables, different consistency levels).\n• **Confusing consistency with durability**: CAP consistency means "all nodes see the same data." Durability means "committed data survives crashes." These are different properties.',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• **Make the CP/AP decision per data type**, not per system. Financial balances (CP), user avatars (AP).\n• **Prefer AP for user-facing features** where an eventual response with slightly stale data beats an error response.\n• **Design AP systems with conflict resolution in mind**: last-write-wins works for simple data; vector clocks or CRDTs are needed for complex merges.\n• **When choosing CP**: design for graceful degradation — serve a cached response rather than a 500 error when the consistent store is unavailable.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                'The **CAP Theorem** states: during a network partition, a distributed system can be either **consistent** (CP — return errors rather than stale data) or **available** (AP — return data that might be stale).\n\nSince network partitions are unavoidable, the real decision is **CP vs AP**.\n\nMost modern systems are **tunable**: Cassandra lets you choose quorum level per query; PostgreSQL is CP by default but read replicas are AP. Design your consistency requirements per data type, not per system.',
            },
          ],
        },
      ],
    },

    // ── Chapter 3: Distributed Systems ───────────────────────────────────────
    {
      id: 'hld-distributed',
      title: 'Distributed Systems',
      lessons: [
        // ── Lesson 7: Message Queues ──────────────────────────────────────────
        {
          id: 'hld-message-queues',
          title: 'Message Queues & Event-Driven Architecture',
          description: 'Kafka, RabbitMQ, async decoupling, fan-out, and event sourcing.',
          difficulty: 'Intermediate',
          estimatedMinutes: 20,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                'A **Message Queue** is a buffer that stores messages between a **producer** (writes events) and a **consumer** (reads and processes events) asynchronously.\n\nTwo paradigms:\n• **Queue (Point-to-Point)**: one consumer processes each message. RabbitMQ, SQS. Used for task distribution.\n• **Topic/Log (Pub-Sub)**: many consumers can independently read the same message stream. Kafka, Kinesis. Used for event streaming.\n\n**Apache Kafka** is the dominant platform for high-throughput event streaming: it stores ordered, immutable logs of events that multiple consumer groups can read independently and replay.',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                'Without message queues, services call each other synchronously:\n• Service A calls Service B directly (HTTP). If B is slow, A waits and is also slow.\n• If B crashes, A\'s request fails immediately.\n• A sudden spike of 100K orders per second must all be processed NOW — there\'s no buffer.\n• Multiple services (email, analytics, shipping) all need to react to "order placed" — A must call all of them, coupling A to every downstream service.\n\nMessage queues solve all of these: A publishes an event and returns immediately. Downstream services consume at their own pace. Services are decoupled.',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                'A restaurant order system.\n\n**Without queue (synchronous)**: the waiter (producer) stands at the kitchen window and waits for the chef (consumer) to finish cooking before going to the next table. If the kitchen is backed up, all waiters are blocked.\n\n**With queue (async)**: the waiter writes the order on a ticket and puts it in a revolving ticket holder (message queue). The chef takes tickets at their own pace. The waiter immediately goes back to serve more customers. If orders spike on Saturday night, tickets accumulate — but nothing crashes. When the kitchen catches up, it works through the backlog.',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**Kafka Core Concepts**\n• **Topic**: a named log of events (e.g., `orders`, `user-clicks`, `payment-processed`).\n• **Partition**: each topic is split into ordered partitions for parallelism. A partition is consumed by exactly one consumer in a group at a time.\n• **Offset**: the position of a consumer within a partition. Consumers commit their offset after processing; on restart, they resume from where they left off.\n• **Consumer Group**: a set of consumers sharing work. Kafka distributes partitions across group members.\n• **Retention**: Kafka retains events for a configurable period (7 days default) — consumers can replay historical events.\n\n**Fan-Out Pattern**\nMultiple consumer groups independently consume the same topic. Example: "order-placed" topic consumed by Billing Group, Shipping Group, Analytics Group — all independently, at their own pace, without coupling.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'Kafka producer and consumer with Spring Kafka:',
              codeExample:
`// ── Producer: publish "order placed" event ────────────────────────────────────
@Service
public class OrderService {

    private final KafkaTemplate<String, OrderEvent> kafka;

    public Order placeOrder(CreateOrderRequest req) {
        Order order = orderRepo.save(buildOrder(req));  // DB write first

        // Publish event — returns immediately (async)
        kafka.send("orders",
            order.getId(),      // key = order ID (ensures same order → same partition)
            new OrderEvent(order.getId(), order.getUserId(), order.getTotalAmount())
        );

        return order;  // Response sent to client before downstream services run
    }
}

// ── Consumer Group 1: Billing service ─────────────────────────────────────────
@Component
public class BillingConsumer {

    @KafkaListener(topics = "orders", groupId = "billing-service")
    public void processPayment(OrderEvent event) {
        paymentService.charge(event.getUserId(), event.getAmount());
        // If this fails, the offset is NOT committed — Kafka retries automatically
    }
}

// ── Consumer Group 2: Shipping service ────────────────────────────────────────
@Component
public class ShippingConsumer {

    @KafkaListener(topics = "orders", groupId = "shipping-service")
    public void createShipment(OrderEvent event) {
        shippingService.schedulePickup(event.getOrderId());
        // Runs independently of billing — no coupling
    }
}

// ── Consumer Group 3: Analytics ───────────────────────────────────────────────
@Component
public class AnalyticsConsumer {

    @KafkaListener(topics = "orders", groupId = "analytics-service",
                   properties = "auto.offset.reset=earliest")  // Replay from start
    public void recordMetric(OrderEvent event) {
        analyticsDb.insert(event);
    }
}`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                '• **Decoupling**: producers don\'t know about consumers. Add a new consumer without touching the producer.\n• **Buffering**: absorbs traffic spikes. Consumers process at a sustainable rate even during peak load.\n• **Fault tolerance**: if a consumer crashes mid-processing, the offset isn\'t committed — the message is reprocessed when it restarts.\n• **Replay**: Kafka retains the log — you can replay events to rebuild a new service\'s state or replay after a bug fix.\n• **Fan-out**: one event → many independent consumers, each doing something different.',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '• **Eventual processing**: the downstream action (email, shipment) happens after the response — users won\'t see it immediately.\n• **Ordering**: Kafka guarantees order within a partition, not globally across partitions. Cross-partition ordering requires careful key design.\n• **Exactly-once semantics is hard**: at-least-once delivery is simple; exactly-once (process each message exactly once, no duplicates) requires idempotent consumers and transactional producers.\n• **Operational complexity**: Kafka clusters require ZooKeeper (or KRaft), broker management, partition rebalancing, and monitoring.\n• **Debugging is harder**: async flows are harder to trace than synchronous call stacks. Distributed tracing (OpenTelemetry) is essential.',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. When would you use a message queue instead of a direct HTTP API call between services?\n2. What is the difference between a message queue (RabbitMQ) and a message log (Kafka)? When would you use each?\n3. What is a consumer group and how does it enable parallel processing?\n4. How does Kafka guarantee message order? Is it guaranteed globally or per-partition?\n5. What is at-least-once delivery? What is idempotency and why is it required with at-least-once delivery?\n6. Design a notification system (email, SMS, push) using a message queue.\n7. How would you use Kafka to implement the "inbox" feature in a social media app?',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Not designing consumers for idempotency**: at-least-once delivery means a message can be delivered multiple times (e.g., after a consumer crash). Processing it twice must produce the same result as processing it once.\n• **Using a queue for synchronous, user-facing operations**: if the user needs the result immediately, a queue adds unnecessary latency and complexity.\n• **Too many partitions**: each partition requires file handles on brokers. Thousands of partitions can overwhelm the cluster.\n• **Not committing offsets at the right point**: committing before processing means messages can be lost on crash; committing after means duplicates. Choose deliberately.',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• **Design consumers to be idempotent** — assume each message will be delivered at least once.\n• **Use partition keys** to guarantee ordering for related events (same order ID → same partition → processed in order).\n• **Use a dead letter queue (DLQ)**: after N failed retries, route poison messages to a DLQ for investigation rather than blocking the queue forever.\n• **Monitor consumer lag** — the difference between the latest offset and the consumer\'s committed offset. Rising lag means consumers are falling behind.\n• **Separate topics by data type**, not by team. `orders`, `payments`, `shipments` — not `team-a-events`.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                '**Message queues** decouple producers from consumers, enabling async processing, traffic buffering, and fan-out patterns.\n\n**Kafka** (log-based, persistent, replay-capable) is the standard for event streaming. **RabbitMQ/SQS** (queue-based, delete-on-consume) is better for task distribution.\n\nDesign consumers to be **idempotent** (safe to process twice), monitor **consumer lag**, and use a **dead letter queue** for failed messages.\n\nAsync architecture trades immediate consistency for resilience and scalability — make sure your product can tolerate eventual processing before adding a queue.',
            },
          ],
        },

        // ── Lesson 8: Microservices ───────────────────────────────────────────
        {
          id: 'hld-microservices',
          title: 'Microservices vs Monolith',
          description: 'Deployment independence, service boundaries, API gateways, and when NOT to split.',
          difficulty: 'Intermediate',
          estimatedMinutes: 18,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                'A **Monolith** packages all application functionality into one deployable unit. A **Microservices** architecture decomposes the application into small, independently deployable services, each owning its own data.\n\nThe spectrum:\n• **Monolith**: single codebase, single deploy, shared DB.\n• **Modular Monolith**: single deploy but internally well-structured with clear module boundaries — the stepping stone.\n• **Microservices**: independent services, independent deploys, independent databases.\n\nNeither is universally better. The choice depends on team size, deployment frequency, scale requirements, and organizational structure.',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                'At small scale, a monolith is faster to build and easier to operate. At large scale, it creates problems:\n• A bug in the Payments module requires redeploying the entire application, including Search.\n• The team editing the Orders module and the team editing the User module constantly conflict in the same codebase.\n• The database schema is shared — one team\'s migration can break another team\'s queries.\n• A spike in the Image Processing service starves CPU from the Checkout service.\n\nMicroservices solve these by making each service an independent unit of deployment, scaling, and ownership.',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                '**Monolith** = a Swiss Army knife. Everything in one tool. Works great for everyday tasks. But if the bottle opener breaks, you have to return the whole knife.\n\n**Microservices** = a kitchen with specialized tools: a chef\'s knife, a peeler, a can opener, a blender. Each tool is independent. If the blender breaks, you replace only the blender — the chef\'s knife is unaffected. Each tool can be upgraded, replaced, or scaled independently.\n\nBut: coordinating 15 specialized tools in a kitchen is harder than using one Swiss Army knife.',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**Microservices core patterns**\n\n• **API Gateway**: the single entry point for all clients. Routes requests to the correct service, handles authentication, rate limiting, and SSL termination. (AWS API Gateway, Kong, Nginx)\n• **Service Discovery**: services register themselves (Consul, Kubernetes Service) so other services can find them without hardcoded IPs.\n• **Inter-service communication**: synchronous via REST/gRPC for request-response, asynchronous via Kafka/RabbitMQ for events.\n• **Database per service**: each service owns its data store. No shared database. Cross-service data queries go through APIs or events.\n• **Circuit Breaker**: if Service B is failing, stop calling it and return a fallback — don\'t let failures cascade. (Resilience4j, Hystrix)\n\n**Domain-Driven Design (DDD) Bounded Contexts**\nService boundaries should align with business domains: UserService, OrderService, PaymentService, NotificationService. Each service models the domain concepts it owns.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'Circuit breaker + fallback with Resilience4j (Spring Boot):',
              codeExample:
`// Resilience4j Circuit Breaker — prevents cascade failures in microservices
@Service
public class ProductService {

    private final ProductCatalogClient catalogClient; // HTTP client to another service

    @CircuitBreaker(name = "productCatalog", fallbackMethod = "getProductFallback")
    @Retry(name = "productCatalog", fallbackMethod = "getProductFallback")
    @TimeLimiter(name = "productCatalog")
    public CompletableFuture<Product> getProduct(String productId) {
        // Call the downstream microservice
        return CompletableFuture.supplyAsync(
            () -> catalogClient.fetchProduct(productId)
        );
    }

    // Fallback: serve cached/default data when catalog service is down
    public CompletableFuture<Product> getProductFallback(String productId, Exception ex) {
        log.warn("Catalog service unavailable, using fallback for {}", productId, ex);
        return CompletableFuture.completedFuture(
            cache.getOrDefault(productId, Product.defaultProduct())
        );
    }
}

# application.yml — Circuit Breaker configuration
resilience4j:
  circuitbreaker:
    instances:
      productCatalog:
        sliding-window-size: 10         # Evaluate last 10 calls
        failure-rate-threshold: 50      # Open circuit if >50% fail
        wait-duration-in-open-state: 30s # Wait 30s before trying again
        permitted-number-of-calls-in-half-open-state: 3
  retry:
    instances:
      productCatalog:
        max-attempts: 3
        wait-duration: 200ms
        retry-exceptions:
          - java.io.IOException
          - java.util.concurrent.TimeoutException`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                '• **Independent deployability**: change and deploy one service without touching others.\n• **Technology flexibility**: each service can use the best language, framework, and database for its problem.\n• **Independent scaling**: scale only the service under load (e.g., scale ImageService during photo-heavy events).\n• **Fault isolation**: a crash in the Recommendation service doesn\'t crash the Checkout service.\n• **Team autonomy**: small teams own end-to-end delivery of a service — "you build it, you run it" (Amazon\'s model).',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '• **Distributed systems complexity**: network calls fail, latency adds up, partial failures are common.\n• **Data consistency**: no shared database means cross-service transactions require sagas or eventual consistency.\n• **Operational overhead**: dozens of services require sophisticated CI/CD, monitoring, service mesh, and observability.\n• **Testing complexity**: integration testing across services is significantly harder than testing a monolith.\n• **Latency**: a user request may fan out to 5 services synchronously, each adding latency.\n• **Premature decomposition**: splitting a poorly understood domain into microservices locks in wrong boundaries that are expensive to change.',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. What is the difference between a monolith and microservices? When would you choose each?\n2. What is an API Gateway and what responsibilities does it have?\n3. How do you handle a transaction that spans multiple microservices? (Saga pattern)\n4. What is a circuit breaker? How does it prevent cascade failures?\n5. How do microservices communicate? What are the tradeoffs between REST and gRPC?\n6. What is the "database per service" pattern? Why is it important?\n7. How would you split a monolith into microservices? What is a Strangler Fig pattern?',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Splitting too early**: microservices for a team of 3 engineers building an MVP is premature. Start with a well-structured monolith.\n• **Shared database**: multiple services sharing a database defeats the purpose — they\'re not independent and any schema change requires coordination.\n• **Chatty services**: Service A calling Service B calling Service C calling Service D in a synchronous chain adds latency at each hop and creates tight coupling.\n• **Wrong service boundaries**: splitting along technical layers (frontend service, backend service, database service) instead of business domains creates coupling.',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• **Start with a modular monolith**: enforce strict module boundaries internally. Extract services only when a module has independent scaling or deployment needs.\n• **Define service boundaries using DDD**: one service = one bounded context. Ownership is clear.\n• **Async over sync for cross-service communication** when the result is not needed immediately.\n• **Implement the circuit breaker pattern** everywhere you call another service.\n• **Distributed tracing is mandatory**: use OpenTelemetry + Jaeger/Zipkin to trace requests across services — essential for debugging.\n• **Each service should have its own CI/CD pipeline** and deploy independently without coordinating with other teams.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                '**Monolith** = simple to build and operate at small scale, becomes painful at large scale with large teams.\n\n**Microservices** = independent deployment, scaling, and ownership — at the cost of distributed systems complexity.\n\nThe right starting point for most teams is a **modular monolith** that can be extracted into services when the need is proven.\n\nKey patterns: **API Gateway** (single entry), **database per service** (independence), **circuit breaker** (fault isolation), **event-driven communication** (decoupling), **distributed tracing** (observability).',
            },
          ],
        },
      ],
    },

    // ── Chapter 4: Classic HLD Problems ──────────────────────────────────────
    {
      id: 'hld-classic',
      title: 'Classic HLD Problems',
      lessons: [
        // ── Lesson 9: Design a URL Shortener ─────────────────────────────────
        {
          id: 'hld-url-shortener',
          title: 'Design a URL Shortener',
          description: 'System design walkthrough — requirements, capacity, schema, algorithms, and scaling.',
          difficulty: 'Intermediate',
          estimatedMinutes: 30,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                'A **URL Shortener** (like bit.ly, t.co) takes a long URL and returns a short alias. Users sharing `https://bit.ly/3xK9mPQ` are redirected to the full destination URL.\n\nThis is the most common "design an X" interview question — it exercises every HLD concept in a bounded scope:\n• API design\n• Capacity estimation\n• Database schema and choice\n• Short code generation algorithm\n• Caching strategy\n• Horizontal scaling\n• Analytics pipeline\n\nInterviewers expect you to drive the requirements clarification, estimation, and component design yourself.',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                '**User problem**: long URLs are ugly, hard to remember, break in emails, and exceed character limits on social platforms.\n\n**System problem** (what makes this interesting to design):\n• Short codes must be **unique globally**.\n• Redirects must be **extremely fast** (<10ms) — users experience the redirect as latency before reaching the target.\n• Scale: bit.ly processes ~6 billion redirects per month = ~2,300 redirects/second average, ~10,000/s at peak.\n• Read/write ratio is **~100:1** — mostly redirects, few shortens.\n• Short codes must be **collision-free** even under concurrent creation.',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                'A coat check at a venue. You hand in your coat (long URL) and receive a numbered ticket (short code). When you return the ticket, the attendant looks up your coat and returns it (redirect).\n\n• The ticket numbers must be unique (no two people get the same number).\n• Looking up the coat from the number must be instant — the attendant doesn\'t search every rack, they go directly to the numbered slot.\n• Most people are checking coats in/out (read-heavy), few are registering new coats (writes).',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**Step 1 — Clarify Requirements**\n• Shorten a URL (POST /shorten) → returns short code.\n• Redirect: GET /{code} → 301/302 to original URL.\n• Custom aliases? Expiry? Analytics? (Assume: yes, yes, basic click counts).\n\n**Step 2 — Capacity Estimation**\n• Write: 100M new URLs/day = ~1,200/s.\n• Read: 10B redirects/day = ~115,000/s.\n• Short code: 7 characters (a-z, A-Z, 0-9) = 62^7 ≈ 3.5 trillion combinations.\n• Storage: 100M URLs/day × 365 × 5 years × 500B/URL ≈ 90TB over 5 years.\n\n**Step 3 — Short Code Generation**\n• **Option A — Counter + Base62 encoding**: a global counter (auto-increment DB or distributed counter like Redis INCR) converts to Base62. Predictable but sequential codes leak creation order.\n• **Option B — Random + collision check**: generate 7 random Base62 chars, check uniqueness in DB. Simple but collision probability grows as table fills.\n• **Option C — MD5/SHA hash of URL + truncate**: hash the long URL, take first 7 chars. Fast, reproducible, but collisions possible for different URLs.\n\n**Step 4 — Redirect: 301 vs 302**\n• **301 (Permanent)**: browser caches the redirect — reduces server load but breaks analytics (subsequent redirects bypass the server).\n• **302 (Temporary)**: browser always calls the server — analytics are accurate but more server load. Use 302 for analytics-enabled shorteners.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'URL shortener core service with Redis caching and Base62:',
              codeExample:
`// ── Base62 encoder for URL-safe short codes ───────────────────────────────────
public class Base62 {
    private static final String CHARS =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public static String encode(long number) {
        StringBuilder sb = new StringBuilder();
        while (number > 0) {
            sb.append(CHARS.charAt((int)(number % 62)));
            number /= 62;
        }
        return sb.reverse().toString();
    }
}

// ── Short URL service: counter-based generation ───────────────────────────────
@Service
public class UrlShortenerService {

    private final UrlRepository db;
    private final StringRedisTemplate redis;

    // Redis atomic counter — unique globally across all instances
    private static final String COUNTER_KEY = "url:counter";
    private static final Duration REDIRECT_CACHE_TTL = Duration.ofDays(1);

    public String shorten(String longUrl, String customAlias) {
        if (customAlias != null) {
            return saveUrl(customAlias, longUrl);
        }
        // Atomic increment — no two instances get the same value
        long id = redis.opsForValue().increment(COUNTER_KEY);
        String code = Base62.encode(id);    // e.g., 1234567 → "5Zr3k"
        return saveUrl(code, longUrl);
    }

    @Transactional
    private String saveUrl(String code, String longUrl) {
        if (db.existsByCode(code)) {
            throw new CodeConflictException("Code already taken: " + code);
        }
        db.save(new ShortUrl(code, longUrl, Instant.now()));
        return "https://sho.rt/" + code;
    }

    // ── Redirect: cache-aside for maximum speed ───────────────────────────────
    public String getLongUrl(String code) {
        // 1. Check Redis (sub-millisecond)
        String cached = redis.opsForValue().get("url:" + code);
        if (cached != null) return cached;

        // 2. DB lookup (10–20ms)
        ShortUrl url = db.findByCode(code)
                         .orElseThrow(UrlNotFoundException::new);

        // 3. Populate cache (TTL = 24h)
        redis.opsForValue().set("url:" + code, url.getLongUrl(), REDIRECT_CACHE_TTL);
        return url.getLongUrl();
    }
}

// ── Controller: 302 redirect for analytics ───────────────────────────────────
@RestController
public class RedirectController {
    @GetMapping("/{code}")
    public ResponseEntity<Void> redirect(@PathVariable String code) {
        String longUrl = urlService.getLongUrl(code);
        analyticsQueue.publish(new ClickEvent(code, Instant.now())); // async
        return ResponseEntity.status(302)
                             .location(URI.create(longUrl))
                             .build();
    }
}`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                '• The **counter-based + Base62** approach is collision-free by design — each ID is globally unique.\n• **Redis caching** of redirect lookups makes the 99%+ read workload sub-millisecond.\n• **Async analytics publishing** (Kafka/SQS) keeps the redirect path fast even under heavy analytics load.\n• The architecture is **horizontally scalable**: stateless app servers behind a load balancer, shared Redis counter, shared DB.',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '• **Redis counter is a single point of failure**: if Redis goes down, URL creation fails. Mitigate: Redis HA cluster, or pre-allocate blocks of IDs to each app server (ranges).\n• **Sequential codes are guessable**: IDs encoded in sequence can be enumerated. Shuffle the encoding or add a random salt for privacy-sensitive use cases.\n• **Database is still the write bottleneck** at extreme scale — shard by short code prefix.\n• **Hot URLs**: a viral link may get millions of redirects per second. Pin it in Redis with no TTL and use Redis cluster.',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. How do you generate a unique short code? Compare hash-based, counter-based, and random approaches.\n2. Why use 302 instead of 301? When would you use each?\n3. How do you handle the case where two users try to shorten the same long URL simultaneously?\n4. How would you design the analytics pipeline to track clicks without slowing down redirects?\n5. The system needs to support 1 million URL creations per second. How does your architecture change?\n6. How do you handle URL expiry? What happens to the DB and cache entries for expired URLs?\n7. Design the database schema for the URL shortener.',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Not clarifying requirements first**: jumping to implementation before establishing scale (writes/s, reads/s), features (custom aliases, expiry), and consistency requirements.\n• **Skipping capacity estimation**: interviewers expect numbers — codes needed (62^7), storage (100M × 500B = 50GB/year), read QPS.\n• **Using 301 redirect**: correct for SEO, wrong for analytics — subsequent visits bypass your server.\n• **Blocking the redirect path with analytics**: recording the click synchronously adds latency to every redirect. Publish to Kafka asynchronously.\n• **Not considering hot-key problem**: a single viral URL can saturate a cache node — use local in-memory cache on each app server for top URLs.',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• **Always start with requirements clarification** in HLD interviews — it shows structured thinking.\n• **Do back-of-envelope estimation before drawing architecture** — it constrains your choices.\n• Explain your **short code generation choice explicitly** — counter vs random vs hash, and their tradeoffs.\n• **Cache the hot path aggressively**: the redirect endpoint is 100x more frequent than the shorten endpoint — optimize it disproportionately.\n• **Design for failure**: what happens if Redis is down? If the DB is slow? Good candidates answer these without being asked.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                'A URL shortener demonstrates: **capacity estimation**, **unique code generation** (counter + Base62 is simplest and collision-free), **cache-aside** (Redis for hot redirects), **async analytics** (Kafka for click events), and **horizontal scaling** (stateless app servers).\n\n**Key numbers**: 7 Base62 chars = 3.5 trillion codes; cache hit rate should be >95% for popular links; redirect must be <10ms end-to-end.\n\nIn an interview, always: clarify → estimate → design API → choose DB → design components → identify bottlenecks → scale.',
            },
          ],
        },

        // ── Lesson 10: Design a Social Media Feed ────────────────────────────
        {
          id: 'hld-news-feed',
          title: 'Design a Social Media Feed',
          description: 'Fan-out on write vs read, ranking, pagination, and feed generation at scale.',
          difficulty: 'Advanced',
          estimatedMinutes: 35,
          steps: [
            {
              id: 'introduction',
              title: 'Introduction',
              content:
                'The **News Feed** (Twitter timeline, Facebook feed, Instagram feed) is the core product feature of social networks. When a user opens the app, they see a ranked, personalized list of posts from people they follow.\n\nThis is one of the most challenging system design problems because it sits at the intersection of:\n• Massive scale (Twitter: 300M users, 500M tweets/day)\n• Strict latency requirements (<500ms to load the feed)\n• Real-time freshness (new posts should appear quickly)\n• Personalized ranking (not just chronological)\n• Write amplification: one tweet by a celebrity with 50M followers means 50M feed entries to update',
            },
            {
              id: 'problem',
              title: 'The Problem It Solves',
              content:
                'The naive approach — "when a user opens the feed, query all posts from all people they follow, sort by time, paginate" — breaks at scale:\n• A user following 1,000 accounts: join 1,000 result sets, sort, paginate. At 300M users × 500ms = catastrophic DB load.\n• A celebrity with 50M followers posts: 50M users need to see it quickly.\n\nThe core tradeoff: do the work at **write time** (fan-out on write) or at **read time** (fan-out on read)?',
            },
            {
              id: 'analogy',
              title: 'Real Life Analogy',
              content:
                '**Fan-out on write** (push model) = a newspaper publisher prints and delivers a copy to every subscriber\'s doorstep the moment the issue is ready. When you wake up, your copy is already there — instant read. But printing 50 million copies is expensive.\n\n**Fan-out on read** (pull model) = the publisher puts one copy in a central library. When you want to read, you go to the library, find the papers from all journalists you follow, and compile them yourself. Cheap to publish, expensive to read.\n\n**Hybrid**: pre-deliver newspapers to normal subscribers (push); for VIP readers with thousands of subscriptions, do it on demand at read time (pull).',
            },
            {
              id: 'how-it-works',
              title: 'How It Works',
              content:
                '**Fan-out on Write (Push)**\nWhen Alice posts a tweet:\n1. Write the tweet to the Tweets table.\n2. For each of Alice\'s N followers, insert Alice\'s tweet ID into their feed cache (Redis sorted set, keyed by timestamp).\n3. When a follower opens their feed, read from their pre-built cache — instant.\n\nPros: reads are O(1). Cons: a celebrity with 50M followers posting causes 50M cache writes (write amplification).\n\n**Fan-out on Read (Pull)**\nWhen Bob opens his feed:\n1. Fetch IDs of all accounts Bob follows.\n2. Query each account\'s latest posts.\n3. Merge and sort all results.\n4. Paginate and rank.\n\nPros: no write amplification. Cons: read is slow (fan-out at read time), especially for users following many accounts.\n\n**Hybrid (Twitter\'s approach)**\n• Regular users (< ~1M followers): fan-out on write. Pre-populate followers\' feeds.\n• Celebrity users (> 1M followers): fan-out on read. Don\'t write to 100M feeds — pull from their tweet store at read time and merge into the pre-built feed.\n\n**Feed Ranking**\nChronological was the original model. Modern feeds use ML ranking: engagement signals (likes, comments, shares), freshness, relationship strength, content type.',
            },
            {
              id: 'implementation',
              title: 'Implementation',
              content: 'Feed service: hybrid fan-out with Redis sorted sets:',
              codeExample:
`// ── Post Tweet → trigger fan-out ─────────────────────────────────────────────
@Service
public class TweetService {

    private final TweetRepository tweetRepo;
    private final KafkaTemplate<String, TweetEvent> kafka;

    public Tweet post(String userId, String content) {
        Tweet tweet = tweetRepo.save(new Tweet(userId, content, Instant.now()));

        // Publish event — fan-out worker consumes this asynchronously
        kafka.send("tweets", new TweetEvent(tweet.getId(), userId, tweet.getCreatedAt()));
        return tweet;
    }
}

// ── Fan-out worker: populate followers' feeds (Kafka consumer) ────────────────
@Component
public class FeedFanoutWorker {

    private final FollowerRepository followers;
    private final StringRedisTemplate redis;
    private static final int MAX_FEED_SIZE = 800; // Keep last 800 items in cache

    @KafkaListener(topics = "tweets", groupId = "feed-fanout")
    public void fanOut(TweetEvent event) {
        // Skip fan-out for celebrities (>1M followers) — handled at read time
        long followerCount = followers.countByUserId(event.getAuthorId());
        if (followerCount > 1_000_000) return;

        // Push tweet ID to each follower's feed (sorted set, score = timestamp)
        List<String> followerIds = followers.findFollowerIds(event.getAuthorId());
        for (String followerId : followerIds) {
            String feedKey = "feed:" + followerId;
            double score = event.getCreatedAt().toEpochMilli();
            redis.opsForZSet().add(feedKey, event.getTweetId(), score);
            // Trim to keep feed from growing forever
            redis.opsForZSet().removeRange(feedKey, 0, -(MAX_FEED_SIZE + 1));
        }
    }
}

// ── Feed read: hybrid model ───────────────────────────────────────────────────
@Service
public class FeedService {

    private final StringRedisTemplate redis;
    private final TweetRepository tweets;
    private final FollowerRepository followers;

    public List<Tweet> getFeed(String userId, int page, int pageSize) {
        String feedKey = "feed:" + userId;
        int start = page * pageSize;
        int end = start + pageSize - 1;

        // 1. Get pre-built feed from Redis (covers non-celebrity tweets)
        Set<String> tweetIds = redis.opsForZSet()
            .reverseRange(feedKey, start, end);  // Newest first

        // 2. Fetch celebrity tweets at read time and merge
        List<String> followedCelebrities = followers.getCelebrityFollows(userId);
        List<Tweet> celebTweets = followedCelebrities.stream()
            .flatMap(celebId -> tweets.findLatestByUser(celebId, 20).stream())
            .collect(toList());

        // 3. Merge, de-duplicate, sort by timestamp, paginate
        List<Tweet> feedTweets = fetchAndMerge(tweetIds, celebTweets);
        feedTweets.sort(comparing(Tweet::getCreatedAt).reversed());
        return feedTweets.subList(start, Math.min(end + 1, feedTweets.size()));
    }
}`,
              codeLanguage: 'java',
            },
            {
              id: 'advantages',
              title: 'Advantages',
              content:
                '• **Hybrid approach** gives fast reads for most users while handling celebrity write amplification gracefully.\n• **Redis sorted sets** are perfectly suited for time-ordered feeds: O(log N) insert, O(log N) range query.\n• **Pre-computed feeds** mean P99 read latency stays under 100ms even at massive scale.\n• **Asynchronous fan-out** via Kafka means posting a tweet is always fast, regardless of follower count.',
            },
            {
              id: 'disadvantages',
              title: 'Disadvantages',
              content:
                '• **Feed staleness**: fan-out is async — a tweet may take seconds to appear in some followers\' feeds.\n• **Storage cost**: storing 800 tweets per user × 300M users = 240 billion Redis entries.\n• **Merge complexity**: combining pre-built feeds with celebrity pull-feeds requires careful deduplication and sorting.\n• **Feed reconstruction**: if a tweet is deleted, it must be removed from potentially millions of pre-built feeds.\n• **Ranking**: chronological merge is simple; ML-based ranking requires fetching more candidates than shown and scoring them — adding latency.',
            },
            {
              id: 'interview-questions',
              title: 'Interview Questions',
              content:
                '1. What is fan-out on write vs fan-out on read? What are the tradeoffs?\n2. How does Twitter handle celebrities with 50M followers posting? (Hybrid model)\n3. How would you store a user\'s feed in Redis? What data structure?\n4. How do you handle feed updates when a user is followed by 100M people?\n5. How do you paginate a feed that is constantly being updated?\n6. How would you add ML-based ranking to a chronological feed?\n7. A user deletes a tweet. How do you remove it from all followers\' pre-built feeds?',
            },
            {
              id: 'common-mistakes',
              title: 'Common Mistakes',
              content:
                '• **Choosing fan-out on write for everyone**: write amplification for celebrities (100M followers posting simultaneously) would overwhelm the fan-out workers and Redis.\n• **Not capping feed size**: an unbounded Redis sorted set grows forever. Cap at ~800–1,000 entries and reconstruct older history from the DB on demand.\n• **Synchronous fan-out**: blocking the tweet POST while writing to millions of feeds makes posting take seconds. Always async via Kafka.\n• **Ignoring the delete problem**: deleted tweets in pre-built feeds are a correctness issue — filter deleted IDs at read time as a safety net.',
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content:
                '• Use **Redis sorted sets** (ZADD, ZREVRANGE) for pre-built feeds — the score is the epoch timestamp.\n• **Threshold-based hybrid**: pick a follower count threshold (e.g., 1M) above which you switch from push to pull.\n• **Cache celebrity tweet lists** separately with a short TTL (5–10s) — they\'re read extremely frequently.\n• **Cursor-based pagination** instead of offset — offset-based pagination breaks when new items are inserted.\n• **Read-repair on feed miss**: if a user\'s feed cache is empty (cold start, TTL expired), rebuild it from the DB asynchronously and return a partial result immediately.',
            },
            {
              id: 'summary',
              title: 'Summary',
              content:
                'A social media feed requires choosing between **fan-out on write** (fast reads, write amplification) and **fan-out on read** (slow reads, no amplification). The production answer is a **hybrid**: push to regular-follower feeds asynchronously; pull celebrity posts at read time.\n\nStorage: **Redis sorted sets** keyed per user, scored by timestamp, capped at ~800 entries.\n\nThe key bottleneck to address in interviews: **celebrity problem** (write amplification), **feed latency** (<500ms target), and **eventual consistency** (async fan-out means brief staleness).',
            },
          ],
        },
      ],
    },
  ],
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const TRACKS: Track[] = [dsaTrack, lldTrack, hldTrack];

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
