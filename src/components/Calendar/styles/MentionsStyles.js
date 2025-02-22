// src/components/Calendar/styles/MentionsStyles.js

const defaultStyle = {
    control: {
      backgroundColor: '#fff',
      fontSize: 14,
      fontWeight: 'normal',
    },
    highlighter: {
      overflow: 'hidden',
    },
    input: {
      margin: 0,
    },
    '&singleLine': {
      control: {
        display: 'inline-block',
        width: '100%',
      },
      highlighter: {
        padding: 9,
        border: '1px solid transparent',
      },
      input: {
        padding: 9,
        border: '1px solid silver',
        borderRadius: 4,
      },
    },
    '&multiLine': {
      control: {
        fontFamily: 'monospace',
        border: '1px solid silver',
        borderRadius: 4,
        padding: 9,
      },
      highlighter: {
        padding: 9,
      },
      input: {
        padding: 0,
        minHeight: 63,
        outline: 0,
        border: 0,
      },
    },
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid silver',
        fontSize: 14,
      },
      item: {
        padding: '5px 15px',
        borderBottom: '1px solid silver',
        '&focused': {
          backgroundColor: '#cee4e5',
        },
      },
    },
  };
  
  export default defaultStyle;