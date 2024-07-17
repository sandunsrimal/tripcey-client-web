import React, { useState, useEffect } from 'react';
import styles from '@/styles/TagsInput.module.css';

const TagsInput = ({ onChange, initialTagsArray }) => {
  const [tags, setTags] = useState(initialTagsArray ? initialTagsArray : []);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (initialTagsArray) {
      setTags(initialTagsArray);
    }
  }, [initialTagsArray]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const inputTags = e.target.value.split(',');
    if (inputTags.length > 1) {
      const newTags = inputTags.map(tag => tag.trim()).filter(tag => tag);
      setTags([...tags, ...newTags]);
      setInput('');
      onChange([...tags, ...newTags]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const newTags = [...tags, input.trim()];
      setTags(newTags);
      setInput('');
      onChange(newTags);
    } else if (e.key === 'Backspace' && !input && tags.length) {
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      onChange(newTags);
    }
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    onChange(newTags);
  };

  return (
    <div className={styles.tagsInput}>
      <input
        className={styles.input}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Press Enter or type commas to add tags"
      />
      <ul className={styles.tagsList}>
        {tags.map((tag, index) => (
          <li key={index} className={styles.tag}>
            <span className={styles.tagText}>{tag}</span>
            <span className={styles.tagClose} onClick={() => removeTag(index)}>x</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagsInput;
