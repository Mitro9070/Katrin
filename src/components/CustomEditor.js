import React, { useState } from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from 'draft-js';
import 'draft-js/dist/Draft.css';

const CustomEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style) => {
    const newEditorState = RichUtils.toggleInlineStyle(editorState, style);
    setEditorState(newEditorState);
  };

  const resetStyles = () => {
    const currentStyle = editorState.getCurrentInlineStyle();
    let newEditorState = editorState;

    currentStyle.forEach((style) => {
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, style);
    });

    setEditorState(newEditorState);
  };

  const toggleBlockType = (blockType) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    localStorage.setItem('content', JSON.stringify(raw));
  };

  const loadContent = () => {
    const raw = localStorage.getItem('content');
    if (raw) {
      const contentState = convertFromRaw(JSON.parse(raw));
      setEditorState(EditorState.createWithContent(contentState));
    }
  };

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => toggleInlineStyle('BOLD')}>Bold</button>
        <button onClick={() => toggleInlineStyle('ITALIC')}>Italic</button>
        <button onClick={() => toggleInlineStyle('UNDERLINE')}>Underline</button>
        <button onClick={resetStyles}>Reset Styles</button>
        <button onClick={() => toggleBlockType('header-one')}>H1</button>
        <button onClick={() => toggleBlockType('header-two')}>H2</button>
        <button onClick={() => toggleBlockType('unordered-list-item')}>UL</button>
        <button onClick={() => toggleBlockType('ordered-list-item')}>OL</button>
        <button onClick={saveContent}>Save</button>
        <button onClick={loadContent}>Load</button>
      </div>
      <div className="editor" style={{ border: '1px solid #ddd', padding: '10px', minHeight: '200px' }}>
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
    </div>
  );
};

export default CustomEditor;