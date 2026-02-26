```diff
--- a/src/components/ui/button.tsx
+++ b/src/components/ui/button.tsx
@@ -40,7 +40,7 @@
       if (!React.isValidElement(children)) {
         throw new Error("Children must be a single valid React element when `asChild` is true.");
       }
-      return React.cloneElement(children, {
+      return React.cloneElement(children, { // Correctly clone element and pass props
         className: cn(buttonVariants({ variant, size, className }), children.props.className),
         ref,
         ...props, // Pass other props like onClick, etc.
```
