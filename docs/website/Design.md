# Design Document - Flash Framework Website

## 1. Design Philosophy
**"Speed. Precision. Minimalism."**
The design should reflect the framework's core value: raw performance wrapped in a clean, modern interface. We will adopt a "developer-first" aesthetic similar to `shadcn/ui`, `Vercel`, and `Linear`.

## 2. Visual Identity

### 2.1 Color Palette
-   **Theme**: Dark Mode First.
-   **Background**:
    -   `bg-background`: `#09090b` (Zinc 950) - Deep, almost black.
    -   `bg-surface`: `#18181b` (Zinc 900) - For cards/sidebars.
-   **Foreground**:
    -   `text-primary`: `#fafafa` (Zinc 50) - High contrast text.
    -   `text-muted`: `#a1a1aa` (Zinc 400) - Secondary text.
-   **Accent**:
    -   `primary`: `#F59E0B` (Amber 500) or `#EAB308` (Yellow 500) - Representing "Flash" / Energy.
    -   Alternative: Electric Blue `#3b82f6` for a cooler, more "tech" feel.

### 2.2 Typography
-   **Font Family**: `Inter` (Google Fonts) or `Geist Sans` for a technical, legible look.
-   **Code Font**: `JetBrains Mono` or `Fira Code`.

### 2.3 Imagery & Icons
-   **Icons**: `Lucide React` (clean, stroke-based icons).
-   **Graphics**:
    -   Abstract, geometric lines (representing connections/nodes).
    -   Interactive SVGs for architecture diagrams.
    -   No stock photos.

## 3. Layout Structure

### 3.1 Landing Page Layout
-   **Navbar**: Sticky, backdrop-blur. Logo (Left), Links (Center), Github/Discord Icons (Right).
-   **Hero**: Centered layout.
    -   H1: "The C++ HTTP Framework for Node.js"
    -   Subtext: "173k req/s. 80μs latency. TypeScript Developer Experience."
    -   Visual: Detailed, animated SVG of the Request/Response cycle.
-   **Bento Grid**: 2x2 or 3x3 grid showcasing features (N-API, Multithreading, Type Safety).
-   **Comparison Section**:
    -   Left: Flash Code example.
    -   Right: Bar chart comparing throughput (Flash vs Express).

### 3.2 Documentation Layout
-   **Three-Column Layout**:
    1.  **Sidebar (Left)**: Navigation tree (Getting Started, Guide, API). Sticky.
    2.  **Main Content (Center)**: MDX content. Max-width `65ch` for readability.
    3.  **On This Page (Right)**: Table of contents for quick jumping. Sticky.

## 4. Key Interactive Elements

### 4.1 The "Bridge" Visualization
An SVG diagram illustrating the N-API Bridge.
-   **State 1**: Static view of Node.js <-> C++ layers.
-   **State 2 (Hover)**: "Data packets" animate across the bridge, lighting up the path to show zero-copy transfer.

### 4.2 Benchmark Toggle graph
A bar chart component using `Recharts` or simple CSS divs.
-   User can toggle between: "Requests per Second" (Higher is better) and "Latency" (Lower is better).
-   Bars animate on scroll.

## 5. Component Library
We will use **shadcn/ui** as the base component library.
-   `Button`: Default, Outline, Ghost.
-   `Card`: For feature blocks.
-   `Tabs`: For code switching.
-   `ScrollArea`: For navigation sidebars.
-   `Sheet`: For mobile navigation.

## 6. Implementation Notes
-   Framework: Next.js 14+ (App Router).
-   Styling: Tailwind CSS.
-   Content: Contentlayer or Next.js MDX.
-   Animations: Framer Motion (for smooth transitions).
