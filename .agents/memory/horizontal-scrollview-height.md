---
name: Horizontal ScrollView height on React Native web
description: Why horizontal ScrollViews stretch unexpectedly in a flex column on web, and the fix.
---

## The problem
A horizontal `ScrollView` used as a tag/chip filter row inside a `flex: 1` container will stretch to fill all remaining vertical space on React Native web. The chips inside grow proportionally and become huge pill shapes occupying the full screen.

## Why
On web, a `ScrollView` is rendered as a `div` with `overflow: scroll`. Without an explicit height constraint, a flex child in a column container can expand to fill available space.

## Fix
Wrap the horizontal ScrollView in a fixed-height `View`:
```tsx
<View style={{ height: 52, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth }}>
  <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
    {chips}
  </ScrollView>
</View>
```

Also add `alignItems: 'center'` to the `contentContainerStyle` to prevent individual chips from stretching vertically.

**Why:** The `View` wrapper provides the height boundary that the ScrollView respects; the ScrollView itself just provides the scrollable overflow.
