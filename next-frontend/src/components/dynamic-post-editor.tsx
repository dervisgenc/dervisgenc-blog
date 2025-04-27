import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type PostEditor from './post-editor'; // Import the type

// Dynamically import PostEditor with SSR disabled
const DynamicPostEditor = dynamic(() => import('./post-editor'), {
    ssr: false,
    // Optional: Add a loading component while the editor loads
    // loading: () => <p>Loading editor...</p>,
});

// Define props based on the original PostEditor props
type DynamicPostEditorProps = ComponentProps<typeof PostEditor>;

// Export the dynamically loaded component
export default DynamicPostEditor;

