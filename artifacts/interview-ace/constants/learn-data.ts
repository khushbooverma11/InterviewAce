export interface MultiLangCode {
  java?: string;
  cpp?: string;
  python?: string;
}

export interface LessonStep {
  id: string;
  title: string;
  content: string;
  codeExample?: string;       // Legacy single-language block (HLD / DSA)
  codeLanguage?: string;      // Legacy language label
  codeExamples?: MultiLangCode; // Multi-language tabs (LLD)
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
    // ── Chapter 1: SOLID Principles ───────────────────────────────────────────
    {
      id: 'lld-solid',
      title: 'SOLID Principles',
      lessons: [
        // ── SRP ──────────────────────────────────────────────────────────────
        {
          id: 'lld-solid-srp',
          title: 'Single Responsibility Principle',
          description: 'A class should have only one reason to change.',
          difficulty: 'Beginner',
          estimatedMinutes: 10,
          steps: [
            { id: 'introduction', title: 'Introduction', content: 'The **Single Responsibility Principle (SRP)** states that a class should have only one reason to change — meaning it should have exactly one job.\n\nA class that handles data persistence AND sends email notifications AND formats JSON violates SRP. Each concern must live in its own class.\n\nThis is the most fundamental of the five SOLID principles and the root cause of most software maintenance headaches.' },
            { id: 'problem', title: 'The Problem It Solves', content: '**God classes** — monolithic classes that do everything — create a tightly coupled web of responsibilities. A change in the email template triggers a re-test of the database logic. A bug in serialization causes unintended side-effects in billing.\n\nSRP prevents this by ensuring that each class has a clearly bounded contract. When requirements change, only the class responsible for that concern needs to be modified — everything else stays stable.' },
            { id: 'analogy', title: 'Real Life Analogy', content: 'Think of a restaurant kitchen. The chef cooks, the host seats guests, the accountant handles billing, and the delivery driver ships orders. Each person has one job.\n\nIf the chef also managed reservations and handled accounting, any change to the booking system would disrupt food preparation. Separating concerns keeps each role independent and easy to replace.' },
            { id: 'how-it-works', title: 'How It Works', content: 'To apply SRP:\n\n**1. Identify responsibilities** — list everything the class currently does.\n**2. Group by reason to change** — if two methods change for different business reasons, they belong in different classes.\n**3. Extract classes** — move each responsibility to its own focused class.\n**4. Compose** — wire the focused classes together in a higher-level use-case class or service.\n\nA good heuristic: if you need "and" to describe what a class does, it has more than one responsibility.' },
            {
              id: 'implementation', title: 'Implementation', content: 'Splitting a bloated UserService into focused classes:',
              codeExamples: {
                java:
`// ❌ Violates SRP — one class handles three concerns
public class UserService {
    public User getUser(String id) {
        return database.query("SELECT * FROM users WHERE id=?", id);
    }
    public String toJSON(User u) {
        return new Gson().toJson(u);            // serialization concern
    }
    public void sendWelcomeEmail(User u) {
        mailer.send(u.getEmail(), "Welcome!");  // notification concern
    }
}

// ✅ Applies SRP — one reason to change per class
public class UserRepository {
    private final Database db;
    public UserRepository(Database db) { this.db = db; }

    public User findById(String id) {
        return db.query("SELECT * FROM users WHERE id=?", id);
    }
    public void save(User u) { db.save(u); }
}

public class UserSerializer {
    private final Gson gson = new Gson();
    public String toJSON(User u) { return gson.toJson(u); }
    public User fromJSON(String json) { return gson.fromJson(json, User.class); }
}

public class EmailService {
    private final Mailer mailer;
    public EmailService(Mailer mailer) { this.mailer = mailer; }
    public void sendWelcome(User u) {
        mailer.send(u.getEmail(), "Welcome to the platform!");
    }
}

// Compose in a use-case class:
// UserRepository changes when DB schema changes.
// UserSerializer changes when JSON format changes.
// EmailService changes when email content changes.`,
                cpp:
`// ❌ Violates SRP
class UserService {
public:
    User getUser(const std::string& id);         // DB concern
    std::string toJSON(const User& u);           // Serialization concern
    void sendWelcomeEmail(const User& u);        // Email concern
};

// ✅ Applies SRP — separate classes, separate reasons to change
class UserRepository {
public:
    explicit UserRepository(Database& db) : db_(db) {}

    User findById(const std::string& id) {
        return db_.query("SELECT * FROM users WHERE id=?", id);
    }
    void save(const User& u) { db_.save(u); }

private:
    Database& db_;
};

class UserSerializer {
public:
    std::string toJSON(const User& u) const;
    User fromJSON(const std::string& json) const;
};

class EmailService {
public:
    explicit EmailService(Mailer& mailer) : mailer_(mailer) {}
    void sendWelcome(const User& u) {
        mailer_.send(u.getEmail(), "Welcome to the platform!");
    }
private:
    Mailer& mailer_;
};

// Compose in application code — each class has a single bounded contract.`,
                python:
`import json, dataclasses
from typing import TYPE_CHECKING

# ❌ Violates SRP — three concerns tangled in one class
class UserService:
    def get_user(self, user_id: str) -> "User": ...   # DB
    def to_json(self, user: "User") -> str: ...        # Serialization
    def send_welcome(self, user: "User") -> None: ...  # Email


# ✅ Applies SRP — one reason to change per class

class UserRepository:
    def __init__(self, db: "Database") -> None:
        self._db = db

    def find_by_id(self, user_id: str) -> "User":
        return self._db.query(
            "SELECT * FROM users WHERE id = ?", user_id
        )

    def save(self, user: "User") -> None:
        self._db.execute("INSERT INTO users ...", user)


class UserSerializer:
    def to_json(self, user: "User") -> str:
        return json.dumps(dataclasses.asdict(user), default=str)

    def from_json(self, data: str) -> "User":
        return User(**json.loads(data))


class EmailService:
    def __init__(self, mailer: "Mailer") -> None:
        self._mailer = mailer

    def send_welcome(self, user: "User") -> None:
        self._mailer.send(
            to=user.email,
            subject="Welcome!",
            body=f"Hi {user.name}, great to have you!"
        )

# Each class changes for exactly one reason.`,
              },
            },
            { id: 'advantages', title: 'Advantages', content: '**Easy to test** — each class has a single contract; unit tests are small and focused.\n\n**Easy to change** — a new email template only touches EmailService, nothing else.\n\n**High cohesion** — methods within a class are closely related; the class is internally consistent.\n\n**Readable** — class names describe exactly what they do (UserRepository, EmailService).\n\n**Reusable** — UserSerializer can be reused by any feature that needs JSON, not just user-creation.' },
            { id: 'disadvantages', title: 'Disadvantages', content: '**More classes** — strict SRP produces many small classes, which can feel overwhelming in small projects.\n\n**Navigation overhead** — tracing behavior across multiple files takes more effort than reading one large file.\n\n**Over-engineering risk** — applying SRP too zealously creates micro-classes for trivial logic (a two-line helper doesn\'t need its own class).\n\n**Coordination cost** — orchestrating multiple classes requires a use-case or command object that knows how to wire them together.' },
            { id: 'interview-questions', title: 'Interview Questions', content: '1. Identify SRP violations in a given class and refactor it.\n2. How does SRP relate to cohesion and coupling?\n3. When is a class with many methods still SRP-compliant?\n4. What\'s the difference between SRP and "separation of concerns"?\n5. Design a UserService that satisfies SRP and explain each class\'s single reason to change.' },
            { id: 'common-mistakes', title: 'Common Mistakes', content: '**Splitting by method count** instead of by reason to change — two methods can still violate SRP if they each address different business stakeholders.\n\n**Confusing layers with SRP** — having a DAO layer doesn\'t mean each DAO satisfies SRP; a DAO that also formats output violates it.\n\n**Creating anemic domain objects** — emptying all behavior from entities in the name of SRP produces data bags with zero encapsulation.\n\n**Not extracting at all** — keeping a 500-line class because "it works" is the most common mistake.' },
            { id: 'best-practices', title: 'Best Practices', content: '**Name classes after their single job** — if you struggle to name it, the responsibility is unclear.\n\n**Use the "reason to change" test** — ask "who would request a change to this class?" Each answer should be the same stakeholder group.\n\n**Start with SRP in mind** — retrofitting SRP onto an existing 1000-line class is painful; design with it from the start.\n\n**Compose with use-case classes** — a CreateUserUseCase or RegisterUserCommand is the right place to wire Repository + Serializer + EmailService together.' },
            { id: 'summary', title: 'Summary', content: '**SRP in one line**: a class should have only one reason to change.\n\n**Split by concern**: UserRepository (DB), UserSerializer (JSON), EmailService (notifications).\n\n**Benefits**: testability, high cohesion, easy evolution.\n\n**Watch out for**: over-engineering trivial helpers, and confusing "one method" with "one responsibility."' },
          ],
        },
        // ── OCP ──────────────────────────────────────────────────────────────
        {
          id: 'lld-solid-ocp',
          title: 'Open/Closed Principle',
          description: 'Open for extension, closed for modification.',
          difficulty: 'Intermediate',
          estimatedMinutes: 14,
          steps: [
            { id: 'introduction', title: 'Introduction', content: 'The **Open/Closed Principle (OCP)** states that software entities should be **open for extension** but **closed for modification**.\n\nAdding new behavior should not require editing existing, tested code. Instead, you extend through new classes, interfaces, or decorators.\n\nOCP is most often enforced using the **Strategy**, **Template Method**, or **Decorator** patterns.' },
            { id: 'problem', title: 'The Problem It Solves', content: 'Imagine a PaymentProcessor with a big if-else chain: credit, PayPal, crypto. Every time a new payment type is added, you must:\n• Modify the existing class (risk of regression).\n• Re-test all existing paths.\n• Increase cyclomatic complexity.\n\nOCP says: the existing PaymentProcessor should never change when you add a new method. New code extends the system — it never modifies the existing core.' },
            { id: 'analogy', title: 'Real Life Analogy', content: 'A standard electrical outlet is "closed" — its internals never change. But it\'s "open" — any device (phone charger, laptop, lamp) can plug into it by implementing the standard interface.\n\nYou don\'t rewire the outlet for each new device. The outlet is closed for modification; the ecosystem is open for extension.' },
            { id: 'how-it-works', title: 'How It Works', content: 'Apply OCP in three steps:\n\n**1. Identify the variation point** — what\'s the behavior that keeps changing? (payment type, discount rule, report format)\n\n**2. Extract an abstraction** — define an interface or abstract class for that behavior.\n\n**3. Depend on the abstraction** — the context class uses the interface, not any concrete type.\n\nNow adding new behavior = adding a new class that implements the interface. Zero changes to existing code.' },
            {
              id: 'implementation', title: 'Implementation', content: 'Payment processor extensible without modification:',
              codeExamples: {
                java:
`// ❌ Violates OCP — every new payment type requires modifying this class
public class PaymentProcessor {
    public void process(String type, double amount) {
        if (type.equals("credit")) {
            // charge credit card
        } else if (type.equals("paypal")) {
            // charge PayPal
        }
        // Adding crypto? Must touch this class again.
    }
}

// ✅ Applies OCP — extend by adding new classes, not editing old ones
public interface PaymentMethod {
    void charge(double amount);
    String getName();
}

public class CreditCardPayment implements PaymentMethod {
    private final String cardNumber;
    public CreditCardPayment(String cardNumber) {
        this.cardNumber = cardNumber;
    }
    @Override public void charge(double amount) {
        System.out.println("Charging $" + amount + " to card " + cardNumber);
    }
    @Override public String getName() { return "Credit Card"; }
}

public class PayPalPayment implements PaymentMethod {
    private final String email;
    public PayPalPayment(String email) { this.email = email; }
    @Override public void charge(double amount) {
        System.out.println("PayPal: sending $" + amount + " from " + email);
    }
    @Override public String getName() { return "PayPal"; }
}

// Adding crypto = new class only. PaymentProcessor never changes.
public class CryptoPayment implements PaymentMethod {
    @Override public void charge(double amount) {
        System.out.println("Broadcasting crypto tx: " + amount + " BTC");
    }
    @Override public String getName() { return "Crypto"; }
}

public class PaymentProcessor {
    public void process(PaymentMethod method, double amount) {
        System.out.println("Processing via " + method.getName());
        method.charge(amount);
    }
}`,
                cpp:
`// ❌ Violates OCP
class PaymentProcessor {
public:
    void process(const std::string& type, double amount) {
        if (type == "credit") { /* ... */ }
        else if (type == "paypal") { /* ... */ }
        // Closed for extension — must edit for every new type
    }
};

// ✅ Applies OCP via abstract base class
class PaymentMethod {
public:
    virtual ~PaymentMethod() = default;
    virtual void charge(double amount) = 0;
    virtual std::string getName() const = 0;
};

class CreditCardPayment : public PaymentMethod {
public:
    explicit CreditCardPayment(std::string card) : card_(std::move(card)) {}
    void charge(double amount) override {
        std::cout << "Credit " << card_ << ": $" << amount << "\n";
    }
    std::string getName() const override { return "Credit Card"; }
private:
    std::string card_;
};

class PayPalPayment : public PaymentMethod {
public:
    explicit PayPalPayment(std::string email) : email_(std::move(email)) {}
    void charge(double amount) override {
        std::cout << "PayPal " << email_ << ": $" << amount << "\n";
    }
    std::string getName() const override { return "PayPal"; }
private:
    std::string email_;
};

// New payment type = new class; PaymentProcessor unchanged.
class PaymentProcessor {
public:
    void process(PaymentMethod& method, double amount) {
        std::cout << "Processing: " << method.getName() << "\n";
        method.charge(amount);
    }
};`,
                python:
`from abc import ABC, abstractmethod

# ❌ Violates OCP
class PaymentProcessor:
    def process(self, payment_type: str, amount: float) -> None:
        if payment_type == "credit":
            print(f"Credit: ${amount}")
        elif payment_type == "paypal":
            print(f"PayPal: ${amount}")
        # Every new type forces a modification here


# ✅ Applies OCP via abstract base class
class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, amount: float) -> None: ...

    @abstractmethod
    def get_name(self) -> str: ...


class CreditCardPayment(PaymentMethod):
    def __init__(self, card_number: str) -> None:
        self._card = card_number

    def charge(self, amount: float) -> None:
        print(f"Charging ${amount} to card {self._card}")

    def get_name(self) -> str:
        return "Credit Card"


class PayPalPayment(PaymentMethod):
    def __init__(self, email: str) -> None:
        self._email = email

    def charge(self, amount: float) -> None:
        print(f"PayPal {self._email}: sending ${amount}")

    def get_name(self) -> str:
        return "PayPal"


# Adding crypto = new class; PaymentProcessor is untouched.
class CryptoPayment(PaymentMethod):
    def charge(self, amount: float) -> None:
        print(f"Broadcasting crypto tx: {amount} BTC")

    def get_name(self) -> str:
        return "Crypto"


class PaymentProcessor:
    def process(self, method: PaymentMethod, amount: float) -> None:
        print(f"Processing via {method.get_name()}")
        method.charge(amount)`,
              },
            },
            { id: 'advantages', title: 'Advantages', content: '**Low regression risk** — existing code is never touched when adding new behavior, so existing tests keep passing.\n\n**Scalable codebase** — each new feature adds code, it does not modify existing code.\n\n**Parallel development** — different engineers can implement new strategies simultaneously without merge conflicts in shared files.\n\n**Testability** — each concrete implementation is independently unit-testable.' },
            { id: 'disadvantages', title: 'Disadvantages', content: '**Upfront abstraction cost** — you need to predict which variation points will change. Over-abstracting stable code is wasted effort.\n\n**Indirection** — behavior is spread across many small classes, making it harder to trace the full flow at a glance.\n\n**Not always achievable** — sometimes you truly need to fix a bug in the original class. OCP is an ideal, not a law.' },
            { id: 'interview-questions', title: 'Interview Questions', content: '1. Design a discount calculation system extensible for new discount types without modifying existing code.\n2. How do you add a new report format (PDF, Excel, HTML) without modifying the ReportGenerator?\n3. Which design patterns implement OCP? (Strategy, Decorator, Factory Method)\n4. Is OCP always achievable? When is modifying existing code acceptable?\n5. Refactor a switch/if-else chain using OCP.' },
            { id: 'common-mistakes', title: 'Common Mistakes', content: '**Abstracting too early** — OCP makes sense when you know a variation point will grow. Abstracting a feature that only ever has one implementation is over-engineering.\n\n**Using OCP for bug fixes** — OCP does not mean "never modify any code." Bug fixes in existing code are expected.\n\n**Applying OCP to everything** — database queries, configuration loading, and pure calculations rarely need OCP treatment.' },
            { id: 'best-practices', title: 'Best Practices', content: '**Identify variation points first** — before designing abstractions, list the behaviors most likely to grow (payment types, notification channels, report formats).\n\n**Use the Factory pattern alongside OCP** — a factory creates the right concrete implementation; the context only works with the interface.\n\n**Follow the "rule of three"** — the first time code changes, modify it. The second time, note the pattern. The third time, apply OCP and extract an abstraction.' },
            { id: 'summary', title: 'Summary', content: '**OCP in one line**: open for extension, closed for modification.\n\n**How**: extract an interface for the variation point; make new behaviors new classes.\n\n**Classic examples**: payment methods, sort strategies, notification channels, report formats.\n\n**Patterns that enforce it**: Strategy, Decorator, Factory Method.\n\n**Pitfall**: abstracting before you know which dimension will vary.' },
          ],
        },
        // ── DIP ──────────────────────────────────────────────────────────────
        {
          id: 'lld-solid-dip',
          title: 'Dependency Inversion Principle',
          description: 'Depend on abstractions, not concretions.',
          difficulty: 'Intermediate',
          estimatedMinutes: 14,
          steps: [
            { id: 'introduction', title: 'Introduction', content: 'The **Dependency Inversion Principle (DIP)** has two rules:\n\n1. High-level modules should not depend on low-level modules. Both should depend on **abstractions**.\n2. Abstractions should not depend on details. Details should depend on abstractions.\n\nIn practice: `UserService` should not import `MySQLDatabase` directly. It should accept a `Database` interface. The concrete database is injected from outside — this is **Dependency Injection (DI)**, the most common way to apply DIP.' },
            { id: 'problem', title: 'The Problem It Solves', content: 'When high-level business logic directly instantiates low-level infrastructure:\n• **Testing becomes impossible** — a unit test for UserService spins up a real MySQL connection.\n• **Swapping implementations is painful** — changing from MySQL to PostgreSQL requires editing UserService.\n• **Circular dependency risk** — tightly coupled modules tend to form dependency cycles.\n\nDIP breaks these couplings by making both sides depend on a stable interface.' },
            { id: 'analogy', title: 'Real Life Analogy', content: 'A table lamp does not care which power company supplies electricity. It depends on the **outlet standard** (voltage, plug shape). Power companies implement that standard.\n\nYou can switch from Company A to Company B without rewiring the lamp. The lamp (high-level) depends on the outlet abstraction, not the power company (low-level detail).' },
            { id: 'how-it-works', title: 'How It Works', content: '**Step 1**: Define an interface (abstraction) for the dependency.\n**Step 2**: High-level class uses the interface in its constructor or method parameters.\n**Step 3**: Low-level classes implement the interface.\n**Step 4**: A composition root (main method, DI container) wires the concrete implementation to the interface and injects it.\n\nThe high-level module never calls `new ConcreteImpl()` — that responsibility moves to the outside.' },
            {
              id: 'implementation', title: 'Implementation', content: 'Inverting the database dependency in UserService:',
              codeExamples: {
                java:
`// ❌ Violates DIP — UserService directly depends on a concrete class
public class UserService {
    private final MySQLDatabase db = new MySQLDatabase(); // tightly coupled

    public User getUser(String id) {
        return db.query("SELECT * FROM users WHERE id=?", id);
    }
}

// ✅ Step 1: define the abstraction
public interface UserRepository {
    User findById(String id);
    void save(User u);
}

// ✅ Step 2: low-level details implement the abstraction
public class MySQLUserRepository implements UserRepository {
    private final Connection conn;
    public MySQLUserRepository(Connection conn) { this.conn = conn; }

    @Override public User findById(String id) {
        // MySQL-specific JDBC query
        return jdbcQuery(conn, "SELECT * FROM users WHERE id=?", id);
    }
    @Override public void save(User u) { /* JDBC insert */ }
}

public class InMemoryUserRepository implements UserRepository {
    private final Map<String, User> store = new HashMap<>();

    @Override public User findById(String id) { return store.get(id); }
    @Override public void save(User u) { store.put(u.getId(), u); }
}

// ✅ Step 3: high-level module depends only on the abstraction
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {  // injection via constructor
        this.repo = repo;
    }

    public User getUser(String id) { return repo.findById(id); }
    public void createUser(User u) { repo.save(u); }
}

// Production wiring:
UserService prodService = new UserService(new MySQLUserRepository(conn));

// Test wiring — no real DB needed:
UserService testService = new UserService(new InMemoryUserRepository());`,
                cpp:
`// ❌ Violates DIP
class UserService {
    MySQLDatabase db;   // tightly coupled to concrete
public:
    User getUser(const std::string& id) {
        return db.query("SELECT * FROM users WHERE id=?", id);
    }
};

// ✅ Step 1: abstract repository interface
class UserRepository {
public:
    virtual ~UserRepository() = default;
    virtual User findById(const std::string& id) = 0;
    virtual void save(const User& u) = 0;
};

// ✅ Step 2: concrete implementations
class MySQLUserRepository : public UserRepository {
public:
    explicit MySQLUserRepository(Connection& conn) : conn_(conn) {}
    User findById(const std::string& id) override {
        return conn_.query("SELECT * FROM users WHERE id=?", id);
    }
    void save(const User& u) override { conn_.execute("INSERT ...", u); }
private:
    Connection& conn_;
};

class InMemoryUserRepository : public UserRepository {
public:
    User findById(const std::string& id) override {
        return store_.at(id);
    }
    void save(const User& u) override { store_[u.getId()] = u; }
private:
    std::unordered_map<std::string, User> store_;
};

// ✅ Step 3: high-level class depends on the abstraction
class UserService {
public:
    explicit UserService(UserRepository& repo) : repo_(repo) {}

    User getUser(const std::string& id) { return repo_.findById(id); }
    void createUser(const User& u) { repo_.save(u); }

private:
    UserRepository& repo_;
};

// Production: UserService{mysqlRepo}
// Testing:    UserService{inMemoryRepo}  — no database needed`,
                python:
`from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Dict

# ❌ Violates DIP — high-level depends on low-level detail
class UserService:
    def __init__(self) -> None:
        self._db = MySQLDatabase()   # tightly coupled

    def get_user(self, user_id: str) -> User:
        return self._db.query("SELECT ...", user_id)


# ✅ Step 1: define abstraction (interface)
class UserRepository(ABC):
    @abstractmethod
    def find_by_id(self, user_id: str) -> User: ...

    @abstractmethod
    def save(self, user: User) -> None: ...


# ✅ Step 2: low-level implementations
class MySQLUserRepository(UserRepository):
    def __init__(self, conn: "Connection") -> None:
        self._conn = conn

    def find_by_id(self, user_id: str) -> User:
        return self._conn.query(
            "SELECT * FROM users WHERE id = ?", user_id
        )

    def save(self, user: User) -> None:
        self._conn.execute("INSERT INTO users ...", user)


class InMemoryUserRepository(UserRepository):
    def __init__(self) -> None:
        self._store: Dict[str, User] = {}

    def find_by_id(self, user_id: str) -> User:
        return self._store[user_id]

    def save(self, user: User) -> None:
        self._store[user.id] = user


# ✅ Step 3: high-level module depends on abstraction
class UserService:
    def __init__(self, repo: UserRepository) -> None:
        self._repo = repo                    # injected, not instantiated

    def get_user(self, user_id: str) -> User:
        return self._repo.find_by_id(user_id)

    def create_user(self, user: User) -> None:
        self._repo.save(user)


# Production:
# service = UserService(MySQLUserRepository(conn))

# Tests — no database:
# service = UserService(InMemoryUserRepository())`,
              },
            },
            { id: 'advantages', title: 'Advantages', content: '**Unit testing without infrastructure** — inject an in-memory or mock implementation; no real DB, no HTTP calls.\n\n**Swappable implementations** — switch from MySQL to PostgreSQL by changing one line at the composition root.\n\n**Parallel development** — high-level and low-level modules can be developed independently against the shared interface.\n\n**Stable high-level modules** — business logic never changes because of an infrastructure switch.' },
            { id: 'disadvantages', title: 'Disadvantages', content: '**More boilerplate** — you need interfaces + concrete classes for every dependency.\n\n**Indirection** — tracing a call requires jumping from interface to implementation.\n\n**DI container complexity** — large applications use frameworks (Spring, Guice, Dagger) to manage wiring, which adds its own learning curve.\n\n**Over-application** — simple utility classes (a math helper, a string formatter) rarely need interface abstraction.' },
            { id: 'interview-questions', title: 'Interview Questions', content: '1. How does dependency injection implement DIP?\n2. What is Inversion of Control (IoC) and how does it relate to DIP?\n3. Design a notification service (email, SMS, push) using DIP.\n4. How does DIP make unit testing easier? Give a concrete example.\n5. What\'s the difference between DIP (principle) and Dependency Injection (pattern)?' },
            { id: 'common-mistakes', title: 'Common Mistakes', content: '**Confusing DI with DIP** — DI is a technique; DIP is the principle. You can do DI without DIP (inject a concrete class). DIP requires injecting an abstraction.\n\n**Programming to implementation** — `UserService(MySQLDatabase db)` still violates DIP even if you use a constructor. The parameter must be the interface.\n\n**Creating interfaces for everything** — a `StringHelper` interface with one implementation is noise, not DIP.' },
            { id: 'best-practices', title: 'Best Practices', content: '**Use constructor injection** — it makes dependencies explicit, visible, and enforces that the object is ready to use immediately.\n\n**Keep the composition root at the edge** — wire concretions only in main(), app bootstrapping, or a DI container. Keep business logic free of `new ConcreteImpl()`.\n\n**Name interfaces by role** — `UserRepository` (not `IUserRepository` or `UserRepositoryInterface`) — the name describes the role, not the implementation.' },
            { id: 'summary', title: 'Summary', content: '**DIP in one line**: depend on abstractions, not concretions.\n\n**How**: define an interface; inject the concrete implementation from outside.\n\n**Key benefit**: testability — swap the real DB for an in-memory mock in tests.\n\n**Common tools**: constructor injection, DI containers (Spring, Guice, Python\'s `dependency-injector`).\n\n**Pitfall**: creating interfaces for everything, including stable utilities that will never change.' },
          ],
        },
      ],
    },
    // ── Chapter 2: Design Patterns ─────────────────────────────────────────────
    {
      id: 'lld-patterns',
      title: 'Design Patterns',
      lessons: [
        // ── Singleton ─────────────────────────────────────────────────────────
        {
          id: 'lld-singleton',
          title: 'Singleton Pattern',
          description: 'Ensure only one instance of a class exists throughout the application.',
          difficulty: 'Beginner',
          estimatedMinutes: 12,
          steps: [
            { id: 'introduction', title: 'Introduction', content: 'The **Singleton** pattern ensures a class has **only one instance** and provides a global access point to it.\n\nCore use cases: application-wide loggers, database connection pools, configuration managers, thread pools, and caches.\n\nKey elements:\n• **Private constructor** — prevents external instantiation.\n• **Static instance field** — holds the single object.\n• **Static `getInstance()` method** — creates the instance on first call, returns the same one afterward.' },
            { id: 'problem', title: 'The Problem It Solves', content: 'Some resources must be shared globally and exist only once:\n• A **logger** that writes to a single log file.\n• A **connection pool** that must not be duplicated (two pools = double the connections).\n• A **configuration** loaded from disk once at startup.\n\nWithout Singleton, each caller does `new Logger()` — creating multiple independent instances with divergent state and wasted resources.' },
            { id: 'analogy', title: 'Real Life Analogy', content: 'A country has exactly one President at any time. No matter how many citizens ask "who is the President?", there is always a single instance. You cannot elect a second President while one exists.\n\nThe President\'s office is the getInstance() — it returns the current President or holds an election to create the first one.' },
            { id: 'how-it-works', title: 'How It Works', content: '**Lazy initialization**: the instance is created on the first call to `getInstance()`. Saves memory if the instance is never needed.\n\n**Eager initialization**: the instance is created when the class is loaded. Simpler and always thread-safe.\n\n**Thread-safe lazy (double-checked locking)**: checks the instance twice — once without locking (fast path), once with locking (safe path on first creation).\n\nThe `volatile` keyword (Java/C++) prevents the CPU from reordering memory operations during instance construction.' },
            {
              id: 'implementation', title: 'Implementation', content: 'Thread-safe Singleton with double-checked locking:',
              codeExamples: {
                java:
`// Thread-safe Singleton using double-checked locking
public final class AppLogger {
    // volatile ensures visibility across threads
    private static volatile AppLogger instance;
    private final List<String> logs = new ArrayList<>();

    private AppLogger() {}  // prevent external instantiation

    public static AppLogger getInstance() {
        if (instance == null) {                    // first check (no lock)
            synchronized (AppLogger.class) {
                if (instance == null) {            // second check (with lock)
                    instance = new AppLogger();
                }
            }
        }
        return instance;
    }

    public synchronized void log(String message) {
        String entry = "[" + System.currentTimeMillis() + "] " + message;
        logs.add(entry);
        System.out.println(entry);
    }

    public synchronized List<String> getLogs() {
        return Collections.unmodifiableList(logs);
    }
}

// Usage — both variables point to the same object
AppLogger a = AppLogger.getInstance();
AppLogger b = AppLogger.getInstance();
System.out.println(a == b);   // true

a.log("Application started");
System.out.println(b.getLogs()); // includes "Application started"

// ── Eager initialization variant (simpler, always thread-safe) ──
public final class Config {
    private static final Config INSTANCE = new Config();  // loaded at class init
    private final Properties props;

    private Config() {
        props = new Properties();
        try { props.load(new FileInputStream("app.properties")); }
        catch (IOException e) { throw new RuntimeException(e); }
    }

    public static Config getInstance() { return INSTANCE; }
    public String get(String key) { return props.getProperty(key); }
}`,
                cpp:
`#include <mutex>
#include <memory>
#include <vector>
#include <string>

// Thread-safe Singleton using static local (C++11 guarantees thread-safety)
class AppLogger {
public:
    // Meyers' Singleton — simplest thread-safe approach in modern C++
    static AppLogger& getInstance() {
        static AppLogger instance;   // created once, thread-safe since C++11
        return instance;
    }

    // Delete copy/move to prevent duplication
    AppLogger(const AppLogger&) = delete;
    AppLogger& operator=(const AppLogger&) = delete;

    void log(const std::string& message) {
        std::lock_guard<std::mutex> lock(mutex_);
        std::string entry = "[LOG] " + message;
        logs_.push_back(entry);
        std::cout << entry << "\n";
    }

    const std::vector<std::string>& getLogs() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return logs_;
    }

private:
    AppLogger() = default;   // private constructor
    mutable std::mutex mutex_;
    std::vector<std::string> logs_;
};

// Usage
int main() {
    AppLogger::getInstance().log("App started");
    AppLogger::getInstance().log("User logged in");

    // Always the same instance
    auto& a = AppLogger::getInstance();
    auto& b = AppLogger::getInstance();
    // &a == &b → true
    return 0;
}`,
                python:
`import threading
from typing import Optional, List

# Thread-safe Singleton using __new__
class AppLogger:
    _instance: Optional["AppLogger"] = None
    _lock = threading.Lock()

    def __new__(cls) -> "AppLogger":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:         # double-checked locking
                    cls._instance = super().__new__(cls)
                    cls._instance._logs: List[str] = []
        return cls._instance

    def log(self, message: str) -> None:
        import time
        entry = f"[{int(time.time())}] {message}"
        self._logs.append(entry)
        print(entry)

    def get_logs(self) -> List[str]:
        return list(self._logs)


# Usage — same object every time
logger_a = AppLogger()
logger_b = AppLogger()
print(logger_a is logger_b)   # True

logger_a.log("App started")
print(logger_b.get_logs())    # includes "App started"


# ── Module-level singleton (Pythonic alternative) ──
# In Python, modules are singletons by nature.
# logger.py ──────────────────────────
import logging
_logger = logging.getLogger("app")

def get_logger() -> logging.Logger:
    return _logger   # always the same Logger instance`,
              },
            },
            { id: 'advantages', title: 'Advantages', content: '**Guaranteed single instance** — eliminates bugs from accidentally creating multiple loggers, pools, or configs.\n\n**Global access point** — any part of the application can retrieve the instance without passing it through every function.\n\n**Lazy creation** — with lazy initialization, the instance is only created if it is actually needed.\n\n**Controlled initialization** — complex initialization logic runs exactly once.' },
            { id: 'disadvantages', title: 'Disadvantages', content: '**Global state** — Singletons introduce hidden dependencies; any class can access and modify the single instance.\n\n**Testing difficulty** — tests share state between runs; one test\'s logger entries bleed into the next.\n\n**Tight coupling** — code that calls `Logger.getInstance()` is hardwired to that class; DI cannot inject a mock.\n\n**Concurrency bugs** — if not implemented with double-checked locking or eager init, multiple instances can be created under contention.' },
            { id: 'interview-questions', title: 'Interview Questions', content: '1. Implement a thread-safe Singleton in Java/C++/Python.\n2. What are the drawbacks of Singleton? When would you avoid it?\n3. What\'s the difference between Singleton and a static class?\n4. How do you make Singleton testable? (Hint: inject it via interface)\n5. Design a configuration manager using Singleton.' },
            { id: 'common-mistakes', title: 'Common Mistakes', content: '**Not using volatile** (Java) — without `volatile`, the CPU can return a partially-constructed instance to the first thread check.\n\n**Not synchronizing `getInstance()`** — two threads entering simultaneously both see `null` and both create an instance.\n\n**Overusing Singleton** — services, repositories, and strategies do not need to be Singletons; DI containers manage their lifecycle better.\n\n**Making domain objects Singletons** — a User or Order should never be a Singleton.' },
            { id: 'best-practices', title: 'Best Practices', content: '**Prefer eager initialization for simplicity** — load the instance at class-loading time if startup cost is low.\n\n**Use Meyers\' Singleton in C++** — `static Local` is thread-safe since C++11 with zero extra code.\n\n**Expose via interface** — make the Singleton implement an interface so it can be mocked in tests.\n\n**Consider a DI container** — Spring, Guice, and Dagger manage singleton lifecycles without the global-state problem.' },
            { id: 'summary', title: 'Summary', content: '**Singleton in one line**: one instance, global access point.\n\n**When to use**: loggers, config, connection pools, thread pools.\n\n**Thread safety**: eager init (simplest) or double-checked locking with volatile.\n\n**Pitfalls**: hidden global state, testing difficulty, over-use as a service locator.\n\n**Modern alternative**: DI containers that manage singleton scope without global state.' },
          ],
        },
        // ── Observer ──────────────────────────────────────────────────────────
        {
          id: 'lld-observer',
          title: 'Observer Pattern',
          description: 'A one-to-many dependency where changes notify all dependents automatically.',
          difficulty: 'Intermediate',
          estimatedMinutes: 15,
          steps: [
            { id: 'introduction', title: 'Introduction', content: 'The **Observer** pattern defines a one-to-many dependency: when the **Subject** (Observable) changes state, all registered **Observers** are notified automatically.\n\nComponents:\n• **Subject (Observable)**: maintains a list of observers, notifies them on state change.\n• **Observer interface**: declares `update()` — the callback observers implement.\n• **Concrete Observers**: subscribe to subjects and react to notifications.\n\nThis is the backbone of event-driven architecture, reactive programming (RxJS, Reactor), and the MVC pattern.' },
            { id: 'problem', title: 'The Problem It Solves', content: 'Without Observer, you write tight loops: after every stock price update, call `emailNotifier.notify()`, `smsNotifier.notify()`, `dashboardNotifier.notify()` — hardcoded in the market logic.\n\nEvery new notification channel means editing the market class. Adding or removing notification targets is risky and violates OCP.\n\nObserver decouples the source from the sinks: the StockMarket just says "price changed" and doesn\'t know who is listening.' },
            { id: 'analogy', title: 'Real Life Analogy', content: 'YouTube channel subscriptions: you (Observer) subscribe to a channel (Subject). When a new video is uploaded (state change), YouTube notifies all subscribers. You can unsubscribe at any time.\n\nThe channel doesn\'t know who is watching — it just loops through its subscriber list and sends notifications. Subscribers react independently.' },
            { id: 'how-it-works', title: 'How It Works', content: '**Register**: Observers call `subject.subscribe(this)` to join the notification list.\n\n**Trigger**: When the Subject\'s state changes, it calls `notifyAll()` — iterating over every registered Observer.\n\n**Notify**: Each Observer\'s `update(event, data)` method is called with the new state.\n\n**Unregister**: Observers call `subject.unsubscribe(this)` to stop receiving notifications.\n\nKey design choice: **push** (subject sends data in `update()`) vs **pull** (observer calls subject to get data).' },
            {
              id: 'implementation', title: 'Implementation', content: 'Stock price alert system:',
              codeExamples: {
                java:
`import java.util.*;

// Observer interface
public interface StockObserver {
    void onPriceChange(String symbol, double price);
}

// Subject
public class StockMarket {
    private final Map<String, Set<StockObserver>> listeners = new HashMap<>();
    private final Map<String, Double> prices = new HashMap<>();

    public void subscribe(String symbol, StockObserver observer) {
        listeners.computeIfAbsent(symbol, k -> new HashSet<>()).add(observer);
    }

    public void unsubscribe(String symbol, StockObserver observer) {
        Optional.ofNullable(listeners.get(symbol))
                .ifPresent(set -> set.remove(observer));
    }

    public void setPrice(String symbol, double price) {
        prices.put(symbol, price);
        notifyObservers(symbol, price);
    }

    private void notifyObservers(String symbol, double price) {
        Optional.ofNullable(listeners.get(symbol))
                .ifPresent(set -> set.forEach(o -> o.onPriceChange(symbol, price)));
    }
}

// Concrete observers
public class PriceAlertObserver implements StockObserver {
    private final double threshold;

    public PriceAlertObserver(double threshold) {
        this.threshold = threshold;
    }

    @Override public void onPriceChange(String symbol, double price) {
        if (price > threshold) {
            System.out.println("ALERT: " + symbol + " hit $" + price);
        }
    }
}

public class PriceLoggerObserver implements StockObserver {
    @Override public void onPriceChange(String symbol, double price) {
        System.out.println("[LOG] " + symbol + " = $" + price);
    }
}

// Usage
StockMarket market = new StockMarket();
market.subscribe("AAPL", new PriceAlertObserver(200.0));
market.subscribe("AAPL", new PriceLoggerObserver());

market.setPrice("AAPL", 215.5); // notifies both observers`,
                cpp:
`#include <unordered_map>
#include <unordered_set>
#include <functional>
#include <string>
#include <iostream>

// Observer interface
class StockObserver {
public:
    virtual ~StockObserver() = default;
    virtual void onPriceChange(const std::string& symbol, double price) = 0;
};

// Subject
class StockMarket {
public:
    void subscribe(const std::string& symbol, StockObserver* observer) {
        listeners_[symbol].insert(observer);
    }

    void unsubscribe(const std::string& symbol, StockObserver* observer) {
        if (listeners_.count(symbol))
            listeners_[symbol].erase(observer);
    }

    void setPrice(const std::string& symbol, double price) {
        prices_[symbol] = price;
        if (listeners_.count(symbol))
            for (auto* obs : listeners_.at(symbol))
                obs->onPriceChange(symbol, price);
    }

private:
    std::unordered_map<std::string,
        std::unordered_set<StockObserver*>> listeners_;
    std::unordered_map<std::string, double> prices_;
};

// Concrete observers
class PriceAlertObserver : public StockObserver {
public:
    explicit PriceAlertObserver(double threshold) : threshold_(threshold) {}
    void onPriceChange(const std::string& symbol, double price) override {
        if (price > threshold_)
            std::cout << "ALERT: " << symbol << " hit $" << price << "\n";
    }
private:
    double threshold_;
};

class PriceLoggerObserver : public StockObserver {
public:
    void onPriceChange(const std::string& symbol, double price) override {
        std::cout << "[LOG] " << symbol << " = $" << price << "\n";
    }
};

// Usage
int main() {
    StockMarket market;
    PriceAlertObserver alert(200.0);
    PriceLoggerObserver logger;

    market.subscribe("AAPL", &alert);
    market.subscribe("AAPL", &logger);
    market.setPrice("AAPL", 215.5);
    return 0;
}`,
                python:
`from __future__ import annotations
from abc import ABC, abstractmethod
from collections import defaultdict
from typing import Callable, Dict, Set

# Observer interface
class StockObserver(ABC):
    @abstractmethod
    def on_price_change(self, symbol: str, price: float) -> None: ...


# Subject
class StockMarket:
    def __init__(self) -> None:
        self._listeners: Dict[str, Set[StockObserver]] = defaultdict(set)
        self._prices: Dict[str, float] = {}

    def subscribe(self, symbol: str, observer: StockObserver) -> None:
        self._listeners[symbol].add(observer)

    def unsubscribe(self, symbol: str, observer: StockObserver) -> None:
        self._listeners[symbol].discard(observer)

    def set_price(self, symbol: str, price: float) -> None:
        self._prices[symbol] = price
        for obs in list(self._listeners[symbol]):
            obs.on_price_change(symbol, price)


# Concrete observers
class PriceAlertObserver(StockObserver):
    def __init__(self, threshold: float) -> None:
        self._threshold = threshold

    def on_price_change(self, symbol: str, price: float) -> None:
        if price > self._threshold:
            print(f"ALERT: {symbol} hit ${price:.2f}!")


class PriceLoggerObserver(StockObserver):
    def on_price_change(self, symbol: str, price: float) -> None:
        print(f"[LOG] {symbol} = ${price:.2f}")


# Usage
market = StockMarket()
market.subscribe("AAPL", PriceAlertObserver(threshold=200.0))
market.subscribe("AAPL", PriceLoggerObserver())
market.set_price("AAPL", 215.5)   # both observers notified`,
              },
            },
            { id: 'advantages', title: 'Advantages', content: '**Loose coupling** — Subject doesn\'t know the concrete types of its Observers; they communicate via interface.\n\n**Open for extension** — add a new notification channel by adding a new Observer class; no changes to Subject.\n\n**Dynamic subscription** — observers can subscribe and unsubscribe at runtime.\n\n**Foundation of event systems** — Java\'s EventListeners, Node.js EventEmitter, RxJS Observables all implement this pattern.' },
            { id: 'disadvantages', title: 'Disadvantages', content: '**Memory leaks** — if observers never unsubscribe, they stay alive as long as the subject does (especially in GUI code).\n\n**Order dependency** — observers are notified in insertion order (usually), which can cause subtle bugs if one observer\'s `update()` affects the subject.\n\n**Cascade updates** — an observer\'s `update()` triggers another state change, which notifies more observers — can cause unexpected chain reactions.\n\n**Debugging difficulty** — tracing which observer caused a bug requires knowing the full subscription graph.' },
            { id: 'interview-questions', title: 'Interview Questions', content: '1. Design a notification system (email, SMS, push) using Observer.\n2. What\'s the difference between Observer and Pub/Sub (publish-subscribe)?\n3. How do you prevent memory leaks in Observer? (Weak references, explicit unsubscribe)\n4. How is Observer implemented in RxJS / Java EventListeners?\n5. Design an order fulfillment system using event-driven Observer.' },
            { id: 'common-mistakes', title: 'Common Mistakes', content: '**Forgetting to unsubscribe** — especially in GUI frameworks; a widget that unregisters on destroy prevents object leaks.\n\n**Modifying the observer list during notification** — iterating over listeners while adding/removing causes ConcurrentModificationException (Java) or list mutation bugs. Copy the list before iterating.\n\n**Coupling observer to subject** — an observer that stores a reference to the subject and queries it inside `update()` creates circular dependencies.' },
            { id: 'best-practices', title: 'Best Practices', content: '**Return an unsubscribe handle** — instead of a separate `unsubscribe()` call, return a function/handle that removes the observer: `const unsub = market.subscribe("AAPL", handler);\nunsub();`\n\n**Copy-on-notify** — clone the listener set before notifying to safely handle add/remove during iteration.\n\n**Use weak references in GUI** — Java WeakReference<Observer> or Python weakref prevents memory leaks when the observer is a UI component that may be destroyed.' },
            { id: 'summary', title: 'Summary', content: '**Observer in one line**: Subject notifies all registered Observers when its state changes.\n\n**Key roles**: Subject (observable), Observer interface, Concrete Observers.\n\n**Classic examples**: stock price alerts, GUI event listeners, reactive streams, MVC model updates.\n\n**Pitfalls**: memory leaks from forgotten unsubscriptions, cascade updates, concurrent modification.\n\n**Modern descendants**: RxJS Observables, Java EventListeners, Node.js EventEmitter.' },
          ],
        },
        // ── Strategy ──────────────────────────────────────────────────────────
        {
          id: 'lld-strategy',
          title: 'Strategy Pattern',
          description: 'Define a family of algorithms, encapsulate each, and make them interchangeable.',
          difficulty: 'Intermediate',
          estimatedMinutes: 13,
          steps: [
            { id: 'introduction', title: 'Introduction', content: 'The **Strategy** pattern defines a family of algorithms, encapsulates each in its own class, and makes them interchangeable at runtime.\n\nThe **Context** class delegates work to a **Strategy** object. The strategy can be swapped without changing the Context.\n\nThis directly enforces OCP: adding a new algorithm = adding a new class. The Context never changes.\n\nFormal roles: **Context** (uses the strategy), **Strategy interface** (common contract), **Concrete Strategies** (algorithm implementations).' },
            { id: 'problem', title: 'The Problem It Solves', content: 'An Order class that handles discounts with a massive if-else chain — student discount, holiday discount, loyalty discount, bulk discount — must be modified every time a new discount type is introduced. Every modification risks breaking existing discounts.\n\nStrategy replaces the if-else chain with polymorphism: each discount is a separate class. Adding a new discount never touches the Order class.' },
            { id: 'analogy', title: 'Real Life Analogy', content: 'Google Maps route strategy: you can select "Fastest", "Shortest", "Avoid Tolls", or "Bicycle." The app (Context) uses whichever strategy you pick.\n\nSwitching from driving to cycling doesn\'t require rewriting Google Maps — it just swaps the route-calculation strategy. Each strategy encapsulates its own logic.' },
            { id: 'how-it-works', title: 'How It Works', content: '**1. Define a Strategy interface** with a common method signature (e.g., `sort(int[])`, `calculateDiscount(Order)`).\n\n**2. Implement Concrete Strategies** — each class encapsulates one algorithm.\n\n**3. Context class** holds a Strategy reference and delegates the algorithm call to it.\n\n**4. At runtime**, the caller sets the desired strategy on the context before triggering the operation.\n\nStrategies can also be stateless and shared across multiple context instances.' },
            {
              id: 'implementation', title: 'Implementation', content: 'Sorting with pluggable strategy algorithms:',
              codeExamples: {
                java:
`import java.util.Arrays;

// Strategy interface
public interface SortStrategy {
    int[] sort(int[] data);
}

// Concrete strategies
public class BubbleSortStrategy implements SortStrategy {
    @Override public int[] sort(int[] data) {
        int[] arr = Arrays.copyOf(data, data.length);
        for (int i = 0; i < arr.length - 1; i++)
            for (int j = 0; j < arr.length - 1 - i; j++)
                if (arr[j] > arr[j + 1]) {
                    int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
                }
        return arr;
    }
}

public class MergeSortStrategy implements SortStrategy {
    @Override public int[] sort(int[] data) {
        if (data.length <= 1) return data;
        int mid = data.length / 2;
        int[] left  = sort(Arrays.copyOfRange(data, 0, mid));
        int[] right = sort(Arrays.copyOfRange(data, mid, data.length));
        return merge(left, right);
    }

    private int[] merge(int[] a, int[] b) {
        int[] result = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length)
            result[k++] = (a[i] <= b[j]) ? a[i++] : b[j++];
        while (i < a.length) result[k++] = a[i++];
        while (j < b.length) result[k++] = b[j++];
        return result;
    }
}

// Context class — delegates to the active strategy
public class Sorter {
    private SortStrategy strategy;

    public Sorter(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public int[] sort(int[] data) {
        return strategy.sort(data);
    }
}

// Usage
Sorter sorter = new Sorter(new MergeSortStrategy());
System.out.println(Arrays.toString(sorter.sort(new int[]{5, 3, 8, 1})));

// Switch algorithm at runtime — zero changes to Sorter
sorter.setStrategy(new BubbleSortStrategy());
System.out.println(Arrays.toString(sorter.sort(new int[]{5, 3, 8, 1})));`,
                cpp:
`#include <vector>
#include <algorithm>
#include <functional>
#include <iostream>

// Strategy via std::function (lightweight, modern C++)
using SortStrategy = std::function<std::vector<int>(std::vector<int>)>;

// Concrete strategies as free functions (or lambdas)
std::vector<int> bubbleSort(std::vector<int> arr) {
    for (size_t i = 0; i < arr.size() - 1; ++i)
        for (size_t j = 0; j < arr.size() - 1 - i; ++j)
            if (arr[j] > arr[j + 1]) std::swap(arr[j], arr[j + 1]);
    return arr;
}

std::vector<int> stdSort(std::vector<int> arr) {
    std::sort(arr.begin(), arr.end());
    return arr;
}

// Context class
class Sorter {
public:
    explicit Sorter(SortStrategy strategy) : strategy_(std::move(strategy)) {}

    void setStrategy(SortStrategy strategy) {
        strategy_ = std::move(strategy);
    }

    std::vector<int> sort(const std::vector<int>& data) {
        return strategy_(data);
    }

private:
    SortStrategy strategy_;
};

int main() {
    Sorter sorter(stdSort);
    auto result = sorter.sort({5, 3, 8, 1, 9, 2});
    // result → {1, 2, 3, 5, 8, 9}

    // Switch strategy at runtime
    sorter.setStrategy(bubbleSort);
    auto result2 = sorter.sort({5, 3, 8, 1});
    return 0;
}`,
                python:
`from __future__ import annotations
from abc import ABC, abstractmethod
from typing import List, Protocol

# Strategy interface (Protocol — structural typing)
class SortStrategy(Protocol):
    def sort(self, data: List[int]) -> List[int]: ...


# Concrete strategies
class BubbleSortStrategy:
    def sort(self, data: List[int]) -> List[int]:
        arr = list(data)
        n = len(arr)
        for i in range(n - 1):
            for j in range(n - 1 - i):
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
        return arr


class MergeSortStrategy:
    def sort(self, data: List[int]) -> List[int]:
        if len(data) <= 1:
            return list(data)
        mid = len(data) // 2
        left  = self.sort(data[:mid])
        right = self.sort(data[mid:])
        return self._merge(left, right)

    def _merge(self, a: List[int], b: List[int]) -> List[int]:
        result, i, j = [], 0, 0
        while i < len(a) and j < len(b):
            if a[i] <= b[j]: result.append(a[i]); i += 1
            else:             result.append(b[j]); j += 1
        return result + a[i:] + b[j:]


# Context class
class Sorter:
    def __init__(self, strategy: SortStrategy) -> None:
        self._strategy = strategy

    def set_strategy(self, strategy: SortStrategy) -> None:
        self._strategy = strategy

    def sort(self, data: List[int]) -> List[int]:
        return self._strategy.sort(data)


# Usage
sorter = Sorter(MergeSortStrategy())
print(sorter.sort([5, 3, 8, 1]))   # [1, 3, 5, 8]

# Swap at runtime — Sorter unchanged
sorter.set_strategy(BubbleSortStrategy())
print(sorter.sort([5, 3, 8, 1]))   # [1, 3, 5, 8]`,
              },
            },
            { id: 'advantages', title: 'Advantages', content: '**Open for extension** — new algorithms are new classes; the Context never changes.\n\n**Replaces if-else chains** — removes complex conditional logic from the Context with polymorphism.\n\n**Testable in isolation** — each strategy is unit-tested independently with no Context dependency.\n\n**Swappable at runtime** — the algorithm can change based on user input, environment, or system load.' },
            { id: 'disadvantages', title: 'Disadvantages', content: '**More classes** — each algorithm becomes a class; for simple cases, a function or lambda is lighter.\n\n**Client awareness** — the caller must know which strategies exist and choose the right one.\n\n**Overhead for trivial variation** — if you only ever use one algorithm, the interface is unnecessary abstraction.' },
            { id: 'interview-questions', title: 'Interview Questions', content: '1. Design a payment system using Strategy (credit, PayPal, crypto).\n2. How is Strategy different from State pattern?\n3. How does Strategy enable testing — can you inject a mock strategy?\n4. What is the difference between Strategy and Template Method?\n5. Design a compression library with pluggable strategies (zip, gzip, lz4).' },
            { id: 'common-mistakes', title: 'Common Mistakes', content: '**Putting strategy selection inside the Context** — the Context should not decide which strategy to use based on a type string. The caller injects the right one.\n\n**Confusing Strategy with State** — Strategy is about swapping algorithms; State is about the object behaving differently depending on its own internal state.\n\n**Using Strategy for single-algorithm cases** — if there will only ever be one implementation, a direct method is simpler.' },
            { id: 'best-practices', title: 'Best Practices', content: '**Name strategies clearly** — `QuickSortStrategy`, `MergeSortStrategy`, `BubbleSortStrategy` — the name should describe the encapsulated algorithm.\n\n**Make strategies stateless** — stateless strategies can be shared and reused without thread-safety concerns.\n\n**Use lambdas/function references for simple strategies** — in languages with first-class functions, a lambda often replaces a one-method class.' },
            { id: 'summary', title: 'Summary', content: '**Strategy in one line**: encapsulate algorithms behind a common interface and swap them at runtime.\n\n**Key roles**: Context (delegates), Strategy interface (contract), Concrete Strategies (algorithms).\n\n**Classic examples**: sort algorithms, payment methods, compression codecs, discount rules, route planning.\n\n**Benefit over if-else**: new behavior = new class, not a modified condition.\n\n**Pitfall**: over-using it when a simple function or enum would suffice.' },
          ],
        },
      ],
    },
    // ── Chapter 3: Classic LLD Problems ────────────────────────────────────────
    {
      id: 'lld-classic',
      title: 'Classic LLD Problems',
      lessons: [
        // ── Parking Lot ───────────────────────────────────────────────────────
        {
          id: 'lld-parking-lot',
          title: 'Design a Parking Lot',
          description: 'A foundational OOP design question asked at every top company.',
          difficulty: 'Intermediate',
          estimatedMinutes: 25,
          steps: [
            { id: 'introduction', title: 'Introduction', content: 'The **Parking Lot** is the most common LLD interview question. It tests your ability to model a real system with OOP.\n\n**Key entities:**\n• **ParkingLot** — manages floors, entry/exit gates.\n• **ParkingFloor** — one level with multiple spots.\n• **ParkingSpot** — a single space (Motorcycle, Compact, Large).\n• **Vehicle** — abstract base (Car, Motorcycle, Truck).\n• **Ticket** — records entry time and assigned spot.\n• **FeeCalculator** — computes the parking fee.\n\n**Key behaviors:** park vehicle, free spot, calculate fee, find nearest available spot.' },
            { id: 'problem', title: 'The Problem It Solves', content: 'A parking facility needs to:\n• Track which spots are available vs. occupied.\n• Match vehicle size to spot size (a truck cannot park in a motorcycle spot).\n• Issue tickets on entry and compute fees on exit.\n• Handle multiple floors and concurrent arrivals.\n\nThe LLD challenge is modeling these rules clearly without a monolithic class that knows everything. Each class should have a single, well-defined responsibility.' },
            { id: 'analogy', title: 'Real Life Analogy', content: 'You enter a mall parking structure. A sensor detects your car. The system checks available spots on each floor. The barrier opens and a ticket prints — recording your entry time and assigned spot.\n\nWhen you leave, you insert the ticket. The system calculates your fee (hourly rate, first hour free, daily cap). The barrier lifts. The spot status updates to "Available."\n\n**Start every interview by clarifying requirements**: number of floors? Vehicle types? Pricing model? Multiple entry gates? EV charging spots?' },
            { id: 'how-it-works', title: 'How It Works', content: '**Class hierarchy:**\n• Vehicle (abstract) → Car, Motorcycle, Truck\n• ParkingSpot (SpotType: Motorcycle/Compact/Large, SpotStatus: Available/Occupied)\n• Ticket (spotId, vehiclePlate, entryTime)\n• ParkingFloor (list of ParkingSpots, findAvailableSpot(vehicleType))\n• ParkingLot (list of ParkingFloors, park(), exit())\n• FeeCalculator (calculateFee(Ticket))\n\n**Spot matching rule**: Motorcycle→MotorcycleSpot | Car→Compact or Large | Truck→Large only.\n\n**Concurrency**: use synchronization on `findAvailableSpot()` and `park()` to prevent double-booking.' },
            {
              id: 'implementation', title: 'Implementation', content: 'Full parking lot class hierarchy:',
              codeExamples: {
                java:
`import java.time.Instant;
import java.time.Duration;
import java.util.*;

// ── Enums ───────────────────────────────────────────────
enum VehicleType { MOTORCYCLE, CAR, TRUCK }
enum SpotType    { MOTORCYCLE, COMPACT, LARGE }
enum SpotStatus  { AVAILABLE, OCCUPIED }

// ── Vehicle hierarchy ────────────────────────────────────
public abstract class Vehicle {
    private final String plate;
    private final VehicleType type;
    public Vehicle(String plate, VehicleType type) {
        this.plate = plate; this.type = type;
    }
    public String getPlate() { return plate; }
    public VehicleType getType() { return type; }
}

public class Car        extends Vehicle { public Car(String p)        { super(p, VehicleType.CAR); } }
public class Motorcycle extends Vehicle { public Motorcycle(String p) { super(p, VehicleType.MOTORCYCLE); } }
public class Truck      extends Vehicle { public Truck(String p)      { super(p, VehicleType.TRUCK); } }

// ── ParkingSpot ──────────────────────────────────────────
public class ParkingSpot {
    private final String id;
    private final SpotType type;
    private SpotStatus status = SpotStatus.AVAILABLE;
    private Vehicle parkedVehicle;

    public ParkingSpot(String id, SpotType type) {
        this.id = id; this.type = type;
    }

    public boolean canFit(Vehicle v) {
        return switch (v.getType()) {
            case MOTORCYCLE -> type == SpotType.MOTORCYCLE;
            case CAR        -> type == SpotType.COMPACT || type == SpotType.LARGE;
            case TRUCK      -> type == SpotType.LARGE;
        };
    }

    public synchronized void park(Vehicle v) {
        parkedVehicle = v;
        status = SpotStatus.OCCUPIED;
    }

    public synchronized void free() {
        parkedVehicle = null;
        status = SpotStatus.AVAILABLE;
    }

    public SpotStatus getStatus() { return status; }
    public String getId() { return id; }
}

// ── Ticket ───────────────────────────────────────────────
public class Ticket {
    private final String ticketId = UUID.randomUUID().toString();
    private final ParkingSpot spot;
    private final Vehicle vehicle;
    private final Instant entryTime = Instant.now();

    public Ticket(ParkingSpot spot, Vehicle vehicle) {
        this.spot = spot; this.vehicle = vehicle;
    }

    public double calculateFee(double hourlyRate) {
        long minutes = Duration.between(entryTime, Instant.now()).toMinutes();
        long hours = Math.max(1, (long) Math.ceil(minutes / 60.0));
        return hours * hourlyRate;
    }

    public ParkingSpot getSpot() { return spot; }
}

// ── ParkingLot ───────────────────────────────────────────
public class ParkingLot {
    private final List<ParkingSpot> spots = new ArrayList<>();

    public void addSpot(ParkingSpot spot) { spots.add(spot); }

    public synchronized Ticket park(Vehicle vehicle) {
        return spots.stream()
                    .filter(s -> s.getStatus() == SpotStatus.AVAILABLE && s.canFit(vehicle))
                    .findFirst()
                    .map(spot -> { spot.park(vehicle); return new Ticket(spot, vehicle); })
                    .orElse(null);   // null = lot full for this vehicle type
    }

    public double exit(Ticket ticket, double hourlyRate) {
        double fee = ticket.calculateFee(hourlyRate);
        ticket.getSpot().free();
        return fee;
    }
}`,
                cpp:
`#include <string>
#include <vector>
#include <optional>
#include <chrono>
#include <memory>
#include <algorithm>

// ── Enums ────────────────────────────────────────────────
enum class VehicleType { Motorcycle, Car, Truck };
enum class SpotType    { Motorcycle, Compact, Large };
enum class SpotStatus  { Available, Occupied };

// ── Vehicle ──────────────────────────────────────────────
class Vehicle {
public:
    Vehicle(std::string plate, VehicleType type)
        : plate_(std::move(plate)), type_(type) {}
    virtual ~Vehicle() = default;

    const std::string& getPlate() const { return plate_; }
    VehicleType getType() const { return type_; }

private:
    std::string plate_;
    VehicleType type_;
};

class Car        : public Vehicle { public: explicit Car(std::string p)  : Vehicle(std::move(p), VehicleType::Car) {} };
class Motorcycle : public Vehicle { public: explicit Motorcycle(std::string p) : Vehicle(std::move(p), VehicleType::Motorcycle) {} };
class Truck      : public Vehicle { public: explicit Truck(std::string p) : Vehicle(std::move(p), VehicleType::Truck) {} };

// ── ParkingSpot ──────────────────────────────────────────
class ParkingSpot {
public:
    ParkingSpot(std::string id, SpotType type)
        : id_(std::move(id)), type_(type) {}

    bool canFit(const Vehicle& v) const {
        switch (v.getType()) {
            case VehicleType::Motorcycle: return type_ == SpotType::Motorcycle;
            case VehicleType::Car:        return type_ == SpotType::Compact || type_ == SpotType::Large;
            case VehicleType::Truck:      return type_ == SpotType::Large;
        }
        return false;
    }

    void park()  { status_ = SpotStatus::Occupied; }
    void free()  { status_ = SpotStatus::Available; }
    bool isAvailable() const { return status_ == SpotStatus::Available; }
    const std::string& getId() const { return id_; }

private:
    std::string id_;
    SpotType    type_;
    SpotStatus  status_ = SpotStatus::Available;
};

// ── Ticket ───────────────────────────────────────────────
class Ticket {
public:
    Ticket(ParkingSpot& spot, const Vehicle& vehicle)
        : spot_(spot), plate_(vehicle.getPlate()),
          entryTime_(std::chrono::steady_clock::now()) {}

    double calculateFee(double hourlyRate) const {
        auto elapsed = std::chrono::steady_clock::now() - entryTime_;
        double hours = std::chrono::duration<double>(elapsed).count() / 3600.0;
        return std::max(1.0, std::ceil(hours)) * hourlyRate;
    }

    ParkingSpot& getSpot() { return spot_; }

private:
    ParkingSpot& spot_;
    std::string  plate_;
    std::chrono::time_point<std::chrono::steady_clock> entryTime_;
};

// ── ParkingLot ───────────────────────────────────────────
class ParkingLot {
public:
    void addSpot(std::unique_ptr<ParkingSpot> spot) {
        spots_.push_back(std::move(spot));
    }

    std::optional<Ticket> park(const Vehicle& v) {
        for (auto& spot : spots_) {
            if (spot->isAvailable() && spot->canFit(v)) {
                spot->park();
                return Ticket(*spot, v);
            }
        }
        return std::nullopt;   // lot full
    }

    double exit(Ticket& ticket, double hourlyRate) {
        double fee = ticket.calculateFee(hourlyRate);
        ticket.getSpot().free();
        return fee;
    }

private:
    std::vector<std::unique_ptr<ParkingSpot>> spots_;
};`,
                python:
`from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Optional, List
from datetime import datetime
import uuid, math


class VehicleType(Enum):
    MOTORCYCLE = auto()
    CAR = auto()
    TRUCK = auto()


class SpotType(Enum):
    MOTORCYCLE = auto()
    COMPACT = auto()
    LARGE = auto()


class SpotStatus(Enum):
    AVAILABLE = auto()
    OCCUPIED = auto()


# ── Vehicle ───────────────────────────────────────────────
class Vehicle:
    def __init__(self, plate: str, vehicle_type: VehicleType) -> None:
        self.plate = plate
        self.vehicle_type = vehicle_type


class Car(Vehicle):
    def __init__(self, plate: str) -> None:
        super().__init__(plate, VehicleType.CAR)

class Motorcycle(Vehicle):
    def __init__(self, plate: str) -> None:
        super().__init__(plate, VehicleType.MOTORCYCLE)

class Truck(Vehicle):
    def __init__(self, plate: str) -> None:
        super().__init__(plate, VehicleType.TRUCK)


# ── ParkingSpot ───────────────────────────────────────────
class ParkingSpot:
    def __init__(self, spot_id: str, spot_type: SpotType) -> None:
        self.spot_id = spot_id
        self.spot_type = spot_type
        self.status = SpotStatus.AVAILABLE
        self._vehicle: Optional[Vehicle] = None

    def can_fit(self, vehicle: Vehicle) -> bool:
        match vehicle.vehicle_type:
            case VehicleType.MOTORCYCLE:
                return self.spot_type == SpotType.MOTORCYCLE
            case VehicleType.CAR:
                return self.spot_type in (SpotType.COMPACT, SpotType.LARGE)
            case VehicleType.TRUCK:
                return self.spot_type == SpotType.LARGE

    def park(self, vehicle: Vehicle) -> None:
        self._vehicle = vehicle
        self.status = SpotStatus.OCCUPIED

    def free(self) -> None:
        self._vehicle = None
        self.status = SpotStatus.AVAILABLE


# ── Ticket ────────────────────────────────────────────────
class Ticket:
    def __init__(self, spot: ParkingSpot, vehicle: Vehicle) -> None:
        self.ticket_id = str(uuid.uuid4())
        self.spot = spot
        self.plate = vehicle.plate
        self.entry_time = datetime.now()

    def calculate_fee(self, hourly_rate: float = 2.0) -> float:
        elapsed = (datetime.now() - self.entry_time).total_seconds() / 3600
        hours = max(1, math.ceil(elapsed))
        return hours * hourly_rate


# ── ParkingLot ────────────────────────────────────────────
class ParkingLot:
    def __init__(self) -> None:
        self._spots: List[ParkingSpot] = []

    def add_spot(self, spot: ParkingSpot) -> None:
        self._spots.append(spot)

    def park(self, vehicle: Vehicle) -> Optional[Ticket]:
        for spot in self._spots:
            if spot.status == SpotStatus.AVAILABLE and spot.can_fit(vehicle):
                spot.park(vehicle)
                return Ticket(spot, vehicle)
        return None   # lot full for this vehicle type

    def exit(self, ticket: Ticket) -> float:
        fee = ticket.calculate_fee()
        ticket.spot.free()
        return fee`,
              },
            },
            { id: 'advantages', title: 'Advantages', content: '**Clear class hierarchy** — each entity (Vehicle, Spot, Ticket, Lot) has a well-defined role.\n\n**Extensible** — add EV charging spots, monthly passes, or multi-lot support without touching existing classes.\n\n**Testable** — each class is independently testable: spot matching, fee calculation, lot capacity.\n\n**Reflects real-world domain** — the object model maps directly to the physical parking structure.' },
            { id: 'disadvantages', title: 'Disadvantages', content: '**Concurrency complexity** — spot allocation must be synchronized to prevent two vehicles booking the same spot.\n\n**State management** — tracking spot availability across floors, gates, and vehicles requires careful state synchronization in distributed deployments.\n\n**Schema evolution** — adding a new vehicle type (e.g., EV bus) may require updating the canFit() method across spot types.' },
            { id: 'interview-questions', title: 'Interview Questions', content: '1. How do you handle concurrent parking requests (two cars targeting the same spot simultaneously)?\n2. Add EV charging spots with a limited-time session.\n3. Design a monthly pass system — how does it affect Ticket and FeeCalculator?\n4. Design a pricing engine for complex rules (first hour free, daily cap, peak pricing).\n5. How would you scale this to a chain of 100 parking lots with centralized availability?' },
            { id: 'common-mistakes', title: 'Common Mistakes', content: '**Putting canFit() in Vehicle** — spot-matching logic belongs in ParkingSpot (the spot knows what it can hold), not in Vehicle.\n\n**Monolithic ParkingLot class** — floor structure and spot discovery should be in ParkingFloor, not crammed into ParkingLot.\n\n**Ignoring concurrency** — not synchronizing spot allocation is the most common production bug in parking systems.' },
            { id: 'best-practices', title: 'Best Practices', content: '**Clarify requirements first** — number of floors? Vehicle types? Payment modes? EV support? Multiple gates? This impresses interviewers more than jumping straight to code.\n\n**Use enums for discrete types** — VehicleType, SpotType, SpotStatus as enums are clear and exhaustive.\n\n**Separate FeeCalculator from Ticket** — fee logic should be in a dedicated class to support multiple pricing strategies (hourly, daily, monthly) without modifying Ticket.' },
            { id: 'summary', title: 'Summary', content: '**Core entities**: Vehicle, ParkingSpot, Ticket, ParkingFloor, ParkingLot, FeeCalculator.\n\n**Matching rule**: Motorcycle→MotorcycleSpot | Car→Compact/Large | Truck→Large.\n\n**Key challenge**: concurrency-safe spot allocation.\n\n**Extension points**: EV spots, monthly passes, multi-lot chains, pricing strategies.\n\n**Interview tip**: always start with requirement clarification — floors, vehicle types, pricing — before drawing classes.' },
          ],
        },
        // ── Elevator ──────────────────────────────────────────────────────────
        {
          id: 'lld-elevator',
          title: 'Design an Elevator System',
          description: 'State machines, scheduling algorithms, and concurrent control systems.',
          difficulty: 'Advanced',
          estimatedMinutes: 30,
          steps: [
            { id: 'introduction', title: 'Introduction', content: 'The **Elevator System** is an advanced LLD question testing state machines, scheduling, and concurrency.\n\n**Key entities:**\n• **Elevator** — current floor, direction (UP/DOWN/IDLE), stop queues.\n• **ElevatorController** — dispatches requests to the optimal elevator.\n• **Request** — (source floor, destination floor, direction pressed).\n• **Button** — internal (inside car) and external (on each floor).\n\n**Key design decisions:**\n• Scheduling algorithm — SCAN, LOOK, or Nearest Car.\n• State machine — IDLE → MOVING_UP or MOVING_DOWN → IDLE.\n• Request types — inside requests (destination floor) vs. outside requests (floor + direction).' },
            { id: 'problem', title: 'The Problem It Solves', content: 'A building with 50 floors and 4 elevators receives dozens of simultaneous requests. Naively sending each request to the first available elevator leads to:\n• Long wait times (distant elevator travels empty).\n• Starvation (upper-floor requests are always deprioritized).\n• Unnecessary direction reversals (wasted energy).\n\nA scheduling algorithm like SCAN ensures each elevator sweeps in one direction, picking up all requests on the way, before reversing — like a disk read head.' },
            { id: 'analogy', title: 'Real Life Analogy', content: 'Otis and KONE elevators use the **SCAN algorithm** (also called the "elevator algorithm" in OS disk scheduling).\n\nAn elevator moving UP picks up every floor request in that direction before reversing — like a hard drive read head sweeping across the disk. This minimizes average wait time and prevents starvation.\n\nYou\'ve experienced this: pressing "UP" on floor 3, the elevator moving up from floor 1 stops at floor 3 on its way up, rather than sending a separate elevator from floor 10.' },
            { id: 'how-it-works', title: 'How It Works', content: '**SCAN algorithm per elevator:**\n1. Maintain two priority queues: `upQueue` (floors to stop going up) and `downQueue` (floors to stop going down).\n2. When moving UP: pick up all floors in `upQueue` in ascending order. When `upQueue` is empty, reverse direction if `downQueue` has entries.\n3. When moving DOWN: pick up all floors in `downQueue` in descending order. Reverse when empty.\n\n**Dispatcher (ElevatorController):**\n• For each new request, score each elevator (distance, direction alignment).\n• Assign the request to the elevator with the lowest score.\n• Prefer elevators already heading in the same direction and passing the floor.' },
            {
              id: 'implementation', title: 'Implementation', content: 'SCAN-based elevator state machine:',
              codeExamples: {
                java:
`import java.util.TreeSet;

// ── Direction enum ────────────────────────────────────────
public enum Direction { UP, DOWN, IDLE }

// ── Elevator with SCAN scheduling ────────────────────────
public class Elevator {
    private int currentFloor = 0;
    private Direction direction = Direction.IDLE;
    private final TreeSet<Integer> upQueue   = new TreeSet<>();
    private final TreeSet<Integer> downQueue = new TreeSet<>();
    private final int id;

    public Elevator(int id) { this.id = id; }

    public synchronized void addRequest(int floor) {
        if (floor > currentFloor) {
            upQueue.add(floor);
            if (direction == Direction.IDLE) direction = Direction.UP;
        } else if (floor < currentFloor) {
            downQueue.add(floor);
            if (direction == Direction.IDLE) direction = Direction.DOWN;
        }
    }

    /** Simulate one floor movement step */
    public synchronized void step() {
        if (direction == Direction.UP) {
            currentFloor++;
            if (upQueue.remove(currentFloor)) {
                System.out.println("Elevator " + id + " stopped at floor " + currentFloor + " (UP)");
            }
            if (upQueue.isEmpty()) {
                direction = downQueue.isEmpty() ? Direction.IDLE : Direction.DOWN;
            }
        } else if (direction == Direction.DOWN) {
            currentFloor--;
            if (downQueue.remove(currentFloor)) {
                System.out.println("Elevator " + id + " stopped at floor " + currentFloor + " (DOWN)");
            }
            if (downQueue.isEmpty()) {
                direction = upQueue.isEmpty() ? Direction.IDLE : Direction.UP;
            }
        }
    }

    public int getCurrentFloor() { return currentFloor; }
    public Direction getDirection() { return direction; }
    public int getId() { return id; }
}

// ── ElevatorController (dispatcher) ──────────────────────
public class ElevatorController {
    private final List<Elevator> elevators;

    public ElevatorController(int count) {
        elevators = new ArrayList<>();
        for (int i = 0; i < count; i++) elevators.add(new Elevator(i));
    }

    /** Assign request to the optimal elevator */
    public void requestFloor(int fromFloor, int toFloor) {
        Elevator best = elevators.stream()
            .min(Comparator.comparingInt(e -> score(e, fromFloor, toFloor)))
            .orElseThrow();
        best.addRequest(fromFloor);
        best.addRequest(toFloor);
    }

    private int score(Elevator e, int from, int to) {
        int dist = Math.abs(e.getCurrentFloor() - from);
        // Penalize elevators moving away from the request floor
        boolean sameDir = (e.getDirection() == Direction.UP && from > e.getCurrentFloor())
                       || (e.getDirection() == Direction.DOWN && from < e.getCurrentFloor());
        return sameDir ? dist : dist + 100;
    }
}`,
                cpp:
`#include <set>
#include <vector>
#include <algorithm>
#include <iostream>
#include <cmath>

enum class Direction { Up, Down, Idle };

class Elevator {
public:
    explicit Elevator(int id) : id_(id) {}

    void addRequest(int floor) {
        if (floor > currentFloor_) {
            upQueue_.insert(floor);
            if (direction_ == Direction::Idle) direction_ = Direction::Up;
        } else if (floor < currentFloor_) {
            downQueue_.insert(floor);
            if (direction_ == Direction::Idle) direction_ = Direction::Down;
        }
    }

    void step() {
        if (direction_ == Direction::Up) {
            ++currentFloor_;
            if (upQueue_.erase(currentFloor_))
                std::cout << "Elevator " << id_ << " UP stop at " << currentFloor_ << "\n";
            if (upQueue_.empty())
                direction_ = downQueue_.empty() ? Direction::Idle : Direction::Down;

        } else if (direction_ == Direction::Down) {
            --currentFloor_;
            if (downQueue_.erase(currentFloor_))
                std::cout << "Elevator " << id_ << " DOWN stop at " << currentFloor_ << "\n";
            if (downQueue_.empty())
                direction_ = upQueue_.empty() ? Direction::Idle : Direction::Up;
        }
    }

    int getCurrentFloor() const { return currentFloor_; }
    Direction getDirection() const { return direction_; }
    int getId() const { return id_; }

private:
    int id_;
    int currentFloor_ = 0;
    Direction direction_ = Direction::Idle;
    std::set<int> upQueue_;
    std::set<int> downQueue_;
};

class ElevatorController {
public:
    explicit ElevatorController(int count) {
        for (int i = 0; i < count; ++i) elevators_.emplace_back(i);
    }

    void requestFloor(int fromFloor, int toFloor) {
        auto& best = *std::min_element(
            elevators_.begin(), elevators_.end(),
            [&](const Elevator& a, const Elevator& b) {
                return score(a, fromFloor) < score(b, fromFloor);
            }
        );
        best.addRequest(fromFloor);
        best.addRequest(toFloor);
    }

private:
    int score(const Elevator& e, int from) const {
        int dist = std::abs(e.getCurrentFloor() - from);
        bool aligned = (e.getDirection() == Direction::Up   && from > e.getCurrentFloor())
                    || (e.getDirection() == Direction::Down && from < e.getCurrentFloor());
        return aligned ? dist : dist + 100;
    }

    std::vector<Elevator> elevators_;
};`,
                python:
`from __future__ import annotations
from enum import Enum, auto
from sortedcontainers import SortedList
from typing import List
import math


class Direction(Enum):
    UP = auto()
    DOWN = auto()
    IDLE = auto()


class Elevator:
    def __init__(self, elevator_id: int) -> None:
        self.id = elevator_id
        self.current_floor = 0
        self.direction = Direction.IDLE
        self._up_queue: SortedList[int] = SortedList()
        self._down_queue: SortedList[int] = SortedList()

    def add_request(self, floor: int) -> None:
        if floor > self.current_floor:
            self._up_queue.add(floor)
            if self.direction == Direction.IDLE:
                self.direction = Direction.UP
        elif floor < self.current_floor:
            self._down_queue.add(floor)
            if self.direction == Direction.IDLE:
                self.direction = Direction.DOWN

    def step(self) -> None:
        """Simulate one floor movement."""
        if self.direction == Direction.UP:
            self.current_floor += 1
            if self.current_floor in self._up_queue:
                self._up_queue.remove(self.current_floor)
                print(f"Elevator {self.id} UP stop at {self.current_floor}")
            if not self._up_queue:
                self.direction = (
                    Direction.DOWN if self._down_queue else Direction.IDLE
                )

        elif self.direction == Direction.DOWN:
            self.current_floor -= 1
            if self.current_floor in self._down_queue:
                self._down_queue.remove(self.current_floor)
                print(f"Elevator {self.id} DOWN stop at {self.current_floor}")
            if not self._down_queue:
                self.direction = (
                    Direction.UP if self._up_queue else Direction.IDLE
                )


class ElevatorController:
    def __init__(self, count: int) -> None:
        self._elevators = [Elevator(i) for i in range(count)]

    def request_floor(self, from_floor: int, to_floor: int) -> None:
        best = min(self._elevators, key=lambda e: self._score(e, from_floor))
        best.add_request(from_floor)
        best.add_request(to_floor)

    def _score(self, elevator: Elevator, from_floor: int) -> int:
        dist = abs(elevator.current_floor - from_floor)
        aligned = (
            elevator.direction == Direction.UP and from_floor > elevator.current_floor
        ) or (
            elevator.direction == Direction.DOWN and from_floor < elevator.current_floor
        )
        return dist if aligned else dist + 100`,
              },
            },
            { id: 'advantages', title: 'Advantages', content: '**Efficient scheduling** — SCAN minimizes average wait time by sweeping in one direction before reversing.\n\n**No starvation** — every floor will eventually be visited as the elevator reverses direction.\n\n**Scalable** — the controller can manage any number of elevators; adding a new elevator requires zero changes to the scheduling logic.\n\n**Extensible state machine** — adding a new state (DOOR_OPEN, MAINTENANCE) is a clean enum extension.' },
            { id: 'disadvantages', title: 'Disadvantages', content: '**SCAN is unfair at extremes** — a floor at the far end of a direction is always served last, even if it pressed first.\n\n**Concurrency complexity** — multiple threads (one per elevator) accessing shared request queues require careful synchronization.\n\n**Dispatcher complexity** — the optimal elevator selection function (score) can be complex and hard to tune for different building layouts.' },
            { id: 'interview-questions', title: 'Interview Questions', content: '1. How do you dispatch a request to the optimal elevator? What is your scoring function?\n2. Compare SCAN vs. LOOK vs. Nearest Car scheduling algorithms.\n3. How do you handle a VIP / emergency override (skip all other stops)?\n4. How would you model the door-open/door-close state in the state machine?\n5. How would you test this system (unit tests + integration tests)?' },
            { id: 'common-mistakes', title: 'Common Mistakes', content: '**Not modeling direction** — a simple list of requested floors without up/down queues leads to incorrect SCAN behavior.\n\n**Dispatching all requests to Elevator 0** — a controller that assigns everything to the first elevator is a common naive mistake.\n\n**No state machine** — a series of if-else checks instead of a formal state machine makes the code fragile and hard to extend.\n\n**Forgetting external requests** — "Press UP on floor 3" and "Press 7 inside the car" are different request types with different handling.' },
            { id: 'best-practices', title: 'Best Practices', content: '**Model internal vs. external requests separately** — an ExternalRequest (floor, direction) is different from an InternalRequest (destination floor).\n\n**Use a sorted data structure for queues** — a TreeSet (Java) or SortedList (Python) lets you efficiently find the next floor in the current direction.\n\n**Ask clarifying questions first** — number of elevators? Floors? Priority modes? VIP/emergency? This shapes the entire design.\n\n**Simulate step-by-step** — implement a `step()` method that advances the elevator one floor per call; this makes the system easy to test and animate.' },
            { id: 'summary', title: 'Summary', content: '**Core entities**: Elevator (state machine), ElevatorController (dispatcher), Request, Direction enum.\n\n**Algorithm**: SCAN — sweep in one direction, stop at all requested floors, reverse when done.\n\n**Key states**: IDLE → MOVING_UP / MOVING_DOWN → IDLE.\n\n**Dispatcher scoring**: prefer elevators heading toward the request floor in the same direction.\n\n**Interview tip**: clarify requirements, draw the state machine, then code Elevator before ElevatorController.' },
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
