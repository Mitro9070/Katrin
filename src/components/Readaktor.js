import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
// Импортируйте вашу кастомную сборку
// import CustomEditor from '../plugins/ckeditor'; 

function Readaktor() {
    const [content, setContent] = useState('<p>Начните писать здесь...</p>');

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setContent(data);
    };

    return (
        <div>
            <h2>Создание новости</h2>
            {/* <CKEditor
                editor={CustomEditor}
                data={content}
                onChange={handleEditorChange}
                config={{
                    toolbar: [
                        'heading', '|', 'bold', 'italic', 'link',
                        'bulletedList', 'numberedList', 'blockQuote',
                        'mediaEmbed', 'insertTable', 'undo', 'redo', 'alignment'
                    ],
                    mediaEmbed: {
                        previewsInData: true,
                    },
                    alignment: {
                        options: ['left', 'center', 'right', 'justify']
                    }
                }}
            /> */}
            <div>
                <h3>HTML код:</h3>
                <pre>{content}</pre>
            </div>
        </div>
    );
}

export default Readaktor;