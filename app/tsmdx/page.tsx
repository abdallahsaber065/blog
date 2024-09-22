// hello world page
import React from 'react';
import '../../public/styles/global.css';

// create tailwindcss classes in the the file 




export default function Page() {
    const page = 
        <>
            <h1 >Hello World</h1>
            <p>This is a page</p>
            <h2>Subheading</h2>
            <p>More content</p>
            <h2>Another subheading</h2>
            <p>More content</p>
            {/* point list */}
            <ul>
                <li>Point 1</li>
                <li>Point 2</li>
                <li>Point 3</li>
            </ul>
            <code>
                <pre>
                    {`
                    import React from 'react';
                    export default function Page() {
                        return (
                            <>
                                <h1>Hello World</h1>
                                <p>This is a page</p>
                            </>
                        )
                    }
                    `}
                </pre>
            </code>
        </>
    return page;

}
