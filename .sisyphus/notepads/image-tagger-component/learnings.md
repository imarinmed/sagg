# ImageTagger Component

## Overview
`ImageTagger` is a React component designed for tagging images with Characters, Episodes, and Mythos elements. It provides a searchable dropdown and displays existing tags as chips.

## Props
- `imagePath: string`: Path to the image being tagged.
- `existingTags?: ImageTag[]`: Array of existing tags.
- `onAddTag: (entityType: string, entityId: string) => void`: Callback when a tag is added.
- `onRemoveTag: (tagId: string) => void`: Callback when a tag is removed.
- `className?: string`: Optional CSS class for the container.

## Features
- **Image Preview**: Displays the image to be tagged.
- **Search**: Real-time search across Characters, Episodes, and Mythos using `api.search.query`.
- **Filtering**: Filters search results to only show relevant entity types.
- **Visual Feedback**: Uses icons and colors to distinguish between entity types.
- **Responsive**: Adapts to different screen sizes.

## Usage
```tsx
import { ImageTagger, ImageTag } from "@/components/media-lab/ImageTagger";

<ImageTagger
  imagePath="/path/to/image.jpg"
  existingTags={tags}
  onAddTag={(type, id) => handleAddTag(type, id)}
  onRemoveTag={(id) => handleRemoveTag(id)}
/>
```
